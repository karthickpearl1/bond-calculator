import React from 'react';
import { DEFAULT_SALE_PRICES } from '../types';
import styles from './SalePriceSelector.module.css';

/**
 * Props for SalePriceSelector component
 */
interface SalePriceSelectorProps {
  selectedPrices: number[];
  onSelectionChange: (selectedPrices: number[]) => void;
}

/**
 * SalePriceSelector component for selecting sale price scenarios
 * Provides selectable options for 100%, 101%, 102%, and 102.5% sale prices
 */
export const SalePriceSelector: React.FC<SalePriceSelectorProps> = ({
  selectedPrices,
  onSelectionChange
}) => {
  /**
   * Handle checkbox change for individual sale price
   */
  const handlePriceToggle = (price: number) => {
    const isSelected = selectedPrices.includes(price);
    
    if (isSelected) {
      // Remove price from selection
      const newSelection = selectedPrices.filter(p => p !== price);
      onSelectionChange(newSelection);
    } else {
      // Add price to selection
      const newSelection = [...selectedPrices, price].sort((a, b) => a - b);
      onSelectionChange(newSelection);
    }
  };

  /**
   * Handle select all / deselect all
   */
  const handleSelectAll = () => {
    if (selectedPrices.length === DEFAULT_SALE_PRICES.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange([...DEFAULT_SALE_PRICES]);
    }
  };

  /**
   * Check if all prices are selected
   */
  const allSelected = selectedPrices.length === DEFAULT_SALE_PRICES.length;
  const someSelected = selectedPrices.length > 0;

  return (
    <div className={styles.salePriceSelector}>
      <div className={styles.header}>
        <h3>Sale Price Scenarios</h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className={styles.selectAllButton}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <p className={styles.description}>
        Select the sale price scenarios you want to analyze (% of face value):
      </p>

      <div className={styles.priceGrid}>
        {DEFAULT_SALE_PRICES.map((price) => {
          const isSelected = selectedPrices.includes(price);
          
          return (
            <label
              key={price}
              className={`${styles.priceOption} ${isSelected ? styles.selected : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handlePriceToggle(price)}
                className={styles.checkbox}
              />
              <div className={styles.priceLabel}>
                <span className={styles.percentage}>{price}%</span>
                <span className={styles.description}>of Face Value</span>
              </div>
              <div className={styles.checkmark}>
                {isSelected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 4.5L6 12L2.5 8.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {someSelected && (
        <div className={styles.selectionSummary}>
          <span className={styles.selectedCount}>
            {selectedPrices.length} of {DEFAULT_SALE_PRICES.length} scenarios selected
          </span>
        </div>
      )}
    </div>
  );
};