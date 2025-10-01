# Requirements Document

## Introduction

The Bond Return Calculator is a static frontend application that enables users to analyze bond investment returns through XIRR calculations across different exit scenarios and sale prices. The application will provide a comprehensive matrix view of potential returns based on various holding periods and exit price points, helping investors make informed decisions about bond investments.

## Requirements

### Requirement 1

**User Story:** As a bond investor, I want to input my bond purchase details, so that I can calculate potential returns for different scenarios.

#### Acceptance Criteria

1. WHEN the user opens the application THEN the system SHALL display input fields for Face Value, Coupon Rate %, Purchase Price % of Face, Accrued Interest, Purchase Date, Maturity Date, and TDS Rate %
2. WHEN the user enters a Face Value THEN the system SHALL accept numeric input (e.g., 100000)
3. WHEN the user enters a Coupon Rate % THEN the system SHALL accept numeric input with decimal precision (e.g., 11.9)
4. WHEN the user enters Purchase Price % of Face THEN the system SHALL accept numeric input with decimal precision (e.g., 102.5)
5. WHEN the user enters Accrued Interest THEN the system SHALL accept numeric input with decimal precision (e.g., 358.63)
6. WHEN the user opens the application THEN the system SHALL default Purchase Date to 03-Oct-2025
7. WHEN the user opens the application THEN the system SHALL default Maturity Date to 31-Dec-2030
8. WHEN the user enters TDS Rate % THEN the system SHALL accept numeric input with decimal precision (e.g., 10)

### Requirement 2

**User Story:** As a bond investor, I want to select different sale price scenarios and exit years, so that I can compare returns across various exit strategies.

#### Acceptance Criteria

1. WHEN the user views the sale price options THEN the system SHALL provide selectable options of 100%, 101%, 102%, and 102.5% of face value
2. WHEN the user views exit year options THEN the system SHALL provide options for 1 to 5 years after purchase date
3. WHEN the user selects sale prices THEN the system SHALL allow multiple selections from the available options
4. WHEN the user selects exit years THEN the system SHALL allow selection of years 1 through 5 after purchase

### Requirement 3

**User Story:** As a bond investor, I want the system to automatically calculate bond costs and coupon payments, so that I can see the financial impact of my investment.

#### Acceptance Criteria

1. WHEN the user enters bond details THEN the system SHALL calculate Total Cost as Face Value × (Purchase Price/100) + Accrued Interest
2. WHEN the user enters bond details THEN the system SHALL calculate Monthly Coupon as (Face Value × Coupon Rate%) / 12
3. WHEN the user enters TDS Rate THEN the system SHALL calculate Net Monthly Coupon as Monthly Coupon × (1 – TDS Rate/100)
4. WHEN calculations are complete THEN the system SHALL display Total Cost to Client
5. WHEN calculations are complete THEN the system SHALL display Monthly Coupon (Net of TDS)

### Requirement 4

**User Story:** As a bond investor, I want to see XIRR calculations for different exit scenarios, so that I can understand annualized returns for each combination of exit year and sale price.

#### Acceptance Criteria

1. WHEN the user has entered all required inputs THEN the system SHALL generate monthly coupon payments for each selected exit year
2. WHEN calculating returns for an exit year THEN the system SHALL add sale proceeds as Face Value × (Sale Price% / 100) in the final month
3. WHEN calculating XIRR THEN the system SHALL build an array of {date, cashflow} including the initial negative investment
4. WHEN calculating XIRR THEN the system SHALL compute the annualized return using the XIRR formula
5. WHEN XIRR is calculated THEN the system SHALL round results to 2 decimal places
6. WHEN all calculations are complete THEN the system SHALL store results in a matrix format with Exit Years as rows and Sale Prices as columns

### Requirement 5

**User Story:** As a bond investor, I want to view a comprehensive return matrix table, so that I can quickly compare returns across all exit year and sale price combinations.

#### Acceptance Criteria

1. WHEN XIRR calculations are complete THEN the system SHALL display a Return Matrix Table
2. WHEN displaying the matrix THEN the system SHALL show Exit Years (2026, 2027, 2028, 2029, 2030) as row headers
3. WHEN displaying the matrix THEN the system SHALL show Sale Prices (100%, 101%, 102%, 102.5%) as column headers
4. WHEN displaying the matrix THEN the system SHALL populate each cell with the corresponding XIRR percentage rounded to 2 decimals
5. WHEN the matrix is displayed THEN the system SHALL format XIRR values as percentages with appropriate visual styling

### Requirement 6

**User Story:** As a bond investor, I want the results to update dynamically when I change inputs, so that I can explore different scenarios efficiently.

#### Acceptance Criteria

1. WHEN the user modifies any input field THEN the system SHALL automatically recalculate all dependent values
2. WHEN inputs change THEN the system SHALL update the Total Cost and Net Monthly Coupon displays
3. WHEN inputs change THEN the system SHALL recalculate the entire XIRR matrix
4. WHEN inputs change THEN the system SHALL update the Return Matrix Table without requiring a page refresh
5. WHEN calculations are in progress THEN the system SHALL provide appropriate loading indicators if needed

### Requirement 7

**User Story:** As a bond investor, I want a clean and intuitive user interface, so that I can easily navigate and use the calculator.

#### Acceptance Criteria

1. WHEN the user accesses the application THEN the system SHALL display a simple, clean form layout for inputs
2. WHEN the user views the interface THEN the system SHALL organize inputs in a logical, easy-to-follow sequence
3. WHEN the user interacts with the form THEN the system SHALL provide clear labels and appropriate input validation
4. WHEN the user views results THEN the system SHALL present information in a well-organized, readable format
5. WHEN the user accesses the application on different devices THEN the system SHALL provide a responsive design

### Requirement 8

**User Story:** As a user, I want the application to be deployable as a static site, so that it can be easily hosted and accessed without backend infrastructure.

#### Acceptance Criteria

1. WHEN the application is built THEN the system SHALL generate static files suitable for deployment on GitHub Pages, Vercel, or Netlify
2. WHEN the application runs THEN the system SHALL perform all calculations client-side without requiring server communication
3. WHEN the application is deployed THEN the system SHALL function completely as a static frontend application
4. WHEN the application is accessed THEN the system SHALL load and function without any backend dependencies

### Requirement 9 (Optional Enhancement)

**User Story:** As a bond investor, I want to see a visual representation of returns over time, so that I can better understand return trends across different exit years.

#### Acceptance Criteria

1. WHEN the user views results THEN the system MAY display a line chart visualizing returns over exit years
2. IF a chart is displayed THEN the system SHALL show separate lines for each sale price scenario
3. IF a chart is displayed THEN the system SHALL clearly label axes and provide appropriate legends
4. IF a chart is displayed THEN the system SHALL update the chart when input parameters change