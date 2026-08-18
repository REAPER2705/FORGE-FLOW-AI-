// Incident Service
// Manages incident creation, tracking, and analysis

import { Incident } from '../models/Incident.js';
import { Machine } from '../models/Machine.js';
import crypto from 'crypto';

export class IncidentService {
  // Create incident from analysis
  static async createIncident(machineId, analysis, telemetrySnapshot) {
    try {
      // Check if machine exists
      const machine = await Machine.findOne({ machineId }).exec();
      if (!machine) {
        throw new Error(`Machine ${machineId} not found`);
      }

      // Generate incident ID
      const incidentId = `INC-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Create incident
      const incident = new Incident({
        incidentId,
        machineId,
        severity: analysis.severity,
        status: 'OPEN',
        title: `${analysis.severity} - Machine ${machineId}`,
        description: `Anomalies detected: ${analysis.anomalies.join(', ')}`,
        telemetrySnapshot: telemetrySnapshot || {},
        aiAnalysis: {
          anomalies: analysis.anomalies,
          confidence: analysis.confidence,
        },
        riskScore: analysis.riskScore,
        recommendedAction: '',
      });

      return await incident.save();
    } catch (error) {
      console.error('Error creating incident:', error.message);
      throw error;
    }
  }

  // Get incident by ID
  static async getIncident(incidentId) {
    try {
      const incident = await Incident.findOne({ incidentId }).exec();
      return incident;
    } catch (error) {
      console.error('Error getting incident:', error.message);
      throw error;
    }
  }

  // Get all incidents for machine
  static async getIncidentsForMachine(machineId) {
    try {
      const incidents = await Incident.find({ machineId }).sort({ createdAt: -1 }).exec();
      return incidents;
    } catch (error) {
      console.error('Error getting machine incidents:', error.message);
      throw error;
    }
  }

  // Get all open incidents
  static async getOpenIncidents() {
    try {
      const incidents = await Incident.find({ status: 'OPEN' }).sort({ createdAt: -1 }).exec();
      return incidents;
    } catch (error) {
      console.error('Error getting open incidents:', error.message);
      throw error;
    }
  }

  // Update incident status
  static async updateIncidentStatus(incidentId, status) {
    try {
      const incident = await Incident.findOneAndUpdate(
        { incidentId },
        { status },
        { new: true }
      ).exec();
      return incident;
    } catch (error) {
      console.error('Error updating incident status:', error.message);
      throw error;
    }
  }

  // Update incident with analysis
  static async updateIncidentAnalysis(incidentId, analysis) {
    try {
      const incident = await Incident.findOneAndUpdate(
        { incidentId },
        {
          aiAnalysis: analysis,
          riskScore: analysis.riskScore,
        },
        { new: true }
      ).exec();
      return incident;
    } catch (error) {
      console.error('Error updating incident analysis:', error.message);
      throw error;
    }
  }

  // Check if recent incident exists for machine
  static async hasRecentIncident(machineId, minutesThreshold = 5) {
    try {
      const fiveMinutesAgo = new Date(Date.now() - minutesThreshold * 60 * 1000);

      const incident = await Incident.findOne({
        machineId,
        status: { $in: ['OPEN', 'IN_PROGRESS'] },
        createdAt: { $gte: fiveMinutesAgo },
      }).exec();

      return incident !== null;
    } catch (error) {
      console.error('Error checking recent incident:', error.message);
      return false;
    }
  }

  // Get incident statistics
  static async getIncidentStats() {
    try {
      const total = await Incident.countDocuments().exec();
      const open = await Incident.countDocuments({ status: 'OPEN' }).exec();
      const critical = await Incident.countDocuments({ severity: 'CRITICAL' }).exec();

      return {
        total,
        open,
        critical,
      };
    } catch (error) {
      console.error('Error getting incident stats:', error.message);
      throw error;
    }
  }
}

export default IncidentService;
