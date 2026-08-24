// Factory Digital Twin Page
// Interactive 2D factory layout visualization with machine selection and live telemetry

import { usePolling } from '../hooks/usePolling';
import { machinesAPI } from '../api/machines';
import { telemetryAPI } from '../api/telemetry';
import { incidentsAPI } from '../api/incidents';
import { workOrdersAPI } from '../api/workOrders';
import TelemetryChart from '../components/TelemetryChart';
import { Cpu, X, AlertTriangle, Zap } from 'lucide-react';
import { useState, useCallback } from 'react';

export function FactoryTwin() {
  // Memoize fetch functions to prevent infinite re-renders
  const fetchMachines = useCallback(() => machinesAPI.getAllMachines(), []);
  const fetchIncidents = useCallback(() => incidentsAPI.getAllIncidents(), []);
  const fetchWorkOrders = useCallback(() => workOrdersAPI.getAllWorkOrders(), []);

  const { data, loading } = usePolling(fetchMachines, 5000);
  const { data: allIncidents } = usePolling(fetchIncidents, 10000);
  const { data: allWorkOrders } = usePolling(fetchWorkOrders, 10000);

  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryData, setTelemetryData] = useState(null);

  const machines = data?.data || [];
  const incidents = allIncidents?.data || [];
  const workOrders = allWorkOrders?.data || [];

  // Group machines by zone
  const machinesByZone = {
    Assembly: machines.filter((m) => m.zone === 'Assembly'),
    CNC: machines.filter((m) => m.zone === 'CNC'),
    Packaging: machines.filter((m) => m.zone === 'Packaging'),
    Storage: machines.filter((m) => m.zone === 'Storage'),
    Utilities: machines.filter((m) => m.zone === 'Utilities'),
  };

  const selectedMachine = machines.find((m) => m.machineId === selectedMachineId);

  // Handle machine selection
  const handleMachineSelect = async (machineId) => {
    setSelectedMachineId(machineId);
    setTelemetryLoading(true);
    try {
      const response = await telemetryAPI.getTelemetryByMachine(machineId, 20);
      setTelemetryData(response.data);
    } catch (error) {
      console.error('Error fetching telemetry:', error);
      setTelemetryData(null);
    } finally {
      setTelemetryLoading(false);
    }
  };

  // Get machine incidents
  const getMachineIncidents = (machineId) => {
    return incidents.filter((i) => i.machineId === machineId);
  };

  // Get machine work orders
  const getMachineWorkOrders = (machineId) => {
    return workOrders.filter((w) => w.machineId === machineId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-600 border-green-400';
      case 'WARNING':
        return 'bg-yellow-600 border-yellow-400';
      case 'CRITICAL':
        return 'bg-red-600 border-red-400';
      case 'OFFLINE':
        return 'bg-gray-600 border-gray-400';
      default:
        return 'bg-slate-600 border-slate-400';
    }
  };

  const getStatusTextColor = (status) => {
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900 border-red-700 text-red-100';
      case 'HIGH':
        return 'bg-yellow-900 border-yellow-700 text-yellow-100';
      case 'MEDIUM':
        return 'bg-blue-900 border-blue-700 text-blue-100';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-400';
      case 'HIGH':
        return 'text-yellow-400';
      case 'MEDIUM':
        return 'text-cyan-400';
      case 'LOW':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  // Prepare chart data
  const chartData = telemetryData?.readings
    ? telemetryData.readings.map((reading) => ({
        timestamp: new Date(reading.timestamp).toLocaleTimeString(),
        temperature: parseFloat(reading.temperature.toFixed(2)),
        vibration: parseFloat(reading.vibration.toFixed(2)),
        pressure: parseFloat(reading.pressure.toFixed(2)),
        rpm: parseFloat(reading.rpm.toFixed(0)),
        power: parseFloat(reading.powerConsumption.toFixed(2)),
        utilization: parseFloat(reading.utilization.toFixed(0)),
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Factory Digital Twin</h1>
        <p className="text-slate-400">Interactive 2D Factory Layout with Live Status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factory Layout */}
        <div className="lg:col-span-2 space-y-4">
          {loading && machines.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
              <p className="text-slate-400">Loading factory layout...</p>
            </div>
          ) : machines.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
              <p className="text-slate-400 mb-2">No machines in factory yet</p>
              <p className="text-sm text-slate-500">Start the simulator from the Dashboard</p>
            </div>
          ) : (
            <>
              {Object.entries(machinesByZone).map(([zone, zoneMachines]) =>
                zoneMachines.length > 0 ? (
                  <div key={zone} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h2 className="text-lg font-semibold text-cyan-400 mb-4">{zone}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {zoneMachines.map((machine) => (
                        <button
                          key={machine._id}
                          onClick={() => handleMachineSelect(machine.machineId)}
                          className={`rounded-lg p-4 border-2 transition-all hover:scale-105 cursor-pointer ${getStatusColor(
                            machine.status
                          )} ${selectedMachineId === machine.machineId ? 'ring-2 ring-cyan-400' : ''}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Cpu size={18} className="text-slate-200" />
                            <h3 className="font-semibold text-slate-200 text-sm text-left">{machine.name}</h3>
                          </div>
                          <div className="space-y-1 text-xs text-slate-300 text-left">
                            <p>
                              <span className="text-slate-400">ID:</span> {machine.machineId}
                            </p>
                            <p>
                              <span className="text-slate-400">Status:</span>
                              <span className={`ml-2 font-semibold ${getStatusTextColor(machine.status)}`}>
                                {machine.status}
                              </span>
                            </p>
                            <p>
                              <span className="text-slate-400">Health:</span>
                              <span className="ml-2 font-semibold text-cyan-400">{machine.healthScore}%</span>
                            </p>
                          </div>
                          <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                machine.healthScore >= 80
                                  ? 'bg-green-400'
                                  : machine.healthScore >= 60
                                    ? 'bg-yellow-400'
                                    : 'bg-red-400'
                              }`}
                              style={{ width: `${machine.healthScore}%` }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </>
          )}

          {/* Legend */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Status Legend</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded" />
                <span className="text-slate-400">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-600 rounded" />
                <span className="text-slate-400">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded" />
                <span className="text-slate-400">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded" />
                <span className="text-slate-400">Offline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine Details Panel */}
        <div className="lg:col-span-1">
          {selectedMachine ? (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 space-y-4">
              {/* Close button */}
              <button
                onClick={() => setSelectedMachineId(null)}
                className="float-right text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>

              {/* Machine Info */}
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">{selectedMachine.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ID:</span>
                    <span className="text-slate-300 font-mono">{selectedMachine.machineId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="text-slate-300">{selectedMachine.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Zone:</span>
                    <span className="text-slate-300">{selectedMachine.zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={`font-semibold ${getStatusTextColor(selectedMachine.status)}`}>
                      {selectedMachine.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Health:</span>
                    <span className="text-cyan-400 font-semibold">{selectedMachine.healthScore}%</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      selectedMachine.healthScore >= 80
                        ? 'bg-green-500'
                        : selectedMachine.healthScore >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedMachine.healthScore}%` }}
                  />
                </div>
              </div>

              {/* CRITICAL Alert */}
              {selectedMachine.status === 'CRITICAL' && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-100 text-sm">
                    <AlertTriangle size={16} />
                    <span className="font-semibold">CRITICAL - Immediate Action Required</span>
                  </div>
                </div>
              )}

              {/* Live Telemetry Snapshot */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Live Telemetry</h4>
                {telemetryLoading && !telemetryData ? (
                  <p className="text-xs text-slate-400">Loading telemetry...</p>
                ) : chartData.length > 0 ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Temp:</span>
                      <span className="text-slate-300">
                        {chartData[chartData.length - 1].temperature}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vibration:</span>
                      <span className="text-slate-300">
                        {chartData[chartData.length - 1].vibration} mm/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pressure:</span>
                      <span className="text-slate-300">
                        {chartData[chartData.length - 1].pressure} PSI
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">RPM:</span>
                      <span className="text-slate-300">{chartData[chartData.length - 1].rpm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Power:</span>
                      <span className="text-slate-300">
                        {chartData[chartData.length - 1].power} kW
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No telemetry available</p>
                )}
              </div>

              {/* Incidents */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Incidents ({getMachineIncidents(selectedMachine.machineId).length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getMachineIncidents(selectedMachine.machineId).slice(0, 3).map((incident) => (
                    <div
                      key={incident._id}
                      className={`rounded-md p-2 border text-xs ${getSeverityColor(incident.severity)}`}
                    >
                      <p className="font-semibold">{incident.severity}</p>
                      <p className="truncate">{incident.description}</p>
                    </div>
                  ))}
                  {getMachineIncidents(selectedMachine.machineId).length === 0 && (
                    <p className="text-xs text-slate-400">No incidents</p>
                  )}
                </div>
              </div>

              {/* Maintenance */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1">
                  <Zap size={14} />
                  Maintenance ({getMachineWorkOrders(selectedMachine.machineId).length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getMachineWorkOrders(selectedMachine.machineId).slice(0, 3).map((wo) => (
                    <div key={wo._id} className="rounded-md p-2 bg-slate-700 border border-slate-600 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-200">{wo.title}</span>
                        <span className={`text-xs font-semibold ${getPriorityColor(wo.priority)}`}>
                          {wo.priority}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs truncate">{wo.description}</p>
                    </div>
                  ))}
                  {getMachineWorkOrders(selectedMachine.machineId).length === 0 && (
                    <p className="text-xs text-slate-400">No maintenance</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">Select a machine to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Charts for Selected Machine */}
      {selectedMachine && chartData.length > 0 && (
        <div className="space-y-4 border-t border-slate-700 pt-6">
          <h2 className="text-xl font-bold text-slate-200">Telemetry History - {selectedMachine.name}</h2>
          <TelemetryChart data={chartData} title="Temperature (°C)" metric="temperature" />
          <TelemetryChart data={chartData} title="Vibration (mm/s)" metric="vibration" />
          <TelemetryChart data={chartData} title="Pressure (PSI)" metric="pressure" />
          <TelemetryChart data={chartData} title="RPM" metric="rpm" />
          <TelemetryChart data={chartData} title="Power Consumption (kW)" metric="power" />
          <TelemetryChart data={chartData} title="Utilization (%)" metric="utilization" />
        </div>
      )}
    </div>
  );
}

export default FactoryTwin;
