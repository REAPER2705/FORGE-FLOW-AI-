// Automation Page
// Track n8n automation executions and workflows

import { usePolling } from '../hooks/usePolling';
import { automationAPI } from '../api/automation';

export function Automation() {
  const { data, loading, error } = usePolling(
    () => automationAPI.getExecutions(),
    5000
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Automation</h1>
        <p className="text-slate-400">n8n Workflow Executions</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Automation Executions</h2>
        {loading ? (
          <p className="text-slate-400">Loading executions...</p>
        ) : data?.data?.length > 0 ? (
          <div className="space-y-2">
            {data.data.map((exec) => (
              <div key={exec._id} className="p-3 bg-slate-700 rounded text-slate-200">
                {exec.workflowName} - {exec.status}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No automation executions yet. Will run when critical incidents occur.</p>
        )}
      </div>
    </div>
  );
}

export default Automation;
