// n8n Service
// Business logic for n8n automation integration with separate test and production flows

import axios from 'axios';
import config from '../config/env.js';
import { AutomationExecution } from '../models/AutomationExecution.js';
import { Machine } from '../models/Machine.js';

export class N8nService {
  // Check if production n8n is configured
  static isConfigured() {
    return !!config.n8nWebhookUrl && config.n8nWebhookUrl.trim() !== '';
  }

  // Send test automation request to n8n
  static async sendTestAutomation(testEmail) {
    if (!config.n8nTestWebhookUrl || config.n8nTestWebhookUrl.trim() === '') {
      throw new Error('n8n test webhook not configured (N8N_TEST_WEBHOOK_URL)');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      throw new Error('Invalid email address');
    }

    try {
      const executionId = `AE-TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const execution = new AutomationExecution({
        executionId,
        workflowName: 'ForgeFlow Test Report',
        workflowType: 'TEST_AUTOMATION',
        testEmail,
        status: 'RUNNING',
      });

      await execution.save();

      // Prepare test payload with sample data
      const payload = {
        type: 'TEST_AUTOMATION',
        testEmail,
        incident: {
          id: 'TEST-INC-001',
          machineId: 'TEST-M-001',
          severity: 'CRITICAL',
          riskScore: 95,
          status: 'OPEN',
          title: '[TEST] Simulated Critical Incident',
          description: 'This is a test incident report to verify n8n automation is working correctly.',
          createdAt: new Date().toISOString(),
        },
        machine: {
          id: 'TEST-M-001',
          name: 'Test Machine Unit',
          type: 'TEST',
          zone: 'TEST_ZONE',
          status: 'CRITICAL',
          healthScore: 15,
        },
        telemetry: {
          temperature: 95.5,
          vibration: 7.8,
          pressure: 85.2,
          rpm: 1100,
          powerConsumption: 72.5,
          utilization: 98.0,
        },
        rootCause: {
          probableCause: 'Test anomaly: High temperature + Vibration',
          confidence: 85,
          evidence: ['Temperature trending upward', 'Unusual vibration detected'],
        },
        recommendation: {
          action: 'STOP',
          priority: 'CRITICAL',
          steps: [
            'Stop machine immediately',
            'Inspect bearings and alignment',
            'Check for mechanical blockage',
            'Verify electrical connections',
          ],
        },
        notification: {
          subject: '[TEST] ForgeFlow AI - Critical Incident Report',
          recipient: testEmail,
        },
        timestamp: new Date().toISOString(),
      };

      const startTime = Date.now();
      const response = await axios.post(config.n8nTestWebhookUrl, payload, {
        timeout: 30000,
      });

      const duration = Date.now() - startTime;

      execution.status = 'SUCCESS';
      execution.duration = duration;
      execution.result = {
        statusCode: response.status,
        message: 'Test report sent successfully',
        n8nResponse: response.data,
      };
      await execution.save();

      console.log(`✓ Test automation sent to ${testEmail} (${duration}ms)`);
      return execution;
    } catch (error) {
      console.error('✗ Test automation error:', error.message);

      try {
        const failedExecution = await AutomationExecution.findOne({
          testEmail,
          status: 'RUNNING',
        }).exec();

        if (failedExecution) {
          failedExecution.status = 'FAILED';
          failedExecution.result = {
            error: error.message,
            code: error.code,
          };
          await failedExecution.save();
        }
      } catch (dbError) {
        console.error('Failed to record test automation failure:', dbError.message);
      }

      throw error;
    }
  }

  // Send webhook to n8n for CRITICAL incident automation
  static async triggerIncidentWorkflow(incident, machine, rootCause, recommendation, workOrder, telemetry) {
    if (!this.isConfigured()) {
      console.warn('⚠ n8n webhook not configured (N8N_WEBHOOK_URL). Incident created but automation skipped.');
      return null;
    }

    try {
      // Check for duplicate execution (prevent duplicate triggers within 60 seconds)
      const recentExecution = await AutomationExecution.findOne({
        incidentId: incident.incidentId,
        workflowType: 'CRITICAL_INCIDENT',
        createdAt: {
          $gte: new Date(Date.now() - 60000),
        },
      }).exec();

      if (recentExecution) {
        console.log(`⚠ Skipping duplicate automation for ${incident.incidentId}`);
        return recentExecution;
      }

      const executionId = `AE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const execution = new AutomationExecution({
        executionId,
        workflowName: 'ForgeFlow Incident Handler',
        workflowType: 'CRITICAL_INCIDENT',
        incidentId: incident.incidentId,
        status: 'RUNNING',
      });

      await execution.save();

      // Prepare production payload
      const payload = {
        type: 'CRITICAL_INCIDENT',
        incident: {
          id: incident.incidentId,
          machineId: incident.machineId,
          severity: incident.severity,
          riskScore: incident.riskScore,
          status: incident.status,
          title: incident.title,
          description: incident.description,
          createdAt: incident.createdAt,
        },
        machine: {
          id: machine?.machineId || incident.machineId,
          name: machine?.name || 'Unknown',
          type: machine?.type || 'Unknown',
          zone: machine?.zone || 'Unknown',
          status: machine?.status || 'UNKNOWN',
          healthScore: machine?.healthScore || 0,
        },
        telemetry: telemetry ? {
          temperature: telemetry.temperature,
          vibration: telemetry.vibration,
          pressure: telemetry.pressure,
          rpm: telemetry.rpm,
          powerConsumption: telemetry.powerConsumption,
          utilization: telemetry.utilization,
          timestamp: telemetry.timestamp,
        } : null,
        rootCause: {
          probableCause: rootCause?.probableCause || 'Unknown',
          confidence: rootCause?.confidence || 0,
          evidence: rootCause?.evidence || [],
        },
        recommendation: {
          action: recommendation?.action || 'MONITOR',
          priority: recommendation?.priority || 'MEDIUM',
          steps: recommendation?.steps || [],
          estimatedTime: recommendation?.estimatedTime || 0,
        },
        workOrder: {
          id: workOrder?.workOrderId || null,
          status: workOrder?.status || null,
        },
        notification: {
          subject: `ForgeFlow AI - CRITICAL Incident on ${machine?.name || incident.machineId}`,
          recipient: config.automationEmailTo || 'ops@company.com',
        },
        timestamp: new Date().toISOString(),
      };

      const startTime = Date.now();
      const response = await axios.post(config.n8nWebhookUrl, payload, {
        timeout: 30000,
      });

      const duration = Date.now() - startTime;

      execution.status = 'SUCCESS';
      execution.duration = duration;
      execution.result = {
        statusCode: response.status,
        message: 'Workflow triggered successfully',
        n8nResponse: response.data,
      };
      await execution.save();

      console.log(`✓ n8n automation triggered for ${incident.incidentId} (${duration}ms)`);
      return execution;
    } catch (error) {
      console.error('✗ n8n automation error:', error.message);

      try {
        const failedExecution = await AutomationExecution.findOne({
          incidentId: incident.incidentId,
          status: 'RUNNING',
        }).exec();

        if (failedExecution) {
          failedExecution.status = 'FAILED';
          failedExecution.result = {
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString(),
          };
          await failedExecution.save();
        }
      } catch (dbError) {
        console.error('Failed to record automation failure:', dbError.message);
      }

      // Don't throw - incident creation must continue
      return null;
    }
  }

