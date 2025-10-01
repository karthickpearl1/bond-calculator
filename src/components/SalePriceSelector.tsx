import React, { useState, useMemo } from 'react';
import styles from './SalePriceSelector.module.css';

/**
 * Props for SalePriceSelector component
 */
interface SalePriceSelectorProps {
  selectedPrices: number[];
  onSelectionChange: (selectedPrices: number[]) => void;
  purchasePrice: number;
  availablePrices: number[];
  onAvailablePricesChange: (prices: number[]) => void;
}

/**
 * SalePriceSelector component for selecting sale price scenarios
 * Dynamically generates default prices based on purchase price and allows custom additions
 */
export const SalePriceSelector: React.FC<SalePriceSelectorProps> = ({
  selectedPrices,
  onSelectionChange,
  purchasePrice,
  availablePrices,
  onAvailablePricesChange
}) => {
  const [newPriceInput, setNewPriceInput] = useState<string>('');
  const [showAddInput, setShowAddInput] = useState<boolean>(false);

  /**
   * Generate default prices from face value (100%) to purchase price
   */
  const defaultPrices = useMemo(() => {
    const prices: number[] = [];
    const faceValue = 100; // Face value is always 100%
    
    // Determine the range from face value to purchase price
    const minPrice = Math.min(faceValue, purchasePrice);
    const maxPrice = Math.max(faceValue, purchasePrice);
    
    // Generate prices with 0.5% increments
    const startPrice = Math.floor(minPrice * 2) / 2; // Round down to nearest 0.5
    const endPrice = Math.ceil(maxPrice * 2) / 2;   // Round up to nearest 0.5
    
    for (let price = startPrice; price <= endPrice; price += 0.5) {
      prices.push(price);
    }
    
    // Ensure face value (100%) is always included
    if (!prices.includes(faceValue)) {
      prices.push(faceValue);
    }
    
    // Ensure exact purchase price is always included
    if (!prices.includes(purchasePrice)) {
      prices.push(purchasePrice);
    }
    
    return prices.sort((a, b) => a - b);
  }, [purchasePrice]);
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
   * Handle adding a new price
   */
  const handleAddPrice = () => {
    const price = parseFloat(newPriceInput);
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }
    
    if (availablePrices.includes(price)) {
      alert('This price is already in the list');
      return;
    }
    
    // Add to available prices and sort
    const newAvailablePrices = [...availablePrices, price].sort((a, b) => a - b);
    onAvailablePricesChange(newAvailablePrices);
    
    // Clear input and hide
    setNewPriceInput('');
    setShowAddInput(false);
  };

  /**
   * Handle removing a price
   */
  const handleRemovePrice = (price: number) => {
    // Remove from available prices
    const newAvailablePrices = availablePrices.filter(p => p !== price);
    onAvailablePricesChange(newAvailablePrices);
    
    // Remove from selected prices if it was selected
    if (selectedPrices.includes(price)) {
      const newSelectedPrices = selectedPrices.filter(p => p !== price);
      onSelectionChange(newSelectedPrices);
    }
  };

  /**
   * Reset to default prices
   */
  const handleResetToDefaults = () => {
    onAvailablePricesChange([...defaultPrices]);
    // Keep only selected prices that are in the new default list
    const newSelectedPrices = selectedPrices.filter(price => defaultPrices.includes(price));
    onSelectionChange(newSelectedPrices);
  };

  /**
   * Handle select all / deselect all
   */
  const handleSelectAll = () => {
    if (selectedPrices.length === availablePrices.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all available prices
      onSelectionChange([...availablePrices]);
    }
  };

  /**
   * Check if all prices are selected
   */
  const allSelected = selectedPrices.length === availablePrices.length;
  const someSelected = selectedPrices.length > 0;
  
  /**
   * Check if a price is a default price
   */
  const isDefaultPrice = (price: number) => defaultPrices.includes(price);

  return (
    <div className={styles.salePriceSelector}>
      <div className={styles.header}>
        <h3>Sale Price Scenarios</h3>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleSelectAll}
            className={styles.selectAllButton}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>
      
      <p className={styles.description}>
        Select the sale price scenarios you want to analyze (% of face value). 
        Default range: 100% (face value) to {purchasePrice}% (purchase price) in 0.5% increments:
      </p>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => setShowAddInput(!showAddInput)}
          className={styles.addButton}
        >
          {showAddInput ? 'Cancel' : 'Add Price'}
        </button>
        
        <button
          type="button"
          onClick={handleResetToDefaults}
          className={styles.resetButton}
        >
          Reset to Defaults
        </button>
      </div>

      {showAddInput && (
        <div className={styles.addPriceSection}>
          <div className={styles.addPriceInput}>
            <input
              type="number"
              value={newPriceInput}
              onChange={(e) => setNewPriceInput(e.target.value)}
              placeholder="Enter price (e.g., 103.5)"
              min="0"
              max="200"
              step="0.1"
              className={styles.priceInput}
            />
            <button
              type="button"
              onClick={handleAddPrice}
              className={styles.confirmAddButton}
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className={styles.priceGrid}>
        {availablePrices.map((price) => {
          const isSelected = selectedPrices.includes(price);
          const isDefault = isDefaultPrice(price);
          
          return (
            <div
              key={price}
              className={`${styles.priceOption} ${isSelected ? styles.selected : ''}`}
            >
              <label className={styles.priceLabel}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handlePriceToggle(price)}
                  className={styles.checkbox}
                />
                <div className={styles.priceContent}>
                  <span className={styles.percentage}>{price}%</span>
                  <span className={styles.description}>
                    {price === purchasePrice ? 'Purchase Price' : 
                     price === 100 ? 'Face Value' : 'of Face Value'}
                  </span>
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
              
              {!isDefault && (
                <button
                  type="button"
                  onClick={() => handleRemovePrice(price)}
                  className={styles.removeButton}
                  title="Remove this price"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {someSelected && (
        <div className={styles.selectionSummary}>
          <span className={styles.selectedCount}>
            {selectedPrices.length} of {availablePrices.length} scenarios selected
          </span>
          <div className={styles.selectedPrices}>
            Selected: {selectedPrices.sort((a, b) => a - b).join('%, ')}%
          </div>
        </div>
      )}
    </div>
  );
};