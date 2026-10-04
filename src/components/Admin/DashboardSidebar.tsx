import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity, 
  Settings,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export function DashboardSidebar({ onLogout }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const links = [
    { name: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
    { name: 'Usuários', path: '/admin/users', icon: Users },
    { name: 'Assinaturas & Pagamentos', path: '/admin/payments', icon: CreditCard },
    { name: 'Quizzes & Conteúdo', path: '/admin/quizzes', icon: FileText },
    { name: 'Auditoria & Logs', path: '/admin/logs', icon: Activity },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-[#2b0e5c] text-white flex flex-col border-r border-purple-800 transition-all duration-300 relative ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-purple-600 hover:bg-purple-500 text-white rounded-full p-1 shadow-lg border border-purple-400 z-50 transition-colors"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className={`p-6 flex flex-col ${isExpanded ? 'items-start' : 'items-center'}`}>
        {isExpanded ? (
          <>
            <h2 className="text-2xl font-black italic tracking-wider text-purple-300">
              QUIZ<span className="text-yellow-400">ADMIN</span>
            </h2>
            <p className="text-xs text-purple-400 mt-1 uppercase tracking-widest font-semibold">Master Control</p>
          </>
        ) : (
          <h2 className="text-xl font-black italic text-yellow-400">Q<span className="text-purple-300">A</span></h2>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto overflow-x-hidden">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin'}
              title={!isExpanded ? link.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 rounded-xl font-bold transition-all ${
                  isExpanded ? 'px-4' : 'px-0 justify-center'
                } ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                    : 'text-purple-300 hover:bg-purple-800/50 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-purple-800 mt-auto">
        <button
          onClick={onLogout}
          title={!isExpanded ? 'Sair do Painel' : undefined}
          className={`flex items-center gap-3 py-3 w-full rounded-xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ${
            isExpanded ? 'px-4' : 'px-0 justify-center'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isExpanded && <span className="whitespace-nowrap">Sair do Painel</span>}
        </button>
      </div>
    </aside>
  );
}
