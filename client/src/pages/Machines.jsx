// Machines Page
// List and manage all factory machines

import { Link } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { machinesAPI } from '../api/machines';
import { Cpu, AlertCircle, CheckCircle } from 'lucide-react';
import { useCallback } from 'react';

export function Machines() {
  const fetchMachines = useCallback(() => machinesAPI.getAllMachines(), []);

  const { data, loading, error } = usePolling(
    fetchMachines,
    5000
  );

  const machines = data?.data || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'NORMAL':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'WARNING':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'CRITICAL':
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <Cpu size={16} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Machines</h1>
        <p className="text-slate-400">Industrial Equipment Inventory</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && machines.length === 0 ? (
          <p className="text-slate-400 col-span-full">Loading machines...</p>
        ) : machines.length > 0 ? (
          machines.map((machine) => (
            <Link
              key={machine._id}
              to={`/machines/${machine.machineId}`}
              className={`rounded-lg p-4 border transition-all hover:scale-105 cursor-pointer ${getStatusColor(machine.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-cyan-400" />
                  <h3 className="font-semibold text-slate-200">{machine.name}</h3>
                </div>
                {getStatusIcon(machine.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <span className="text-slate-300 font-mono">{machine.machineId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-slate-300">{machine.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zone:</span>
                  <span className="text-slate-300">{machine.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-semibold">{machine.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Health:</span>
                  <span className="text-cyan-400 font-semibold">{machine.healthScore}%</span>
                </div>
              </div>

              <div className="mt-3 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    machine.healthScore >= 80
                      ? 'bg-green-500'
                      : machine.healthScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${machine.healthScore}%` }}
                />
              </div>
            </Link>
          ))
        ) : (
          <p className="text-slate-400 col-span-full">No machines available. Start the simulation in the Dashboard.</p>
        )}
      </div>
    </div>
  );
}

export default Machines;