  // Get automation executions
  static async getExecutions(limit = 50) {
    try {
      const executions = await AutomationExecution.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();

      return executions;
    } catch (error) {
      console.error('Error fetching executions:', error.message);
      throw error;
    }
  }

  // Get execution by ID
  static async getExecutionById(executionId) {
    try {
      const execution = await AutomationExecution.findOne({ executionId }).exec();
      return execution;
    } catch (error) {
      console.error('Error fetching execution:', error.message);
      throw error;
    }
  }

  // Get executions for incident
  static async getIncidentExecutions(incidentId) {
    try {
      const executions = await AutomationExecution.find({ incidentId })
        .sort({ createdAt: -1 })
        .exec();

      return executions;
    } catch (error) {
      console.error('Error fetching incident executions:', error.message);
      throw error;
    }
  }

  // Get automation statistics
  static async getStatistics() {
    try {
      const total = await AutomationExecution.countDocuments();
      const successful = await AutomationExecution.countDocuments({ status: 'SUCCESS' });
      const failed = await AutomationExecution.countDocuments({ status: 'FAILED' });
      const running = await AutomationExecution.countDocuments({ status: 'RUNNING' });
      
      const testExecutions = await AutomationExecution.countDocuments({ workflowType: 'TEST_AUTOMATION' });
      const incidentExecutions = await AutomationExecution.countDocuments({ workflowType: 'CRITICAL_INCIDENT' });

      return {
        total,
        successful,
        failed,
        running,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
        testExecutions,
        incidentExecutions,
      };
    } catch (error) {
      console.error('Error calculating statistics:', error.message);
      throw error;
    }
  }
}

export default N8nService;
