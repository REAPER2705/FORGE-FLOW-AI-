// Final Insight Node
// Generates executive summary and final AI insight

import GeminiService from '../../services/gemini.service.js';

export class InsightNode {
  // Generate final AI insight
  static async analyze(state) {
    const { machine, anomaly_analysis, root_cause_analysis, maintenance_recommendation, incident } = state;

    if (!machine || !anomaly_analysis) {
      return {
        ...state,
        final_insight: {
          summary: 'Analysis complete',
          recommendations: [],
          confidence: 0,
          source: 'deterministic',
        },
      };
    }

    // Try to get AI summary
    const aiSummary = await GeminiService.generateIncidentSummary(
      machine,
      anomaly_analysis.anomalies || [],
      root_cause_analysis?.mostLikelyCause || 'Unknown',
      incident || { severity: anomaly_analysis.severity }
    );

    const finalInsight = {
      summary: aiSummary?.executiveSummary || 'Machine anomaly detected',
      technicalDetails: aiSummary?.technicalSummary || 'See detailed analysis',
      impact: aiSummary?.impact || 'Monitor closely',
      urgency: aiSummary?.urgency || anomaly_analysis.severity,
      recommendations: maintenance_recommendation?.steps || [],
      confidence: root_cause_analysis?.confidence || 70,
      source: aiSummary ? 'hybrid' : 'deterministic',
      timestamp: new Date().toISOString(),
    };

    return {
      ...state,
      final_insight: finalInsight,
    };
  }
}

export default InsightNode;
