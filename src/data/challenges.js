// ─────────────────────────────────────────────────────────────
//  CHALLENGES DATA
//
//  To add a new challenge:
//    1. Drop yourchallenge.md into src/writeups/
//    2. Add an entry below with writeup: () => import('../writeups/yourchallenge.md?raw')
//    3. Save — that's it.
// ─────────────────────────────────────────────────────────────

export const challenges = [
  {
    id: 'graverobber',
    name: 'Graverobber',
    category: 'reversing',
    diff: 'very-easy',
    tags: ['ELF', 'PIE Binary', 'objdump', '.data Section', 'stat() Syscall', 'Static Analysis'],
    date: '2026-07',
    writeup: () => import('../writeups/graverobber.md?raw'),
  },
  {
    id: 'behindthescenes',
    name: 'Behind the Scenes',
    category: 'reversing',
    diff: 'very-easy',
    tags: ['ELF', 'Anti-Debugging', 'SIGILL Trap', 'ud2 Opcode', 'sigaction', 'objdump'],
    date: '2026-07',
    writeup: () => import('../writeups/behindthescenes.md?raw'),
  },
  {
    id: 'simpleencryptor',
    name: 'Simple Encryptor',
    category: 'crypto',
    diff: 'very-easy',
    tags: ['ELF', 'PRNG Keystream', 'glibc rand()', 'Key Leak', 'C Programming', 'objdump'],
    date: '2026-07',
    writeup: () => import('../writeups/simpleencryptor.md?raw'),
  },
  {
    id: 'scrambledpayload',
    name: 'Scrambled Payload',
    category: 'malware',
    diff: 'easy',
    tags: ['VBScript', 'COM Automation', 'ADODB.Stream', 'Deobfuscation', 'Regex Solving'],
    date: '2026-07',
    writeup: () => import('../writeups/scrambledpayload.md?raw'),
  },
];

// ── helpers ──────────────────────────────────────────────────
export const getChallenge = (id) => challenges.find((c) => c.id === id);
export const challengeDiffOrder = { 'very-easy': 0, easy: 1, medium: 2, hard: 3, insane: 4 };
export const allChallengeTags = [...new Set(challenges.flatMap((c) => c.tags))].sort();
