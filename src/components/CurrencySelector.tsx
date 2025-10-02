import React from 'react';
import { useCurrency, CURRENCIES, type Currency } from '../contexts/CurrencyContext';
import styles from './CurrencySelector.module.css';

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={styles.currencySelector}>
      <label htmlFor="currency-select" className={styles.label}>
        Currency
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className={styles.select}
        aria-label="Select currency"
      >
        {Object.entries(CURRENCIES).map(([code, info]) => (
          <option key={code} value={code}>
            {info.symbol} {info.name}
          </option>
        ))}
      </select>
    </div>
  );
};