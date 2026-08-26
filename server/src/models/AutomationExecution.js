// Automation Execution Model
// Mongoose schema for tracking automation workflow executions

import mongoose from 'mongoose';

const automationExecutionSchema = new mongoose.Schema(
  {
    executionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    workflowName: {
      type: String,
      required: true,
    },
    workflowType: {
      type: String,
      enum: ['CRITICAL_INCIDENT', 'TEST_AUTOMATION'],
      default: 'CRITICAL_INCIDENT',
    },
    incidentId: {
      type: String,
      default: null,
    },
    testEmail: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['RUNNING', 'SUCCESS', 'FAILED'],
      default: 'RUNNING',
    },
    result: {
      type: Object,
      default: {},
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const AutomationExecution = mongoose.model('AutomationExecution', automationExecutionSchema);
export default AutomationExecution;
