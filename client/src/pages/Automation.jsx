// Automation Page
// Track n8n automation executions and workflows with separate test and production flows

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Loader, Activity, Mail, X } from 'lucide-react';
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

function TestAutomationModal({ isOpen, onClose, onSubmit, loading, error, success }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
    setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Send Test Report</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-3 mb-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 border border-green-700 rounded p-3 mb-4 text-sm text-green-100">
            ✓ Test report sent successfully to {email}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Gmail or Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@gmail.com"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              You will receive a test incident report on this email address.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={16} />
                  Send Test Report
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Automation() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);
  const [testSuccess, setTestSuccess] = useState(false);

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

  const handleTestAutomation = async (email) => {
    setTestLoading(true);
    setTestError(null);
    setTestSuccess(false);

    try {
      const response = await automationAPI.sendTestAutomation(email);
      if (response.success) {
        setTestSuccess(true);
        // Close modal after 2 seconds
        setTimeout(() => {
          setTestModalOpen(false);
          setTestSuccess(false);
        }, 2000);
      } else {
        setTestError(response.error || 'Failed to send test report');
      }
    } catch (err) {
      setTestError(err.message || 'Failed to send test report. Check n8n configuration.');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">Automation</h1>
        <p className="text-slate-400">n8n Workflow Execution & Test Management</p>
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

      {/* Test Automation Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-cyan-700/30">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={20} className="text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-200">🧪 Test Automation</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Send a test incident report to verify n8n email integration is working correctly.
        </p>
        <button
          onClick={() => setTestModalOpen(true)}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <Mail size={18} />
          Send Test Report
        </button>
      </div>

      {/* Statistics */}
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

      {/* Recent Executions */}
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
                  <th className="text-left py-2 px-3 text-slate-400">Type</th>
                  <th className="text-left py-2 px-3 text-slate-400">Incident/Email</th>
                  <th className="text-left py-2 px-3 text-slate-400">Status</th>
                  <th className="text-right py-2 px-3 text-slate-400">Duration (ms)</th>
                  <th className="text-left py-2 px-3 text-slate-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((exec) => (
                  <tr key={exec._id} className="border-b border-slate-700 hover:bg-slate-700">
                    <td className="py-3 px-3 text-slate-300 font-mono text-xs">{exec.executionId}</td>
                    <td className="py-3 px-3 text-slate-300 text-xs">
                      {exec.workflowType === 'TEST_AUTOMATION' ? '🧪 Test' : '⚠️ CRITICAL'}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-mono text-xs">
                      {exec.testEmail || exec.incidentId || '-'}
                    </td>
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
          <p className="text-slate-400 text-center py-8">No executions yet.</p>
        )}
      </div>

      {/* Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">🧪 Test Automation</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>✓ Manually triggered test reports</li>
            <li>✓ Send to any Gmail or email address</li>
            <li>✓ Sample incident data included</li>
            <li>✓ Verifies n8n webhook is working</li>
            <li>✓ Confirms email delivery</li>
          </ul>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">⚠️ Automatic CRITICAL Automation</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>✓ Triggered when CRITICAL incident detected</li>
            <li>✓ Real incident data sent</li>
            <li>✓ Telemetry included</li>
            <li>✓ Recipient from AUTOMATION_EMAIL_TO</li>
            <li>✓ Non-blocking if n8n unavailable</li>
          </ul>
        </div>
      </div>

      {/* Test Modal */}
      <TestAutomationModal
        isOpen={testModalOpen}
        onClose={() => {
          setTestModalOpen(false);
          setTestError(null);
          setTestSuccess(false);
        }}
        onSubmit={handleTestAutomation}
        loading={testLoading}
        error={testError}
        success={testSuccess}
      />
    </div>
  );
}

export default Automation;
