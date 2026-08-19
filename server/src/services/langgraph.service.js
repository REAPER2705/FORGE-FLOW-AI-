// LangGraph Workflow Service
// Orchestrates the AI analysis pipeline using node-based workflow

import TelemetryNode from '../ai/nodes/telemetryNode.js';
import RootCauseNode from '../ai/nodes/rootCauseNode.js';
import MaintenanceNode from '../ai/nodes/maintenanceNode.js';
import SafetyNode from '../ai/nodes/safetyNode.js';
import InsightNode from '../ai/nodes/insightNode.js';

export class LangGraphService {
  // Execute the complete AI analysis workflow
  static async executeAnalysisWorkflow(state) {
    try {
      console.log('\n🤖 Executing AI analysis workflow...');

      // Step 1: Telemetry Analysis Node
      console.log('  → Telemetry Analysis Node');
      const telemetryAnalysis = TelemetryNode.analyze(state.telemetryHistory);
      state.telemetry_analysis = telemetryAnalysis;

      // Step 2: Root Cause Analysis Node (async - can call AI)
      console.log('  → Root Cause Analysis Node');
      state = await RootCauseNode.analyze(state);

      // Step 3: Maintenance Recommendation Node (async - can call AI)
      console.log('  → Maintenance Recommendation Node');
      state = await MaintenanceNode.analyze(state);

      // Step 4: Safety Validation Node (deterministic - CRITICAL)
      console.log('  → Safety Validation Node');
      state = SafetyNode.validate(state);

      // Step 5: Final Insight Node (async - can call AI)
      console.log('  → Final Insight Node');
      state = await InsightNode.analyze(state);

      console.log('✓ Workflow complete');
      return state;
    } catch (error) {
      console.error('✗ Workflow error:', error.message);
      throw error;
    }
  }

  // Build state object from analysis data
  static buildState(machine, telemetryHistory, anomalyAnalysis, rootCauseAnalysis, recommendation) {
    return {
      machine,
      telemetryHistory,
      anomaly_analysis: anomalyAnalysis,
      deterministic_root_cause: rootCauseAnalysis?.probableCause,
      anomalies: anomalyAnalysis?.anomalies || [],
      recommendation,
      // Will be populated by nodes:
      telemetry_analysis: null,
      root_cause_analysis: null,
      maintenance_recommendation: null,
      safety_validated: false,
      final_insight: null,
    };
  }

  // Extract workflow output in standard format
  static extractOutput(state) {
    return {
      machine: state.machine,
      analysis: {
        severity: state.anomaly_analysis?.severity,
        riskScore: state.anomaly_analysis?.riskScore,
        anomalies: state.anomaly_analysis?.anomalies,
      },
      telemetryAnalysis: state.telemetry_analysis,
      rootCause: {
        mostLikelyCause: state.root_cause_analysis?.mostLikelyCause,
        confidence: state.root_cause_analysis?.confidence,
        reasoning: state.root_cause_analysis?.aiReasoning,
        evidence: state.root_cause_analysis?.evidence,
        source: state.root_cause_analysis?.source,
      },
      maintenance: {
        action: state.maintenance_recommendation?.action,
        priority: state.maintenance_recommendation?.priority,
        steps: state.maintenance_recommendation?.steps,
        narrative: state.maintenance_recommendation?.narrative,
        source: state.maintenance_recommendation?.source,
      },
      insight: state.final_insight,
      safetyNotes: state.root_cause_analysis?.safetyNotes,
    };
  }
}

export default LangGraphService;
