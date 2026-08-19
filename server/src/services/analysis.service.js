// Analysis Orchestration Service
// Orchestrates the complete workflow: Telemetry → Anomaly → Risk → Incident → Root Cause → Maintenance

import TelemetryService from './telemetry.service.js';
import AnomalyService from './anomaly.service.js';
import IncidentService from './incident.service.js';
import RootCauseService from './rootCause.service.js';
import MaintenanceService from './maintenance.service.js';
import LangGraphService from './langgraph.service.js';
import { Machine } from '../models/Machine.js';

export class AnalysisService {
  // Main orchestration method: Complete analysis workflow
  static async analyzeAndRecommend(machineId) {
    try {
      console.log(`\n📊 Starting analysis for ${machineId}...`);

      // Step 1: Get machine
      const machine = await Machine.findOne({ machineId }).exec();
      if (!machine) {
        throw new Error(`Machine ${machineId} not found`);
      }

      console.log(`  1. Machine found: ${machine.name}`);

      // Step 2: Get latest telemetry
      const latestTelemetry = await TelemetryService.getLatestTelemetry(machineId);
      if (!latestTelemetry) {
        console.log(`  ⚠ No telemetry available for ${machineId}`);
        return null;
      }

      console.log(`  2. Latest telemetry collected: temp=${latestTelemetry.temperature}°C`);

      // Step 3: Get telemetry history
      const telemetryHistory = await TelemetryService.getTelemetryHistory(machineId, 50);
      console.log(`  3. History retrieved: ${telemetryHistory.length} readings`);

      // Step 4: Detect anomalies
      const anomalyAnalysis = AnomalyService.detectAnomaliesFromHistory(telemetryHistory);
      console.log(`  4. Anomalies detected: severity=${anomalyAnalysis.severity}, risk=${anomalyAnalysis.riskScore}`);

      // Only create incident if there are significant anomalies
      if (anomalyAnalysis.severity !== 'NORMAL') {
        // Check for recent incident to avoid duplicates
        const hasRecent = await IncidentService.hasRecentIncident(machineId, 10);
        if (!hasRecent) {
          // Step 5: Create incident
          const incident = await IncidentService.createIncident(
            machineId,
            anomalyAnalysis,
            latestTelemetry
          );
          console.log(`  5. Incident created: ${incident.incidentId}`);

          // Step 6: Analyze root cause
          const rootCauseAnalysis = RootCauseService.analyzeRootCause(
            telemetryHistory,
            anomalyAnalysis.anomalies
          );
          console.log(`  6. Root cause analysis: ${rootCauseAnalysis.probableCause}`);

          // Step 7: Update incident with root cause analysis
          await IncidentService.updateIncidentAnalysis(incident.incidentId, {
            anomalies: anomalyAnalysis.anomalies,
            confidence: anomalyAnalysis.confidence,
            rootCause: rootCauseAnalysis.probableCause,
            rootCauseConfidence: rootCauseAnalysis.confidence,
            evidence: rootCauseAnalysis.evidence,
          });

          // Step 8: Generate maintenance recommendation
          const recommendation = MaintenanceService.generateRecommendation(
            anomalyAnalysis,
            rootCauseAnalysis
          );
          console.log(`  7. Recommendation generated: ${recommendation.priority}`);

          // Step 8b: Execute AI workflow (LangGraph) for enhanced analysis
          // This is supplementary to Phase 3 deterministic analysis
          let aiWorkflowResult = null;
          try {
            const workflowState = LangGraphService.buildState(
              machine,
              telemetryHistory,
              anomalyAnalysis,
              rootCauseAnalysis,
              recommendation
            );
            const completedState = await LangGraphService.executeAnalysisWorkflow(workflowState);
            aiWorkflowResult = LangGraphService.extractOutput(completedState);
            console.log(`  7b. AI workflow completed successfully`);
          } catch (error) {
            console.warn('⚠️  AI workflow error (non-blocking):', error.message);
          }

          // Step 9: Create work order
          const workOrder = await MaintenanceService.createWorkOrder(
            incident.incidentId,
            machineId,
            recommendation
          );
          console.log(`  8. Work order created: ${workOrder.workOrderId}`);

          return {
            incident,
            rootCause: rootCauseAnalysis,
            recommendation,
            workOrder,
            analysis: {
              anomalies: anomalyAnalysis,
              severity: anomalyAnalysis.severity,
              riskScore: anomalyAnalysis.riskScore,
            },
            aiAnalysis: aiWorkflowResult,
          };
        } else {
          console.log(`  ⚠ Recent incident already exists, skipping duplicate`);
          return null;
        }
      } else {
        console.log(`  ✓ Machine operating normally`);
        return null;
      }
    } catch (error) {
      console.error(`✗ Error analyzing ${machineId}:`, error.message);
      throw error;
    }
  }

  // Analyze all machines
  static async analyzeAllMachines() {
    try {
      console.log('\n🔍 Starting factory-wide analysis...');

      const machines = await Machine.find().exec();
      const results = [];

      for (const machine of machines) {
        const result = await this.analyzeAndRecommend(machine.machineId);
        if (result) {
          results.push(result);
        }
      }

      console.log(`\n✓ Analysis complete. ${results.length} incidents identified`);
      return results;
    } catch (error) {
      console.error('Error analyzing all machines:', error.message);
      throw error;
    }
  }

  // Get comprehensive dashboard summary
  static async getDashboardSummary() {
    try {
      const machines = await Machine.find().exec();
      const incidentStats = await IncidentService.getIncidentStats();
      const pendingMaintenance = await MaintenanceService.getPendingMaintenance();

      const summary = {
        totalMachines: machines.length,
        machineStatus: {
          normal: machines.filter((m) => m.status === 'NORMAL').length,
          warning: machines.filter((m) => m.status === 'WARNING').length,
          critical: machines.filter((m) => m.status === 'CRITICAL').length,
          offline: machines.filter((m) => m.status === 'OFFLINE').length,
        },
        incidents: {
          total: incidentStats.total,
          open: incidentStats.open,
          critical: incidentStats.critical,
        },
        maintenance: {
          pending: pendingMaintenance.length,
          byPriority: {
            CRITICAL: pendingMaintenance.filter((wo) => wo.priority === 'CRITICAL').length,
            HIGH: pendingMaintenance.filter((wo) => wo.priority === 'HIGH').length,
            MEDIUM: pendingMaintenance.filter((wo) => wo.priority === 'MEDIUM').length,
            LOW: pendingMaintenance.filter((wo) => wo.priority === 'LOW').length,
          },
        },
        averageHealth: machines.length > 0 
          ? Math.round(machines.reduce((sum, m) => sum + m.healthScore, 0) / machines.length)
          : 100,
      };

      return summary;
    } catch (error) {
      console.error('Error getting dashboard summary:', error.message);
      throw error;
    }
  }
}

export default AnalysisService;
