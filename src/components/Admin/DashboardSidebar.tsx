import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity, 
  Settings,
  LogOut,
  FileText
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export function DashboardSidebar({ onLogout }: SidebarProps) {
  const links = [
    { name: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
    { name: 'Usuários', path: '/admin/users', icon: Users },
    { name: 'Assinaturas & Pagamentos', path: '/admin/payments', icon: CreditCard },
    { name: 'Quizzes & Conteúdo', path: '/admin/quizzes', icon: FileText },
    { name: 'Auditoria & Logs', path: '/admin/logs', icon: Activity },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#2b0e5c] text-white flex flex-col border-r border-purple-800">
      <div className="p-6">
        <h2 className="text-2xl font-black italic tracking-wider text-purple-300">
          QUIZ<span className="text-yellow-400">ADMIN</span>
        </h2>
        <p className="text-xs text-purple-400 mt-1 uppercase tracking-widest font-semibold">Master Control</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                    : 'text-purple-300 hover:bg-purple-800/50 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-800 mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
}
