// Sidebar Component
// Navigation sidebar with links to main pages

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  Cpu,
  AlertCircle,
  Wrench,
  Bot,
  FileText,
  Zap,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Factory Twin', path: '/factory', icon: Factory },
  { name: 'Machines', path: '/machines', icon: Cpu },
  { name: 'Incidents', path: '/incidents', icon: AlertCircle },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'AI Copilot', path: '/copilot', icon: Bot },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Automation', path: '/automation', icon: Zap },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-slate-300">Navigation</h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-cyan-900 text-cyan-300'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        <p>Phase 1: Foundation</p>
      </div>
    </aside>
  );
}

export default Sidebar;
