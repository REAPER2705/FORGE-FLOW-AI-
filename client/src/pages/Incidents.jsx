// Incidents Page
// View and manage active and historical incidents

import { usePolling } from '../hooks/usePolling';
import { incidentsAPI } from '../api/incidents';

export function Incidents() {
  const { data, loading, error } = usePolling(
    () => incidentsAPI.getAllIncidents(),
    5000
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Incidents</h1>
        <p className="text-slate-400">Critical Events & Alerts</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Active Incidents</h2>
        {loading ? (
          <p className="text-slate-400">Loading incidents...</p>
        ) : data?.data?.length > 0 ? (
          <div className="space-y-2">
            {data.data.map((incident) => (
              <div key={incident._id} className="p-3 bg-slate-700 rounded text-slate-200">
                {incident.title}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No incidents. Factory is operating normally.</p>
        )}
      </div>
    </div>
  );
}

export default Incidents;
