// Reports Page
// Generate and view operational reports with AI analysis

import { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertCircle, CheckCircle, TrendingDown, Loader } from 'lucide-react';
import reportsAPI from '../api/reports';

function MetricCard({ label, value, color = 'cyan', icon: Icon }) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
        {Icon && <Icon size={18} className={colorClasses[color]} />}
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  // Load report on mount
  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsAPI.generateHealthReport();
      if (response.success) {
        setReport(response.data);
        setLastGenerated(new Date().toLocaleTimeString());
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      setError('Error generating report: ' + err.message);
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };

  const handleDownload = () => {
    if (!report) return;
    // Future: Implement PDF download
    alert('PDF download will be available in Phase 7');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Reports</h1>
          <p className="text-slate-400">Factory Health Reports & Analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !report}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-100 font-semibold">Error</p>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader size={32} className="text-cyan-400 animate-spin" />
            <p className="text-slate-300">Generating report...</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      {report && !loading && (
        <>
          {/* Last Generated */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Last generated: {lastGenerated}</span>
            <span className="text-xs text-slate-500">{report.timestamp}</span>
          </div>

          {/* Critical Alerts */}
          {report.criticalAlerts && report.criticalAlerts.length > 0 && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-100 mb-2">Critical Alerts</h3>
                  <ul className="space-y-1">
                    {report.criticalAlerts.map((alert, idx) => (
                      <li key={idx} className="text-sm text-red-200">• {alert}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {report.aiAnalysis && (
            <div className="bg-gradient-to-r from-purple-900 to-slate-800 rounded-lg p-6 border border-purple-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-purple-300">AI Executive Summary</h2>
              </div>
              <p className="text-slate-100 mb-4">{report.aiAnalysis.executiveSummary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Risk Assessment</p>
                  <p className="text-sm text-slate-200">{report.aiAnalysis.riskAssessment}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Operational Insights</p>
                  <ul className="space-y-1">
                    {report.aiAnalysis.operationalInsights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-slate-200">• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Factory Status Overview */}
          <SectionCard title="Factory Status Overview">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                label="Overall Health"
                value={`${report.factoryStatus.overallHealth}%`}
                color={report.factoryStatus.overallHealth >= 80 ? 'green' : 
                       report.factoryStatus.overallHealth >= 50 ? 'yellow' : 'red'}
              />
              <MetricCard label="Total Machines" value={report.factoryStatus.totalMachines} color="cyan" />
              <MetricCard label="Healthy" value={report.factoryStatus.healthyMachines} color="green" icon={CheckCircle} />
              <MetricCard label="Warnings" value={report.factoryStatus.warningMachines} color="yellow" />
              <MetricCard label="Critical" value={report.factoryStatus.criticalMachines} color="red" icon={AlertCircle} />
            </div>
          </SectionCard>

          {/* Incident Summary */}
          <SectionCard title="Incident Summary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Total</p>
                <p className="text-xl font-bold text-cyan-400">{report.incidents.total}</p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Open</p>
                <p className="text-xl font-bold text-orange-400">{report.incidents.open}</p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Critical</p>
                <p className="text-xl font-bold text-red-400">{report.incidents.critical}</p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">High Priority</p>
                <p className="text-xl font-bold text-yellow-400">{report.incidents.high}</p>
              </div>
            </div>

            {report.incidents.topIssues && report.incidents.topIssues.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400 mb-3">Top Issues</p>
                <ul className="space-y-2">
                  {report.incidents.topIssues.map((issue, idx) => (
                    <li key={idx} className="bg-slate-700 rounded p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-200">{issue.id}</span>
                        <span className={issue.severity === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Machine: {issue.machine}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>

          {/* Maintenance Status */}
          <SectionCard title="Maintenance Status">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Pending</p>
                <p className="text-xl font-bold text-cyan-400">{report.maintenance.pending}</p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">In Progress</p>
                <p className="text-xl font-bold text-yellow-400">{report.maintenance.inProgress}</p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Completed</p>
                <p className="text-xl font-bold text-green-400">{report.maintenance.completed}</p>
              </div>
              <div className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Est. Downtime</p>
                <p className="text-xl font-bold text-orange-400">{report.maintenance.estimatedDowntime}h</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-3">Priority Breakdown</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-slate-700 rounded">
                <p className="text-xs text-slate-400 mb-1">CRITICAL</p>
                <p className="text-lg font-bold text-red-400">{report.maintenance.byPriority.CRITICAL}</p>
              </div>
              <div className="text-center p-2 bg-slate-700 rounded">
                <p className="text-xs text-slate-400 mb-1">HIGH</p>
                <p className="text-lg font-bold text-orange-400">{report.maintenance.byPriority.HIGH}</p>
              </div>
              <div className="text-center p-2 bg-slate-700 rounded">
                <p className="text-xs text-slate-400 mb-1">MEDIUM</p>
                <p className="text-lg font-bold text-yellow-400">{report.maintenance.byPriority.MEDIUM}</p>
              </div>
              <div className="text-center p-2 bg-slate-700 rounded">
                <p className="text-xs text-slate-400 mb-1">LOW</p>
                <p className="text-lg font-bold text-green-400">{report.maintenance.byPriority.LOW}</p>
              </div>
            </div>
          </SectionCard>

          {/* Recommended Actions */}
          {report.recommendedActions && report.recommendedActions.length > 0 && (
            <SectionCard title="Recommended Actions">
              <div className="space-y-3">
                {report.recommendedActions.map((rec, idx) => {
                  const priorityColor = 
                    rec.priority === 'CRITICAL' ? 'bg-red-900 border-red-700 text-red-100' :
                    rec.priority === 'HIGH' ? 'bg-orange-900 border-orange-700 text-orange-100' :
                    'bg-yellow-900 border-yellow-700 text-yellow-100';
                  
                  return (
                    <div key={idx} className={`border rounded-lg p-3 ${priorityColor}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold flex-1">{rec.action}</p>
                        <span className="text-xs font-bold whitespace-nowrap ml-2">{rec.priority}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Machine Breakdown */}
          <SectionCard title="Machine Breakdown">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-2 text-slate-400">Machine</th>
                    <th className="text-left py-2 px-2 text-slate-400">Type</th>
                    <th className="text-left py-2 px-2 text-slate-400">Status</th>
                    <th className="text-right py-2 px-2 text-slate-400">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {report.machineBreakdown.map((machine, idx) => {
                    const statusColor = 
                      machine.status === 'CRITICAL' ? 'text-red-400' :
                      machine.status === 'WARNING' ? 'text-yellow-400' :
                      machine.status === 'OFFLINE' ? 'text-slate-500' :
                      'text-green-400';
                    
                    return (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                        <td className="py-2 px-2 text-slate-200">{machine.name}</td>
                        <td className="py-2 px-2 text-slate-400">{machine.type}</td>
                        <td className={`py-2 px-2 font-semibold ${statusColor}`}>{machine.status}</td>
                        <td className="py-2 px-2 text-right text-slate-200">{machine.healthScore}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Report Info */}
          <div className="text-xs text-slate-500 text-center">
            Report generated at {new Date(report.timestamp).toLocaleString()} • 
            <span className="ml-1">Phase 5 AI-Powered Reports</span>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !report && !error && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
          <p className="text-slate-400">No report generated yet. Click Refresh to generate a factory health report.</p>
        </div>
      )}
    </div>
  );
}

export default Reports;
