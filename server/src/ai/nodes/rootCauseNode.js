// Root Cause Analysis Node
// Uses AI to reason about root causes

import GeminiService from '../../services/gemini.service.js';

export class RootCauseNode {
  // Analyze root cause using AI
  static async analyze(state) {
    const { telemetryHistory, anomalies, deterministic_root_cause, machine } = state;

    if (!telemetryHistory || anomalies.length === 0) {
      return {
        ...state,
        root_cause_analysis: {
          aiReasoning: 'Insufficient data for analysis',
          mostLikelyCause: deterministic_root_cause || 'Unknown',
          confidence: 0,
          evidence: [],
          source: 'deterministic',
        },
      };
    }

    // Try to get AI reasoning
    const aiAnalysis = await GeminiService.analyzeRootCause(
      telemetryHistory,
      anomalies,
      deterministic_root_cause || 'Unknown'
    );

    const rootCauseAnalysis = aiAnalysis || {
      aiReasoning: 'AI analysis unavailable',
      mostLikelyCause: deterministic_root_cause || 'Unknown',
      confidence: 70, // Use deterministic confidence
      evidence: [],
      source: 'deterministic',
    };

    return {
      ...state,
      root_cause_analysis: rootCauseAnalysis,
    };
  }
}

export default RootCauseNode;
