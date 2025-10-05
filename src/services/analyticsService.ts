import type {
  AnalyticsService,
  EventParameters,
  CalculationParameters,
  InteractionParameters,
  AnalyticsEvent,
  AnalyticsConfig,
  SessionData
} from '../types/analytics';
import { ANALYTICS_EVENTS } from '../types/analytics';

/**
 * Google Analytics service implementation
 * Provides centralized tracking for user interactions and events
 */
class GoogleAnalyticsService implements AnalyticsService {
  private config: AnalyticsConfig | null = null;
  private initialized = false;
  private eventQueue: AnalyticsEvent[] = [];
  private retryAttempts = 3;
  private retryDelay = 1000;
  private maxQueueSize = 100;
  private isOnline = true;
  private retryTimeouts: Set<number> = new Set();
  private failedEvents: Map<string, { event: AnalyticsEvent; attempts: number; lastAttempt: number }> = new Map();
  
  // Session tracking properties
  private sessionData: SessionData | null = null;
  private lastActivityTime = Date.now();
  private sessionTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
  private calculationCount = 0;
  private interactionCount = 0;

  /**
   * Initialize Google Analytics with measurement ID
   */
  initialize(measurementId: string): void {
    try {
      this.config = {
        measurementId,
        enabled: true,
        debugMode: import.meta.env.DEV,
        respectDNT: import.meta.env.VITE_GA_RESPECT_DNT !== 'false',
        forceOptOut: import.meta.env.VITE_GA_FORCE_OPT_OUT === 'true'
      };

      // Check if user has opted out
      if (this.hasUserOptedOut()) {
        this.config.enabled = false;
        if (this.config.debugMode) {
          console.log('Analytics disabled: User has opted out');
        }
        return;
      }

      // Check privacy restrictions before initializing
      if (!this.isTrackingEnabled()) {
        if (this.config.debugMode) {
          console.log('Analytics disabled: Privacy restrictions detected');
        }
        return;
      }

      // Set up network connectivity monitoring
      this.setupNetworkMonitoring();

      // Check if gtag is available (script loaded)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag?.('config', measurementId, {
          page_title: document.title,
          page_location: window.location.href
        });
        
        this.initialized = true;
        this.processEventQueue();
        this.initializeSession();
        this.startPrivacyComplianceMonitoring();
        
