// n8n Service
// Business logic for n8n automation integration

import axios from 'axios';
import config from '../config/env.js';
import { AutomationExecution } from '../models/AutomationExecution.js';
import { Incident } from '../models/Incident.js';

export class N8nService {
  // Check if n8n is configured
  static isConfigured() {
    return !!config.n8nWebhookUrl && config.n8nWebhookUrl.trim() !== '';
  }

  // Send webhook to n8n for incident automation
  static async triggerIncidentWorkflow(incident, rootCause, recommendation, workOrder, telemetry) {
    if (!this.isConfigured()) {
      console.warn('n8n webhook not configured');
      return null;
    }

    try {
      // Check for duplicate execution (prevent duplicate triggers)
      const recentExecution = await AutomationExecution.findOne({
        incidentId: incident.incidentId,
        createdAt: {
          $gte: new Date(Date.now() - 60000), // Last 60 seconds
        },
      }).exec();

      if (recentExecution) {
        console.log(`Skipping duplicate automation for ${incident.incidentId}`);
        return recentExecution;
      }

      // Create execution record
      const executionId = `AE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const execution = new AutomationExecution({
        executionId,
        workflowName: 'ForgeFlow Incident Handler',
        incidentId: incident.incidentId,
        status: 'RUNNING',
      });

      await execution.save();

      // Prepare payload
      const payload = {
        incident: {
          id: incident.incidentId,
          machineId: incident.machineId,
          severity: incident.severity,
          riskScore: incident.riskScore,
          status: incident.status,
          createdAt: incident.createdAt,
        },
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
        telemetry: telemetry ? {
          temperature: telemetry.temperature,
          vibration: telemetry.vibration,
          pressure: telemetry.pressure,
          rpm: telemetry.rpm,
          powerConsumption: telemetry.powerConsumption,
          utilization: telemetry.utilization,
        } : null,
        timestamp: new Date().toISOString(),
      };

      // Send to n8n
      const startTime = Date.now();
      const response = await axios.post(config.n8nWebhookUrl, payload, {
        timeout: 10000, // 10 second timeout
      });

      const duration = Date.now() - startTime;

      // Update execution record
      execution.status = 'SUCCESS';
      execution.duration = duration;
      execution.result = {
        statusCode: response.status,
        message: 'Workflow triggered successfully',
      };
      await execution.save();

      console.log(`✓ n8n automation triggered for ${incident.incidentId} (${duration}ms)`);
      return execution;
    } catch (error) {
      console.error('✗ n8n automation error:', error.message);

      // Record failure
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
          };
          await failedExecution.save();
        }
      } catch (dbError) {
        console.error('Failed to record automation failure:', dbError.message);
      }

      // Don't throw - let incident creation proceed
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

      return {
        total,
        successful,
        failed,
        running,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      };
    } catch (error) {
      console.error('Error calculating statistics:', error.message);
      throw error;
    }
  }
}

export default N8nService;
