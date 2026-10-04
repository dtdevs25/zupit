import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { useAuth } from '../../context/AuthContext';

export function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#110524] text-white overflow-hidden font-['Montserrat',sans-serif]">
      {/* Sidebar Navigation */}
      <DashboardSidebar onLogout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#1a0a33] p-8">
        <div className="max-w-7xl mx-auto">
          {/* Outlet renderiza as sub-páginas do dashboard (Overview, Users, etc) */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
