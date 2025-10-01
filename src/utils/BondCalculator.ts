/**
 * BondCalculator class provides core calculation methods for bond investments
 * Implements the fundamental calculations needed for bond cost and coupon analysis
 */
export class BondCalculator {
  /**
   * Calculate the total cost to client for purchasing the bond
   * Formula: Face Value × (Purchase Price/100) + Accrued Interest
   * 
   * @param faceValue - The face value of the bond
   * @param purchasePrice - Purchase price as percentage of face value
   * @param accruedInterest - Accrued interest amount
   * @returns Total cost to client
   */
  static calculateTotalCost(
    faceValue: number, 
    purchasePrice: number, 
    accruedInterest: number
  ): number {
    if (faceValue <= 0) {
      throw new Error('Face value must be greater than 0');
    }
    if (purchasePrice <= 0) {
      throw new Error('Purchase price must be greater than 0');
    }
    if (accruedInterest < 0) {
      throw new Error('Accrued interest cannot be negative');
    }

    return (faceValue * (purchasePrice / 100)) + accruedInterest;
  }

  /**
   * Calculate the monthly coupon payment before TDS
   * Formula: (Face Value × Coupon Rate%) / 12
   * 
   * @param faceValue - The face value of the bond
   * @param couponRate - Annual coupon rate as percentage
   * @returns Monthly coupon payment
   */
  static calculateMonthlyCoupon(faceValue: number, couponRate: number): number {
    if (faceValue <= 0) {
      throw new Error('Face value must be greater than 0');
    }
    if (couponRate < 0) {
      throw new Error('Coupon rate cannot be negative');
    }

    return (faceValue * (couponRate / 100)) / 12;
  }

  /**
   * Calculate the net monthly coupon payment after TDS deduction
   * Formula: Monthly Coupon × (1 – TDS%)
   * 
   * @param monthlyCoupon - Monthly coupon payment before TDS
   * @param tdsRate - TDS rate as percentage
   * @returns Net monthly coupon payment after TDS
   */
  static calculateNetMonthlyCoupon(monthlyCoupon: number, tdsRate: number): number {
    if (monthlyCoupon < 0) {
      throw new Error('Monthly coupon cannot be negative');
    }
    if (tdsRate < 0 || tdsRate > 100) {
      throw new Error('TDS rate must be between 0 and 100');
    }

    return monthlyCoupon * (1 - (tdsRate / 100));
  }
}