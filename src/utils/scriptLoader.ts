/**
 * Script Loading Utility
 * Handles dynamic loading of Google Analytics script with error handling
 */

import { getAnalyticsConfig } from './analyticsConfig';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer: any[];
    gtagLoadError: boolean;
    gtagLoaded: boolean;
  }
}

/**
 * Loads the Google Analytics script dynamically
 * @returns Promise that resolves when script is loaded or rejects on error
 */
export function loadGoogleAnalyticsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = getAnalyticsConfig();
    
    // Don't load if analytics is disabled or already loaded
    if (!config.enabled || window.gtagLoaded) {
      resolve();
      return;
    }

    // Check if script loading already failed
    if (window.gtagLoadError) {
      reject(new Error('Google Analytics script previously failed to load'));
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    
    script.onload = () => {
      window.gtagLoaded = true;
      
      // Configure Google Analytics
      window.gtag?.('config', config.measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        debug_mode: config.debugMode
      });
      
      if (config.debugMode) {
        console.log('Google Analytics script loaded successfully');
      }
      
      resolve();
    };
    
    script.onerror = () => {
      window.gtagLoadError = true;
      const error = new Error('Failed to load Google Analytics script');
      
      if (config.debugMode) {
        console.warn('Google Analytics script failed to load');
      }
      
      reject(error);
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Checks if Google Analytics is available and loaded
 * @returns boolean indicating if gtag is available
 */
export function isGoogleAnalyticsLoaded(): boolean {
  return window.gtagLoaded && typeof window.gtag === 'function' && !window.gtagLoadError;
}

/**
 * Safely calls gtag function with error handling
 * @param args Arguments to pass to gtag
 */
export function safeGtag(...args: any[]): void {
  if (isGoogleAnalyticsLoaded()) {
    try {
      window.gtag?.(...args);
    } catch (error) {
      console.warn('Error calling gtag:', error);
    }
  }
}