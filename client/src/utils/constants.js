// Application Constants
// Shared constants used throughout the application

export const MACHINE_STATUS = {
  NORMAL: 'NORMAL',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  OFFLINE: 'OFFLINE',
};

export const INCIDENT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const WORK_ORDER_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
};

export const AUTOMATION_STATUS = {
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

export const FACTORY_ZONES = [
  'Assembly',
  'CNC',
  'Packaging',
  'Storage',
  'Utilities',
];

export default {
  MACHINE_STATUS,
  INCIDENT_SEVERITY,
  WORK_ORDER_STATUS,
  AUTOMATION_STATUS,
  FACTORY_ZONES,
};
