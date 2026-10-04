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
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', path: '/admin/users', icon: Users },
    { name: 'Assinaturas', path: '/admin/payments', icon: CreditCard },
    { name: 'Pagamentos', path: '/admin/payments', icon: CreditCard },
    { name: 'Quizes', path: '/admin/quizzes', icon: FileText },
    { name: 'Auditoria', path: '/admin/logs', icon: Activity },
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

      <div className={`p-4 flex flex-col items-center justify-center`}>
        {/* Empty per user request */}
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

        {/* Custom Split Screen Button inside nav renamed to 'Jogar' */}
        <button
          onClick={() => { window.location.href = '/?split=true'; }}
          title={!isExpanded ? 'Jogar' : undefined}
          className={`flex items-center gap-3 py-3 w-full rounded-xl font-bold transition-all ${
            isExpanded ? 'px-4' : 'px-0 justify-center'
          } text-blue-300 hover:bg-blue-900/50 hover:text-white border border-blue-900/50`}
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          {isExpanded && <span className="whitespace-nowrap">Jogar</span>}
        </button>
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
