// Incident Model
// Mongoose schema for industrial incidents

import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    machineId: {
      type: String,
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    telemetrySnapshot: {
      type: Object,
      default: {},
    },
    aiAnalysis: {
      type: Object,
      default: null,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    recommendedAction: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
