import React, { useMemo } from 'react';
import styles from './ExitYearSelector.module.css';

/**
 * Props for ExitYearSelector component
 */
interface ExitYearSelectorProps {
  selectedYears: number[];
  onSelectionChange: (selectedYears: number[]) => void;
  purchaseDate: Date;
  maturityDate: Date;
}

/**
 * ExitYearSelector component for selecting exit year scenarios
 * Dynamically generates exit years based on purchase and maturity dates
 */
export const ExitYearSelector: React.FC<ExitYearSelectorProps> = ({
  selectedYears,
  onSelectionChange,
  purchaseDate,
  maturityDate
}) => {
  /**
   * Calculate available exit years based on purchase and maturity dates
   */
  const availableExitYears = useMemo(() => {
    const purchaseYear = purchaseDate.getFullYear();
    const maturityYear = maturityDate.getFullYear();
    const maxYears = maturityYear - purchaseYear;
    
    // Generate years from 1 to maxYears, but at least 1 year
    const years: number[] = [];
    for (let i = 1; i <= Math.max(1, maxYears); i++) {
      years.push(i);
    }
    
    return years;
  }, [purchaseDate, maturityDate]);

  /**
   * Calculate the actual calendar year for an exit year
   */
  const getExitCalendarYear = (exitYear: number): number => {
    return purchaseDate.getFullYear() + exitYear;
  };

  /**
   * Handle checkbox change for individual exit year
   */
  const handleYearToggle = (year: number) => {
    const isSelected = selectedYears.includes(year);
    
    if (isSelected) {
      // Remove year from selection
      const newSelection = selectedYears.filter(y => y !== year);
      onSelectionChange(newSelection);
    } else {
      // Add year to selection
      const newSelection = [...selectedYears, year].sort((a, b) => a - b);
      onSelectionChange(newSelection);
    }
  };

  /**
   * Handle select all / deselect all
   */
  const handleSelectAll = () => {
    if (selectedYears.length === availableExitYears.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all available years
      onSelectionChange([...availableExitYears]);
    }
  };

  /**
   * Check if all years are selected
   */
  const allSelected = selectedYears.length === availableExitYears.length;
  const someSelected = selectedYears.length > 0;

  return (
    <div className={styles.exitYearSelector}>
      <div className={styles.header}>
        <h3>Exit Year Scenarios</h3>
        <button
          type="button"
          onClick={handleSelectAll}
          className={styles.selectAllButton}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <p className={styles.description}>
        Select the exit years you want to analyze (years after purchase):
      </p>

      <div className={styles.yearGrid}>
        {availableExitYears.map((exitYear) => {
          const isSelected = selectedYears.includes(exitYear);
          const calendarYear = getExitCalendarYear(exitYear);
          
          return (
            <label
              key={exitYear}
              className={`${styles.yearOption} ${isSelected ? styles.selected : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleYearToggle(exitYear)}
                className={styles.checkbox}
              />
              <div className={styles.yearLabel}>
                <span className={styles.exitYear}>Year {exitYear}</span>
                <span className={styles.calendarYear}>({calendarYear})</span>
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
            {selectedYears.length} of {availableExitYears.length} exit years selected
          </span>
          <div className={styles.selectedYears}>
            Selected: {selectedYears.map(year => getExitCalendarYear(year)).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};