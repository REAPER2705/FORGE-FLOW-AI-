// Copilot Page
// Factory-aware AI assistant for queries and recommendations

import { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, Loader } from 'lucide-react';
import copilotAPI from '../api/copilot';

function Message({ message, isUser }) {
  const bgClass = isUser ? 'bg-cyan-900 border-cyan-700' : 'bg-slate-700 border-slate-600';
  const labelClass = isUser ? 'text-cyan-300' : 'text-slate-300';
  const sourceColor = message.source === 'ai' ? 'text-green-400' : 
                      message.source === 'deterministic' ? 'text-yellow-400' : 'text-slate-400';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-lg p-4 border ${bgClass}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold ${labelClass}`}>AI Copilot</span>
            {message.source && (
              <span className={`text-xs ${sourceColor}`}>
                [{message.source}]
              </span>
            )}
            {message.confidence && (
              <span className="text-xs text-slate-400">
                {message.confidence}%
              </span>
            )}
          </div>
        )}
        <p className={`text-sm ${isUser ? 'text-slate-100' : 'text-slate-100'}`}>
          {message.text}
        </p>
        {message.timestamp && (
          <p className="text-xs text-slate-500 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export function Copilot() {
  const [messages, setMessages] = useState([
    {
      text: 'Welcome to ForgeFlow AI Copilot! I can help you with factory operations, machine status, incident analysis, and maintenance recommendations. What would you like to know?',
      isUser: false,
      source: 'system',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    // Add user message
    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setLoading(true);

    try {
      // Call Copilot API
      const response = await copilotAPI.query(inputValue);

      if (response.success) {
        const aiMessage = {
          text: response.response,
          isUser: false,
          source: response.source,
          confidence: response.confidence,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Show context info if available
        if (response.context && (response.context.machinesCount > 0 || response.context.incidentsCount > 0)) {
          const contextMessage = {
            text: `Factory Context: ${response.context.machinesCount} machines, ${response.context.incidentsCount} recent incidents`,
            isUser: false,
            source: 'context',
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, contextMessage]);
        }
      } else {
        setError(response.error || 'Failed to get response from AI Copilot');
      }
    } catch (err) {
      setError('Error communicating with AI Copilot: ' + err.message);
      console.error('Copilot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">AI Copilot</h1>
        <p className="text-slate-400">Factory-Aware AI Assistant for Industrial Operations</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col min-h-96">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <Message key={idx} message={msg} isUser={msg.isUser} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Loader size={18} className="animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-100 font-semibold">Error</p>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4">
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about machines, incidents, or maintenance..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Quick Questions */}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickQuestion('What is the current factory status?')}
                className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded transition"
                disabled={loading}
              >
                Factory Status
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('Are there any critical issues?')}
                className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded transition"
                disabled={loading}
              >
                Critical Issues
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('What maintenance is pending?')}
                className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded transition"
                disabled={loading}
              >
                Pending Maintenance
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuestion('How can I use the AI Copilot?')}
                className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded transition"
                disabled={loading}
              >
                Help
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Capabilities</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>✓ Machine status and health</li>
            <li>✓ Incident analysis and root causes</li>
            <li>✓ Maintenance recommendations</li>
            <li>✓ Factory operations overview</li>
            <li>✓ Safety alerts and warnings</li>
          </ul>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Safety Guarantees</h3>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>🔒 Phase 3 safety decisions are authoritative</li>
            <li>🛑 CRITICAL alerts always prioritized</li>
            <li>✓ AI provides reasoning, not orders</li>
            <li>✓ All recommendations are supplementary</li>
            <li>✓ Deterministic analysis always checked</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Copilot;
