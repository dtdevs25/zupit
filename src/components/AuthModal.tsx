import React, { useState } from 'react';
import { X, UserPlus, LogIn, Crown, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'register',
  onSuccess,
}) => {
  const { login, register, quickLoginMaster } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Digite seu nome.');
        if (!email.trim() || !email.includes('@')) throw new Error('Digite um e-mail válido.');
        if (password.length < 4) throw new Error('A senha deve ter ao menos 4 caracteres.');
        await register(name.trim(), email.trim(), password);
      } else {
        if (!email.trim()) throw new Error('Digite seu e-mail.');
        if (!password) throw new Error('Digite sua senha.');
        await login(email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMaster = async () => {
    setError(null);
    setLoading(true);
    try {
      await quickLoginMaster();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-[#240b4d] border-2 border-purple-700/80 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden my-auto">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header bar with close button */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-800/60 relative z-10 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-400 text-purple-950 font-black text-[11px] uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            1 Quiz Grátis (Até 15 Participantes)
          </div>

          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1.5 rounded-xl hover:bg-purple-800/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pt-3 pb-1 pr-1 space-y-3 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'register' ? 'Criar Conta de Acesso' : 'Entrar no QuizPop!'}
            </h2>
            <p className="text-xs text-purple-200 mt-0.5">
              {mode === 'register'
                ? 'Cadastre-se e ganhe 1 quiz completo com até 15 participantes para testar!'
                : 'Acesse para gerenciar seus quizzes e abrir salas de jogo.'}
            </p>
          </div>

          {/* Mode switcher tabs */}
          <div className="grid grid-cols-2 gap-1 bg-[#1a0738] p-1 rounded-xl border border-purple-800/80">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register' ? 'bg-yellow-400 text-purple-950 shadow-md font-black' : 'text-purple-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login' ? 'bg-yellow-400 text-purple-950 shadow-md font-black' : 'text-purple-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Já Tenho Conta
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">Seu Nome / Apelido</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Prof. Camila Rocha"
                  className="w-full bg-[#160530] border border-purple-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-[#160530] border border-purple-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#160530] border border-purple-700/60 rounded-xl px-3 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {mode === 'register' && (
              <div className="bg-purple-900/40 p-2.5 rounded-xl border border-purple-800 text-xs text-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 text-yellow-300 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  1 Quiz Grátis (Limite de até 15 participantes)
                </div>
                <p className="text-[11px] text-purple-300 leading-snug">
                  Apresente 1 quiz completo com até 15 participantes sem pagar nada. Depois, renove com o Pacote Básico (R$ 8,99) ou Pacote Master (R$ 18,99).
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-purple-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {loading ? 'Processando...' : mode === 'register' ? 'Criar Conta Grátis' : 'Entrar'}
            </button>
          </form>

          {/* Master quick button */}
          <div className="pt-2.5 border-t border-purple-800/80 text-center">
            <button
              type="button"
              onClick={handleQuickMaster}
              disabled={loading}
              className="w-full py-1.5 px-3 bg-purple-900/50 hover:bg-purple-800/80 border border-purple-600/60 rounded-xl text-xs font-bold text-yellow-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span>Acessar como Master (Dani)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
