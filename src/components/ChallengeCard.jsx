import { Link } from 'react-router-dom';
import styles from './ChallengeCard.module.css';

const DIFF_COLOR = {
  'very-easy': 'green',
  easy:        'green',
  medium:      'amber',
  hard:        'pink',
  insane:      'purple',
};

const CATEGORY_COLOR = {
  reversing: 'var(--purple2)',
  crypto:    '#60a5fa',
  malware:   'var(--pink)',
  web:       'var(--green)',
  pwn:       '#f97316',
};

export default function ChallengeCard({ challenge }) {
  const { id, name, category, diff, tags, date } = challenge;
  const color = DIFF_COLOR[diff];

  return (
    <Link to={`/challenge/${id}`} className={`${styles.card} ${styles[diff]}`}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.name}>{name}</span>
          <span className={`${styles.diff} ${styles[`diff_${color}`]}`}>{diff}</span>
        </div>
      </div>

      <div className={styles.category}>
        <span className={styles.categoryDot} style={{ background: CATEGORY_COLOR[category] }} />
        {category.charAt(0).toUpperCase() + category.slice(1)}
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
