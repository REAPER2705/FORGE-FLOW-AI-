// Maintenance Recommendation Service
// Generates maintenance recommendations based on analysis

import { WorkOrder } from '../models/WorkOrder.js';
import crypto from 'crypto';

export class MaintenanceService {
  // Generate maintenance recommendation
  static generateRecommendation(incidentData, rootCause) {
    const anomalies = incidentData.anomalies || [];
    const riskScore = incidentData.riskScore || 0;

    let recommendation = {
      action: '',
      priority: 'MEDIUM',
      description: '',
      estimatedTime: 0, // hours
      requiredTools: [],
      steps: [],
    };

    // Analyze anomalies and assign recommendations
    for (const anomaly of anomalies) {
      if (anomaly.includes('Temperature')) {
        recommendation.requiredTools.push('Thermometer', 'Lubricant');
        recommendation.steps.push('Check bearing temperature');
        recommendation.steps.push('Inspect and replace lubricant if needed');
        recommendation.estimatedTime = Math.max(recommendation.estimatedTime, 2);
      }

      if (anomaly.includes('Vibration')) {
        recommendation.requiredTools.push('Vibration analyzer', 'Alignment tool');
        recommendation.steps.push('Check machine alignment');
        recommendation.steps.push('Inspect for worn bearings or gears');
        recommendation.steps.push('Perform dynamic balancing if needed');
        recommendation.estimatedTime = Math.max(recommendation.estimatedTime, 3);
      }

      if (anomaly.includes('Pressure')) {
        recommendation.requiredTools.push('Pressure gauge', 'Hydraulic fluid');
        recommendation.steps.push('Check hydraulic pressure');
        recommendation.steps.push('Inspect pressure relief valve');
        recommendation.steps.push('Flush and replace hydraulic fluid if needed');
        recommendation.estimatedTime = Math.max(recommendation.estimatedTime, 2.5);
      }

      if (anomaly.includes('RPM')) {
        recommendation.requiredTools.push('Tachometer', 'Motor analyzer');
        recommendation.steps.push('Test motor performance');
        recommendation.steps.push('Check for mechanical blockage');
        recommendation.steps.push('Inspect electrical connections');
        recommendation.estimatedTime = Math.max(recommendation.estimatedTime, 2);
      }

      if (anomaly.includes('Power')) {
        recommendation.requiredTools.push('Power meter', 'Electrical tester');
        recommendation.steps.push('Measure actual power consumption');
        recommendation.steps.push('Check for electrical faults');
        recommendation.steps.push('Inspect motor winding insulation');
        recommendation.estimatedTime = Math.max(recommendation.estimatedTime, 2);
      }
    }

    // Set priority based on risk score
    if (riskScore > 80) {
      recommendation.priority = 'CRITICAL';
      recommendation.action = 'STOP machine and perform immediate inspection';
    } else if (riskScore > 60) {
      recommendation.priority = 'HIGH';
      recommendation.action = 'Schedule urgent maintenance within 24 hours';
    } else if (riskScore > 40) {
      recommendation.priority = 'MEDIUM';
      recommendation.action = 'Schedule maintenance within one week';
    } else {
      recommendation.priority = 'LOW';
      recommendation.action = 'Continue monitoring, schedule routine maintenance';
    }

    // Add root cause specific actions
    if (rootCause && rootCause.probableCause) {
      if (rootCause.probableCause.includes('bearing')) {
        recommendation.steps.unshift('Inspect bearing assembly for wear');
        recommendation.action = `${recommendation.action} - Focus on bearing inspection`;
      }
      if (rootCause.probableCause.includes('alignment')) {
        recommendation.steps.unshift('Check machine alignment using laser alignment tool');
        recommendation.action = `${recommendation.action} - Realignment may be needed`;
      }
      if (rootCause.probableCause.includes('Motor failure')) {
        recommendation.priority = 'CRITICAL';
        recommendation.action = 'STOP immediately - Do not operate';
      }
    }

    // Remove duplicates
    recommendation.requiredTools = [...new Set(recommendation.requiredTools)];
    recommendation.steps = [...new Set(recommendation.steps)];

    recommendation.description = `Priority: ${recommendation.priority}\n${recommendation.action}\n\nEstimated Time: ${recommendation.estimatedTime} hours\n\nRequired Tools: ${recommendation.requiredTools.join(', ')}\n\nSteps:\n${recommendation.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;

    return recommendation;
  }

  // Create work order from recommendation
  static async createWorkOrder(incidentId, machineId, recommendation) {
    try {
      const workOrderId = `WO-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      const workOrder = new WorkOrder({
        workOrderId,
        incidentId,
        machineId,
        title: `Maintenance: ${recommendation.action}`,
        description: recommendation.description,
        priority: recommendation.priority,
        status: 'OPEN',
      });

      return await workOrder.save();
    } catch (error) {
      console.error('Error creating work order:', error.message);
      throw error;
    }
  }

  // Get maintenance history for machine
  static async getMaintenanceHistory(machineId, limit = 20) {
    try {
      const workOrders = await WorkOrder.find({ machineId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
      return workOrders;
    } catch (error) {
      console.error('Error getting maintenance history:', error.message);
      throw error;
    }
  }

  // Get pending maintenance work orders
  static async getPendingMaintenance() {
    try {
      const workOrders = await WorkOrder.find({
        status: { $in: ['OPEN', 'IN_PROGRESS'] },
      })
        .sort({ priority: 1, createdAt: -1 })
        .exec();
      return workOrders;
    } catch (error) {
      console.error('Error getting pending maintenance:', error.message);
      throw error;
    }
  }

  // Update work order status
  static async updateWorkOrderStatus(workOrderId, status) {
    try {
      const workOrder = await WorkOrder.findOneAndUpdate(
        { workOrderId },
        { status },
        { new: true }
      ).exec();
      return workOrder;
    } catch (error) {
      console.error('Error updating work order:', error.message);
      throw error;
    }
  }
}

export default MaintenanceService;
