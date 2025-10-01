# Implementation Plan

- [x] 1. Set up project structure and core interfaces








  - Initialize React + TypeScript project with Vite
  - Configure TypeScript with strict settings
  - Set up project directory structure (components, types, utils)
  - Define core TypeScript interfaces for BondInputs, CalculationResults, XIRRMatrix, and CashFlow
  - _Requirements: 8.1, 8.3_

- [-] 2. Implement bond calculation utilities


  - [x] 2.1 Create BondCalculator class with core calculation methods



    - Implement calculateTotalCost method: Face × (Purchase Price/100) + Accrued Interest
    - Implement calculateMonthlyCoupon method: (Face × Coupon Rate%) / 12
    - Implement calculateNetMonthlyCoupon method: Monthly Coupon × (1 – TDS%)
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 2.2 Write unit tests for bond calculation methods
    - Test calculateTotalCost with various input combinations
    - Test calculateMonthlyCoupon with different face values and rates
    - Test calculateNetMonthlyCoupon with different TDS rates
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Implement XIRR calculation engine





  - [x] 3.1 Create XIRRCalculator class with Newton-Raphson implementation


    - Implement XIRR calculation using iterative Newton-Raphson method
    - Add convergence checking and maximum iteration limits
    - Handle edge cases like no positive cash flows or convergence failures
    - _Requirements: 4.4, 4.5_
  
  - [x] 3.2 Implement cash flow generation for bond scenarios


    - Create generateCashFlows method that builds monthly coupon payment arrays
    - Add initial negative investment cash flow
    - Add sale proceeds in final month based on exit year and sale price
    - Handle date calculations for monthly intervals
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 3.3 Write unit tests for XIRR calculations
    - Test XIRR calculation against known financial scenarios
    - Test cash flow generation for different exit years and sale prices
    - Test edge cases and error conditions
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Create input validation and form components





  - [x] 4.1 Implement input validation schema and utilities


    - Create validation functions for numeric ranges (face value, rates, prices)
    - Implement date validation ensuring maturity after purchase date
    - Add real-time validation with appropriate error messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 7.3_
  
  - [x] 4.2 Build BondDetailsSection component


    - Create form inputs for Face Value, Coupon Rate, Purchase Price, Accrued Interest
    - Add date pickers for Purchase Date and Maturity Date with defaults
    - Implement TDS Rate input field
    - Connect inputs to validation and parent state updates
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [x] 4.3 Build SalePriceSelector component


    - Create selectable options for 100%, 101%, 102%, 102.5% sale prices
    - Implement multi-select functionality with checkboxes or toggle buttons
    - Handle selection state and communicate changes to parent
    - _Requirements: 2.1, 2.3_
  
  - [x] 4.4 Build ExitYearSelector component


    - Create selectable options for exit years 1-5 after purchase
    - Implement selection interface with clear year labels (2026, 2027, etc.)
    - Handle selection state and communicate changes to parent
    - _Requirements: 2.2, 2.4_

- [x] 5. Implement calculation summary and results display





  - [x] 5.1 Create CalculationSummary component


    - Display Total Cost to Client with proper currency formatting
    - Show Monthly Coupon (Net of TDS) with currency formatting
    - Update automatically when input parameters change
    - _Requirements: 3.4, 3.5, 6.2_
  
  - [x] 5.2 Build ReturnMatrix component


    - Create HTML table with Exit Years as rows and Sale Prices as columns
    - Populate cells with XIRR percentages rounded to 2 decimal places
    - Apply appropriate styling and formatting for readability
    - Handle loading states and calculation errors gracefully
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Integrate components and implement reactive calculations





  - [x] 6.1 Create main BondCalculator container component


    - Manage all application state (inputs, selections, calculations)
    - Implement state update handlers for all input changes
    - Coordinate between input components and results display
    - _Requirements: 6.1, 6.4_
  
  - [x] 6.2 Implement automatic recalculation system


    - Add useEffect hooks to trigger calculations when inputs change
    - Implement debounced calculations to avoid excessive computation
    - Update XIRR matrix and summary when any parameter changes
    - Add loading indicators for calculation-heavy operations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 6.3 Add error handling and user feedback


    - Implement error boundaries for component-level error catching
    - Add user-friendly error messages for calculation failures
    - Handle XIRR convergence failures with appropriate fallbacks
    - Display validation errors near relevant input fields
    - _Requirements: 7.3_

- [-] 7. Style the application and ensure responsive design



  - [x] 7.1 Implement clean, professional styling


    - Create CSS modules or Tailwind classes for all components
    - Design clean form layout with logical input grouping
    - Style the results matrix with clear headers and readable cells
    - Add hover effects and visual feedback for interactive elements
    - _Requirements: 7.1, 7.2, 7.4_
  
  - [-] 7.2 Ensure responsive design across devices

    - Implement responsive breakpoints for mobile, tablet, and desktop
    - Optimize form layout for smaller screens
    - Ensure matrix table is readable on mobile devices
    - Test and adjust spacing and typography for different screen sizes
    - _Requirements: 7.5_

- [ ] 8. Optimize for production deployment
  - [ ] 8.1 Configure build optimization
    - Set up Vite production build configuration
    - Implement code splitting and tree shaking
    - Optimize bundle size and loading performance
    - Configure static asset handling
    - _Requirements: 8.1, 8.2_
  
  - [ ] 8.2 Add deployment configuration files
    - Create deployment configuration for Vercel (vercel.json)
    - Add Netlify configuration (_redirects, netlify.toml)
    - Create GitHub Pages workflow if needed
    - Ensure all static hosting requirements are met
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [ ]* 8.3 Implement performance monitoring and testing
    - Add bundle size analysis tools
    - Test application performance with various input scenarios
    - Verify memory usage during repeated calculations
    - Test cross-browser compatibility
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9. Optional: Add return visualization chart
  - [ ] 9.1 Integrate charting library and create ReturnChart component
    - Choose and integrate a lightweight charting library (Chart.js or Recharts)
    - Create line chart component showing returns over exit years
    - Display separate lines for each selected sale price scenario
    - Add proper axis labels, legends, and responsive behavior
    - _Requirements: 9.1, 9.2, 9.3, 9.4_