import React, { useRef, useCallback } from 'react';
import type { BondInputs } from '../types';
import { analyticsService } from '../services/analyticsService';
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
  // Ref for debouncing analytics events
  const debounceTimeoutRef = useRef<Record<string, number>>({});

  /**
   * Track input changes with debouncing to avoid excessive events
   */
  const trackInputChange = useCallback((field: keyof BondInputs, value: string | number | Date) => {
    // Clear existing timeout for this field
    if (debounceTimeoutRef.current[field]) {
      clearTimeout(debounceTimeoutRef.current[field]);
    }

    // Set new debounced timeout
    debounceTimeoutRef.current[field] = window.setTimeout(() => {
      // Only track if value is not empty
      if (value !== '' && value !== null && value !== undefined) {
        analyticsService.trackUserInteraction('bond_parameter_change', {
          component: 'BondDetailsSection',
          action: 'input_change',
          input_field: field,
          value: typeof value === 'object' ? 'date' : String(value)
        });
      }
    }, 1000); // 1 second debounce delay
  }, []);

  /**
   * Handle input change with validation and tracking
   */
  const handleInputChange = (field: keyof BondInputs, value: string | Date) => {
    try {
      let processedValue: string | number | Date = value;
      
      // Convert string to number for numeric fields
      if (typeof value === 'string' && 
          ['faceValue', 'couponRate', 'purchasePrice', 'accruedInterest', 'brokerage', 'tdsRate'].includes(field)) {
        processedValue = value === '' ? '' : parseFloat(value);
      }
      
      // Track the input change with debouncing
      trackInputChange(field, processedValue);
      
      onInputChange(field, processedValue);
    } catch (error) {
      console.error('Error processing input change:', error);
    }
  };

  /**
   * Format date for input field
   */
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  /**
   * Handle date input change with tracking
   */
  const handleDateChange = (field: keyof BondInputs, value: string) => {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        // Track the date change with debouncing
        trackInputChange(field, date);
        
        onInputChange(field, date);
      }
    } catch (error) {
      console.error('Invalid date input:', error);
    }
  };

  return (
    <div className={styles.bondDetailsSection}>
      <h3>Bond Details</h3>
      
      <div className={styles.formGrid}>
        {/* Face Value - Full width on mobile */}
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

        {/* Price Row - Two columns on mobile */}
        <div className={styles.mobileRow}>
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

          <div className={styles.formGroup}>
            <label htmlFor="purchasePrice">
              Purchase Price (%) <span className={styles.required}>*</span>
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
        </div>

        {/* Interest & Brokerage Row - Two columns on mobile */}
        <div className={styles.mobileRow}>
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
        </div>

        {/* Date Row - Two columns on mobile */}
        <div className={styles.dateRow}>
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
        </div>

        {/* TDS Rate - Full width */}
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