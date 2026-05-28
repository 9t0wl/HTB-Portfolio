import { useState, useEffect } from 'react';
import { machines } from '../data/machines';
import { certs } from '../data/certs';
import MachineCard from '../components/MachineCard';
import CertCard from '../components/CertCard';
import OwlSVG from '../components/OwlSVG';
import useReveal from '../components/useReveal';
import styles from './Home.module.css';

const FILTERS = ['all', 'easy', 'medium', 'hard', 'insane', 'windows', 'linux'];

const tools = [
  {
    icon: '[ BOF ]',
    name: 'Process Injection BOFs',
    desc: 'Beacon Object Files for in-process code execution via Cobalt Strike / Sliver. Covers process hollowing and token manipulation with minimal footprint and no child process spawning.',
    lang: 'C · COFF · mingw64',
    href: 'https://github.com/9t0wl',
  },
  {
    icon: '[ BOF ]',
    name: 'Token Manipulation BOF',
    desc: 'ADVAPI32 calls wrapped in BOF format for token impersonation and privilege escalation. Built and tested in-process via COFFLoader64 — avoids fork-and-run.',
    lang: 'C · Windows Internals',
    href: 'https://github.com/9t0wl',
  },
  {
    icon: '[ HTML ]',
    name: 'CRTO Notes',
    desc: 'Single-file tactical reference covering all CRTO lab attack paths. Built for speed under exam conditions — searchable, indexed, no dependencies.',
    lang: 'HTML · JavaScript',
    href: 'https://github.com/9t0wl/crto-notes',
  },
  {
    icon: '[ C# ]',
    name: 'Port Scanner (execute_assembly)',
    desc: 'Custom C# port scanner designed to run in-process via execute_assembly — avoids spawning child processes that trip EDR behavioral heuristics.',
    lang: 'C# · .NET · OPSEC-conscious',
    href: 'https://github.com/9t0wl',
  },
  {
    icon: '[ PY ]',
    name: 'AD Attack Scripts',
    desc: 'Personal collection refined across 70+ machines and Pro Labs — Kerberoasting, AS-REP, BloodHound CE automation, Ligolo-ng tunnel setup, faketime wrappers.',
    lang: 'Python · Bash · PowerShell',
    href: 'https://github.com/9t0wl',
  },
  {
    icon: '[ C2 ]',
    name: 'Red Team Rig Config',
    desc: 'Documented build of a dedicated red team workstation — Sliver, Havoc, Ligolo-ng, structured tooling under C:\\Tools\\, isolated on a GL.iNet Opal network segment.',
    lang: 'Sliver · Havoc · VirtualBox',
    href: 'https://github.com/9t0wl',
  },
];

