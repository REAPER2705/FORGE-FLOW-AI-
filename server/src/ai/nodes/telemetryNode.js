// Telemetry Analysis Node
// Analyzes telemetry patterns and trends

export class TelemetryNode {
  // Analyze telemetry for trends and patterns
  static analyze(telemetryHistory) {
    if (!telemetryHistory || telemetryHistory.length < 3) {
      return {
        trendRate: 0,
        acceleration: 0,
        predictedFailureTime: null,
        dominantMetric: null,
      };
    }

    const recent = telemetryHistory.slice(-10);
    const metrics = ['temperature', 'vibration', 'pressure', 'powerConsumption'];

    let dominantMetric = null;
    let maxDelta = 0;

    for (const metric of metrics) {
      const values = recent.map((t) => t[metric]);
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const delta = lastValue - firstValue;

      if (Math.abs(delta) > Math.abs(maxDelta)) {
        maxDelta = delta;
        dominantMetric = metric;
      }
    }

    // Calculate acceleration (rate of change over rate)
    const midpoint = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, midpoint).map((t) => t[dominantMetric] || 0);
    const secondHalf = recent.slice(midpoint).map((t) => t[dominantMetric] || 0);

    const firstRate = (firstHalf[firstHalf.length - 1] - firstHalf[0]) / firstHalf.length;
    const secondRate = (secondHalf[secondHalf.length - 1] - secondHalf[0]) / secondHalf.length;
    const acceleration = secondRate - firstRate;

    // Predict failure time (rough estimate)
    let predictedFailureTime = null;
    if (acceleration > 0.1 && dominantMetric === 'temperature') {
      // Extrapolate based on trend
      const minutesToCritical = (100 - recent[recent.length - 1][dominantMetric]) / (acceleration || 0.1);
      predictedFailureTime = Math.round(Math.max(minutesToCritical, 5)); // At least 5 minutes
    }

    return {
      trendRate: Math.round(maxDelta * 100) / 100,
      acceleration: Math.round(acceleration * 1000) / 1000,
      predictedFailureTime,
      dominantMetric,
      metricsSnapshot: {
        temperature: recent[recent.length - 1].temperature,
        vibration: recent[recent.length - 1].vibration,
        pressure: recent[recent.length - 1].pressure,
        powerConsumption: recent[recent.length - 1].powerConsumption,
      },
    };
  }
}

export default TelemetryNode;
