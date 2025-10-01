import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * ErrorBoundary component for catching and displaying component-level errors
 * Provides graceful error handling and user-friendly error messages
 * Requirements: 7.3
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Static method to update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In a production app, you might want to log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  /**
   * Handle retry action
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  /**
   * Handle refresh page action
   */
  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            
            <p className={styles.errorMessage}>
              The Bond Return Calculator encountered an unexpected error. This might be due to:
            </p>
            
            <ul className={styles.errorReasons}>
              <li>Invalid calculation inputs</li>
              <li>Browser compatibility issues</li>
              <li>Temporary system error</li>
            </ul>

            <div className={styles.errorActions}>
              <button 
                onClick={this.handleRetry}
                className={styles.retryButton}
              >
                Try Again
              </button>
              
              <button 
                onClick={this.handleRefresh}
                className={styles.refreshButton}
              >
                Refresh Page
              </button>
            </div>

            {/* Development error details */}
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorDetailsSummary}>
                  Technical Details (Development Only)
                </summary>
                <div className={styles.errorDetailsContent}>
                  <h4>Error:</h4>
                  <pre className={styles.errorStack}>
                    {this.state.error.toString()}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre className={styles.errorStack}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}