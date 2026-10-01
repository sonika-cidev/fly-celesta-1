import styles from "./OrbitBadge.module.css";

/** Rotating circular inscription with a gold satellite — links to the fleet. */
export function OrbitBadge({ className }: { className?: string }) {
  return (
    <a href="#fleet" className={`${styles.orbit} ${className ?? ""}`} aria-label="Explore the fleet">
      <svg className={styles.ring} viewBox="0 0 300 300" aria-hidden="true">
        <defs>
          <path id="orbit-path" d="M150,150 m-128,0 a128,128 0 1,1 256,0 a128,128 0 1,1 -256,0" />
        </defs>
        <text className={styles.inscription}>
          <textPath href="#orbit-path" textLength="800">
            Private Aviation • Fly Celesta • Beyond Horizons •
          </textPath>
        </text>
      </svg>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.satellite} />
      </span>
      <span className={styles.inner}>
        <span>Explore</span>
        <span className={styles.innerRule} />
        <span>the fleet</span>
      </span>
    </a>
  );
}
