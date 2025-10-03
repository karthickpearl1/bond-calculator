import React, { useState, useEffect } from 'react';
import type { XIRRMatrix, BondInputs } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import styles from './ReturnMatrix.module.css';

interface ReturnMatrixProps {
  xirrMatrix: XIRRMatrix;
  salePrices: number[];
  exitYears: number[];
  purchasePrice: number;
  bondInputs: BondInputs;
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
  purchasePrice,
  bondInputs,
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
   * Calculate total amount earned for a scenario
   * @param exitYear - Exit year (1-based, where 1 = exit in purchase year)
   * @param salePrice - Sale price percentage
   * @returns Total amount earned (sale proceeds + net coupons)
   */
  const calculateTotalAmount = (exitYear: number, salePrice: number): number => {
    // Sale proceeds
    const saleProceeds = bondInputs.faceValue * (salePrice / 100);
    
    // Net monthly coupon
    const monthlyCoupon = (bondInputs.faceValue * (bondInputs.couponRate / 100)) / 12;
    const netMonthlyCoupon = monthlyCoupon * (1 - (bondInputs.tdsRate / 100));
    
    // Calculate total months from purchase to exit
    const purchaseDate = bondInputs.purchaseDate;
    const monthsInFirstYear = 12 - purchaseDate.getMonth(); // Remaining months in purchase year (including purchase month)
    const additionalYears = exitYear - 1;
    const totalMonths = monthsInFirstYear + (additionalYears * 12);
    
    const totalCoupons = netMonthlyCoupon * totalMonths;
    
    return saleProceeds + totalCoupons;
  };

  const { formatCurrency } = useCurrency();

  /**
   * Format currency amount using selected currency
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  const formatAmount = (amount: number): string => {
    return formatCurrency(amount);
  };

  /**
   * Get the display year for an exit year
   * For partial year scenarios, Year 1 represents the purchase year itself
   * @param exitYear - Number of years after purchase (1-based)
   * @returns Display year (e.g., 2025 for exit year 1 if purchased in 2025)
   */
  const getDisplayYear = (exitYear: number): string => {
    const purchaseYear = bondInputs.purchaseDate.getFullYear();
    return (purchaseYear + exitYear - 1).toString();
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
   * Check if a sale price matches the purchase price
   * @param salePrice - Sale price to check
   * @returns True if this is the purchase price
   */
  const isPurchasePrice = (salePrice: number): boolean => {
    return Math.abs(salePrice - purchasePrice) < 0.01; // Allow for small floating point differences
  };

  /**
   * Determine cell styling based on XIRR value
   * @param xirr - XIRR value
   * @param salePrice - Sale price for additional styling
   * @returns CSS class name for styling
   */
  const getCellClass = (xirr: number | null, salePrice?: number): string => {
    let baseClass = '';
    
    if (xirr === null || isNaN(xirr) || !isFinite(xirr)) {
      baseClass = styles.cellError;
    } else {
      // Color coding based on return levels
      if (xirr >= 0.15) baseClass = styles.cellExcellent; // 15%+
      else if (xirr >= 0.12) baseClass = styles.cellGood;      // 12-15%
      else if (xirr >= 0.08) baseClass = styles.cellFair;      // 8-12%
      else baseClass = styles.cellPoor;                        // <8%
    }
    
    // Add purchase price marker
    if (salePrice && isPurchasePrice(salePrice)) {
      baseClass += ` ${styles.purchasePriceColumn}`;
    }
    
    return baseClass;
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
              const totalAmount = calculateTotalAmount(exitYear, salePrice);
              return (
                <div 
                  key={`${exitYear}-${salePrice}`}
                  className={`${styles.cardItem} ${getCellClass(xirrValue, salePrice)}`}
                >
                  <div className={styles.cardLabel}>
                    Sale Price: {salePrice}%
                    {isPurchasePrice(salePrice) && (
                      <span className={styles.purchaseMarker} title="Purchase Price">
                        💰
                      </span>
                    )}
                  </div>
                  <div className={styles.cardValue}>
                    {isCalculating ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      <div className={styles.cardContent}>
                        <div className={styles.xirrValue}>
                          {xirrValue !== null ? formatXIRR(xirrValue) : 'N/A'}
                        </div>
                        <div className={styles.totalAmount}>
                          {formatAmount(totalAmount)}
                        </div>
                      </div>
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
              <th 
                key={price} 
                className={`${styles.headerCell} ${isPurchasePrice(price) ? styles.purchasePriceHeader : ''}`}
              >
                <div className={styles.headerContent}>
                  <span className={styles.priceValue}>{price}%</span>
                  {isPurchasePrice(price) && (
                    <span className={styles.purchaseMarker} title="Purchase Price">
                      💰
                    </span>
                  )}
                </div>
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
                const totalAmount = calculateTotalAmount(exitYear, salePrice);
                return (
                  <td 
                    key={`${exitYear}-${salePrice}`}
                    className={`${styles.dataCell} ${getCellClass(xirrValue, salePrice)}`}
                    title={`Exit Year ${exitYear}, Sale Price ${salePrice}%${isPurchasePrice(salePrice) ? ' (Purchase Price)' : ''}\nXIRR: ${xirrValue !== null ? formatXIRR(xirrValue) : 'N/A'}\nTotal Amount: ${formatAmount(totalAmount)}`}
                  >
                    {isCalculating ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      <div className={styles.cellContent}>
                        <div className={styles.xirrValue}>
                          {xirrValue !== null ? formatXIRR(xirrValue) : 'N/A'}
                        </div>
                        <div className={styles.totalAmount}>
                          {formatAmount(totalAmount)}
                        </div>
                      </div>
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
        <h3 className={styles.title}>Return Matrix (XIRR % & Total Amount)</h3>
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