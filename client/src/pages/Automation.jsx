// Automation Page - TEST VERSION
// Track n8n automation executions and workflows

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader, Activity } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import { automationAPI } from '../api/automation';

function StatusBadge({ status }) {
  const statusConfig = {
    SUCCESS: { color: 'bg-green-900 text-green-100', icon: CheckCircle },
    FAILED: { color: 'bg-red-900 text-red-100', icon: AlertCircle },
    RUNNING: { color: 'bg-yellow-900 text-yellow-100', icon: Loader },
  };

  const config = statusConfig[status] || statusConfig.RUNNING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {status === 'RUNNING' && <Icon size={14} className="animate-spin" />}
      {status !== 'RUNNING' && <Icon size={14} />}
      {status}
    </span>
  );
}

export function Automation() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchExecutions = useCallback(() => automationAPI.getExecutions(20), []);

  const { data, loading, error } = usePolling(fetchExecutions, 5000);

  const loadStatsAsync = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await automationAPI.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatsAsync();
    const interval = setInterval(loadStatsAsync, 10000);
    return () => clearInterval(interval);
  }, [loadStatsAsync]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Automation</h1>
        <p className="text-slate-400">n8n Workflow Execution History & Statistics</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-100 font-semibold">Error</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Total</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.total}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Successful</p>
            <p className="text-2xl font-bold text-green-400">{stats.successful}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Failed</p>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Running</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.running}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Success Rate</p>
            <p className="text-2xl font-bold text-purple-400">{stats.successRate}%</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-200">Recent Executions</h2>
          {loading && <Loader size={16} className="animate-spin text-slate-400 ml-auto" />}
        </div>

        {loading ? (
          <p className="text-slate-400 text-center py-8">Loading...</p>
        ) : data?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400">Execution ID</th>
                  <th className="text-left py-2 px-3 text-slate-400">Workflow</th>
                  <th className="text-left py-2 px-3 text-slate-400">Incident</th>
                  <th className="text-left py-2 px-3 text-slate-400">Status</th>
                  <th className="text-right py-2 px-3 text-slate-400">Duration (ms)</th>
                  <th className="text-left py-2 px-3 text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((exec) => (
                  <tr key={exec._id} className="border-b border-slate-700 hover:bg-slate-700">
                    <td className="py-3 px-3 text-slate-300 font-mono text-xs">{exec.executionId}</td>
                    <td className="py-3 px-3 text-slate-300">{exec.workflowName}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{exec.incidentId || '-'}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={exec.status} />
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">{exec.duration || '-'}</td>
                    <td className="py-3 px-3 text-slate-400 text-xs">
                      {new Date(exec.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">
            No executions yet.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>✓ Critical incidents trigger n8n workflows automatically</li>
            <li>✓ Workflow receives incident, telemetry, and recommendations</li>
            <li>✓ Execution status is tracked in real-time</li>
            <li>✓ Duplicate triggers are prevented</li>
            <li>✓ Failures don't break incident creation</li>
          </ul>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Webhook Configuration</h3>
          <p className="text-xs text-slate-400 mb-3 font-mono">
            http://localhost:5678/webhook/forgeflow-incident
          </p>
          <p className="text-xs text-slate-500">
            Configure the n8n webhook URL in the server .env file.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Automation;
