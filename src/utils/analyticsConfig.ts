/**
 * Analytics Configuration Utility
 * Handles Google Analytics configuration for different environments
 */

export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
  debugMode: boolean;
  respectDNT?: boolean;
  forceOptOut?: boolean;
}

/**
 * Gets the analytics configuration based on environment variables
 * @returns AnalyticsConfig object with current environment settings
 */
export function getAnalyticsConfig(): AnalyticsConfig {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
  const enabled = import.meta.env.VITE_GA_ENABLED === 'true';
  const debugMode = import.meta.env.VITE_GA_DEBUG === 'true';
  const respectDNT = import.meta.env.VITE_GA_RESPECT_DNT !== 'false'; // Default to true
  const forceOptOut = import.meta.env.VITE_GA_FORCE_OPT_OUT === 'true';

  // Validate measurement ID format (should start with G- for GA4)
  const isValidMeasurementId = measurementId.startsWith('G-') && measurementId.length > 3;

  // Disable if forced opt-out is enabled
  const finalEnabled = enabled && isValidMeasurementId && !forceOptOut;

  return {
    measurementId,
    enabled: finalEnabled,
    debugMode,
    respectDNT,
    forceOptOut
  };
}

/**
 * Checks if analytics is properly configured and enabled
 * @returns boolean indicating if analytics should be initialized
 */
export function isAnalyticsEnabled(): boolean {
  const config = getAnalyticsConfig();
  return config.enabled && config.measurementId.length > 0;
}

/**
 * Gets the current environment name for analytics
 * @returns string representing the current environment
 */
export function getEnvironmentName(): string {
  return import.meta.env.MODE || 'development';
}

/**
 * Debug function to log current analytics configuration
 * Useful for troubleshooting environment variable issues
 */
export function debugAnalyticsConfig(): void {
  console.log('Analytics Configuration Debug:');
  console.log('VITE_GA_MEASUREMENT_ID:', import.meta.env.VITE_GA_MEASUREMENT_ID);
  console.log('VITE_GA_ENABLED:', import.meta.env.VITE_GA_ENABLED);
  console.log('VITE_GA_DEBUG:', import.meta.env.VITE_GA_DEBUG);
  console.log('VITE_GA_RESPECT_DNT:', import.meta.env.VITE_GA_RESPECT_DNT);
  console.log('VITE_GA_FORCE_OPT_OUT:', import.meta.env.VITE_GA_FORCE_OPT_OUT);
  console.log('Parsed config:', getAnalyticsConfig());
  console.log('Is analytics enabled:', isAnalyticsEnabled());
}