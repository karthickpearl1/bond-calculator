import type { FC } from 'react';
import { BondCalculator } from './components/BondCalculator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import './App.css'

const App: FC = () => {
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

export default App
