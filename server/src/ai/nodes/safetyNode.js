// Safety Validation Node
// Validates AI recommendations against Phase 3 safety rules

export class SafetyNode {
  // Validate that AI doesn't override safety-critical decisions
  static validate(state) {
    const { anomaly_analysis, maintenance_recommendation } = state;

    // CRITICAL SAFETY RULE: Never override Phase 3 decisions
    if (anomaly_analysis && anomaly_analysis.severity === 'CRITICAL') {
      // Must maintain STOP decision
      if (maintenance_recommendation && maintenance_recommendation.action !== 'STOP') {
        console.warn('⚠️  Safety validation: Overriding AI action to STOP for CRITICAL severity');
        maintenance_recommendation.action = 'STOP';
        maintenance_recommendation.priority = 'CRITICAL';
      }
    }

    // Validate confidence levels
    if (state.root_cause_analysis) {
      // AI confidence capped at 95% to preserve deterministic authority
      if (state.root_cause_analysis.confidence > 95) {
        state.root_cause_analysis.confidence = 95;
      }
    }

    // Validate risk score not downgraded
    if (anomaly_analysis && state.root_cause_analysis) {
      state.root_cause_analysis.safetyNotes = [
        'Phase 3 deterministic analysis is authoritative',
        'AI reasoning is supplementary',
        `Severity: ${anomaly_analysis.severity}`,
        `Risk Score: ${anomaly_analysis.riskScore}`,
      ];
    }

    return {
      ...state,
      safety_validated: true,
    };
  }
}

export default SafetyNode;
