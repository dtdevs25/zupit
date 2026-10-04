import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../Header';

export function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-[#110524] text-white font-['Montserrat',sans-serif]">
      {/* Global Header */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
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
    </div>
  );
}
