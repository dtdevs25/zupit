import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, LogOut, Columns } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MasterNavbarProps {
  onToggleSplitScreen?: () => void;
  isSplitScreen?: boolean;
}

export function MasterNavbar({ onToggleSplitScreen, isSplitScreen }: MasterNavbarProps) {
  const { user, isMaster, logout } = useAuth();
  
  if (!user || !isMaster) return null;

  return (
    <div className="bg-[#110524] text-white px-4 py-2 flex items-center justify-between text-sm font-bold border-b border-purple-900 z-50 relative">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 text-yellow-400">
          <Crown className="w-4 h-4" /> Modo Master
        </span>
        <Link to="/admin" className="text-purple-300 hover:text-white transition-colors">
          Ir para o Dashboard
        </Link>
        {onToggleSplitScreen && (
          <button onClick={onToggleSplitScreen} className="text-purple-300 hover:text-white transition-colors flex items-center gap-1.5">
            <Columns className="w-4 h-4" /> {isSplitScreen ? 'Desativar Tela Dividida' : 'Tela Dividida (Testes)'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-4 text-purple-300">
        <span>Admin: <span className="text-white">{user.name}</span></span>
        <button onClick={logout} className="text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </div>
  );
}
