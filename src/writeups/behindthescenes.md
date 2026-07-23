# HTB Writeup — Behind the Scenes
**Difficulty:** Very Easy | **Category:** Reversing
**Author:** nt0wl | **Date:** July 2026
**Flag:** `HTB{Itz_0nLy_UD2}`

---

## Overview

A statically-linked x86-64 ELF crackme (`./challenge <password>`) that validates a 12-character CLI argument via four sequential `strncmp` calls against hardcoded 3-byte fragments, layered with a signal-based anti-debug trick: a custom `SIGILL` handler and an illegal `ud2` opcode prepended to every basic block in `main`. The anti-debug layer only defeats *live* analysis (a debugger single-stepping through traps) — it does nothing against static reading, so the whole challenge, anti-debug included, was solved without ever attaching a debugger.

**Approach Summary:**
```
strings → objdump -d --disassemble=main → disassemble the handler to confirm (not assume) anti-debug → objdump -s -j .rodata
```

## Recon

```bash
strings behindthescenes
```
Two immediate tells: the usage string `./challenge <password>` and a custom (non-libc) symbol `segill_sigaction` — a `SIGILL`-related function name that doesn't belong to any standard library, flagging a custom signal handler before opening a disassembler.

## Reading `main`

```bash
objdump -d -M intel --disassemble=main behindthescenes
```

Surfaced the entire logic in one dump: a `sigaction`/`sigemptyset` sequence wiring a handler for `SIGILL` to `segill_sigaction`, `ud2` (`0f 0b`) bytes prepended to the start of nearly every basic block, and the real validation — `argc == 2`, `strlen(argv[1]) == 12`, then four `strncmp` calls comparing 3-byte slices of `argv[1]` at offsets `0/3/6/9` against four `.rodata` constants.

## Confirming the Anti-Debug Mechanism

Rather than assuming from the function name, the handler itself was disassembled:

```bash
objdump -d -M intel --disassemble=segill_sigaction behindthescenes
```

It reads the saved `RIP` out of the `ucontext_t` at the fixed x86-64 Linux offset `0xa8` (`uc_mcontext.gregs[REG_RIP]`), adds `2`, and writes it back — the textbook "skip the illegal 2-byte instruction and resume" pattern. This only matters if you *execute* the trap; static disassembly never triggers a signal, so the entire mechanism was irrelevant to solving the challenge.

## Extracting the Password

```bash
objdump -s -j .rodata behindthescenes
```

| Offset | Bytes | ASCII |
|---|---|---|
| `0x201b` | `49 74 7a 00` | `Itz` |
| `0x201f` | `5f 30 6e 00` | `_0n` |
| `0x2023` | `4c 79 5f 00` | `Ly_` |
| `0x2027` | `55 44 32 00` | `UD2` |

Concatenated: `Itz_0nLy_UD2` → `HTB{Itz_0nLy_UD2}`.

## Root Cause

1. **The password is cleartext in `.rodata`**, just split into four fragments rather than one string — this raises the reading effort slightly but doesn't meaningfully protect the secret.
2. **The `SIGILL`/`ud2` anti-debug layer only raises the cost of *dynamic* analysis.** It does not obstruct static disassembly at all, since those tools read bytes without executing them.

## Key Takeaways

- **`ud2` inline in a "working" program's disassembly is a strong anti-debug signal** — go looking for a `sigaction(SIGILL, ...)` call.
- **Anti-debugging and anti-disassembly are different threat models.** A trap that only fires on execution is irrelevant to a purely static workflow.
- **Confirm suspicious handlers by disassembling them, not by trusting the function name.**
- **`SA_SIGINFO` handlers on x86-64 Linux find the saved `RIP` at `ucontext_t` offset `0xa8`** — worth memorizing for any future RIP-patching signal handler.
