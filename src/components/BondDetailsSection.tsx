import React from 'react';
import type { BondInputs } from '../types';
import styles from './BondDetailsSection.module.css';

/**
 * Props for BondDetailsSection component
 */
interface BondDetailsSectionProps {
  inputs: BondInputs;
  onInputChange: (field: keyof BondInputs, value: string | number | Date) => void;
  errors?: Record<string, string>;
}

/**
 * BondDetailsSection component for bond input form
 * Handles Face Value, Coupon Rate, Purchase Price, Accrued Interest, dates, and TDS Rate
 */
export const BondDetailsSection: React.FC<BondDetailsSectionProps> = ({
  inputs,
  onInputChange,
  errors = {}
}) => {
  /**
   * Handle input change with validation
   */
  const handleInputChange = (field: keyof BondInputs, value: string | Date) => {
    let processedValue: string | number | Date = value;
    
    // Convert string to number for numeric fields
    if (typeof value === 'string' && 
        ['faceValue', 'couponRate', 'purchasePrice', 'accruedInterest', 'brokerage', 'tdsRate'].includes(field)) {
      processedValue = value === '' ? '' : parseFloat(value);
    }
    
    onInputChange(field, processedValue);
  };

  /**
   * Format date for input field
   */
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  /**
   * Handle date input change
   */
  const handleDateChange = (field: keyof BondInputs, value: string) => {
    const date = new Date(value);
    onInputChange(field, date);
  };

  return (
    <div className={styles.bondDetailsSection}>
      <h3>Bond Details</h3>
      
      <div className={styles.formGrid}>
        {/* Face Value */}
        <div className={styles.formGroup}>
          <label htmlFor="faceValue">
            Face Value <span className={styles.required}>*</span>
          </label>
          <input
            id="faceValue"
            type="number"
            value={inputs.faceValue || ''}
            onChange={(e) => handleInputChange('faceValue', e.target.value)}
            placeholder="100000"
            min="1000"
            max="10000000"
            step="1000"
            className={errors.faceValue ? styles.error : ''}
          />
          {errors.faceValue && (
            <span className={styles.errorMessage}>{errors.faceValue}</span>
          )}
        </div>

        {/* Coupon Rate */}
        <div className={styles.formGroup}>
          <label htmlFor="couponRate">
            Coupon Rate (%) <span className={styles.required}>*</span>
          </label>
          <input
            id="couponRate"
            type="number"
            value={inputs.couponRate || ''}
            onChange={(e) => handleInputChange('couponRate', e.target.value)}
            placeholder="11.9"
            min="0"
            max="50"
            step="0.1"
            className={errors.couponRate ? styles.error : ''}
          />
          {errors.couponRate && (
            <span className={styles.errorMessage}>{errors.couponRate}</span>
          )}
        </div>

        {/* Purchase Price */}
        <div className={styles.formGroup}>
          <label htmlFor="purchasePrice">
            Purchase Price (% of Face) <span className={styles.required}>*</span>
          </label>
          <input
            id="purchasePrice"
            type="number"
            value={inputs.purchasePrice || ''}
            onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
            placeholder="102.5"
            min="50"
            max="200"
            step="0.1"
            className={errors.purchasePrice ? styles.error : ''}
          />
          {errors.purchasePrice && (
            <span className={styles.errorMessage}>{errors.purchasePrice}</span>
          )}
        </div>

        {/* Accrued Interest */}
        <div className={styles.formGroup}>
          <label htmlFor="accruedInterest">
            Accrued Interest <span className={styles.required}>*</span>
          </label>
          <input
            id="accruedInterest"
            type="number"
            value={inputs.accruedInterest || ''}
            onChange={(e) => handleInputChange('accruedInterest', e.target.value)}
            placeholder="358.63"
            min="0"
            max="100000"
            step="0.01"
            className={errors.accruedInterest ? styles.error : ''}
          />
          {errors.accruedInterest && (
            <span className={styles.errorMessage}>{errors.accruedInterest}</span>
          )}
        </div>

        {/* Brokerage */}
        <div className={styles.formGroup}>
          <label htmlFor="brokerage">
            Brokerage <span className={styles.required}>*</span>
          </label>
          <input
            id="brokerage"
            type="number"
            value={inputs.brokerage || ''}
            onChange={(e) => handleInputChange('brokerage', e.target.value)}
            placeholder="0"
            min="0"
            max="50000"
            step="0.01"
            className={errors.brokerage ? styles.error : ''}
          />
          {errors.brokerage && (
            <span className={styles.errorMessage}>{errors.brokerage}</span>
          )}
        </div>

        {/* Purchase Date */}
        <div className={styles.formGroup}>
          <label htmlFor="purchaseDate">
            Purchase Date <span className={styles.required}>*</span>
          </label>
          <input
            id="purchaseDate"
            type="date"
            value={formatDateForInput(inputs.purchaseDate)}
            onChange={(e) => handleDateChange('purchaseDate', e.target.value)}
            className={errors.purchaseDate ? styles.error : ''}
          />
          {errors.purchaseDate && (
            <span className={styles.errorMessage}>{errors.purchaseDate}</span>
          )}
        </div>

        {/* Maturity Date */}
        <div className={styles.formGroup}>
          <label htmlFor="maturityDate">
            Maturity Date <span className={styles.required}>*</span>
          </label>
          <input
            id="maturityDate"
            type="date"
            value={formatDateForInput(inputs.maturityDate)}
            onChange={(e) => handleDateChange('maturityDate', e.target.value)}
            className={errors.maturityDate ? styles.error : ''}
          />
          {errors.maturityDate && (
            <span className={styles.errorMessage}>{errors.maturityDate}</span>
          )}
        </div>

        {/* TDS Rate */}
        <div className={styles.formGroup}>
          <label htmlFor="tdsRate">
            TDS Rate (%) <span className={styles.required}>*</span>
          </label>
          <input
            id="tdsRate"
            type="number"
            value={inputs.tdsRate || ''}
            onChange={(e) => handleInputChange('tdsRate', e.target.value)}
            placeholder="10"
            min="0"
            max="50"
            step="0.1"
            className={errors.tdsRate ? styles.error : ''}
          />
          {errors.tdsRate && (
            <span className={styles.errorMessage}>{errors.tdsRate}</span>
          )}
        </div>
      </div>
    </div>
  );
};