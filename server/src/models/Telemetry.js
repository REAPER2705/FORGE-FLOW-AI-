// Telemetry Model
// Mongoose schema for machine telemetry data

import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      index: true,
    },
    temperature: {
      type: Number,
      default: 0,
    },
    vibration: {
      type: Number,
      default: 0,
    },
    pressure: {
      type: Number,
      default: 0,
    },
    rpm: {
      type: Number,
      default: 0,
    },
    powerConsumption: {
      type: Number,
      default: 0,
    },
    utilization: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;
