// Anomaly Detection Service
// Detects anomalies in machine telemetry based on thresholds

export class AnomalyService {
  // Define normal ranges for each metric
  static THRESHOLDS = {
    NORMAL: {
      temperature: { min: 50, max: 75 },
      vibration: { min: 0, max: 3 },
      pressure: { min: 40, max: 65 },
      rpm: { min: 1400, max: 1900 },
      powerConsumption: { min: 15, max: 45 },
      utilization: { min: 40, max: 90 },
    },
    WARNING: {
      temperature: { min: 75, max: 90 },
      vibration: { min: 3, max: 6 },
      pressure: { min: 65, max: 85 },
      rpm: { min: 1100, max: 1400 },
      powerConsumption: { min: 45, max: 70 },
      utilization: { min: 85, max: 100 },
    },
    CRITICAL: {
      temperature: { min: 90, max: 150 },
      vibration: { min: 6, max: 15 },
      pressure: { min: 85, max: 150 },
      rpm: { min: 0, max: 1100 },
      powerConsumption: { min: 70, max: 100 },
      utilization: { min: 95, max: 100 },
    },
  };

  // Analyze single telemetry reading
  static analyzeTelemetry(telemetry) {
    const anomalies = [];
    let severity = 'NORMAL';
    let riskScore = 0;

    // Check temperature
    if (telemetry.temperature > this.THRESHOLDS.CRITICAL.temperature.max) {
      anomalies.push('Temperature critically high (>90°C)');
      severity = 'CRITICAL';
      riskScore += 30;
    } else if (telemetry.temperature > this.THRESHOLDS.WARNING.temperature.min) {
      anomalies.push('Temperature elevated (>75°C)');
      if (severity === 'NORMAL') severity = 'HIGH';
      riskScore += 15;
    }

    // Check vibration
    if (telemetry.vibration > this.THRESHOLDS.CRITICAL.vibration.min) {
      anomalies.push('Vibration critical (>6 mm/s)');
      severity = 'CRITICAL';
      riskScore += 30;
    } else if (telemetry.vibration > this.THRESHOLDS.WARNING.vibration.min) {
      anomalies.push('Vibration elevated (>3 mm/s)');
      if (severity === 'NORMAL') severity = 'HIGH';
      riskScore += 15;
    }

    // Check pressure
    if (telemetry.pressure > this.THRESHOLDS.CRITICAL.pressure.min) {
      anomalies.push('Pressure critical (>85 PSI)');
      severity = 'CRITICAL';
      riskScore += 25;
    } else if (telemetry.pressure > this.THRESHOLDS.WARNING.pressure.min) {
      anomalies.push('Pressure elevated (>65 PSI)');
      if (severity === 'NORMAL') severity = 'MEDIUM';
      riskScore += 12;
    }

    // Check RPM
    if (telemetry.rpm < this.THRESHOLDS.CRITICAL.rpm.max) {
      anomalies.push('RPM critically low (<1100)');
      severity = 'CRITICAL';
      riskScore += 20;
    } else if (telemetry.rpm < this.THRESHOLDS.WARNING.rpm.max) {
      anomalies.push('RPM below normal (<1400)');
      if (severity === 'NORMAL') severity = 'MEDIUM';
      riskScore += 10;
    }

    // Check power consumption
    if (telemetry.powerConsumption > this.THRESHOLDS.CRITICAL.powerConsumption.min) {
      anomalies.push('Power consumption critical (>70 kW)');
      severity = 'CRITICAL';
      riskScore += 20;
    } else if (telemetry.powerConsumption > this.THRESHOLDS.WARNING.powerConsumption.min) {
      anomalies.push('Power consumption elevated (>45 kW)');
      if (severity === 'NORMAL') severity = 'MEDIUM';
      riskScore += 10;
    }

    // Check utilization
    if (telemetry.utilization > this.THRESHOLDS.WARNING.utilization.min) {
      anomalies.push('Utilization very high (>85%)');
      if (severity === 'NORMAL') severity = 'LOW';
      riskScore += 8;
    }

    // Constrain risk score
    riskScore = Math.min(100, Math.max(0, riskScore));

    return {
      severity,
      riskScore,
      anomalies,
      confidence: Math.min(100, 70 + Math.abs(riskScore - 50) * 0.3),
    };
  }

  // Detect anomalies from telemetry history
  static detectAnomaliesFromHistory(telemetryHistory) {
    if (!telemetryHistory || telemetryHistory.length === 0) {
      return { severity: 'NORMAL', riskScore: 0, anomalies: [] };
    }

    // Analyze latest reading
    const latest = telemetryHistory[telemetryHistory.length - 1];
    const analysis = this.analyzeTelemetry(latest);

    // Check for trends if we have history
    if (telemetryHistory.length > 3) {
      const trend = this.detectTrend(telemetryHistory);
      if (trend.isIncreasing && trend.metric) {
        analysis.anomalies.push(`${trend.metric} trending upward`);
        analysis.riskScore = Math.min(100, analysis.riskScore + 5);
      }
    }

    return analysis;
  }

  // Detect trends in telemetry
  static detectTrend(telemetryHistory) {
    if (telemetryHistory.length < 3) {
      return { isIncreasing: false, metric: null };
    }

    const recent = telemetryHistory.slice(-5);
    const metrics = ['temperature', 'vibration', 'pressure', 'powerConsumption'];

    for (const metric of metrics) {
      const values = recent.map((t) => t[metric]);
      const trend = values[values.length - 1] - values[0];

      if (Math.abs(trend) > 5) {
        return {
          isIncreasing: trend > 0,
          metric: metric,
          delta: Math.abs(trend),
        };
      }
    }

    return { isIncreasing: false, metric: null };
  }
}

export default AnomalyService;
