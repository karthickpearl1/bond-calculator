import React from 'react';
import type { CalculationResults } from '../types';
import styles from './CalculationSummary.module.css';

/**
 * Props for CalculationSummary component
 */
interface CalculationSummaryProps {
  calculations: CalculationResults;
  isCalculating?: boolean;
}

/**
 * CalculationSummary component displays bond cost and coupon calculations
 * Shows Total Cost to Client and Monthly Coupon (Net of TDS)
 * Requirements: 3.4, 3.5, 6.2
 */
export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  calculations,
  isCalculating = false
}) => {
  /**
   * Format currency values for display
   */
  const formatCurrency = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className={styles.calculationSummary}>
      <h3 className={styles.title}>Calculation Summary</h3>
      
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryItem} ${isCalculating ? styles.loading : ''}`}>
          <label className={styles.label} data-type="cost">Total Cost to Client</label>
          <div className={styles.value}>
            {isCalculating ? (
              <span className={styles.loading}>Calculating...</span>
            ) : (
              <span className={styles.amount} data-currency="INR">
                {formatCurrency(calculations.totalCost)}
              </span>
            )}
          </div>
          <div className={styles.description}>
            Face Value × (Purchase Price/100) + Accrued Interest
          </div>
        </div>

        <div className={`${styles.summaryItem} ${isCalculating ? styles.loading : ''}`}>
          <label className={styles.label} data-type="coupon">Monthly Coupon (Net of TDS)</label>
          <div className={styles.value}>
            {isCalculating ? (
              <span className={styles.loading}>Calculating...</span>
            ) : (
              <span className={styles.amount} data-currency="INR">
                {formatCurrency(calculations.netMonthlyCoupon)}
              </span>
            )}
          </div>
          <div className={styles.description}>
            Monthly Coupon × (1 – TDS Rate%)
          </div>
        </div>
      </div>
    </div>
  );
};