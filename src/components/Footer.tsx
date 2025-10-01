import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.signature}>
          <div className={styles.mainText}>
            Built with <span className={styles.heart}>❤️</span> & AI by{' '}
            <span className={styles.name}>Karthick Sivagnanam</span>
          </div>
          <div className={styles.tagline}>Curious-Learn-Build</div>
        </div>
        
        <div className={styles.tech}>
          <span className={styles.techItem}>⚡ React</span>
          <span className={styles.separator}>•</span>
          <span className={styles.techItem}>TypeScript</span>
          <span className={styles.separator}>•</span>
          <span className={styles.techItem}>XIRR Math</span>
          <span className={styles.separator}>•</span>
          <span className={styles.techItem}>Deployed on Netlify</span>
        </div>
        
        <div className={styles.links}>
          <a
            href="https://www.linkedin.com/in/karthick-sivagnanam-61798188/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="LinkedIn Profile"
          >
            <span className={styles.linkIcon}>💼</span>
            LinkedIn
          </a>
          <a
            href="https://github.com/karthickpearl1"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="GitHub Profile"
          >
            <span className={styles.linkIcon}>🐙</span>
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};