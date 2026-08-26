// ForgeFlow AI - Main App Component
// Router setup and main application layout

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useHealthCheck } from './hooks/useHealthCheck';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import FactoryTwin from './pages/FactoryTwin';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import Incidents from './pages/Incidents';
import Copilot from './pages/Copilot';
import Reports from './pages/Reports';
import Automation from './pages/Automation';

function App() {
  const { isHealthy, isChecking } = useHealthCheck();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout apiHealthy={isHealthy} />}>
          <Route index element={<Dashboard />} />
          <Route path="factory" element={<FactoryTwin />} />
          <Route path="machines" element={<Machines />} />
          <Route path="machines/:id" element={<MachineDetail />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="copilot" element={<Copilot />} />
          <Route path="reports" element={<Reports />} />
          <Route path="automation" element={<Automation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
