// Telemetry Service
// Business logic for telemetry data management

import { Telemetry } from '../models/Telemetry.js';
import { Machine } from '../models/Machine.js';

export class TelemetryService {
  // Store a new telemetry reading
  static async storeTelemetry(telemetryData) {
    try {
      const telemetry = new Telemetry({
        machineId: telemetryData.machineId,
        temperature: telemetryData.temperature,
        vibration: telemetryData.vibration,
        pressure: telemetryData.pressure,
        rpm: telemetryData.rpm,
        powerConsumption: telemetryData.powerConsumption,
        utilization: telemetryData.utilization,
        timestamp: telemetryData.timestamp || new Date(),
      });
      return await telemetry.save();
    } catch (error) {
      console.error('Error storing telemetry:', error.message);
      throw error;
    }
  }

  // Get latest telemetry for a specific machine
  static async getLatestTelemetry(machineId) {
    try {
      if (!machineId) throw new Error('machineId is required');
      const telemetry = await Telemetry.findOne({ machineId }).sort({ timestamp: -1 }).exec();
      return telemetry;
    } catch (error) {
      console.error('Error getting latest telemetry:', error.message);
      throw error;
    }
  }

  // Get telemetry history for a machine
  static async getTelemetryHistory(machineId, limit = 50) {
    try {
      if (!machineId) throw new Error('machineId is required');
      const telemetry = await Telemetry.find({ machineId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
      return telemetry.reverse();
    } catch (error) {
      console.error('Error getting telemetry history:', error.message);
      throw error;
    }
  }

  // Get latest telemetry for all machines
  static async getLatestTelemetryForAllMachines() {
    try {
      const machines = await Machine.find().exec();
      const telemetryData = {};

      for (const machine of machines) {
        const latest = await this.getLatestTelemetry(machine.machineId);
        telemetryData[machine.machineId] = latest;
      }

      return telemetryData;
    } catch (error) {
      console.error('Error getting all machines telemetry:', error.message);
      throw error;
    }
  }
}

export default TelemetryService;
