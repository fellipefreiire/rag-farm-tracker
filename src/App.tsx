import { Routes, Route } from 'react-router-dom';
import { OptimizerProvider } from './features/optimizer/context/OptimizerContext';
import { Home } from './components/Home';
import { Planner } from './components/Planner';
import { FarmTrackerApp } from './components/FarmTrackerApp';
import { Formulas } from './components/Formulas';
import { FarmOptimizer } from './components/FarmOptimizer';
import { ElementTable } from './components/ElementTable';
import { BossTimeTracker } from './components/BossTimeTracker';
import { SharedBossTimeTracker } from './components/SharedBossTimeTracker';
import { getRoomIdFromUrl } from './utils/room';

function BossTrackerRoute() {
  const roomId = getRoomIdFromUrl();

  // If room ID exists in URL, show shared version
  if (roomId) {
    return <SharedBossTimeTracker />;
  }

  // Otherwise show local version
  return <BossTimeTracker />;
}

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
        <Route path="/boss-tracker" element={<BossTrackerRoute />} />
      </Routes>
    </OptimizerProvider>
  );
}

export default App;
