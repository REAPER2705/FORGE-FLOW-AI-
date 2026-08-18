// Dashboard Page
// Main overview of factory operations and KPIs

import { useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { machinesAPI } from '../api/machines';
import { analysisAPI } from '../api/analysis';
import { simulationAPI } from '../api/simulation';
import { Play, AlertCircle, TrendingDown, CheckCircle, Zap } from 'lucide-react';

function KPICard({ title, value, icon: Icon, color = 'cyan', subtext = '' }) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        {Icon && <Icon size={20} className={colorClasses[color]} />}
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      {subtext && <div className="text-xs text-slate-500 mt-2">{subtext}</div>}
    </div>
  );
}

export function Dashboard() {
  const [simulationStarting, setSimulationStarting] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  // Fetch machines
  const { data: machinesData } = usePolling(() => machinesAPI.getAllMachines(), 5000);

  // Fetch analysis summary
  const { data: summaryData } = usePolling(() => analysisAPI.getDashboardSummary(), 5000);

  const machines = machinesData?.data || [];
  const summary = summaryData?.data;

  const handleStartSimulation = async () => {
    setSimulationStarting(true);
    try {
      await simulationAPI.start();
      setSimMessage('✓ Simulator started successfully');
      setTimeout(() => setSimMessage(''), 3000);
    } catch (error) {
      setSimMessage('✗ Error: ' + error.message);
    } finally {
      setSimulationStarting(false);
    }
  };

  const handleAnalyzeNow = async () => {
    setSimulationStarting(true);
    try {
      await analysisAPI.analyzeAllMachines();
      setSimMessage('✓ Analysis triggered');
      setTimeout(() => setSimMessage(''), 3000);
    } catch (error) {
      setSimMessage('✗ Error: ' + error.message);
    } finally {
      setSimulationStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Dashboard</h1>
          <p className="text-slate-400">Industrial Operations Overview</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Simulator</h3>
            <p className="text-xs text-slate-400">Generate telemetry data</p>
          </div>
          <button
            onClick={handleStartSimulation}
            disabled={simulationStarting}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg transition whitespace-nowrap"
          >
            <Play size={18} />
            Start
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">Analysis</h3>
            <p className="text-xs text-slate-400">Analyze all machines now</p>
          </div>
          <button
            onClick={handleAnalyzeNow}
            disabled={simulationStarting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition whitespace-nowrap"
          >
            <Zap size={18} />
            Analyze
          </button>
        </div>
      </div>

      {/* Simulation Message */}
      {simMessage && (
        <div
          className={`rounded-lg p-4 border ${simMessage.startsWith('✓') ? 'bg-green-900 border-green-700 text-green-100' : 'bg-red-900 border-red-700 text-red-100'}`}
        >
          {simMessage}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Machines" value={summary?.totalMachines || 0} color="cyan" />
        <KPICard
          title="Healthy"
          value={summary?.machineStatus?.normal || 0}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Critical"
          value={summary?.machineStatus?.critical || 0}
          icon={AlertCircle}
          color="red"
        />
        <KPICard title="Open Incidents" value={summary?.incidents?.open || 0} color="yellow" />
        <KPICard
          title="Avg Health"
          value={`${summary?.averageHealth || 100}%`}
          color="cyan"
        />
      </div>

      {/* Detailed Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Healthy Machines</p>
          <p className="text-2xl font-bold text-green-400">{summary?.machineStatus?.normal}</p>
        </div>
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Warnings</p>
          <p className="text-2xl font-bold text-yellow-400">{summary?.machineStatus?.warning}</p>
        </div>
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-400">{summary?.machineStatus?.critical}</p>
        </div>
        <div className="bg-orange-900 border border-orange-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Pending Maintenance</p>
          <p className="text-2xl font-bold text-orange-400">{summary?.maintenance?.pending}</p>
        </div>
      </div>

      {/* Maintenance Priority Breakdown */}
      {summary?.maintenance?.byPriority && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Maintenance Priority Breakdown</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Critical</p>
              <p className="text-3xl font-bold text-red-400">{summary.maintenance.byPriority.CRITICAL}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">High</p>
              <p className="text-3xl font-bold text-orange-400">{summary.maintenance.byPriority.HIGH}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Medium</p>
              <p className="text-3xl font-bold text-yellow-400">{summary.maintenance.byPriority.MEDIUM}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Low</p>
              <p className="text-3xl font-bold text-green-400">{summary.maintenance.byPriority.LOW}</p>
            </div>
          </div>
        </div>
      )}

      {/* Incident Summary */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-slate-200 mb-4">Incident Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Total Incidents</p>
            <p className="text-2xl font-bold text-cyan-400">{summary?.incidents?.total || 0}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Open Incidents</p>
            <p className="text-2xl font-bold text-orange-400">{summary?.incidents?.open || 0}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Critical Incidents</p>
            <p className="text-2xl font-bold text-red-400">{summary?.incidents?.critical || 0}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-bold text-slate-200 mb-3">Phase 3: Anomaly Detection & Analysis</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-400 text-sm">
          <li>Click "Start" to begin the telemetry simulator</li>
          <li>Analysis runs automatically every 30 seconds</li>
          <li>Anomalies are detected and incidents created</li>
          <li>Maintenance recommendations are generated</li>
          <li>View machines on the "Machines" page</li>
          <li>View incidents and work orders on "Maintenance" page</li>
          <li>Trigger critical state to test the complete workflow</li>
        </ol>
      </div>
    </div>
  );
}

export default Dashboard;