        if (this.config.debugMode) {
          console.log('Google Analytics initialized with ID:', measurementId);
        }
      } else {
        console.warn('Google Analytics script not loaded. Events will be queued.');
        // Set up retry mechanism
        this.retryInitialization();
      }
    } catch (error) {
      this.handleError('Failed to initialize Google Analytics', error);
    }
  }

  /**
   * Track page view events
   */
  trackPageView(path: string): void {
    if (!this.isTrackingEnabled()) return;

    const event: AnalyticsEvent = {
      event_name: ANALYTICS_EVENTS.PAGE_VIEW,
      timestamp: Date.now(),
      parameters: {
        page_location: window.location.origin + path,
        page_title: document.title
      }
    };

    this.sendEvent(event);
    this.updateSessionActivity();
    
    // Update session page views
    if (this.sessionData) {
      this.sessionData.page_views++;
    }
  }

  /**
   * Track custom events with parameters
   */
  trackEvent(eventName: string, parameters?: EventParameters): void {
    if (!this.isTrackingEnabled()) return;

    const sanitizedParams = this.sanitizeParameters(parameters);
    const event: AnalyticsEvent = {
      event_name: eventName,
      timestamp: Date.now(),
      parameters: sanitizedParams
    };

    this.sendEvent(event);
  }

  /**
   * Track bond calculation events
   */
  trackCalculation(calculationType: string, parameters?: CalculationParameters): void {
    if (!this.isTrackingEnabled()) return;

    const sanitizedParams = this.sanitizeParameters({
      calculation_type: calculationType,
      ...parameters
    });

    const event: AnalyticsEvent = {
      event_name: ANALYTICS_EVENTS.BOND_CALCULATION,
      timestamp: Date.now(),
      parameters: sanitizedParams
    };

    this.sendEvent(event);
  }

  /**
   * Track user interaction events
   */
  trackUserInteraction(interaction: string, parameters?: InteractionParameters): void {
    if (!this.isTrackingEnabled()) return;

    const sanitizedParams = this.sanitizeParameters({
      interaction_type: interaction,
      ...parameters
    });

    const event: AnalyticsEvent = {
      event_name: ANALYTICS_EVENTS.INPUT_CHANGE,
      timestamp: Date.now(),
      parameters: sanitizedParams
    };

    this.sendEvent(event);
    this.updateSessionActivity();
  }

  /**
   * Initialize or update session tracking
   */
  private initializeSession(): void {
    const now = Date.now();
    const sessionId = this.generateSessionId();
    
    this.sessionData = {
      session_id: sessionId,
      session_start: now,
      page_views: 1,
      calculations_performed: 0,
      currency_used: 'INR' // Default, will be updated when currency changes
    };
    
    this.lastActivityTime = now;
    this.calculationCount = 0;
    this.interactionCount = 0;
    
    // Track session start event
    this.trackEvent('session_start', {
      session_id: sessionId,
      timestamp: now
    });
  }

  /**
   * Update session activity and check for session continuation
   */
  private updateSessionActivity(): void {
    const now = Date.now();
    
    // Check if session has expired
    if (this.sessionData && (now - this.lastActivityTime) > this.sessionTimeout) {
      this.endSession();
      this.initializeSession();
      return;
    }
    
    // Initialize session if not exists
    if (!this.sessionData) {
      this.initializeSession();
      return;
    }
    
    this.lastActivityTime = now;
    this.interactionCount++;
    
    // Track engagement event every 10 interactions
    if (this.interactionCount % 10 === 0) {
      this.trackSessionEngagement();
    }
  }

  /**
   * Track session engagement events
   */
  private trackSessionEngagement(): void {
    if (!this.sessionData) return;
    
    const now = Date.now();
    const sessionDuration = now - this.sessionData.session_start;
    
    this.trackEvent('session_engagement', {
      session_id: this.sessionData.session_id,
      session_duration_ms: sessionDuration,
      interactions_count: this.interactionCount,
      calculations_count: this.calculationCount,
      engagement_time: Math.floor(sessionDuration / 1000) // in seconds
    });
  }

  /**
   * End current session and track session summary
   */
  private endSession(): void {
    if (!this.sessionData) return;
    
    const now = Date.now();
    const sessionDuration = now - this.sessionData.session_start;
    
    this.trackEvent('session_end', {
      session_id: this.sessionData.session_id,
      session_duration_ms: sessionDuration,
      total_interactions: this.interactionCount,
      total_calculations: this.calculationCount,
      final_currency: this.sessionData.currency_used
    });
    
    this.sessionData = null;
  }

  /**
   * Update session data when currency changes
   */
  updateSessionCurrency(currency: string): void {
    if (this.sessionData) {
      this.sessionData.currency_used = currency;
    }
  }

  /**
   * Track calculation with session context
   */
  trackCalculationWithSession(calculationType: string, parameters?: CalculationParameters): void {
    this.trackCalculation(calculationType, parameters);
    this.calculationCount++;
    this.updateSessionActivity();
    
    // Update session data
    if (this.sessionData) {
      this.sessionData.calculations_performed = this.calculationCount;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Send event to Google Analytics or queue if not ready
   */
  private sendEvent(event: AnalyticsEvent): void {
    // Check if we should queue the event
    if (!this.initialized || !window.gtag || !this.isOnline) {
      this.queueEvent(event);
      return;
    }

    try {
      window.gtag?.('event', event.event_name, event.parameters);
      
      // Remove from failed events if it was previously failing
      const eventKey = this.getEventKey(event);
      if (this.failedEvents.has(eventKey)) {
        this.failedEvents.delete(eventKey);
      }
      
      if (this.config?.debugMode) {
        console.log('Analytics event sent:', event);
      }
    } catch (error) {
      this.handleEventSendError(event, error);
    }
  }

  /**
   * Process queued events when analytics becomes available
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  /**
   * Retry initialization if gtag is not immediately available
   */
  private retryInitialization(): void {
    let attempts = 0;
    const retry = () => {
      if (attempts >= this.retryAttempts) {
        console.warn('Google Analytics initialization failed after retries.');
        
        // Check if analytics is blocked and handle accordingly
        if (this.isAnalyticsBlocked()) {
          this.handleAnalyticsBlocked();
        }
        return;
      }

      if (typeof window !== 'undefined' && window.gtag && this.config) {
        try {
          // Complete initialization now that gtag is available
          window.gtag?.('config', this.config.measurementId, {
            page_title: document.title,
            page_location: window.location.href
          });
          
          this.initialized = true;
          this.processEventQueue();
          this.initializeSession();
          this.startPrivacyComplianceMonitoring();
          
          if (this.config.debugMode) {
            console.log('Google Analytics initialized with ID:', this.config.measurementId);
          }
          return;
        } catch (error) {
          this.handleError('Error during retry initialization', error);
        }
      }

      attempts++;
      const timeoutId = setTimeout(retry, this.retryDelay * Math.pow(2, attempts - 1)); // Exponential backoff
      this.retryTimeouts.add(timeoutId);
    };

    const initialTimeoutId = setTimeout(retry, this.retryDelay);
    this.retryTimeouts.add(initialTimeoutId);
  }

  /**
   * Check if tracking is enabled and available
   */
  private isTrackingEnabled(): boolean {
    // Check for explicit opt-out via environment variable
    if (import.meta.env.VITE_GA_ENABLED === 'false') {
      return false;
    }

    // Respect Do Not Track browser setting (comprehensive check)
    if (this.config?.respectDNT !== false && this.isDoNotTrackEnabled()) {
      return false;
    }

    // Check for privacy-focused browser settings
    if (this.hasPrivacyRestrictions()) {
      return false;
    }

    // Check if analytics is configured and enabled
    return this.config?.enabled === true;
  }

  /**
   * Comprehensive Do Not Track detection
   */
  private isDoNotTrackEnabled(): boolean {
    if (typeof navigator === 'undefined') return false;

    // Check various DNT implementations
    const dntValues = [
      navigator.doNotTrack,
      (navigator as any).msDoNotTrack,
      (window as any).doNotTrack
    ];

    // DNT can be '1', 'yes', or true
    return dntValues.some(value => 
      value === '1' || 
      value === 'yes' || 
      value === true
    );
  }

  /**
   * Check for privacy-focused browser restrictions
   */
  private hasPrivacyRestrictions(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      // Check for private/incognito mode indicators
      if (this.isPrivateMode()) {
        return true;
      }

      // Check for tracking protection
      if (this.hasTrackingProtection()) {
        return true;
      }

      // Check for third-party cookie restrictions
      if (this.hasThirdPartyCookieRestrictions()) {
        return true;
      }

      return false;
    } catch (error) {
      // If we can't determine privacy settings, err on the side of caution
      return true;
    }
  }

  /**
   * Detect private/incognito browsing mode
   */
  private isPrivateMode(): boolean {
    try {
      // Test localStorage availability (often restricted in private mode)
      const testKey = '__analytics_privacy_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      // Test sessionStorage availability
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      
      return false; // If both work, likely not private mode
    } catch (error) {
      return true; // If storage is restricted, likely private mode
    }
  }

  /**
   * Check for browser tracking protection
   */
  private hasTrackingProtection(): boolean {
    // Firefox tracking protection
    if ((navigator as any).doNotTrack === '1' && navigator.userAgent.includes('Firefox')) {
      return true;
    }

    // Safari Intelligent Tracking Prevention indicators
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      // Safari often blocks third-party tracking
      return this.isSafariWithITP();
    }

    // Edge tracking prevention
    if (navigator.userAgent.includes('Edge')) {
      return (navigator as any).msDoNotTrack === '1';
    }

    return false;
  }

  /**
   * Detect Safari with Intelligent Tracking Prevention
   */
  private isSafariWithITP(): boolean {
    try {
      // Test for ITP by checking document.hasStorageAccess
      if ('hasStorageAccess' in document) {
        // If hasStorageAccess exists, ITP is likely active
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check for third-party cookie restrictions
   */
  private hasThirdPartyCookieRestrictions(): boolean {
    try {
      // Test if we can set a cookie
      document.cookie = '__analytics_cookie_test__=test; SameSite=None; Secure';
      const canSetCookie = document.cookie.includes('__analytics_cookie_test__');
      
      // Clean up test cookie
      if (canSetCookie) {
        document.cookie = '__analytics_cookie_test__=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      return !canSetCookie;
    } catch (error) {
      return true; // If we can't test cookies, assume restrictions
    }
  }

  /**
   * Validate that no PII is being tracked
   */
  private validateAnonymousTracking(): boolean {
    // Check if any queued events contain PII
    const hasQueuedPII = this.eventQueue.some(event => 
      this.eventContainsPII(event)
    );

    // Check failed events for PII
    const hasFailedPII = Array.from(this.failedEvents.values()).some(failedEvent =>
      this.eventContainsPII(failedEvent.event)
    );

    if (hasQueuedPII || hasFailedPII) {
      console.error('PII detected in analytics events. Clearing queues for privacy compliance.');
      this.clearPIIEvents();
      return false;
    }

    return true;
  }

  /**
   * Check if an event contains PII
   */
  private eventContainsPII(event: AnalyticsEvent): boolean {
    const parametersString = JSON.stringify(event.parameters);
    return this.containsPII(parametersString) || this.containsPII(event.event_name);
  }

  /**
   * Clear events that contain PII
   */
  private clearPIIEvents(): void {
    // Filter out events with PII from queue
    this.eventQueue = this.eventQueue.filter(event => !this.eventContainsPII(event));

    // Remove failed events with PII
    this.failedEvents.forEach((failedEvent, key) => {
      if (this.eventContainsPII(failedEvent.event)) {
        this.failedEvents.delete(key);
      }
    });
  }

  /**
   * Create opt-out mechanism
   */
  public optOut(): void {
    if (this.config?.debugMode) {
      console.log('User opted out of analytics tracking');
    }

    // Clear all queued and failed events
    this.eventQueue.length = 0;
    this.failedEvents.clear();
    this.clearRetryTimeouts();

    // Disable tracking
    if (this.config) {
      this.config.enabled = false;
    }

    // Set opt-out flag in localStorage for persistence
    try {
      localStorage.setItem('analytics_opt_out', 'true');
    } catch (error) {
      // If localStorage is not available, just disable for this session
      console.warn('Could not persist opt-out preference');
    }

    // End current session
    this.endSession();
  }

  /**
   * Check if user has previously opted out
   */
  private hasUserOptedOut(): boolean {
    try {
      return localStorage.getItem('analytics_opt_out') === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Allow user to opt back in
   */
  public optIn(): void {
    if (this.config?.debugMode) {
      console.log('User opted back into analytics tracking');
    }

    // Remove opt-out flag
    try {
      localStorage.removeItem('analytics_opt_out');
    } catch (error) {
      console.warn('Could not remove opt-out preference');
    }

    // Re-enable tracking if configuration allows
    if (this.config && !this.isDoNotTrackEnabled() && !this.hasPrivacyRestrictions()) {
      this.config.enabled = true;
      
      // Reinitialize if needed
      if (!this.initialized && typeof window !== 'undefined' && window.gtag) {
        this.initialized = true;
        this.initializeSession();
      }
    }
  }

  /**
   * Get current privacy status
   */
  public getPrivacyStatus(): {
    trackingEnabled: boolean;
    doNotTrack: boolean;
    hasPrivacyRestrictions: boolean;
    userOptedOut: boolean;
    analyticsBlocked: boolean;
  } {
    return {
      trackingEnabled: this.isTrackingEnabled(),
      doNotTrack: this.isDoNotTrackEnabled(),
      hasPrivacyRestrictions: this.hasPrivacyRestrictions(),
      userOptedOut: this.hasUserOptedOut(),
      analyticsBlocked: this.isAnalyticsBlocked()
    };
  }

  /**
   * Perform periodic privacy compliance check
   */
  private performPrivacyComplianceCheck(): void {
    // Validate anonymous tracking
    if (!this.validateAnonymousTracking()) {
      console.warn('Privacy compliance check failed. Disabling analytics.');
      this.optOut();
      return;
    }

    // Check if privacy settings have changed
    if (!this.isTrackingEnabled()) {
      if (this.config?.debugMode) {
        console.log('Privacy settings changed. Disabling analytics.');
      }
      this.handlePrivacySettingsChange();
    }
  }

  /**
   * Handle changes in privacy settings
   */
  private handlePrivacySettingsChange(): void {
    // Clear queues and disable tracking
    this.eventQueue.length = 0;
    this.failedEvents.clear();
    this.clearRetryTimeouts();
    
    if (this.config) {
      this.config.enabled = false;
    }
    
    this.endSession();
  }

  /**
   * Start periodic privacy compliance checks
   */
  private startPrivacyComplianceMonitoring(): void {
    // Check every 5 minutes
    const intervalId = setInterval(() => {
      this.performPrivacyComplianceCheck();
    }, 5 * 60 * 1000);
    
    // Store interval ID for cleanup if needed
    this.retryTimeouts.add(intervalId);
  }

  /**
   * Sanitize event parameters to ensure valid types and no PII
   */
  private sanitizeParameters(parameters?: Record<string, any>): Record<string, string | number | boolean | undefined> {
    if (!parameters) return {};

    const sanitized: Record<string, string | number | boolean | undefined> = {};

    Object.entries(parameters).forEach(([key, value]) => {
      // Only allow specific types
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        // Ensure no PII by limiting string length and checking for common PII patterns
        if (typeof value === 'string') {
          if (value.length > 100) {
            sanitized[key] = value.substring(0, 100);
          } else if (!this.containsPII(value)) {
            sanitized[key] = value;
          }
        } else {
          sanitized[key] = value;
        }
      }
    });

    return sanitized;
  }

  /**
   * Enhanced PII detection to prevent accidental tracking
   */
  private containsPII(value: string): boolean {
    const piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i, // Addresses
      /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/, // Full names (basic pattern)
      /\b(ip|address):\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/i, // IP addresses
      /\b[A-Z0-9]{2,4}[-\s]?\d{2,4}[-\s]?\d{2,4}\b/, // License plates, IDs
    ];

    return piiPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Handle general errors
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    
    if (this.config?.debugMode) {
      console.error('Analytics error details:', error);
    }
  }

  /**
   * Handle event send errors with retry logic
   */
  private handleEventSendError(event: AnalyticsEvent, error: any): void {
    const eventKey = this.getEventKey(event);
    const failedEvent = this.failedEvents.get(eventKey);
    
    if (failedEvent) {
      failedEvent.attempts++;
      failedEvent.lastAttempt = Date.now();
    } else {
      this.failedEvents.set(eventKey, {
        event,
        attempts: 1,
        lastAttempt: Date.now()
      });
    }
    
    // Only retry if we haven't exceeded max attempts
    if (!failedEvent || failedEvent.attempts < this.retryAttempts) {
      this.scheduleEventRetry(event, failedEvent?.attempts || 1);
    } else {
      console.warn(`Analytics event failed after ${this.retryAttempts} attempts:`, event.event_name);
      // Remove from failed events to prevent memory leaks
      this.failedEvents.delete(eventKey);
    }
    
    if (this.config?.debugMode) {
      console.error('Event send error:', error);
    }
  }

  /**
   * Set up network connectivity monitoring
   */
  private setupNetworkMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Initial online status
    this.isOnline = navigator.onLine;

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.config?.debugMode) {
        console.log('Network connectivity restored. Processing queued events.');
      }
      this.processEventQueue();
      this.retryFailedEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      if (this.config?.debugMode) {
        console.log('Network connectivity lost. Events will be queued.');
      }
    });
  }

  /**
   * Queue event with size management
   */
  private queueEvent(event: AnalyticsEvent): void {
    // Prevent queue from growing too large
    if (this.eventQueue.length >= this.maxQueueSize) {
      // Remove oldest event to make room
      this.eventQueue.shift();
      console.warn('Analytics event queue full. Removing oldest event.');
    }
    
    this.eventQueue.push(event);
    
    if (this.config?.debugMode) {
      console.log('Analytics event queued:', event.event_name, `(Queue size: ${this.eventQueue.length})`);
    }
  }

  /**
   * Generate unique key for event tracking
   */
  private getEventKey(event: AnalyticsEvent): string {
    return `${event.event_name}_${event.timestamp}_${JSON.stringify(event.parameters)}`;
  }

  /**
   * Schedule retry for failed event
   */
  private scheduleEventRetry(event: AnalyticsEvent, attempt: number): void {
    const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
    
    const timeoutId = setTimeout(() => {
      this.retryTimeouts.delete(timeoutId);
      
      if (this.initialized && typeof window !== 'undefined' && window.gtag && this.isOnline) {
        this.sendEvent(event);
      } else {
        // Still not ready, queue it again
        this.queueEvent(event);
      }
    }, delay);
    
    this.retryTimeouts.add(timeoutId);
  }

  /**
   * Retry all failed events
   */
  private retryFailedEvents(): void {
    if (!this.isOnline || !this.initialized || !window.gtag) return;

    const now = Date.now();
    const retryInterval = 30000; // 30 seconds

    this.failedEvents.forEach((failedEvent, eventKey) => {
      // Only retry if enough time has passed since last attempt
      if (now - failedEvent.lastAttempt > retryInterval) {
        if (failedEvent.attempts < this.retryAttempts) {
          this.sendEvent(failedEvent.event);
        } else {
          // Remove events that have exceeded retry attempts
          this.failedEvents.delete(eventKey);
        }
      }
    });
  }

  /**
   * Clear all retry timeouts (useful for cleanup)
   */
  private clearRetryTimeouts(): void {
    this.retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.retryTimeouts.clear();
  }

  /**
   * Check if analytics is blocked by privacy tools
   */
  private isAnalyticsBlocked(): boolean {
    if (typeof window === 'undefined') return true;

    // Check for common ad blocker indicators
    const blockerIndicators = [
      // Check if gtag function is blocked or replaced
      !window.gtag || typeof window.gtag !== 'function',
      // Check for common ad blocker properties
      window.navigator.userAgent.includes('AdBlock'),
      // Check if Google Analytics domains are blocked
      this.isGoogleAnalyticsBlocked()
    ];

    return blockerIndicators.some(indicator => indicator);
  }

  /**
   * Test if Google Analytics domains are accessible
   */
  private isGoogleAnalyticsBlocked(): boolean {
    try {
      // Create a test image to check if GA domains are accessible
      const testImg = new Image();
      testImg.src = 'https://www.google-analytics.com/collect?v=1&t=pageview&tid=UA-TEST&cid=test';
      return false; // If we can create the request, it's likely not blocked
    } catch (error) {
      return true; // If there's an error, it might be blocked
    }
  }

  /**
   * Fallback mechanism when analytics is blocked
   */
  private handleAnalyticsBlocked(): void {
    if (this.config?.debugMode) {
      console.log('Analytics appears to be blocked. Running in fallback mode.');
    }

    // Clear any pending operations
    this.clearRetryTimeouts();
    this.eventQueue.length = 0;
    this.failedEvents.clear();

    // Set initialized to false to prevent further attempts
    this.initialized = false;
  }
}



// Export singleton instance
export const analyticsService = new GoogleAnalyticsService();
export default analyticsService;