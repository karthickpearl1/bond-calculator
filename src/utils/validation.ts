/**
 * Input validation utilities for the Bond Return Calculator
 * Provides validation functions for numeric ranges, dates, and real-time error handling
 */

import type { BondInputs } from '../types';

/**
 * Validation rule interface
 */
export interface ValidationRule {
  min?: number;
  max?: number;
  required?: boolean;
  type?: 'number' | 'date';
  after?: keyof BondInputs;
}

/**
 * Validation schema for bond inputs
 */
export const bondInputSchema: Record<keyof BondInputs, ValidationRule> = {
  faceValue: { min: 1000, max: 10000000, required: true, type: 'number' },
  couponRate: { min: 0, max: 50, required: true, type: 'number' },
  purchasePrice: { min: 50, max: 200, required: true, type: 'number' },
  accruedInterest: { min: 0, max: 100000, required: true, type: 'number' },
  brokerage: { min: 0, max: 50000, required: true, type: 'number' },
  purchaseDate: { required: true, type: 'date' },
  maturityDate: { required: true, type: 'date', after: 'purchaseDate' },
  tdsRate: { min: 0, max: 50, required: true, type: 'number' }
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a single field value against its schema rule
 */
export function validateField(
  fieldName: keyof BondInputs,
  value: unknown,
  allInputs?: Partial<BondInputs>
): ValidationResult {
  const rule = bondInputSchema[fieldName];
  
  // Check if required field is empty
  if (rule.required && (value === null || value === undefined || value === '')) {
    return {
      isValid: false,
      error: `${getFieldDisplayName(fieldName)} is required`
    };
  }

  // Skip validation if field is not required and empty
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return { isValid: true };
  }

  // Type-specific validation
  if (rule.type === 'number') {
    return validateNumber(fieldName, value, rule);
  } else if (rule.type === 'date') {
    return validateDate(fieldName, value, rule, allInputs);
  }

  return { isValid: true };
}

/**
 * Validate numeric input
 */
function validateNumber(
  fieldName: keyof BondInputs,
  value: unknown,
  rule: ValidationRule
): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : (value as number);
  
  // Check if it's a valid number
  if (typeof numValue !== 'number' || isNaN(numValue) || !isFinite(numValue)) {
    return {
      isValid: false,
      error: `${getFieldDisplayName(fieldName)} must be a valid number`
    };
  }

  // Check minimum value
  if (rule.min !== undefined && numValue < rule.min) {
    return {
      isValid: false,
      error: `${getFieldDisplayName(fieldName)} must be at least ${formatNumber(rule.min)}`
    };
  }

  // Check maximum value
  if (rule.max !== undefined && numValue > rule.max) {
    return {
      isValid: false,
      error: `${getFieldDisplayName(fieldName)} must not exceed ${formatNumber(rule.max)}`
    };
  }

  return { isValid: true };
}

/**
 * Validate date input
 */
function validateDate(
  fieldName: keyof BondInputs,
  value: unknown,
  rule: ValidationRule,
  allInputs?: Partial<BondInputs>
): ValidationResult {
  let dateValue: Date;

  // Convert to Date object if needed
  if (value instanceof Date) {
    dateValue = value;
  } else if (typeof value === 'string') {
    dateValue = new Date(value);
  } else {
    return {
      isValid: false,
      error: `${getFieldDisplayName(fieldName)} must be a valid date`
    };
  }

  // Check if it's a valid date
  if (isNaN(dateValue.getTime())) {
    return {
      isValid: false,
      error: `${getFieldDisplayName(fieldName)} must be a valid date`
    };
  }

  // Check date relationships (e.g., maturity after purchase)
  if (rule.after && allInputs) {
    const afterFieldValue = allInputs[rule.after];
    if (afterFieldValue) {
      const afterDate = afterFieldValue instanceof Date ? afterFieldValue : new Date(afterFieldValue);
      if (!isNaN(afterDate.getTime()) && dateValue <= afterDate) {
        return {
          isValid: false,
          error: `${getFieldDisplayName(fieldName)} must be after ${getFieldDisplayName(rule.after)}`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate all bond inputs
 */
export function validateAllInputs(inputs: Partial<BondInputs>): Record<keyof BondInputs, ValidationResult> {
  const results = {} as Record<keyof BondInputs, ValidationResult>;
  
  for (const fieldName of Object.keys(bondInputSchema) as Array<keyof BondInputs>) {
    results[fieldName] = validateField(fieldName, inputs[fieldName], inputs);
  }
  
  return results;
}

/**
 * Check if all inputs are valid
 */
export function areAllInputsValid(inputs: Partial<BondInputs>): boolean {
  const validationResults = validateAllInputs(inputs);
  return Object.values(validationResults).every(result => result.isValid);
}

/**
 * Get validation errors for inputs
 */
export function getValidationErrors(inputs: Partial<BondInputs>): Record<string, string> {
  const validationResults = validateAllInputs(inputs);
  const errors: Record<string, string> = {};
  
  for (const [fieldName, result] of Object.entries(validationResults)) {
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  }
  
  return errors;
}

/**
 * Get user-friendly field display names
 */
function getFieldDisplayName(fieldName: keyof BondInputs): string {
  const displayNames: Record<keyof BondInputs, string> = {
    faceValue: 'Face Value',
    couponRate: 'Coupon Rate',
    purchasePrice: 'Purchase Price',
    accruedInterest: 'Accrued Interest',
    brokerage: 'Brokerage',
    purchaseDate: 'Purchase Date',
    maturityDate: 'Maturity Date',
    tdsRate: 'TDS Rate'
  };
  
  return displayNames[fieldName] || fieldName;
}

/**
 * Format numbers for display in error messages
 */
function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toLocaleString() + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toLocaleString() + 'K';
  }
  return value.toLocaleString();
}

/**
 * Real-time validation hook for form inputs
 */
export function useRealTimeValidation() {
  const validateOnChange = (
    fieldName: keyof BondInputs,
    value: unknown,
    allInputs: Partial<BondInputs>
  ): ValidationResult => {
    return validateField(fieldName, value, allInputs);
  };

  const validateOnBlur = (
    fieldName: keyof BondInputs,
    value: unknown,
    allInputs: Partial<BondInputs>
  ): ValidationResult => {
    // More thorough validation on blur
    return validateField(fieldName, value, allInputs);
  };

  return {
    validateOnChange,
    validateOnBlur
  };
}