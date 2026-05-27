import { Link } from 'react-router-dom';
import styles from './MachineCard.module.css';

const DIFF_COLOR = {
  easy:   'green',
  medium: 'amber',
  hard:   'pink',
  insane: 'purple',
};

const OS_COLOR = {
  windows: '#60a5fa',
  linux:   'var(--green)',
  freebsd: '#f97316',
};

export default function MachineCard({ machine }) {
  const { id, name, os, diff, tags, date } = machine;
  const color = DIFF_COLOR[diff];

  return (
    <Link to={`/box/${id}`} className={`${styles.card} ${styles[diff]}`}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={`${styles.diff} ${styles[`diff_${color}`]}`}>{diff}</span>
      </div>

      <div className={styles.os}>
        <span className={styles.osDot} style={{ background: OS_COLOR[os] }} />
        {os.charAt(0).toUpperCase() + os.slice(1)}
        {date && <span className={styles.date}>{date}</span>}
      </div>

      <div className={styles.tags}>
        {tags.map(t => (
          <span key={t} className={styles.tag}>{t}</span>
        ))}
      </div>

      <div className={styles.readMore}>view writeup →</div>
    </Link>
  );
}
