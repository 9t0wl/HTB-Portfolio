import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMachine, machines, diffOrder } from '../data/machines';
import styles from './WriteupPage.module.css';

const DIFF_COLOR = {
  easy:   'var(--green)',
  medium: '#f59e0b',
  hard:   'var(--pink)',
  insane: 'var(--purple2)',
};

const OS_COLOR = {
  windows: '#60a5fa',
  linux:   'var(--green)',
  freebsd: '#f97316',
};

export default function WriteupPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const machine      = getMachine(id);
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!machine) { setLoading(false); return; }

    setLoading(true);
    setContent('');
    setError(false);

    machine.writeup()
      .then((mod) => {
        setContent(mod.default);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (!machine) {
    return (
      <div className={styles.notFound}>
        <div className={styles.nfCode}>404</div>
        <div className={styles.nfMsg}>// machine not found</div>
        <Link to="/" className="btn btn-p" style={{ marginTop: '2rem' }}>← back home</Link>
      </div>
    );
  }

  const { name, os, diff, tags, date } = machine;

  const sorted = [...machines].sort((a, b) => diffOrder[a.diff] - diffOrder[b.diff]);
  const idx    = sorted.findIndex((m) => m.id === id);
  const prev   = sorted[idx - 1];
  const next   = sorted[idx + 1];

  return (
    <div className={styles.page}>
      {/* Back / breadcrumb */}
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>← back</button>
        <div className={styles.breadcrumb}>
          <Link to="/">9t0wl</Link>
          <span>/</span>
          <Link to="/#boxes">boxes</Link>
          <span>/</span>
          <span>{name}</span>
        </div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.diffBadge} style={{ color: DIFF_COLOR[diff], borderColor: DIFF_COLOR[diff] }}>
            {diff}
          </span>
          <span className={styles.osBadge}>
            <span className={styles.osDot} style={{ background: OS_COLOR[os] }} />
            {os}
          </span>
          {date && <span className={styles.dateBadge}>{date}</span>}
        </div>

        <h1 className={styles.title}>{name}</h1>

        <div className={styles.tags}>
          {tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
        </div>
      </header>

      {/* Body */}
      <article className={styles.article}>
        {loading && (
          <div className={styles.loading}>
            <span className="mono muted">// loading writeup</span>
            <span className="blink"> _</span>
          </div>
        )}
        {error && (
          <div className={styles.loading}>
            <span className="mono muted">// writeup file not found — drop the .md in src/writeups/</span>
          </div>
        )}
        {!loading && !error && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
      </article>

      {/* Prev / Next */}
      <nav className={styles.prevNext}>
        {prev ? (
          <Link to={`/box/${prev.id}`} className={styles.navBtn}>
            <span className={styles.navDir}>← prev</span>
            <span className={styles.navName}>{prev.name}</span>
          </Link>
        ) : <div />}
        {next ? (
          <Link to={`/box/${next.id}`} className={`${styles.navBtn} ${styles.navRight}`}>
            <span className={styles.navDir}>next →</span>
            <span className={styles.navName}>{next.name}</span>
          </Link>
        ) : <div />}
      </nav>
    </div>
  );
}
