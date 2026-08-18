// Telemetry Simulator
// Generates realistic simulated industrial IoT telemetry

import { Machine } from '../models/Machine.js';
import { TelemetryService } from '../services/telemetry.service.js';

export class TelemetrySimulator {
  constructor() {
    this.isRunning = false;
    this.simulationInterval = null;
    this.machineStates = {}; // Track state of each machine
    this.machineBaselines = {}; // Track baseline readings for each machine
  }

  // Initialize simulator state for a machine
  initializeMachine(machineId) {
    if (!this.machineStates[machineId]) {
      this.machineStates[machineId] = 'NORMAL';
      this.machineBaselines[machineId] = {
        temperature: 62,
        vibration: 2.0,
        pressure: 50,
        rpm: 1600,
        powerConsumption: 30,
        utilization: 70,
      };
    }
  }

  // Generate realistic telemetry based on machine state
  generateTelemetry(machineId) {
    const state = this.machineStates[machineId] || 'NORMAL';
    const baseline = this.machineBaselines[machineId] || {};

    let reading = {
      temperature: baseline.temperature + (Math.random() - 0.5) * 4,
      vibration: baseline.vibration + (Math.random() - 0.5) * 0.5,
      pressure: baseline.pressure + (Math.random() - 0.5) * 5,
      rpm: baseline.rpm + (Math.random() - 0.5) * 100,
      powerConsumption: baseline.powerConsumption + (Math.random() - 0.5) * 8,
      utilization: baseline.utilization + (Math.random() - 0.5) * 10,
    };

    // Apply state-based adjustments
    if (state === 'WARNING') {
      reading.temperature += 10 + Math.random() * 5;
      reading.vibration += 1.5 + Math.random() * 1;
      reading.pressure += 10 + Math.random() * 5;
      reading.rpm -= 100 + Math.random() * 100;
      reading.powerConsumption += 15 + Math.random() * 10;
      reading.utilization += 10 + Math.random() * 10;
    } else if (state === 'CRITICAL') {
      reading.temperature += 25 + Math.random() * 10;
      reading.vibration += 4 + Math.random() * 2;
      reading.pressure += 25 + Math.random() * 10;
      reading.rpm -= 300 + Math.random() * 200;
      reading.powerConsumption += 30 + Math.random() * 15;
      reading.utilization += 15 + Math.random() * 10;
    } else if (state === 'OFFLINE') {
      return null; // No telemetry for offline machines
    }

    // Constrain values to realistic ranges
    reading.temperature = Math.max(0, Math.min(150, reading.temperature));
    reading.vibration = Math.max(0, Math.min(15, reading.vibration));
    reading.pressure = Math.max(0, Math.min(150, reading.pressure));
    reading.rpm = Math.max(0, Math.min(3000, reading.rpm));
    reading.powerConsumption = Math.max(0, Math.min(100, reading.powerConsumption));
    reading.utilization = Math.max(0, Math.min(100, reading.utilization));

    return reading;
  }

  // Start the simulator
  async start() {
    if (this.isRunning) {
      console.log('⚠ Simulator is already running');
      return false;
    }

    console.log('🚀 Starting telemetry simulator...');

    try {
      // Seed machines if needed
      await this.seedMachines();

      // Initialize all machines
      const machines = await Machine.find().exec();
      for (const machine of machines) {
        this.initializeMachine(machine.machineId);
      }

      this.isRunning = true;

      // Start simulation loop (2 seconds interval)
      this.simulationInterval = setInterval(async () => {
        await this.tick();
      }, 2000);

      console.log('✓ Telemetry simulator started');
      return true;
    } catch (error) {
      console.error('Error starting simulator:', error.message);
      throw error;
    }
  }

