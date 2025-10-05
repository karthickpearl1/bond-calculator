import React, { createContext, useContext, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { ANALYTICS_EVENTS } from '../types/analytics';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' }
};

interface CurrencyContextType {
  currency: Currency;
  currencyInfo: CurrencyInfo;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  
  const currencyInfo = CURRENCIES[currency];
  
  const setCurrency = (newCurrency: Currency) => {
    const previousCurrency = currency;
    setCurrencyState(newCurrency);
    
    // Track currency change event
    analyticsService.trackEvent(ANALYTICS_EVENTS.CURRENCY_CHANGE, {
      previous_currency: previousCurrency,
      new_currency: newCurrency,
      interaction_type: 'currency_preference_change'
    });
    
    // Update session currency tracking
    analyticsService.updateSessionCurrency(newCurrency);
  };
  
  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || !isFinite(amount)) {
      return 'N/A';
    }
    
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      currencyInfo, 
      setCurrency, 
      formatCurrency 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};