export default function Home() {
  const [filter, setFilter] = useState('all');
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });
  const revealRef = useReveal();

  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const filtered = machines.filter(m =>
    filter === 'all' || m.diff === filter || m.os === filter
  );

  return (
    <div ref={revealRef}>
      {/* Cursor glow */}
      <div
        className={styles.cursorGlow}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* ── HERO ── */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>offensive security researcher // las vegas, nv</div>

          <h1 className={styles.heroName}>
            <span className={styles.num}>9</span>
            <span className={styles.owl}>t0wl</span>
          </h1>

          <p className={styles.heroTitle}>
            <strong>Penetration Tester</strong> · Red Team Operator · Active Directory Specialist
          </p>

          <div className={styles.heroBadges}>
            <span className="badge badge-g">HTB CWES</span>
            <span className="badge badge-g">HTB CPTS</span>
            <span className="badge badge-p">Synack Red Team</span>
            <span className="badge badge-pk">CRTO — Active</span>
            <span className="badge badge-pk">PNPT — Active</span>
          </div>

          <div className={styles.heroCta}>
            <a href="#boxes" className="btn btn-p">// view writeups</a>
            <a href="#contact" className="btn btn-pk">// get in touch</a>
          </div>
        </div>

        <div className={styles.heroOwl}>
          <OwlSVG size={280} style={{ opacity: 0.75 }} />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className={styles.statsBar}>
        {[
          { num: '70+',  label: 'HTB Machines',  color: 'var(--green)' },
          { num: '3',    label: 'Pro Labs',       color: 'var(--purple2)' },
          { num: '4',    label: 'Active Certs',   color: 'var(--purple2)' },
          { num: 'SRT',  label: 'Synack Red Team',color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className={`${styles.statItem} reveal`}>
            <div className={styles.statNum} style={{ color: s.color }}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── CERTS ── */}
      <section id="certs" className={styles.section}>
        <div className={`${styles.sectionHeader} reveal`}>
          <div className="section-label">credentials</div>
          <h2 className="section-title">Certs &amp; <span className="accent-p">Achievements</span></h2>
          <div className="section-line" />
        </div>
        <div className={styles.certsGrid}>
          {certs.map((c, i) => (
            <div key={c.id} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
              <CertCard cert={c} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HTB BOXES ── */}
      <section id="boxes" className={styles.section}>
        <div className={`${styles.sectionHeader} reveal`}>
          <div className="section-label">hack the box</div>
          <h2 className="section-title">Box <span className="accent-pk">Writeups</span></h2>
          <div className="section-line" />
        </div>

        <div className={`${styles.filters} reveal`}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className={styles.boxesGrid}>
          {filtered.map((m, i) => (
            <div key={m.id} className="reveal" style={{ transitionDelay: `${i * 50}ms` }}>
              <MachineCard machine={m} />
            </div>
          ))}
        </div>

        <div className={`${styles.boxCount} reveal`}>
          <span>{filtered.length} writeup{filtered.length !== 1 ? 's' : ''} published</span>
          {' · more added regularly '}
          <span className="blink">_</span>
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section id="tools" className={styles.section}>
        <div className={`${styles.sectionHeader} reveal`}>
          <div className="section-label">development</div>
          <h2 className="section-title">Tools &amp; <span className="accent-g">BOF Dev</span></h2>
          <div className="section-line" />
        </div>

        <div className={styles.toolsGrid}>
          {tools.map((t, i) => (
            <div key={t.name} className={`${styles.toolCard} reveal`} style={{ transitionDelay: `${i * 60}ms` }}>
              <div className={styles.toolIcon}>{t.icon}</div>
              <div className={styles.toolName}>{t.name}</div>
              <div className={styles.toolDesc}>{t.desc}</div>
              <div className={styles.toolLang}>{t.lang}</div>
              <a href={t.href} className={styles.toolLink} target="_blank" rel="noopener noreferrer">
                view on github →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className={styles.section} style={{ textAlign: 'center' }}>
        <div className={`${styles.sectionHeader} reveal`} style={{ alignItems: 'center' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>links</div>
          <h2 className="section-title">Get In <span className="accent-p">Touch</span></h2>
          <div className="section-line" style={{ maxWidth: 300, margin: '1rem auto 0' }} />
        </div>

        <p className={`${styles.contactBlurb} reveal`}>
          Open to red team engagements, freelance pentest work, and collaborations.
        </p>

        <div className={`${styles.contactGrid} reveal`}>
          {[
            { icon: '⬡', label: 'Hack The Box',  href: 'https://profile.hackthebox.com/profile/019c6cde-6b07-710e-ae72-893fc0e73f14' },
            { icon: '◈', label: 'GitHub',         href: 'https://github.com/9t0wl' },
            { icon: '◉', label: 'LinkedIn',       href: 'https://www.linkedin.com/in/herry-hernandez-43100123b/' },
          ].map(l => (
            <a key={l.label} href={l.href} className={styles.contactLink} target="_blank" rel="noopener noreferrer">
              <span>{l.icon}</span> {l.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span className="accent-p">9t0wl</span> · offensive security researcher · las vegas, nv
        <br /><br />
        <span className="blink">▮</span> built clean. no bs.
      </footer>
    </div>
  );
}
