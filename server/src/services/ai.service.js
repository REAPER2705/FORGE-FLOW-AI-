// AI Service
// High-level AI analysis interface for external routes/endpoints

import LangGraphService from './langgraph.service.js';
import GeminiService from './gemini.service.js';
import TelemetryService from './telemetry.service.js';
import AnomalyService from './anomaly.service.js';
import RootCauseService from './rootCause.service.js';
import MaintenanceService from './maintenance.service.js';
import { Machine } from '../models/Machine.js';

export class AIService {
  // Perform comprehensive AI analysis on an incident
  static async analyzeIncident(incidentId, incident) {
    try {
      if (!incident || !incident.machineId) {
        return {
          success: false,
          error: 'Invalid incident data',
        };
      }

      const machine = await Machine.findOne({ machineId: incident.machineId }).exec();
      if (!machine) {
        return {
          success: false,
          error: 'Machine not found',
        };
      }

      // Get telemetry history
      const telemetryHistory = await TelemetryService.getTelemetryHistory(incident.machineId, 50);
      if (!telemetryHistory || telemetryHistory.length === 0) {
        return {
          success: false,
          error: 'No telemetry data available',
        };
      }

      // Run deterministic analysis
      const anomalyAnalysis = AnomalyService.detectAnomaliesFromHistory(telemetryHistory);
      const rootCauseAnalysis = RootCauseService.analyzeRootCause(
        telemetryHistory,
        anomalyAnalysis.anomalies
      );
      const recommendation = MaintenanceService.generateRecommendation(
        anomalyAnalysis,
        rootCauseAnalysis
      );

      // Run AI workflow
      const workflowState = LangGraphService.buildState(
        machine,
        telemetryHistory,
        anomalyAnalysis,
        rootCauseAnalysis,
        recommendation
      );
      const completedState = await LangGraphService.executeAnalysisWorkflow(workflowState);
      const aiOutput = LangGraphService.extractOutput(completedState);

      return {
        success: true,
        incidentId,
        machine: {
          id: machine.machineId,
          name: machine.name,
          type: machine.type,
        },
        analysis: {
          deterministic: {
            severity: anomalyAnalysis.severity,
            riskScore: anomalyAnalysis.riskScore,
            anomalies: anomalyAnalysis.anomalies,
            confidence: anomalyAnalysis.confidence,
          },
          aiEnhanced: aiOutput,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('✗ Incident analysis error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Explain an AI decision
  static async explainDecision(incidentId) {
    try {
      // This would retrieve incident and provide explanation
      return {
        success: true,
        incidentId,
        explanation: 'AI analysis provides reasoning for maintenance decisions',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('✗ Explanation error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check AI service availability
  static getStatus() {
    return {
      geminiAvailable: GeminiService.isAvailable(),
      langgraphAvailable: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export default AIService;
