// Report Service
// Business logic for factory health reports and AI analysis

import { Machine } from '../models/Machine.js';
import { Incident } from '../models/Incident.js';
import { WorkOrder } from '../models/WorkOrder.js';
import { Telemetry } from '../models/Telemetry.js';
import TelemetryService from './telemetry.service.js';
import AnomalyService from './anomaly.service.js';
import GeminiService from './gemini.service.js';

export class ReportService {
  // Generate comprehensive factory health report
  static async generateFactoryHealthReport() {
    try {
      // Gather all factory data
      const machines = await Machine.find().exec();
      const incidents = await Incident.find().exec();
      const workOrders = await WorkOrder.find().exec();
      
      // Calculate metrics
      const machineHealth = this.calculateMachineHealth(machines, incidents);
      const incidentSummary = this.summarizeIncidents(incidents);
      const maintenancePriority = this.summarizeMaintenance(workOrders);
      const criticalMachines = machines.filter(m => m.status === 'CRITICAL');

      // Build base report
      const report = {
        timestamp: new Date().toISOString(),
        factoryStatus: {
          overallHealth: machineHealth.average,
          totalMachines: machines.length,
          healthyMachines: machineHealth.healthy,
          warningMachines: machineHealth.warning,
          criticalMachines: machineHealth.critical,
          offlineMachines: machineHealth.offline,
        },
        machineBreakdown: machines.map(m => ({
          id: m.machineId,
          name: m.name,
          type: m.type,
          status: m.status,
          healthScore: m.healthScore,
        })),
        incidents: incidentSummary,
        maintenance: maintenancePriority,
        criticalAlerts: criticalMachines.length > 0 ? [
          `${criticalMachines.length} critical machine(s) detected`,
          `${incidentSummary.critical} critical incident(s) open`,
          `Immediate attention required`,
        ] : [],
        recommendedActions: this.generateRecommendations(machineHealth, incidentSummary, maintenancePriority),
      };

      // Try to enhance with AI
      const aiAnalysis = await this.enhanceReportWithAI(report, machines, incidents);
      if (aiAnalysis) {
        report.aiAnalysis = aiAnalysis;
      }

      return report;
    } catch (error) {
      console.error('Error generating factory health report:', error.message);
      throw error;
    }
  }

  // Calculate machine health metrics
  static calculateMachineHealth(machines, incidents) {
    const metrics = {
      average: 0,
      healthy: 0,
      warning: 0,
      critical: 0,
      offline: 0,
    };

    if (machines.length === 0) {
      return metrics;
    }

    machines.forEach(m => {
      metrics.average += m.healthScore || 100;
      
      if (m.status === 'CRITICAL') metrics.critical++;
      else if (m.status === 'WARNING') metrics.warning++;
      else if (m.status === 'OFFLINE') metrics.offline++;
      else metrics.healthy++;
    });

    metrics.average = Math.round(metrics.average / machines.length);
    return metrics;
  }

  // Summarize incidents
  static summarizeIncidents(incidents) {
    const summary = {
      total: incidents.length,
      open: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      topIssues: [],
    };

    incidents.forEach(i => {
      if (i.status === 'OPEN') summary.open++;
      if (i.severity === 'CRITICAL') summary.critical++;
      else if (i.severity === 'HIGH') summary.high++;
      else if (i.severity === 'MEDIUM') summary.medium++;
      else if (i.severity === 'LOW') summary.low++;
    });

    // Get top 3 recent critical incidents
    summary.topIssues = incidents
      .filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(i => ({
        id: i.incidentId,
        machine: i.machineId,
        severity: i.severity,
        createdAt: i.createdAt,
      }));

    return summary;
  }

  // Summarize maintenance
  static summarizeMaintenance(workOrders) {
    const summary = {
      total: workOrders.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      byPriority: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      },
      estimatedDowntime: 0,
    };

    workOrders.forEach(wo => {
      if (wo.status === 'OPEN') summary.pending++;
      else if (wo.status === 'IN_PROGRESS') summary.inProgress++;
      else if (wo.status === 'COMPLETED') summary.completed++;

      summary.byPriority[wo.priority] = (summary.byPriority[wo.priority] || 0) + 1;
      summary.estimatedDowntime += wo.estimatedTime || 0;
    });

    return summary;
  }

  // Generate recommendations
  static generateRecommendations(machineHealth, incidents, maintenance) {
    const recommendations = [];

    // Critical recommendations
    if (machineHealth.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: `${machineHealth.critical} machine(s) in critical state - immediate intervention required`,
      });
    }

    if (incidents.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: `${incidents.critical} critical incident(s) - schedule emergency maintenance`,
      });
    }

    // High priority
    if (machineHealth.warning > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: `${machineHealth.warning} machine(s) with warnings - monitor closely`,
      });
    }

    if (maintenance.byPriority.HIGH > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: `${maintenance.byPriority.HIGH} high-priority maintenance tasks pending`,
      });
    }

    // Medium priority
    if (machineHealth.average < 75) {
      recommendations.push({
        priority: 'MEDIUM',
        action: `Factory health score ${machineHealth.average}% - consider preventive maintenance`,
      });
    }

    if (maintenance.estimatedDowntime > 20) {
      recommendations.push({
        priority: 'MEDIUM',
        action: `${maintenance.estimatedDowntime} hours estimated maintenance time needed`,
      });
    }

    return recommendations;
  }

  // Enhance report with AI analysis
  static async enhanceReportWithAI(report, machines, incidents) {
    if (!GeminiService.isAvailable()) {
      return null;
    }

    try {
      const prompt = `You are an industrial operations analyst. Generate an executive summary for this factory report:

Factory Status:
- Overall Health: ${report.factoryStatus.overallHealth}%
- Healthy: ${report.factoryStatus.healthyMachines}/${report.factoryStatus.totalMachines} machines
- Critical: ${report.factoryStatus.criticalMachines}
- Open Incidents: ${report.incidents.open}
- Critical Incidents: ${report.incidents.critical}
- Pending Maintenance: ${report.maintenance.pending}

Provide a JSON response with:
{
  "executiveSummary": "2-3 sentence overview of factory status",
  "riskAssessment": "Current risk level and rationale",
  "operationalInsights": ["insight1", "insight2", "insight3"],
  "urgentActions": ["action1", "action2"]
}

Keep it concise and actionable.`;

      const response = await GeminiService.generateContent(prompt);
      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            executiveSummary: analysis.executiveSummary,
            riskAssessment: analysis.riskAssessment,
            operationalInsights: analysis.operationalInsights,
            urgentActions: analysis.urgentActions,
            generatedAt: new Date().toISOString(),
          };
        }
      }
      return null;
    } catch (error) {
      console.warn('AI report enhancement failed:', error.message);
      return null;
    }
  }

  // Get report by ID (for future use)
  static async getReportById(reportId) {
    // Placeholder for future database storage
    return null;
  }

  // List recent reports (for future use)
  static async listReports(limit = 10) {
    // Placeholder for future database storage
    return [];
  }
}

export default ReportService;
