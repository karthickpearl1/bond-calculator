import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className={styles.icon}>
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className={styles.label}>
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};