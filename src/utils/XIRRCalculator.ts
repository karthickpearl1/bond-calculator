import type { CashFlow, BondInputs } from '../types';

/**
 * XIRRCalculator class provides XIRR (Extended Internal Rate of Return) calculations
 * using the Newton-Raphson iterative method for bond investment analysis
 */
export class XIRRCalculator {
  private static readonly MAX_ITERATIONS = 100;
  private static readonly CONVERGENCE_THRESHOLD = 1e-6;
  private static readonly INITIAL_GUESS = 0.1; // 10% initial guess

  /**
   * Calculate XIRR using Newton-Raphson method
   * 
   * @param cashFlows - Array of cash flows with dates and amounts
   * @returns XIRR as decimal (e.g., 0.12 for 12%)
   * @throws Error if calculation fails to converge or invalid cash flows
   */
  static calculate(cashFlows: CashFlow[]): number {
    // Validate input
    if (!cashFlows || cashFlows.length < 2) {
      throw new Error('At least two cash flows are required for XIRR calculation');
    }

    // Check for at least one positive and one negative cash flow
    const hasPositive = cashFlows.some(cf => cf.amount > 0);
    const hasNegative = cashFlows.some(cf => cf.amount < 0);
    
    if (!hasPositive || !hasNegative) {
      throw new Error('Cash flows must contain at least one positive and one negative value');
    }

    // Sort cash flows by date
    const sortedCashFlows = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Get the first date as reference point
    const firstDate = sortedCashFlows[0].date;
    
    // Newton-Raphson iteration
    let rate = this.INITIAL_GUESS;
    
    for (let iteration = 0; iteration < this.MAX_ITERATIONS; iteration++) {
      const { npv, derivative } = this.calculateNPVAndDerivative(sortedCashFlows, firstDate, rate);
      
      // Check for convergence
      if (Math.abs(npv) < this.CONVERGENCE_THRESHOLD) {
        return rate;
      }
      
      // Check for zero derivative (would cause division by zero)
      if (Math.abs(derivative) < this.CONVERGENCE_THRESHOLD) {
        throw new Error('XIRR calculation failed: derivative too close to zero');
      }
      
      // Newton-Raphson update: rate = rate - f(rate) / f'(rate)
      const newRate = rate - (npv / derivative);
      
      // Check for convergence in rate change
      if (Math.abs(newRate - rate) < this.CONVERGENCE_THRESHOLD) {
        return newRate;
      }
      
      rate = newRate;
      
      // Prevent extreme values that could cause numerical issues
      if (rate < -0.99 || rate > 10) {
        throw new Error('XIRR calculation diverged to extreme values');
      }
    }
    
    throw new Error(`XIRR calculation failed to converge after ${this.MAX_ITERATIONS} iterations`);
  }

  /**
   * Calculate NPV and its derivative for Newton-Raphson method
   * 
   * @param cashFlows - Sorted cash flows
   * @param firstDate - Reference date (first cash flow date)
   * @param rate - Current rate estimate
   * @returns Object with NPV and derivative values
   */
  private static calculateNPVAndDerivative(
    cashFlows: CashFlow[], 
    firstDate: Date, 
    rate: number
  ): { npv: number; derivative: number } {
    let npv = 0;
    let derivative = 0;
    
    for (const cashFlow of cashFlows) {
      // Calculate time difference in years
      const timeDiff = this.getYearsDifference(firstDate, cashFlow.date);
      
      // Calculate discount factor: (1 + rate)^(-timeDiff)
      const discountFactor = Math.pow(1 + rate, -timeDiff);
      
      // Add to NPV
      npv += cashFlow.amount * discountFactor;
      
      // Add to derivative: -timeDiff * amount * (1 + rate)^(-timeDiff - 1)
      derivative += -timeDiff * cashFlow.amount * discountFactor / (1 + rate);
    }
    
    return { npv, derivative };
  }

  /**
   * Generate cash flows for a bond investment scenario
   * 
   * @param inputs - Bond input parameters
   * @param exitYear - Number of years after purchase to exit (1-5)
   * @param salePrice - Sale price as percentage of face value
   * @returns Array of cash flows including initial investment, monthly coupons, and sale proceeds
   */
  static generateCashFlows(
    inputs: BondInputs,
    exitYear: number,
    salePrice: number
  ): CashFlow[] {
    if (exitYear < 1 || exitYear > 5) {
      throw new Error('Exit year must be between 1 and 5');
    }
    
    if (salePrice <= 0) {
      throw new Error('Sale price must be greater than 0');
    }

    const cashFlows: CashFlow[] = [];
    
    // Calculate initial investment (negative cash flow)
    const totalCost = (inputs.faceValue * (inputs.purchasePrice / 100)) + inputs.accruedInterest;
    cashFlows.push({
      date: new Date(inputs.purchaseDate),
      amount: -totalCost
    });

    // Calculate net monthly coupon
    const monthlyCoupon = (inputs.faceValue * (inputs.couponRate / 100)) / 12;
    const netMonthlyCoupon = monthlyCoupon * (1 - (inputs.tdsRate / 100));

    // Generate monthly coupon payments
    const totalMonths = exitYear * 12;
    const purchaseDate = new Date(inputs.purchaseDate);
    
    for (let month = 1; month <= totalMonths; month++) {
      const couponDate = new Date(purchaseDate);
      couponDate.setMonth(couponDate.getMonth() + month);
      
      let cashFlowAmount = netMonthlyCoupon;
      
      // Add sale proceeds in the final month
      if (month === totalMonths) {
        const saleProceeds = inputs.faceValue * (salePrice / 100);
        cashFlowAmount += saleProceeds;
      }
      
      cashFlows.push({
        date: couponDate,
        amount: cashFlowAmount
      });
    }

    return cashFlows;
  }

  /**
   * Calculate XIRR for a specific bond scenario
   * 
   * @param inputs - Bond input parameters
   * @param exitYear - Number of years after purchase to exit
   * @param salePrice - Sale price as percentage of face value
   * @returns XIRR as decimal (e.g., 0.12 for 12%)
   */
  static calculateScenarioXIRR(
    inputs: BondInputs,
    exitYear: number,
    salePrice: number
  ): number {
    const cashFlows = this.generateCashFlows(inputs, exitYear, salePrice);
    return this.calculate(cashFlows);
  }

  /**
   * Calculate the difference between two dates in years
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Difference in years as decimal
   */
  private static getYearsDifference(startDate: Date, endDate: Date): number {
    const millisecondsPerYear = 365.25 * 24 * 60 * 60 * 1000; // Account for leap years
    return (endDate.getTime() - startDate.getTime()) / millisecondsPerYear;
  }}
