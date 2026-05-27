# Ghost

**Difficulty:** Hard | **OS:** Windows | **Completed:** March 2026

---

## Overview

Ghost is a Hard AD machine built around ADFS exploitation via Golden SAML. The path involves blind LDAP injection, DNS record injection, NTLMv2 capture via Responder, and ultimately forging SAML tokens using ADFSDump + ADFSpoof.

---

## Recon & Foothold

Enumerated LDAP blindly — crafted injection payloads to extract user attributes one character at a time:

```python
# Blind LDAP injection — measure response delta per character
# Filter: (&(objectClass=user)(cn=a*))
```

Injected a DNS A record pointing to attacker IP, triggered outbound authentication from a service account, captured NTLMv2 hash via Responder:

```bash
sudo responder -I tun0 -wPv
hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt
```

---

## Golden SAML

Obtained ADFS service account credentials. Dumped ADFS configuration (DKM key + signing cert) with ADFSDump:

```bash
ADFSDump.exe /output:adfs_dump.xml
```

Forged a SAML token for the domain administrator using ADFSpoof:

```bash
python3 ADFSpoof.py -b adfs_dump.xml -s adfs.ghost.htb --assertionid admin@ghost.htb
```

Used the forged token to authenticate to the internal portal → shell as domain admin.

---

## Lessons Learned

- ADFS Golden SAML is a powerful persistence primitive — the signing key doesn't rotate on password changes
- DNS injection as a coercion primitive is underused; works when you can write DNS records but can't directly coerce auth
