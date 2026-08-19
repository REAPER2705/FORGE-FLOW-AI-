// Copilot Routes
// API endpoints for AI assistant

import GeminiService from '../services/gemini.service.js';
import { Machine } from '../models/Machine.js';
import { Incident } from '../models/Incident.js';

// Build context for Copilot
const buildCopilotContext = async () => {
  try {
    const machines = await Machine.find().select('machineId name type status').limit(10).exec();
    const incidents = await Incident.find().select('incidentId severity status').limit(5).sort({ createdAt: -1 }).exec();

    return {
      machines: machines.map((m) => ({ id: m.machineId, name: m.name, type: m.type, status: m.status })),
      recentIncidents: incidents.map((i) => ({ id: i.incidentId, severity: i.severity, status: i.status })),
    };
  } catch (error) {
    console.warn('Context building error:', error.message);
    return { machines: [], recentIncidents: [] };
  }
};

// Generate Copilot response with context
const generateCopilotResponse = async (query, context) => {
  if (!GeminiService.isAvailable()) {
    return {
      response: 'AI Copilot is currently unavailable. Please try again later.',
      source: 'system',
      confidence: 0,
    };
  }

  const prompt = `You are an industrial operations AI assistant for ForgeFlow AI. You have access to factory context:

Current Factory Status:
- Active Machines: ${context.machines.length}
- Recent Incidents: ${context.recentIncidents.length}

Machines:
${context.machines.map((m) => `- ${m.name} (${m.id}): Status=${m.status}, Type=${m.type}`).join('\n')}

Recent Incidents:
${context.recentIncidents.map((i) => `- ${i.id}: Severity=${i.severity}, Status=${i.status}`).join('\n')}

User Query: ${query}

Provide a helpful, concise response focused on industrial operations. If the query is about a specific machine or incident, reference the data above. Keep responses practical and action-oriented.

Important: Always include safety warnings for any CRITICAL severity issues.`;

  try {
    const response = await GeminiService.generateContent(prompt);

    if (response) {
      return {
        response,
        source: 'ai',
        confidence: 85,
      };
    } else {
      // Fallback deterministic response
      return {
        response: generateFallbackResponse(query, context),
        source: 'deterministic',
        confidence: 60,
      };
    }
  } catch (error) {
    console.error('Copilot response error:', error.message);
    return {
      response: generateFallbackResponse(query, context),
      source: 'fallback',
      confidence: 50,
    };
  }
};

// Deterministic fallback response
const generateFallbackResponse = (query, context) => {
  const queryLower = query.toLowerCase();

  if (queryLower.includes('machine') || queryLower.includes('status')) {
    return `Factory Status: ${context.machines.length} machines active. ${context.recentIncidents.length} recent incidents. Use the Machines or Incidents page for detailed information.`;
  }

  if (queryLower.includes('critical') || queryLower.includes('emergency')) {
    const criticalIncidents = context.recentIncidents.filter((i) => i.severity === 'CRITICAL');
    if (criticalIncidents.length > 0) {
      return `⚠️ CRITICAL: ${criticalIncidents.length} critical incident(s) detected. Immediate attention required. See Incidents page for details.`;
    }
    return 'No critical incidents currently. Factory operations normal.';
  }

  if (queryLower.includes('maintenance')) {
    return 'Maintenance status available on the Maintenance page. View pending work orders and priority levels.';
  }

  if (queryLower.includes('help') || queryLower.includes('what can')) {
    return 'I can help you with: machine status, incident information, maintenance recommendations, and factory operations. Ask me about specific machines or recent issues.';
  }

  return `Query received: "${query}". Use specific machine names or incident IDs for detailed information. Visit the Dashboard for factory overview.`;
};

export const setupCopilotRoutes = (app) => {
  app.post('/api/copilot', async (req, res, next) => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing query',
        });
      }

      // Build context
      const context = await buildCopilotContext();

      // Generate response
      const copilotResponse = await generateCopilotResponse(query.trim(), context);

      res.json({
        success: true,
        query,
        response: copilotResponse.response,
        source: copilotResponse.source,
        confidence: copilotResponse.confidence,
        context: {
          machinesCount: context.machines.length,
          incidentsCount: context.recentIncidents.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupCopilotRoutes;
