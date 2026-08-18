// Work Order Model
// Mongoose schema for maintenance work orders

import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema(
  {
    workOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    incidentId: {
      type: String,
      default: null,
    },
    machineId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
      default: 'OPEN',
    },
  },
  { timestamps: true }
);

export const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
export default WorkOrder;
