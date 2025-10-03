import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { 
  BondInputs, 
  CalculationResults, 
  XIRRMatrix, 
  ErrorState
} from '../types';
import { 
  DEFAULT_BOND_INPUTS, 
  DEFAULT_SALE_PRICES, 
  DEFAULT_EXIT_YEARS 
} from '../types';
import { BondCalculator as BondCalc } from '../utils/BondCalculator';
import { XIRRCalculator } from '../utils/XIRRCalculator';
import { getValidationErrors, areAllInputsValid } from '../utils/validation';
import { BondDetailsSection } from './BondDetailsSection';
import { SalePriceSelector } from './SalePriceSelector';
import { ExitYearSelector } from './ExitYearSelector';
import { CalculationSummary } from './CalculationSummary';
import { ReturnMatrix } from './ReturnMatrix';
import { ThemeToggle } from './ThemeToggle';
import { CurrencySelector } from './CurrencySelector';
import { Footer } from './Footer';
import styles from './BondCalculator.module.css';

/**
 * Main BondCalculator container component
 * Manages all application state and coordinates between input components and results display
 * Requirements: 6.1, 6.4
 */
export const BondCalculator: React.FC = () => {
  // Application state
  const [inputs, setInputs] = useState<BondInputs>(DEFAULT_BOND_INPUTS);
  const [selectedSalePrices, setSelectedSalePrices] = useState<number[]>(DEFAULT_SALE_PRICES);
  const [availableSalePrices, setAvailableSalePrices] = useState<number[]>(DEFAULT_SALE_PRICES);
  const [selectedExitYears, setSelectedExitYears] = useState<number[]>(DEFAULT_EXIT_YEARS);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorState>({
    inputErrors: {},
    calculationErrors: [],
    systemErrors: []
  });

  // Refs for debouncing
  const debounceTimeoutRef = useRef<number | null>(null);
  const calculationTimeoutRef = useRef<number | null>(null);

  /**
   * Effect to handle cleanup of timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Generate default sale prices from face value (100%) to purchase price
   */
  const generateDefaultSalePrices = useCallback((purchasePrice: number): number[] => {
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
  }, []);

  /**
   * Generate default exit years based on maturity date
   */
  const generateDefaultExitYears = useCallback((purchaseDate: Date, maturityDate: Date): number[] => {
    const purchaseYear = purchaseDate.getFullYear();
    const maturityYear = maturityDate.getFullYear();
    const maxYears = maturityYear - purchaseYear + 1; // +1 because year 1 is the purchase year
    
    // Generate all available years from 1 to maxYears
    const years: number[] = [];
    for (let i = 1; i <= Math.max(1, maxYears); i++) {
      years.push(i);
    }
    
    return years;
  }, []);

  /**
   * Effect to update available sale prices when purchase price changes
   */
  useEffect(() => {
    const newDefaultPrices = generateDefaultSalePrices(inputs.purchasePrice);
    
    // Only update if this is the initial load or if the available prices are empty
    if (availableSalePrices.length === 0) {
      setAvailableSalePrices(newDefaultPrices);
      // Set initial selected prices
      const keyPrices = [100, inputs.purchasePrice]; // Always include face value and purchase price
      const additionalPrices = newDefaultPrices.filter(p => !keyPrices.includes(p)).slice(0, 2);
      const defaultSelection = [...keyPrices, ...additionalPrices].filter(p => newDefaultPrices.includes(p));
      setSelectedSalePrices(defaultSelection);
    }
  }, [inputs.purchasePrice, generateDefaultSalePrices]);

  /**
   * Effect to update default exit years when purchase or maturity date changes
   */
  useEffect(() => {
    const newDefaultExitYears = generateDefaultExitYears(inputs.purchaseDate, inputs.maturityDate);
    
    // Update selected exit years to include all available years by default
    setSelectedExitYears(newDefaultExitYears);
  }, [inputs.purchaseDate, inputs.maturityDate, generateDefaultExitYears]);

  /**
   * Effect to trigger recalculation when any parameter changes
   * This provides automatic recalculation as required by 6.1, 6.2, 6.3, 6.4, 6.5
   */
  useEffect(() => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Only trigger calculation if we have valid inputs and selections
    if (areAllInputsValid(inputs) && selectedSalePrices.length > 0 && selectedExitYears.length > 0) {
      // Debounce the calculation trigger
      debounceTimeoutRef.current = window.setTimeout(() => {
        triggerCalculation();
      }, 300); // 300ms debounce delay
    } else {
      // Clear loading state if inputs are invalid
      setIsCalculating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, selectedSalePrices, selectedExitYears]);

  /**
   * Debounced calculation trigger
   */
  const triggerCalculation = useCallback(() => {
    // Clear existing timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current);
    }

    // Set loading state
    setIsCalculating(true);

    // Debounce calculation to avoid excessive computation
    calculationTimeoutRef.current = window.setTimeout(() => {
      setIsCalculating(false);
    }, 300); // 300ms delay for calculation completion
  }, []);

  /**
   * Handle input field changes with validation
   * Recalculation is handled automatically by useEffect
   */
  const handleInputChange = useCallback((field: keyof BondInputs, value: string | number | Date) => {
    setInputs(prevInputs => {
      const newInputs = { ...prevInputs, [field]: value };
      
      // Update validation errors
      const validationErrors = getValidationErrors(newInputs);
      setErrors(prevErrors => ({
        ...prevErrors,
        inputErrors: validationErrors
      }));
      
      return newInputs;
    });
  }, []);

  /**
   * Handle sale price selection changes
   * Recalculation is handled automatically by useEffect
   */
  const handleSalePriceChange = useCallback((prices: number[]) => {
    setSelectedSalePrices(prices);
  }, []);

  /**
   * Handle available sale prices changes
   */
  const handleAvailableSalePricesChange = useCallback((prices: number[]) => {
    setAvailableSalePrices(prices);
    // Remove any selected prices that are no longer available
    setSelectedSalePrices(prev => prev.filter(price => prices.includes(price)));
  }, []);

  /**
   * Handle exit year selection changes
   * Recalculation is handled automatically by useEffect
   */
  const handleExitYearChange = useCallback((years: number[]) => {
    setSelectedExitYears(years);
  }, []);

  /**
   * Calculate basic bond metrics (cost, coupons)
   */
  const basicCalculations = useMemo(() => {
    try {
      const totalCost = BondCalc.calculateTotalCost(
        inputs.faceValue,
        inputs.purchasePrice,
        inputs.accruedInterest,
        inputs.brokerage
      );

      const monthlyCoupon = BondCalc.calculateMonthlyCoupon(
        inputs.faceValue,
        inputs.couponRate
      );

      const netMonthlyCoupon = BondCalc.calculateNetMonthlyCoupon(
        monthlyCoupon,
        inputs.tdsRate
      );

      return {
        totalCost,
        monthlyCoupon,
        netMonthlyCoupon
      };
    } catch (error) {
      console.error('Error in basic calculations:', error);
      return {
        totalCost: 0,
        monthlyCoupon: 0,
        netMonthlyCoupon: 0
      };
    }
  }, [inputs.faceValue, inputs.purchasePrice, inputs.accruedInterest, inputs.brokerage, inputs.couponRate, inputs.tdsRate]);

  /**
   * Calculate XIRR matrix for all selected scenarios with enhanced error handling
   */
  const xirrMatrix = useMemo<XIRRMatrix>(() => {
    // Only calculate if inputs are valid and we have selections
    if (!areAllInputsValid(inputs) || 
        selectedSalePrices.length === 0 || 
        selectedExitYears.length === 0) {
      // Clear errors when inputs are invalid
      setErrors(prevErrors => ({
        ...prevErrors,
        calculationErrors: [],
        systemErrors: []
      }));
      return {};
    }

    const matrix: XIRRMatrix = {};
    const calculationErrors: string[] = [];
    const systemErrors: string[] = [];

    try {
      for (const exitYear of selectedExitYears) {
        matrix[exitYear] = {};
        
        for (const salePrice of selectedSalePrices) {
          try {
            const xirr = XIRRCalculator.calculateScenarioXIRR(
              inputs,
              exitYear,
              salePrice
            );
            matrix[exitYear][salePrice] = xirr;
          } catch (error) {
            console.error(`XIRR calculation failed for year ${exitYear}, price ${salePrice}:`, error);
            matrix[exitYear][salePrice] = NaN;
            
            // Provide user-friendly error messages based on error type
            if (error instanceof Error) {
              if (error.message.includes('converge')) {
                calculationErrors.push(
                  `XIRR calculation did not converge for exit year ${exitYear} and sale price ${salePrice}%. This may indicate an unusual cash flow pattern.`
                );
              } else if (error.message.includes('positive and one negative')) {
                calculationErrors.push(
                  `Invalid cash flow pattern for exit year ${exitYear} and sale price ${salePrice}%. Please check your input values.`
                );
              } else {
                calculationErrors.push(
                  `Calculation error for exit year ${exitYear} and sale price ${salePrice}%: ${error.message}`
                );
              }
            } else {
              calculationErrors.push(
                `Unknown error calculating XIRR for exit year ${exitYear} and sale price ${salePrice}%`
              );
            }
          }
        }
      }

      // Update errors state
      setErrors(prevErrors => ({
        ...prevErrors,
        calculationErrors,
        systemErrors
      }));

    } catch (error) {
      console.error('System error calculating XIRR matrix:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown system error';
      
      systemErrors.push(
        `System error during XIRR calculations: ${errorMessage}. Please try refreshing the page or check your input values.`
      );
      
      setErrors(prevErrors => ({
        ...prevErrors,
        calculationErrors,
        systemErrors
      }));
    }

    return matrix;
  }, [inputs, selectedSalePrices, selectedExitYears]);

  /**
   * Combined calculation results
   */
  const calculations: CalculationResults = useMemo(() => ({
    ...basicCalculations,
    xirrMatrix
  }), [basicCalculations, xirrMatrix]);

  /**
   * Check if we have any errors to display
   */
  const hasErrors = Object.keys(errors.inputErrors).length > 0 || 
                   errors.calculationErrors.length > 0 || 
                   errors.systemErrors.length > 0;

  /**
   * Check if calculations are ready to display
   */
  const canShowResults = areAllInputsValid(inputs) && 
                        selectedSalePrices.length > 0 && 
                        selectedExitYears.length > 0;

  return (
    <div className={styles.bondCalculator}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Bond Return Calculator</h1>
            <p className={styles.subtitle}>
              Analyze bond investment returns through XIRR calculations across different exit scenarios and sale prices
            </p>
          </div>
          <div className={styles.headerActions}>
            <CurrencySelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Left Column - Inputs */}
        <section className={styles.leftColumn}>
          <div className={styles.inputSection}>
            <BondDetailsSection
              inputs={inputs}
              onInputChange={handleInputChange}
              errors={errors.inputErrors}
            />
          </div>

          <div className={styles.selectionSection}>
            <SalePriceSelector
              selectedPrices={selectedSalePrices}
              onSelectionChange={handleSalePriceChange}
              purchasePrice={inputs.purchasePrice}
              availablePrices={availableSalePrices}
              onAvailablePricesChange={handleAvailableSalePricesChange}
            />

            <ExitYearSelector
              selectedYears={selectedExitYears}
              onSelectionChange={handleExitYearChange}
              purchaseDate={inputs.purchaseDate}
              maturityDate={inputs.maturityDate}
            />
          </div>
        </section>

        {/* Right Column - Results */}
        <section className={styles.rightColumn}>
          {/* Input Validation Errors Summary */}
          {Object.keys(errors.inputErrors).length > 0 && (
            <div className={styles.errorContainer}>
              <h3 className={styles.errorTitle}>Input Validation Errors</h3>
              <p className={styles.errorDescription}>
                Please correct the following issues to see calculation results:
              </p>
              <ul className={styles.errorList}>
                {Object.entries(errors.inputErrors).map(([field, error]) => (
                  <li key={field} className={styles.errorItem}>
                    <strong>{field}:</strong> {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* System Errors */}
          {errors.systemErrors.length > 0 && (
            <div className={styles.errorContainer}>
              <h3 className={styles.errorTitle}>System Errors</h3>
              <p className={styles.errorDescription}>
                The application encountered system-level errors:
              </p>
              <ul className={styles.errorList}>
                {errors.systemErrors.map((error, index) => (
                  <li key={index} className={styles.errorItem}>{error}</li>
                ))}
              </ul>
              <div className={styles.errorActions}>
                <button 
                  onClick={() => window.location.reload()}
                  className={styles.refreshButton}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}

          {/* Calculation Summary */}
          {canShowResults && (
            <CalculationSummary
              calculations={calculations}
              isCalculating={isCalculating}
            />
          )}

          {/* Return Matrix */}
          {canShowResults && (
            <ReturnMatrix
              xirrMatrix={calculations.xirrMatrix}
              salePrices={selectedSalePrices}
              exitYears={selectedExitYears}
              purchasePrice={inputs.purchasePrice}
              bondInputs={inputs}
              isCalculating={isCalculating}
              calculationErrors={errors.calculationErrors}
            />
          )}

          {/* No Results Message */}
          {!canShowResults && !hasErrors && (
            <div className={styles.noResultsMessage}>
              <p>Please complete all required fields and select at least one sale price and exit year to see results.</p>
            </div>
          )}
        </section>
      </div>
      
      <Footer />
    </div>
  );
};