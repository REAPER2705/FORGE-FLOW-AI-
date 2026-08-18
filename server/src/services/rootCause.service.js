// Root Cause Analysis Service
// Analyzes telemetry patterns to determine root causes

export class RootCauseService {
  // Analyze telemetry history to find root cause
  static analyzeRootCause(telemetryHistory, anomalies) {
    if (!telemetryHistory || telemetryHistory.length === 0) {
      return {
        probableCause: 'Insufficient data',
        confidence: 0,
        evidence: [],
      };
    }

    const analysis = {
      probableCause: '',
      confidence: 0,
      evidence: [],
    };

    // Check for high temperature trend
    if (anomalies.includes('Temperature critically high (>90°C)')) {
      const tempTrend = this.analyzeTrend(telemetryHistory, 'temperature');
      if (tempTrend.trend > 5) {
        analysis.probableCause = 'Bearing degradation or lubrication failure';
        analysis.confidence = 85;
        analysis.evidence.push('Temperature increasing over time');
        analysis.evidence.push(`Current temp: ${telemetryHistory[telemetryHistory.length - 1].temperature}°C`);
      }
    }

    // Check for high vibration
    if (anomalies.includes('Vibration critical (>6 mm/s)')) {
      const vibTrend = this.analyzeTrend(telemetryHistory, 'vibration');
      if (vibTrend.trend > 2) {
        analysis.probableCause = 'Misalignment or worn components';
        analysis.confidence = 80;
        analysis.evidence.push('Vibration increasing steadily');
        analysis.evidence.push(`Current vibration: ${telemetryHistory[telemetryHistory.length - 1].vibration} mm/s`);
      }
    }

    // Check for low RPM
    if (anomalies.includes('RPM critically low (<1100)')) {
      analysis.probableCause = 'Motor failure or load jam';
      analysis.confidence = 75;
      analysis.evidence.push(`Current RPM: ${telemetryHistory[telemetryHistory.length - 1].rpm}`);
      analysis.evidence.push('Unable to reach normal operating speed');
    }

    // Check for high pressure
    if (anomalies.includes('Pressure critical (>85 PSI)')) {
      analysis.probableCause = 'Hydraulic blockage or overpressure condition';
      analysis.confidence = 70;
      analysis.evidence.push(`Current pressure: ${telemetryHistory[telemetryHistory.length - 1].pressure} PSI`);
    }

    // Check for power consumption spike
    if (anomalies.includes('Power consumption critical (>70 kW)')) {
      analysis.probableCause = 'Electrical fault or increased mechanical resistance';
      analysis.confidence = 65;
      analysis.evidence.push(`Power consumption: ${telemetryHistory[telemetryHistory.length - 1].powerConsumption} kW`);
    }

    // Default if no specific cause found
    if (!analysis.probableCause) {
      analysis.probableCause = 'Multiple anomalies detected - requires further investigation';
      analysis.confidence = 50;
      analysis.evidence = anomalies;
    }

    return analysis;
  }

  // Analyze trend for specific metric
  static analyzeTrend(telemetryHistory, metric) {
    if (telemetryHistory.length < 3) {
      return { trend: 0, direction: 'stable' };
    }

    const recent = telemetryHistory.slice(-10);
    const values = recent.map((t) => t[metric]);

    // Calculate simple linear trend
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const trend = lastValue - firstValue;

    // Calculate average change per reading
    let totalChange = 0;
    for (let i = 1; i < values.length; i++) {
      totalChange += values[i] - values[i - 1];
    }
    const avgChange = totalChange / (values.length - 1);

    return {
      trend: trend,
      avgChange: avgChange,
      direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      firstValue,
      lastValue,
    };
  }

  // Combine evidence for severity assessment
  static assessSeverity(analysis, riskScore) {
    if (riskScore > 80) {
      return 'CRITICAL - Immediate action required';
    } else if (riskScore > 60) {
      return 'HIGH - Schedule maintenance soon';
    } else if (riskScore > 40) {
      return 'MEDIUM - Monitor and plan maintenance';
    } else {
      return 'LOW - Continue monitoring';
    }
  }
}

export default RootCauseService;
