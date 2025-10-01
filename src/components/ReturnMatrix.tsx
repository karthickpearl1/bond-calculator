import React, { useState, useEffect } from 'react';
import type { XIRRMatrix } from '../types';
import styles from './ReturnMatrix.module.css';

interface ReturnMatrixProps {
  xirrMatrix: XIRRMatrix;
  salePrices: number[];
  exitYears: number[];
  isCalculating?: boolean;
  calculationErrors?: string[];
}

/**
 * ReturnMatrix component displays XIRR calculations in a matrix format
 * Shows Exit Years as rows and Sale Prices as columns
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export const ReturnMatrix: React.FC<ReturnMatrixProps> = ({
  xirrMatrix,
  salePrices,
  exitYears,
  isCalculating = false,
  calculationErrors = []
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setViewMode(mobile ? 'cards' : 'table');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  /**
   * Format XIRR value as percentage with 2 decimal places
   * @param xirr - XIRR value as decimal (e.g., 0.12 for 12%)
   * @returns Formatted percentage string
   */
  const formatXIRR = (xirr: number): string => {
    if (isNaN(xirr) || !isFinite(xirr)) {
      return 'N/A';
    }
    return `${(xirr * 100).toFixed(2)}%`;
  };

  /**
   * Get the display year for an exit year (purchase year + exit year)
   * @param exitYear - Number of years after purchase
   * @returns Display year (e.g., 2026 for exit year 1 if purchased in 2025)
   */
  const getDisplayYear = (exitYear: number): string => {
    const currentYear = new Date().getFullYear();
    return (currentYear + exitYear).toString();
  };

  /**
   * Get XIRR value for a specific exit year and sale price combination
   * @param exitYear - Exit year
   * @param salePrice - Sale price percentage
   * @returns XIRR value or null if not available
   */
  const getXIRRValue = (exitYear: number, salePrice: number): number | null => {
    return xirrMatrix[exitYear]?.[salePrice] ?? null;
  };

  /**
   * Determine cell styling based on XIRR value
   * @param xirr - XIRR value
   * @returns CSS class name for styling
   */
  const getCellClass = (xirr: number | null): string => {
    if (xirr === null || isNaN(xirr) || !isFinite(xirr)) {
      return styles.cellError;
    }
    
    // Color coding based on return levels
    if (xirr >= 0.15) return styles.cellExcellent; // 15%+
    if (xirr >= 0.12) return styles.cellGood;      // 12-15%
    if (xirr >= 0.08) return styles.cellFair;      // 8-12%
    return styles.cellPoor;                        // <8%
  };

  if (calculationErrors.length > 0) {
    return (
      <div className={styles.returnMatrix}>
        <h3 className={styles.title}>Return Matrix</h3>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            Unable to calculate returns due to the following errors:
          </p>
          <ul className={styles.errorList}>
            {calculationErrors.map((error, index) => (
              <li key={index} className={styles.errorItem}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  /**
   * Render mobile-friendly card view
   */
  const renderCardView = () => (
    <div className={styles.cardView}>
      {exitYears.map(exitYear => (
        <div key={exitYear} className={styles.yearCard}>
          <div className={styles.cardHeader}>
            <h4 className={styles.cardTitle}>
              {getDisplayYear(exitYear)} (Year {exitYear})
            </h4>
          </div>
          <div className={styles.cardGrid}>
            {salePrices.map(salePrice => {
              const xirrValue = getXIRRValue(exitYear, salePrice);
              return (
                <div 
                  key={`${exitYear}-${salePrice}`}
                  className={`${styles.cardItem} ${getCellClass(xirrValue)}`}
                >
                  <div className={styles.cardLabel}>
                    Sale Price: {salePrice}%
                  </div>
                  <div className={styles.cardValue}>
                    {isCalculating ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      <span className={styles.xirrValue}>
                        {xirrValue !== null ? formatXIRR(xirrValue) : 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Render desktop table view
   */
  const renderTableView = () => (
    <div className={styles.tableContainer}>
      <table className={styles.matrix}>
        <thead>
          <tr>
            <th className={styles.headerCell}>Exit Year</th>
            {salePrices.map(price => (
              <th key={price} className={styles.headerCell}>
                {price}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exitYears.map(exitYear => (
            <tr key={exitYear}>
              <td className={styles.rowHeader}>
                {getDisplayYear(exitYear)}
                <span className={styles.yearSubtext}>
                  (Year {exitYear})
                </span>
              </td>
              {salePrices.map(salePrice => {
                const xirrValue = getXIRRValue(exitYear, salePrice);
                return (
                  <td 
                    key={`${exitYear}-${salePrice}`}
                    className={`${styles.dataCell} ${getCellClass(xirrValue)}`}
                    title={`Exit Year ${exitYear}, Sale Price ${salePrice}%: ${xirrValue !== null ? formatXIRR(xirrValue) : 'N/A'}`}
                  >
                    {isCalculating ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      <span className={styles.xirrValue}>
                        {xirrValue !== null ? formatXIRR(xirrValue) : 'N/A'}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.returnMatrix}>
      <div className={styles.matrixHeader}>
        <h3 className={styles.title}>Return Matrix (XIRR %)</h3>
        {isMobile && (
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'table' ? styles.active : ''}`}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
            >
              📊
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'cards' ? styles.active : ''}`}
              onClick={() => setViewMode('cards')}
              aria-label="Card view"
            >
              📱
            </button>
          </div>
        )}
      </div>
      
      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {!isCalculating && (
        <div className={styles.legend}>
          <h4 className={styles.legendTitle}>Return Levels</h4>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.cellExcellent}`}></span>
              <span>Excellent (15%+)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.cellGood}`}></span>
              <span>Good (12-15%)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.cellFair}`}></span>
              <span>Fair (8-12%)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={`${styles.legendColor} ${styles.cellPoor}`}></span>
              <span>Poor (&lt;8%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnMatrix;