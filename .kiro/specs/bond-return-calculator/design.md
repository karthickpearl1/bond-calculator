# Design Document

## Overview

The Bond Return Calculator is a React-based static web application that provides comprehensive bond investment analysis through XIRR calculations. The application features a clean, responsive interface with real-time calculations and a matrix visualization of returns across different exit scenarios and sale prices.

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: CSS Modules or Tailwind CSS for component-based styling
- **Financial Calculations**: Custom XIRR implementation using Newton-Raphson method
- **Date Handling**: Native JavaScript Date API
- **Deployment**: Static site compatible with Vercel, Netlify, or GitHub Pages

## Architecture

### Component Hierarchy

```
App
├── BondCalculator
│   ├── InputForm
│   │   ├── BondDetailsSection
│   │   ├── SalePriceSelector
│   │   └── ExitYearSelector
│   ├── CalculationSummary
│   └── ResultsDisplay
│       ├── ReturnMatrix
│       └── ReturnChart (optional)
└── ErrorBoundary
```

### Data Flow

The application follows a unidirectional data flow pattern:

1. **User Input** → State updates in BondCalculator
2. **State Changes** → Trigger calculation engine
3. **Calculations** → Update derived state (costs, coupons, XIRR matrix)
4. **Derived State** → Re-render affected components

### State Management

Using React's built-in state management with custom hooks for complex calculations:

```typescript
interface BondCalculatorState {
  inputs: BondInputs;
  calculations: CalculationResults;
  selectedSalePrices: number[];
  selectedExitYears: number[];
  isCalculating: boolean;
}
```

## Components and Interfaces

### Core Data Models

```typescript
interface BondInputs {
  faceValue: number;
  couponRate: number;
  purchasePrice: number;
  accruedInterest: number;
  purchaseDate: Date;
  maturityDate: Date;
  tdsRate: number;
}

interface CalculationResults {
  totalCost: number;
  monthlyCoupon: number;
  netMonthlyCoupon: number;
  xirrMatrix: XIRRMatrix;
}

interface XIRRMatrix {
  [exitYear: number]: {
    [salePrice: number]: number;
  };
}

interface CashFlow {
  date: Date;
  amount: number;
}
```

### Component Interfaces

#### InputForm Component
- **Props**: `{ inputs: BondInputs, onInputChange: (field: string, value: any) => void }`
- **Responsibilities**: 
  - Render all input fields with proper validation
  - Handle user input and trigger parent state updates
  - Display input validation errors

#### CalculationSummary Component
- **Props**: `{ calculations: CalculationResults }`
- **Responsibilities**:
  - Display Total Cost to Client
  - Show Monthly Coupon (Net of TDS)
  - Format currency values appropriately

#### ReturnMatrix Component
- **Props**: `{ xirrMatrix: XIRRMatrix, salePrices: number[], exitYears: number[] }`
- **Responsibilities**:
  - Render XIRR matrix as an HTML table
  - Apply conditional formatting for better readability
  - Handle empty or error states

### Calculation Engine

#### XIRR Implementation
The XIRR calculation will use the Newton-Raphson iterative method:

```typescript
class XIRRCalculator {
  static calculate(cashFlows: CashFlow[]): number {
    // Newton-Raphson method implementation
    // Initial guess: 10% annual return
    // Iterate until convergence or max iterations
  }
  
  static generateCashFlows(
    inputs: BondInputs, 
    exitYear: number, 
    salePrice: number
  ): CashFlow[] {
    // Generate monthly coupon payments
    // Add initial investment (negative)
    // Add sale proceeds in final month
  }
}
```

#### Bond Calculations
```typescript
class BondCalculator {
  static calculateTotalCost(faceValue: number, purchasePrice: number, accruedInterest: number): number;
  static calculateMonthlyCoupon(faceValue: number, couponRate: number): number;
  static calculateNetMonthlyCoupon(monthlyCoupon: number, tdsRate: number): number;
}
```

