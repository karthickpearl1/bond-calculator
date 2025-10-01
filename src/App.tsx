import type { FC } from 'react';
import { BondCalculator } from './components/BondCalculator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css'

const App: FC = () => {
  return (
    <ThemeProvider>
      <div className="App">
        <ErrorBoundary>
          <BondCalculator />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  )
};

export default App
