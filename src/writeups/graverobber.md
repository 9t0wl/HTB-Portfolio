# HTB Writeup — Graverobber
**Difficulty:** Very Easy | **Category:** Reversing
**Author:** nt0wl | **Date:** July 2026
**Flag:** `HTB{br34k1n9_d0wn_th3_sysc4ll5}`

---

## Overview

`robber` is a not-stripped ELF64 PIE crackme that *looks* like it wants a runtime check satisfied: it builds a path string one character at a time from a global array and calls `stat()` on it after every character, aborting the moment the path stops resolving. That check is a decoy — the characters being assembled are sitting in plain sight in the binary's `.data` section. No execution required.

**Approach Summary:**
```
file (confirm ELF/PIE/not-stripped) → objdump -d (trace the loop) → objdump -s -j .data (dump the array) → decode
```

## Recon

```bash
strings robber
```
Surfaced a win/lose message pair (`"We took a wrong turning!"` / `"We found the treasure!..."`) and a `main.c` string — confirming the binary is **not stripped**, so real symbol names (`main`, `parts`) show up in disassembly instead of bare addresses.

```bash
file robber
```
```
robber: ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

## Reading `main`

```bash
objdump -d -M intel --disassemble=main robber
```

```asm
lea rdx,[rax*4+0x0]                 ; index * 4  <- stride reveals element size before any data is read
lea rax,[rip+0x2e63]                ; &parts   # 4040 <parts>   (PIE: rip-relative)
mov edx,DWORD PTR [rdx+rax*1]       ; edx = parts[i]        (reads a full 4-byte int)
mov BYTE PTR [rbp+rax*1-0x50],dl    ; buf[i*2]   = low byte of parts[i]
mov BYTE PTR [rbp+rax*1-0x50],0x2f  ; buf[i*2+1] = '/'
call stat@plt                       ; stat(buf, &statbuf)  — gate on the *partial* path
test eax,eax
je   <continue loop>                ; fail -> print "wrong turning", exit(1)
...                                  ; loop i = 0..31, then prints "found the treasure"
```

A counter `i` runs 0→31. Each pass reads `parts[i]` as a 4-byte `int`, keeps only the low byte, and writes `char` then `/` into a stack buffer — building a slash-separated string one character longer each time, with `stat()` re-checked after every append.

Two disassembly-reading habits made this fast:
- **Index scaling reveals type before you've seen any data.** `*4` scaling on `parts[i]` means a 4-byte element — this told us to expect 4-byte slots before dumping anything.
- **PIE addresses are `rip`-relative; trust `objdump`'s trailing comment.** `lea rax,[rip+0x2e63]` isn't a literal address — `# 4040 <parts>` is the real target.

## Extracting the Flag

`parts` lives in `.data`, not `.rodata` — worth flagging since mutable globals with a nonzero initializer land in `.data`, while `.rodata` is reserved for compiler-generated constants.

```bash
objdump -s -j .data robber
```
```
4040 48000000 54000000 42000000 7b000000  H...T...B...{...
4050 62000000 72000000 33000000 34000000  b...r...3...4...
...
40b0 6c000000 35000000 7d000000 00000000  l...5...}.......
```

32 little-endian `int32` slots. Taking the first byte of each 4-byte group in order:

```
H  T  B  {  b  r  3  4  k  1  n  9  _  d  0  w  n  _  t  h  3  _  s  y  s  c  4  l  l  5  }
```

## Root Cause

No memory-safety bug — the pattern here is "the answer is fully readable as static data, disguised behind an irrelevant runtime gate." The `stat()` check only matters if you intend to satisfy it dynamically; it places zero obstacle in front of reading the array directly.

## Key Takeaways

- **Ask "what generates this value?" before "how do I satisfy this check?"** If a check compares against something fixed at compile time, the fixed value is almost always cheaper to read statically than to satisfy dynamically.
- **Index scaling in disassembly (`*1`/`*2`/`*4`/`*8`) reveals element size before touching the data.**
- **`.rodata` is for constants; `.data` is for mutable globals with nonzero initializers** — check where a reference actually points rather than assuming.
