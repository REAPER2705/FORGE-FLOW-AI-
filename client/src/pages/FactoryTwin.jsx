// Factory Digital Twin Page
// Interactive 2D factory layout visualization

import { usePolling } from '../hooks/usePolling';
import { machinesAPI } from '../api/machines';
import { Cpu } from 'lucide-react';

export function FactoryTwin() {
  const { data, loading } = usePolling(() => machinesAPI.getAllMachines(), 5000);

  const machines = data?.data || [];

  // Group machines by zone
  const machinesByZone = {
    Assembly: machines.filter((m) => m.zone === 'Assembly'),
    CNC: machines.filter((m) => m.zone === 'CNC'),
    Packaging: machines.filter((m) => m.zone === 'Packaging'),
    Storage: machines.filter((m) => m.zone === 'Storage'),
    Utilities: machines.filter((m) => m.zone === 'Utilities'),
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Factory Digital Twin</h1>
        <p className="text-slate-400">Interactive 2D Factory Layout</p>
      </div>

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
        <div className="space-y-4">
          {Object.entries(machinesByZone).map(([zone, zoneMachines]) =>
            zoneMachines.length > 0 ? (
              <div key={zone} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-cyan-400 mb-4">{zone}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zoneMachines.map((machine) => (
                    <div
                      key={machine._id}
                      className={`rounded-lg p-4 border-2 ${getStatusColor(machine.status)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu size={18} className="text-slate-200" />
                        <h3 className="font-semibold text-slate-200 text-sm">{machine.name}</h3>
                      </div>
                      <div className="space-y-1 text-xs text-slate-300">
                        <p>
                          <span className="text-slate-400">ID:</span> {machine.machineId}
                        </p>
                        <p>
                          <span className="text-slate-400">Status:</span>
                          <span className="ml-2 font-semibold">{machine.status}</span>
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
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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
  );
}

export default FactoryTwin;