  // Simulation tick - generate and store telemetry
  async tick() {
    try {
      const machines = await Machine.find().exec();

      for (const machine of machines) {
        const reading = this.generateTelemetry(machine.machineId);

        if (reading) {
          // Store telemetry
          await TelemetryService.storeTelemetry({
            machineId: machine.machineId,
            ...reading,
            timestamp: new Date(),
          });

          // Update machine health score based on state
          let healthScore = 100;
          if (this.machineStates[machine.machineId] === 'WARNING') {
            healthScore = 60 + Math.random() * 24;
          } else if (this.machineStates[machine.machineId] === 'CRITICAL') {
            healthScore = 20 + Math.random() * 39;
          } else if (this.machineStates[machine.machineId] === 'OFFLINE') {
            healthScore = 0;
          }

          // Update machine
          await Machine.findByIdAndUpdate(machine._id, {
            status: this.machineStates[machine.machineId],
            healthScore: Math.round(healthScore),
          }).exec();
        }
      }
    } catch (error) {
      console.error('Error in simulation tick:', error.message);
    }
  }

  // Trigger warning state for a machine
  async triggerWarning(machineId) {
    try {
      const machine = await Machine.findOne({ machineId }).exec();
      if (!machine) {
        throw new Error(`Machine ${machineId} not found`);
      }

      this.initializeMachine(machineId);
      this.machineStates[machineId] = 'WARNING';
      console.log(`⚠ Triggered WARNING state for ${machineId}`);
      return true;
    } catch (error) {
      console.error('Error triggering warning:', error.message);
      throw error;
    }
  }

  // Trigger critical state for a machine
  async triggerCritical(machineId) {
    try {
      const machine = await Machine.findOne({ machineId }).exec();
      if (!machine) {
        throw new Error(`Machine ${machineId} not found`);
      }

      this.initializeMachine(machineId);
      this.machineStates[machineId] = 'CRITICAL';
      console.log(`🔴 Triggered CRITICAL state for ${machineId}`);
      return true;
    } catch (error) {
      console.error('Error triggering critical:', error.message);
      throw error;
    }
  }

  // Reset all machines to NORMAL
  async reset() {
    try {
      console.log('🔄 Resetting simulator...');

      // Reset all machine states
      for (const machineId in this.machineStates) {
        this.machineStates[machineId] = 'NORMAL';
      }

      // Update all machines in database
      await Machine.updateMany({}, { status: 'NORMAL', healthScore: 100 }).exec();

      console.log('✓ Simulator reset to NORMAL');
      return true;
    } catch (error) {
      console.error('Error resetting simulator:', error.message);
      throw error;
    }
  }

  // Stop the simulator
  stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isRunning = false;
    console.log('⏹ Telemetry simulator stopped');
  }

  // Get simulator status
  getStatus() {
    return {
      isRunning: this.isRunning,
      machineStates: this.machineStates,
    };
  }

  // Seed initial machines if database is empty
  async seedMachines() {
    try {
      const existingCount = await Machine.countDocuments().exec();

      if (existingCount === 0) {
        console.log('📦 Seeding initial machines...');

        const machines = [
          {
            machineId: 'M-001',
            name: 'CNC Precision Mill',
            type: 'CNC',
            zone: 'CNC',
            status: 'NORMAL',
            healthScore: 100,
          },
          {
            machineId: 'M-002',
            name: 'Assembly Robot A',
            type: 'Assembly',
            zone: 'Assembly',
            status: 'NORMAL',
            healthScore: 100,
          },
          {
            machineId: 'M-003',
            name: 'Packaging Line 01',
            type: 'Packaging',
            zone: 'Packaging',
            status: 'NORMAL',
            healthScore: 100,
          },
          {
            machineId: 'M-004',
            name: 'Hydraulic Press 01',
            type: 'Press',
            zone: 'Assembly',
            status: 'NORMAL',
            healthScore: 100,
          },
          {
            machineId: 'M-005',
            name: 'Conveyor Line A',
            type: 'Conveyor',
            zone: 'Storage',
            status: 'NORMAL',
            healthScore: 100,
          },
        ];

        await Machine.insertMany(machines);
        console.log('✓ Machines seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding machines:', error.message);
    }
  }
}

export default TelemetrySimulator;
