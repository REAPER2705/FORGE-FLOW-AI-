// Gemini AI Service
// Wrapper for Google Generative AI API with safety guardrails

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/env.js';

export class GeminiService {
  static client = null;
  static model = null;

  // Initialize Gemini client
  static initialize() {
    if (!config.geminiApiKey) {
      console.warn('⚠️  GEMINI_API_KEY not configured. AI features will be unavailable.');
      return false;
    }

    try {
      this.client = new GoogleGenerativeAI(config.geminiApiKey);
      // Use gemini-pro as the model (most stable)
      this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      console.log('✓ Gemini AI service initialized');
      return true;
    } catch (error) {
      console.error('✗ Failed to initialize Gemini:', error.message);
      return false;
    }
  }

  // Check if Gemini is available
  static isAvailable() {
    return !!this.model;
  }

  // Generate content with retry logic and error handling
  static async generateContent(prompt, retries = 2) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await this.model.generateContent(prompt);
      const text = response.response.text();
      return text;
    } catch (error) {
      if (retries > 0 && error.message.includes('429')) {
        // Rate limit - retry after delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return this.generateContent(prompt, retries - 1);
      }
      console.error('✗ Gemini generation error:', error.message);
      return null;
    }
  }

  // Analyze root cause with AI reasoning
  static async analyzeRootCause(telemetryHistory, anomalies, probableCause) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const recentTelemetry = telemetryHistory.slice(-10);
      const prompt = `You are an industrial maintenance AI expert. Analyze the following machine data and provide root cause analysis.

Telemetry (last 10 readings):
${JSON.stringify(recentTelemetry, null, 2)}

Detected Anomalies:
${anomalies.map((a) => `- ${a}`).join('\n')}

Deterministic Analysis suggests: ${probableCause}

Provide a JSON response with:
{
  "reasoning": "Your step-by-step analysis",
  "alternativeCauses": ["cause1", "cause2"],
  "mostLikelyCause": "the most probable cause",
  "confidence": 85,
  "evidence": ["evidence1", "evidence2"],
  "nextSteps": ["step1", "step2"]
}

Be concise and practical. Confidence should be 0-100.`;

      const response = await this.generateContent(prompt);
      if (!response) return null;

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          aiReasoning: result.reasoning,
          alternativeCauses: result.alternativeCauses || [],
          mostLikelyCause: result.mostLikelyCause,
          confidence: Math.min(result.confidence || 70, 95), // Cap at 95% to preserve deterministic authority
          evidence: result.evidence || [],
          nextSteps: result.nextSteps || [],
          source: 'gemini',
        };
      }
      return null;
    } catch (error) {
      console.error('✗ Root cause analysis error:', error.message);
      return null;
    }
  }

  // Generate maintenance narrative
  static async generateMaintenanceNarrative(anomalies, rootCause, recommendedSteps, priority) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const stepsText = recommendedSteps.map((s, i) => `${i + 1}. ${s}`).join('\n');

      const prompt = `You are an industrial maintenance professional. Generate a detailed maintenance narrative for a technician.

Machine Issues:
${anomalies.map((a) => `- ${a}`).join('\n')}

Root Cause: ${rootCause}

Required Steps:
${stepsText}

Priority Level: ${priority}

Generate a JSON response with:
{
  "narrative": "A detailed, professional narrative (2-3 paragraphs) for the technician including safety warnings and verification steps",
  "safetyWarnings": ["warning1", "warning2"],
  "verificationSteps": ["step1", "step2"],
  "estimatedTime": "2-3 hours"
}

Be practical and safety-focused.`;

      const response = await this.generateContent(prompt);
      if (!response) return null;

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          narrative: result.narrative,
          safetyWarnings: result.safetyWarnings || [],
          verificationSteps: result.verificationSteps || [],
          estimatedTime: result.estimatedTime,
          source: 'gemini',
        };
      }
      return null;
    } catch (error) {
      console.error('✗ Narrative generation error:', error.message);
      return null;
    }
  }

  // Generate incident summary
  static async generateIncidentSummary(machine, anomalies, rootCause, incident) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const prompt = `You are an industrial operations analyst. Create an executive summary for an incident.

Machine: ${machine.name} (${machine.machineId})
Type: ${machine.type}

Issues:
${anomalies.map((a) => `- ${a}`).join('\n')}

Root Cause: ${rootCause}
Severity: ${incident.severity}

Generate a JSON response with:
{
  "executiveSummary": "A 1-2 sentence summary suitable for management",
  "technicalSummary": "A technical description for maintenance team",
  "impact": "Description of impact if not addressed",
  "urgency": "Immediate/High/Medium/Low"
}`;

      const response = await this.generateContent(prompt);
      if (!response) return null;

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          executiveSummary: result.executiveSummary,
          technicalSummary: result.technicalSummary,
          impact: result.impact,
          urgency: result.urgency,
          source: 'gemini',
        };
      }
      return null;
    } catch (error) {
      console.error('✗ Summary generation error:', error.message);
      return null;
    }
  }
}

// Initialize on module load
GeminiService.initialize();

export default GeminiService;
