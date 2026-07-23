# HTB Writeup — Scrambled Payload
**Difficulty:** Easy | **Category:** Reversing / Malware Analysis
**Author:** nt0wl | **Date:** July 2026
**Flag:** `HTB{ScR4MBL3D_VB_Scr1PT1NG}`

---

## Overview

A single-line, heavily obfuscated VBScript dropper (`payload.vbs`) requiring three nested layers of deobfuscation to recover a flag gated behind a hostname check. Solved entirely statically — every COM API's *effect* was reproduced in Python rather than emulating COM or executing the script.

**Approach Summary:**
```
Layer 1: base64 + COM decode → Layer 2: 9 separately-keyed Chr() chunks → Layer 3: final Chr() layer reveals a 3-regex hostname gate → solve via character-class intersection
```

## Obfuscation Architecture

**Layer 1 (outer)** uses `Msxml2.DOMDocument`'s `bin.base64` `dataType` trick — a free, library-free base64 codec native to Windows — plus an `ADODB.Stream` `Type=1`/`Type=2` flip (the standard binary↔text conversion primitive in VBScript) to decode and `Execute` a base64 blob.

**Layer 2 (middle)** splits the payload into 9 separately-keyed chunks:
```vbscript
d="":for i=0 to N:d=d+Chr((Array(<numbers>)(i) <op> <key>)mod 256):Next:Execute d
```
Each chunk uses a different array, operator (`+`, `*`, or `xor`), and key. Since VBScript runs top-to-bottom in shared scope, executing 9 chunks back-to-back has the same net effect as one script — chopped up and re-keyed per piece specifically to defeat single-signature/single-key static detection.

**Layer 3 (inner)** reassembles a ~12KB script using the same `Chr((a*b) mod 256)` chain, revealing the real logic: base64-encode `WScript.Network.ComputerName`, then gate a message box behind **three separate 36-character regex patterns**, each written as a per-position bracket character class.

## The Regex Trick

All three patterns run against the same string in sequence, with early-exit on any failure — meaning the correct string's character at every position must satisfy **all three** simultaneously. Since each position is a character class, the true character is the **set intersection** of the three classes at that position:

```
position 1:  [MSy]  ∩  [{Sp]  ∩  [WoS]  =  {S}
```

Doing this across all 36 positions reconstructs the exact base64 string the check requires — without ever knowing or brute-forcing the real hostname.

## Solver (Python)

```python
def solve_regexes(patterns: list[str]) -> str:
    per_pattern = [CLASS_RE.findall(p) for p in patterns]
    result = ""
    for classes_at_position in zip(*per_pattern):
        common = set(classes_at_position[0])
        for classes in classes_at_position[1:]:
            common &= set(classes)
        result += common.pop()   # exactly 1 char should remain
    return result
```

Base64-decoding the intersected string yields the flag directly.

## Key Takeaways

- **`Chr((a op b) mod 256)` chains are a recognizable signature** in VBS/JS droppers — grep for `Chr\(\(?\d+\s*[\+\*]\s*\d+\)?\s*(mod 256)?\)`.
- **Splitting one script into many separately-keyed chunks + sequential `Execute`** defeats single-signature detection even though the runtime effect is identical to one unsplit script.
- **`Msxml2.DOMDocument` `bin.base64` and `ADODB.Stream` type-flipping** are Windows-native, library-free encoding primitives extremely common in VBS/JS malware — recognize them on sight.
- **You don't need to execute untrusted code to analyze it** — reproducing each COM call's *effect* in a safe language is sufficient and avoids any risk of running the payload.
- **Multiple regex checks against the same string, run in sequence, are just "AND together N constraints"** — if expressed as per-position character classes, the unique satisfying string is the position-by-position set intersection.
