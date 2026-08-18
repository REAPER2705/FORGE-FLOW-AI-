// Machine Model
// Mongoose schema for industrial machines

import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['CNC', 'Assembly', 'Packaging', 'Conveyor', 'Press'],
      default: 'CNC',
    },
    zone: {
      type: String,
      enum: ['Assembly', 'CNC', 'Packaging', 'Storage', 'Utilities'],
      default: 'Assembly',
    },
    status: {
      type: String,
      enum: ['NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE'],
      default: 'NORMAL',
    },
    healthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
  },
  { timestamps: true }
);

export const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
