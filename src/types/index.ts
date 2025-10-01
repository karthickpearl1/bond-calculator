/**
 * Core TypeScript interfaces for the Bond Return Calculator
 */

/**
 * Bond input parameters from user
 */
export interface BondInputs {
  faceValue: number;
  couponRate: number;
  purchasePrice: number;
  accruedInterest: number;
  brokerage: number;
  purchaseDate: Date;
  maturityDate: Date;
  tdsRate: number;
}

/**
 * Results of bond calculations
 */
export interface CalculationResults {
  totalCost: number;
  monthlyCoupon: number;
  netMonthlyCoupon: number;
  xirrMatrix: XIRRMatrix;
}

/**
 * Matrix of XIRR values indexed by exit year and sale price
 */
export interface XIRRMatrix {
  [exitYear: number]: {
    [salePrice: number]: number;
  };
}

/**
 * Cash flow entry with date and amount
 */
export interface CashFlow {
  date: Date;
  amount: number;
}

/**
 * Application state for the bond calculator
 */
export interface BondCalculatorState {
  inputs: BondInputs;
  calculations: CalculationResults;
  selectedSalePrices: number[];
  selectedExitYears: number[];
  isCalculating: boolean;
}

/**
 * Error state for input validation and calculation errors
 */
export interface ErrorState {
  inputErrors: Record<string, string>;
  calculationErrors: string[];
  systemErrors: string[];
}

/**
 * Default values for bond inputs
 */
export const DEFAULT_BOND_INPUTS: BondInputs = {
  faceValue: 100000,
  couponRate: 11.9,
  purchasePrice: 102.5,
  accruedInterest: 358.63,
  brokerage: 0,
  purchaseDate: new Date('2025-10-03'),
  maturityDate: new Date('2030-12-31'),
  tdsRate: 10
};

/**
 * Default sale price options
 */
export const DEFAULT_SALE_PRICES = [100, 101, 102, 102.5];

/**
 * Default exit year options (1-5 years after purchase)
 * Note: Exit years are now dynamically generated based on maturity date
 */
export const DEFAULT_EXIT_YEARS = [1, 2, 3, 4, 5];