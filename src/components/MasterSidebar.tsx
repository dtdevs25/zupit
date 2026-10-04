import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, LogOut, Columns, ChevronLeft, ChevronRight, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MasterSidebarProps {
  onToggleSplitScreen?: () => void;
  isSplitScreen?: boolean;
}

export function MasterSidebar({ onToggleSplitScreen, isSplitScreen }: MasterSidebarProps) {
  const { user, isMaster, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!user || !isMaster) return null;

  return (
    <div 
      className={`fixed left-0 top-[61px] sm:top-[81px] h-[calc(100vh-61px)] sm:h-[calc(100vh-81px)] bg-[#110524] border-r border-purple-900 z-40 transition-all duration-300 flex flex-col ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 flex items-center justify-center border-b border-purple-900">
        <Crown className="w-6 h-6 text-yellow-400" />
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-purple-600 hover:bg-purple-500 text-white rounded-full p-1 shadow-lg border border-purple-400 z-50 transition-colors"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="flex-1 py-6 flex flex-col gap-2 px-2">
        <Link 
          to="/admin" 
          className={`flex items-center gap-3 p-3 rounded-xl text-purple-300 hover:bg-purple-900/50 hover:text-white transition-colors ${!isExpanded ? 'justify-center' : ''}`}
          title="Acessar Dashboard"
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {isExpanded && <span className="font-bold text-sm">Dashboard Completo</span>}
        </Link>

        {onToggleSplitScreen && (
          <button 
            onClick={onToggleSplitScreen} 
            className={`flex items-center gap-3 p-3 rounded-xl text-purple-300 hover:bg-purple-900/50 hover:text-white transition-colors ${!isExpanded ? 'justify-center' : ''}`}
            title="Tela Dividida (Testes)"
          >
            <Columns className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="font-bold text-sm whitespace-nowrap">{isSplitScreen ? 'Desativar Split' : 'Ativar Split Screen'}</span>}
          </button>
        )}
      </div>

      <div className="p-4 border-t border-purple-900 mt-auto">
        <button 
          onClick={logout} 
          className={`flex items-center gap-3 p-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${!isExpanded ? 'justify-center' : ''}`}
          title="Sair"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {isExpanded && <span className="font-bold text-sm">Sair do Sistema</span>}
        </button>
      </div>
    </div>
  );
}