## Data Models

### Input Validation Schema

```typescript
const bondInputSchema = {
  faceValue: { min: 1000, max: 10000000, required: true },
  couponRate: { min: 0, max: 50, required: true },
  purchasePrice: { min: 50, max: 200, required: true },
  accruedInterest: { min: 0, max: 100000, required: true },
  purchaseDate: { required: true, type: 'date' },
  maturityDate: { required: true, type: 'date', after: 'purchaseDate' },
  tdsRate: { min: 0, max: 50, required: true }
};
```

### Default Values

```typescript
const defaultInputs: BondInputs = {
  faceValue: 100000,
  couponRate: 11.9,
  purchasePrice: 102.5,
  accruedInterest: 358.63,
  purchaseDate: new Date('2025-10-03'),
  maturityDate: new Date('2030-12-31'),
  tdsRate: 10
};

const defaultSalePrices = [100, 101, 102, 102.5];
const defaultExitYears = [1, 2, 3, 4, 5];
```

## Error Handling

### Input Validation
- **Client-side validation** for all numeric inputs with appropriate ranges
- **Date validation** ensuring maturity date is after purchase date
- **Real-time feedback** with error messages displayed near invalid fields

### Calculation Errors
- **XIRR convergence failures** handled with fallback messaging
- **Division by zero** protection in all calculations
- **Invalid date ranges** that would result in no coupon payments

### Error Display Strategy
```typescript
interface ErrorState {
  inputErrors: Record<string, string>;
  calculationErrors: string[];
  systemErrors: string[];
}
```

### Error Boundary
- **React Error Boundary** to catch and display component-level errors
- **Graceful degradation** when calculations fail
- **User-friendly error messages** with suggested actions

## Testing Strategy

### Unit Testing
- **Calculation functions**: Test XIRR algorithm accuracy against known values
- **Bond calculations**: Verify cost and coupon calculations
- **Input validation**: Test all validation rules and edge cases
- **Date utilities**: Test date manipulation and formatting functions

### Integration Testing
- **Component interactions**: Test data flow between parent and child components
- **State management**: Verify state updates trigger appropriate re-renders
- **User workflows**: Test complete user journeys from input to results

### End-to-End Testing
- **Critical user paths**: Input → Calculation → Display workflow
- **Cross-browser compatibility**: Test on major browsers
- **Responsive design**: Test on different screen sizes

### Performance Testing
- **Calculation performance**: Ensure XIRR calculations complete within acceptable time
- **Memory usage**: Monitor for memory leaks during repeated calculations
- **Bundle size**: Keep production bundle under reasonable size limits

## Performance Considerations

### Calculation Optimization
- **Memoization** of expensive XIRR calculations when inputs haven't changed
- **Debounced calculations** to avoid excessive recalculation during rapid input changes
- **Web Workers** consideration for heavy calculations (if needed)

### Rendering Optimization
- **React.memo** for components that don't need frequent re-renders
- **useMemo** for expensive derived calculations
- **Virtualization** for large matrices (if expanded beyond 5x4)

### Bundle Optimization
- **Tree shaking** to eliminate unused code
- **Code splitting** if the application grows larger
- **Asset optimization** for any images or icons used

## Deployment Architecture

### Build Process
```bash
npm run build  # Vite production build
# Generates optimized static files in dist/
```

### Static Hosting Requirements
- **Single Page Application** routing handled client-side
- **HTTPS** recommended for production deployment
- **CDN** integration for optimal performance
- **Caching headers** for static assets

### Environment Configuration
```typescript
// No environment variables needed for static deployment
// All configuration embedded in build
```

### Deployment Targets
- **Vercel**: Zero-config deployment with automatic HTTPS
- **Netlify**: Drag-and-drop deployment with form handling
- **GitHub Pages**: Direct deployment from repository
- **Custom hosting**: Any static file server