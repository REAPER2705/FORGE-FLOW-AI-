// Header Component
// Top navigation bar with status and controls

import { Circle } from 'lucide-react';

export function Header({ apiHealthy = false }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-cyan-400">ForgeFlow AI</h1>
        <p className="text-xs text-slate-400">Industrial Operations Platform</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Circle
            size={8}
            fill={apiHealthy ? '#10b981' : '#ef4444'}
            className={apiHealthy ? 'text-green-500' : 'text-red-500'}
          />
          <span className="text-slate-400">
            API: {apiHealthy ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
