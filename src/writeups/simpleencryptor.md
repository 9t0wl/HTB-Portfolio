# HTB Writeup — Simple Encryptor
**Difficulty:** Very Easy | **Category:** Crypto / Reversing
**Author:** nt0wl | **Date:** July 2026
**Flag:** `HTB{vRy_s1MplE_F1LE3nCryp0r}`

---

## Overview

A not-stripped ELF64 PIE binary (`encrypt`) "encrypts" a flag file using a `time()`-seeded `rand()` keystream instead of any real cipher, then — the fatal bug — writes its own 4-byte seed as a plaintext header at the start of the ciphertext file. No brute-forcing required: the key is handed to the attacker for free.

**Approach Summary:**
```
strings (rule out a real crypto library) → objdump -d --disassemble=main → spot the leaked seed → write a C decryptor linked against the same libc
```

## Recon

```bash
strings encrypt
```
Imports: `fopen, fread, fseek, ftell, fclose, malloc, fwrite, srand, rand, time` — no crypto library at all. The presence of `time → srand → rand` and the absence of any real cipher is the single biggest tell: this is a home-rolled PRNG-based keystream, not a real algorithm.

```bash
objdump -d encrypt | grep '<.*>:'
```
Only one developer-written function exists — `main`. Everything else is glibc/compiler boilerplate, meaning the entire algorithm is inlined in one place.

## Reading the Disassembly

```bash
objdump -d -M intel --disassemble=main encrypt
```

Per byte: `ciphertext[i] = ROL8(plaintext[i] XOR (rand()&0xFF), rand()&0x7)`, seeded by `srand(time(NULL))`. Critically, right before writing the ciphertext:

```asm
lea rax, [rbp-0x38]     ; address of the seed variable itself
call fwrite              ; fwrite(&seed, 1, 4, fp2)  <- writes the raw seed as a header
call fwrite              ; fwrite(buf, 1, filesize, fp2)
```

`xxd flag.enc` confirms it: the first 4 bytes read as a little-endian int are a plausible Unix timestamp — the exact seed used to generate the keystream.

## Exploitation

Since decrypting requires reproducing glibc's *exact* `rand()` sequence, the decryptor was written in C and linked against the same libc rather than reimplemented in another language:

```c
srand(seed);  // seed read straight from the leaked header

for (long i = 0; i < ct_len; i++) {
    int r1 = rand() & 0xFF;
    int r2 = rand() & 0x7;

    unsigned char undone_rotate = ror8(buf[i], r2);   // undo ROL first
    buf[i] = undone_rotate ^ (unsigned char)r1;        // then undo XOR
}
```

Order matters: encryption applied XOR then rotate, so decryption undoes rotate first, then XOR — the same principle as unwinding `f(g(x))` via `g⁻¹` before `f⁻¹`. `rand()` must also be called in the same order/count as the original program per byte, since it's one continuous stream.

```bash
gcc -o decrypt decryptor.c && ./decrypt && cat flag_decrypted
```
```
HTB{vRy_s1MplE_F1LE3nCryp0r}
```

## Root Cause

Two compounding weaknesses: a `time()`-seeded PRNG has low entropy even without a leak (brute-forceable in seconds), and the seed was additionally written directly into the ciphertext file — removing any need to brute-force at all.

## Key Takeaways

- **A PRNG seeded from `time()` is not cryptography** — it's a deterministic, reproducible sequence once the seed is known.
- **Never let key material live anywhere near its own ciphertext**, even "just" as a header.
- **glibc's `rand()` is fully deterministic given a seed** — to reproduce it bit-for-bit, compile against the same libc rather than reimplementing the algorithm elsewhere.
- **Undo compound transformations in reverse order** — same logic as inverting a composed function.
