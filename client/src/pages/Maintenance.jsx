// Maintenance Page
// Work order and maintenance tracking

import { usePolling } from '../hooks/usePolling';
import { workOrdersAPI } from '../api/workOrders';
import { useCallback } from 'react';

export function Maintenance() {
  const fetchWorkOrders = useCallback(() => workOrdersAPI.getAllWorkOrders(), []);

  const { data, loading, error } = usePolling(
    fetchWorkOrders,
    5000
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Maintenance</h1>
        <p className="text-slate-400">Work Orders & Maintenance Tracking</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Work Orders</h2>
        {loading ? (
          <p className="text-slate-400">Loading work orders...</p>
        ) : data?.data?.length > 0 ? (
          <div className="space-y-2">
            {data.data.map((order) => (
              <div key={order._id} className="p-3 bg-slate-700 rounded text-slate-200">
                {order.title}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No work orders. Will be created when incidents occur.</p>
        )}
      </div>
    </div>
  );
}

export default Maintenance;
