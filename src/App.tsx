import type { FC } from 'react';
import { BondCalculator } from './components/BondCalculator';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css'

const App: FC = () => {
  return (
    <div className="App">
      <ErrorBoundary>
        <BondCalculator />
      </ErrorBoundary>
    </div>
  )
};

export default App
