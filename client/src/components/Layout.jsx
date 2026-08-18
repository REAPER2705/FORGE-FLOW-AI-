// Layout Component
// Main layout wrapper with sidebar and navigation

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export function Layout({ apiHealthy = false }) {
  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header apiHealthy={apiHealthy} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
