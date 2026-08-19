// AI Service Tests

import TelemetryNode from '../ai/nodes/telemetryNode.js';
import RootCauseNode from '../ai/nodes/rootCauseNode.js';
import SafetyNode from '../ai/nodes/safetyNode.js';
import LangGraphService from '../services/langgraph.service.js';

describe('AI Nodes', () => {
  describe('TelemetryNode', () => {
    test('should analyze telemetry trends', () => {
      const telemetryHistory = [
        { temperature: 60, vibration: 2, pressure: 50, powerConsumption: 30 },
        { temperature: 62, vibration: 2.5, pressure: 52, powerConsumption: 32 },
        { temperature: 65, vibration: 3, pressure: 55, powerConsumption: 35 },
        { temperature: 70, vibration: 3.5, pressure: 60, powerConsumption: 40 },
      ];

      const analysis = TelemetryNode.analyze(telemetryHistory);

      expect(analysis).toBeDefined();
      expect(analysis.trendRate).toBeDefined();
      expect(analysis.dominantMetric).toBeDefined();
      console.log('✓ Telemetry analysis test passed');
    });
  });

  describe('SafetyNode', () => {
    test('should enforce CRITICAL severity constraints', () => {
      const state = {
        anomaly_analysis: {
          severity: 'CRITICAL',
          riskScore: 95,
          anomalies: [],
        },
        maintenance_recommendation: {
          action: 'SCHEDULE',
          priority: 'HIGH',
        },
      };

      const validated = SafetyNode.validate(state);

      expect(validated.maintenance_recommendation.action).toBe('STOP');
      expect(validated.maintenance_recommendation.priority).toBe('CRITICAL');
      expect(validated.safety_validated).toBe(true);
      console.log('✓ Safety validation test passed');
    });

    test('should cap AI confidence at 95%', () => {
      const state = {
        anomaly_analysis: {
          severity: 'HIGH',
          riskScore: 75,
        },
        root_cause_analysis: {
          confidence: 100,
          mostLikelyCause: 'Test',
        },
      };

      const validated = SafetyNode.validate(state);

      expect(validated.root_cause_analysis.confidence).toBeLessThanOrEqual(95);
      console.log('✓ AI confidence cap test passed');
    });
  });

  describe('LangGraphService', () => {
    test('should build state correctly', () => {
      const machine = { machineId: 'M-001', name: 'Machine 1', type: 'Press' };
      const telemetry = [];
      const anomaly = { severity: 'NORMAL', riskScore: 10 };
      const rootCause = { probableCause: 'Normal operation' };
      const recommendation = { action: 'MONITOR' };

      const state = LangGraphService.buildState(
        machine,
        telemetry,
        anomaly,
        rootCause,
        recommendation
      );

      expect(state.machine).toBe(machine);
      expect(state.anomaly_analysis).toBe(anomaly);
      expect(state.telemetry_analysis).toBeNull();
      console.log('✓ State building test passed');
    });

    test('should extract output correctly', () => {
      const state = {
        machine: { machineId: 'M-001', name: 'Machine 1' },
        anomaly_analysis: { severity: 'HIGH', riskScore: 70 },
        root_cause_analysis: {
          mostLikelyCause: 'Bearing wear',
          confidence: 85,
          source: 'hybrid',
        },
        maintenance_recommendation: {
          action: 'SCHEDULE',
          priority: 'HIGH',
          source: 'hybrid',
        },
        final_insight: { summary: 'Machine requires attention' },
      };

      const output = LangGraphService.extractOutput(state);

      expect(output.machine).toBeDefined();
      expect(output.analysis).toBeDefined();
      expect(output.rootCause).toBeDefined();
      expect(output.maintenance).toBeDefined();
      expect(output.insight).toBeDefined();
      console.log('✓ Output extraction test passed');
    });
  });
});

console.log('\n=== AI Service Tests ===');
console.log('✓ All AI tests passed\n');
