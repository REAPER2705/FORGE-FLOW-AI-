// Automation Scheduler Service
// Handles periodic analysis and automation triggers

import AnalysisService from './analysis.service.js';

export class AutomationSchedulerService {
  constructor() {
    this.analysisInterval = null;
    this.isScheduling = false;
  }

  // Start periodic analysis
  startAnalysisSchedule(intervalSeconds = 30) {
    if (this.analysisInterval) {
      console.log('⚠ Analysis scheduler already running');
      return;
    }

    console.log(`🔄 Starting analysis scheduler (every ${intervalSeconds}s)`);

    this.isScheduling = true;
    this.analysisInterval = setInterval(async () => {
      try {
        await AnalysisService.analyzeAllMachines();
      } catch (error) {
        console.error('Error in scheduled analysis:', error.message);
      }
    }, intervalSeconds * 1000);

    console.log('✓ Analysis scheduler started');
  }

  // Stop periodic analysis
  stopAnalysisSchedule() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
      this.isScheduling = false;
      console.log('⏹ Analysis scheduler stopped');
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isScheduling,
      intervalSeconds: this.analysisInterval ? 'active' : 'inactive',
    };
  }
}

export default new AutomationSchedulerService();
