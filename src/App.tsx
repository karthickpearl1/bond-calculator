import type { FC } from 'react';
import { useEffect } from 'react';
import { BondCalculator } from './components/BondCalculator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { analyticsService } from './services/analyticsService';
import { loadGoogleAnalyticsScript } from './utils/scriptLoader';
import { getAnalyticsConfig, isAnalyticsEnabled, debugAnalyticsConfig } from './utils/analyticsConfig';
import './App.css'

const App: FC = () => {
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Debug current configuration
        debugAnalyticsConfig();
        
        // Check if analytics is enabled and configured
        if (!isAnalyticsEnabled()) {
          console.log('Google Analytics is disabled or not configured');
          return;
        }

        const config = getAnalyticsConfig();
        
        // Detect privacy blockers and Do Not Track
        const isPrivacyBlocked = detectPrivacyBlocker();
        if (isPrivacyBlocked) {
          console.log('Privacy blocker detected or Do Not Track enabled. Analytics disabled.');
          return;
        }

        // Load Google Analytics script
        await loadGoogleAnalyticsScript();
        
        // Initialize analytics service
        analyticsService.initialize(config.measurementId);
        
        // Track initial page view
        analyticsService.trackPageView(window.location.pathname);
        
        if (config.debugMode) {
          console.log('Google Analytics initialized successfully');
        }
      } catch (error) {
        // Graceful degradation - app continues to work without analytics
        console.warn('Failed to initialize Google Analytics:', error);
      }
    };

    initializeAnalytics();
  }, []);

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="App">
          <ErrorBoundary>
            <BondCalculator />
          </ErrorBoundary>
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  )
};

/**
 * Detect privacy blockers and Do Not Track settings
 * @returns boolean indicating if privacy features are blocking analytics
 */
function detectPrivacyBlocker(): boolean {
  // Check Do Not Track browser setting
  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {
    return true;
  }

  // Check for common ad blocker indicators
  if (typeof window !== 'undefined') {
    // Check if gtag function was blocked/modified by ad blockers
    if (window.gtagLoadError) {
      return true;
    }

    // Additional privacy blocker detection can be added here
    // For example, checking for specific ad blocker signatures
  }

  return false;
}

export default App
