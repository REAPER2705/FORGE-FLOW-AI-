// Machine Detail Page
// Detailed view of a specific machine with telemetry charts

import { useParams } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { machinesAPI } from '../api/machines';
import { telemetryAPI } from '../api/telemetry';
import { simulationAPI } from '../api/simulation';
import TelemetryChart from '../components/TelemetryChart';
import { AlertCircle } from 'lucide-react';
import { useState, useCallback } from 'react';

export function MachineDetail() {
  const { id } = useParams();
  const [controlLoading, setControlLoading] = useState(false);
  const [controlMessage, setControlMessage] = useState('');

  // Memoize fetch functions with id dependency
  const fetchMachine = useCallback(() => machinesAPI.getMachine(id), [id]);
  const fetchTelemetry = useCallback(() => telemetryAPI.getTelemetryByMachine(id, 50), [id]);

  // Fetch machine details
  const { data: machineData, loading: machineLoading, error: machineError } = usePolling(
    fetchMachine,
    5000
  );

  // Fetch telemetry
  const { data: telemetryData, loading: telemetryLoading, error: telemetryError } = usePolling(
    fetchTelemetry,
    5000
  );

  const machine = machineData?.data;
  const telemetry = telemetryData?.data;

  // Prepare chart data
  const chartData = telemetry?.readings ? telemetry.readings.map((reading) => ({
    timestamp: new Date(reading.timestamp).toLocaleTimeString(),
    temperature: parseFloat(reading.temperature.toFixed(2)),
    vibration: parseFloat(reading.vibration.toFixed(2)),
    pressure: parseFloat(reading.pressure.toFixed(2)),
    rpm: parseFloat(reading.rpm.toFixed(0)),
    power: parseFloat(reading.powerConsumption.toFixed(2)),
    utilization: parseFloat(reading.utilization.toFixed(0)),
  })) : [];

  // Control handlers
  const handleWarning = async () => {
    setControlLoading(true);
    try {
      await simulationAPI.triggerWarning(id);
      setControlMessage('⚠ Warning triggered');
      setTimeout(() => setControlMessage(''), 3000);
    } catch (error) {
      setControlMessage('Error: ' + error.message);
    } finally {
      setControlLoading(false);
    }
  };

  const handleCritical = async () => {
    setControlLoading(true);
    try {
      await simulationAPI.triggerCritical(id);
      setControlMessage('🔴 Critical state triggered');
      setTimeout(() => setControlMessage(''), 3000);
    } catch (error) {
      setControlMessage('Error: ' + error.message);
    } finally {
      setControlLoading(false);
    }
  };

  const handleReset = async () => {
    setControlLoading(true);
    try {
      await simulationAPI.reset();
      setControlMessage('🔄 Reset to NORMAL');
      setTimeout(() => setControlMessage(''), 3000);
    } catch (error) {
      setControlMessage('Error: ' + error.message);
    } finally {
      setControlLoading(false);
    }
  };

  // Status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL':
        return 'text-green-400';
      case 'WARNING':
        return 'text-yellow-400';
      case 'CRITICAL':
        return 'text-red-400';
      case 'OFFLINE':
        return 'text-gray-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-900 border-green-700';
      case 'WARNING':
        return 'bg-yellow-900 border-yellow-700';
      case 'CRITICAL':
        return 'bg-red-900 border-red-700';
      case 'OFFLINE':
        return 'bg-gray-900 border-gray-700';
      default:
        return 'bg-slate-800 border-slate-700';
    }
  };

  if (machineLoading && !machine) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Machine Details</h1>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (machineError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Machine Details</h1>
          <p className="text-slate-400">Machine ID: {id}</p>
        </div>
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {machineError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Machine Details</h1>
        <p className="text-slate-400">{id}</p>
      </div>

      {/* Machine Info Card */}
      <div className={`rounded-lg p-6 border ${getStatusBgColor(machine?.status)}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">Name</p>
            <p className="text-lg font-semibold text-slate-200">{machine?.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Type</p>
            <p className="text-lg font-semibold text-slate-200">{machine?.type}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Zone</p>
            <p className="text-lg font-semibold text-slate-200">{machine?.zone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Status</p>
            <p className={`text-lg font-semibold ${getStatusColor(machine?.status)}`}>
              {machine?.status}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Health Score</p>
            <p className="text-lg font-semibold text-cyan-400">{machine?.healthScore}%</p>
          </div>
        </div>
      </div>

      {/* Control Message */}
      {controlMessage && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 text-blue-100">
          {controlMessage}
        </div>
      )}

      {/* Simulation Controls */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          Simulation Controls
        </h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleWarning}
            disabled={controlLoading}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            ⚠ Trigger Warning
          </button>
          <button
            onClick={handleCritical}
            disabled={controlLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            🔴 Trigger Critical
          </button>
          <button
            onClick={handleReset}
            disabled={controlLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            🔄 Reset to Normal
          </button>
        </div>
      </div>

      {/* Telemetry Charts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Telemetry History</h2>

        {telemetryLoading && !chartData.length ? (
          <p className="text-slate-400">Loading telemetry...</p>
        ) : telemetryError ? (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
            {telemetryError}
          </div>
        ) : chartData.length > 0 ? (
          <>
            <TelemetryChart data={chartData} title="Temperature (°C)" metric="temperature" />
            <TelemetryChart data={chartData} title="Vibration (mm/s)" metric="vibration" />
            <TelemetryChart data={chartData} title="Pressure (PSI)" metric="pressure" />
            <TelemetryChart data={chartData} title="RPM" metric="rpm" />
            <TelemetryChart data={chartData} title="Power Consumption (kW)" metric="power" />
            <TelemetryChart data={chartData} title="Utilization (%)" metric="utilization" />
          </>
        ) : (
          <p className="text-slate-400">No telemetry data available. Start the simulator.</p>
        )}
      </div>
    </div>
  );
}

export default MachineDetail;

