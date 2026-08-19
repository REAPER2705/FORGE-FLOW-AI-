// Maintenance Recommendation Node
// Generates maintenance instructions with AI enhancement

import GeminiService from '../../services/gemini.service.js';

export class MaintenanceNode {
  // Generate maintenance recommendations
  static async analyze(state) {
    const { root_cause_analysis, anomalies, recommendation, machine } = state;

    if (!recommendation) {
      return {
        ...state,
        maintenance_recommendation: {
          action: 'MONITOR',
          priority: 'LOW',
          steps: ['Continue normal operation', 'Monitor machine status'],
          narrative: null,
          source: 'deterministic',
        },
      };
    }

    // Try to get AI-enhanced narrative
    const aiNarrative = await GeminiService.generateMaintenanceNarrative(
      anomalies,
      root_cause_analysis.mostLikelyCause || 'Unknown',
      recommendation.steps || [],
      recommendation.priority
    );

    const maintenanceRec = {
      action: recommendation.action || 'SCHEDULE',
      priority: recommendation.priority || 'MEDIUM',
      steps: recommendation.steps || [],
      estimatedTime: recommendation.estimatedTime || '2-4 hours',
      requiredTools: recommendation.requiredTools || [],
      narrative: aiNarrative || null,
      source: aiNarrative ? 'hybrid' : 'deterministic',
    };

    return {
      ...state,
      maintenance_recommendation: maintenanceRec,
    };
  }
}

export default MaintenanceNode;
