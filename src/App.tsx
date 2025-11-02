import { Routes, Route } from 'react-router-dom';
import { OptimizerProvider } from './features/optimizer/context/OptimizerContext';
import { Home } from './components/Home';
import { Planner } from './components/Planner';
import { FarmTrackerApp } from './components/FarmTrackerApp';
import { Formulas } from './components/Formulas';
import { FarmOptimizer } from './components/FarmOptimizer';
import { ElementTable } from './components/ElementTable';

function App() {
  return (
    <OptimizerProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/tracker" element={<FarmTrackerApp />} />
        <Route path="/formulas" element={<Formulas />} />
        <Route path="/optimizer" element={<FarmOptimizer />} />
        <Route path="/elements" element={<ElementTable />} />
      </Routes>
    </OptimizerProvider>
  );
}

export default App;
