/**
 * Core interfaces for Google Analytics integration
 * Supports tracking page views, user interactions, and calculation events
 */

export interface AnalyticsService {
  initialize(measurementId: string): void;
  trackPageView(path: string): void;
  trackEvent(eventName: string, parameters?: EventParameters): void;
  trackCalculation(calculationType: string, parameters?: CalculationParameters): void;
  trackUserInteraction(interaction: string, parameters?: InteractionParameters): void;
  updateSessionCurrency(currency: string): void;
  trackCalculationWithSession(calculationType: string, parameters?: CalculationParameters): void;
  optOut(): void;
  optIn(): void;
  getPrivacyStatus(): PrivacyStatus;
}

export interface EventParameters {
  [key: string]: string | number | boolean;
}

export interface CalculationParameters {
  bondType?: string;
  exitYearsCount?: number;
  salePricesCount?: number;
  currency?: string;
}

export interface InteractionParameters {
  component?: string;
  action?: string;
  value?: string | number;
  input_field?: string;
  selected_prices?: string;
  selected_years?: string;
}

/**
 * Analytics event structure for consistent tracking
 */
export type AnalyticsEvent = {
  event_name: string;
  timestamp: number;
  parameters: {
    page_title?: string;
    page_location?: string;
    currency?: string;
    calculation_type?: string;
    input_field?: string;
    interaction_type?: string;
    [key: string]: string | number | boolean | undefined;
  };
};

/**
 * User session data for tracking engagement patterns
 */
export type SessionData = {
  session_id: string;
  session_start: number;
  page_views: number;
  calculations_performed: number;
  currency_used: string;
};

/**
 * Standardized event names for consistent tracking
 */
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  BOND_CALCULATION: 'bond_calculation',
  INPUT_CHANGE: 'input_change',
  CURRENCY_CHANGE: 'currency_change',
  EXIT_YEAR_SELECTION: 'exit_year_selection',
  SALE_PRICE_SELECTION: 'sale_price_selection',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

/**
 * Configuration interface for analytics setup
 */
export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
  debugMode: boolean;
  respectDNT?: boolean;
  forceOptOut?: boolean;
}

/**
 * Privacy status information
 */
export interface PrivacyStatus {
  trackingEnabled: boolean;
  doNotTrack: boolean;
  hasPrivacyRestrictions: boolean;
  userOptedOut: boolean;
  analyticsBlocked: boolean;
}