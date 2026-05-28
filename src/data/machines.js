// ─────────────────────────────────────────────────────────────
//  MACHINES DATA
//
//  To add a new box:
//    1. Drop yourbox.md into src/writeups/
//    2. Add an entry below with writeup: () => import('../writeups/yourbox.md?raw')
//    3. Save — that's it.
// ─────────────────────────────────────────────────────────────

export const machines = [
  {
    id: 'pingpong',
    name: 'PingPong',
    os: 'windows',
    diff: 'insane',
    image: '/HTB-Portfolio/images/pingpong.png',
    tags: ['ESC13', 'PKINIT', 'Cross-Forest', 'gMSA', 'JEA', 'Kerberos-Only'],
    date: '2026-04',
    writeup: () => import('../writeups/lock.md?raw'),
  },
  {
    id: 'ghost',
    name: 'Ghost',
    os: 'windows',
    diff: 'insane',
    image: '/HTB-Portfolio/images/ghost.png',
    tags: ['Golden SAML', 'ADFS', 'DNS Injection', 'Responder', 'NTLMv2'],
    date: '2026-03',
    writeup: () => import('../writeups/ghost.md?raw'),
  },
  {
    id: 'eighteen',
    name: 'Eighteen',
    os: 'windows',
    diff: 'insane',
    image: '/HTB-Portfolio/images/eighteen.png',
    tags: ['BadSuccessor', 'dMSA', 'bloodyAD', 'Windows Server 2025'],
    date: '2026-04',
    writeup: () => import('../writeups/eighteen.md?raw'),
  },
  {
    id: 'garfield',
    name: 'Garfield',
    os: 'windows',
    diff: 'hard',
    tags: ['WriteProperty', 'scriptPath', 'Kerberos', 'AD'],
    date: '2026-04',
    writeup: () => import('../writeups/garfield.md?raw'),
  },
    {
    id: 'darkzero',
    name: 'DarkZero',
    os: 'windows',
    diff: 'hard',
    image: '/HTB-Portfolio/images/darkzero.png',
    tags: ['ADCS', 'PKINIT', 'SQL Server', 'xp_cmdshell', 'SeImpersonatePrivilege', 'Ligolo', 'DCSync', 'Kerberos'],
    date: '2025-11',
    writeup: () => import('../writeups/darkzero.md?raw'),
  },
];

// ── helpers ──────────────────────────────────────────────────
export const getMachine = (id) => machines.find((m) => m.id === id);
export const diffOrder  = { easy: 0, medium: 1, hard: 2, insane: 3 };
export const allTags    = [...new Set(machines.flatMap((m) => m.tags))].sort();
