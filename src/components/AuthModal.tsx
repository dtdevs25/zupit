import React, { useState } from 'react';
import { X, Eye, EyeOff, ShieldAlert, ArrowRight, MessageCircleQuestion } from 'lucide-react';
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
  defaultMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="fixed inset-0 bg-[#46178f] flex items-center justify-center p-4 sm:p-6 z-[100] animate-fadeIn overflow-y-auto">
      {/* Close button on the top right of the screen */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Floating Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MessageCircleQuestion className="absolute text-white/10 w-24 h-24 top-20 left-[10%] animate-float" />
        <MessageCircleQuestion className="absolute text-white/5 w-16 h-16 bottom-10 left-[20%] animate-float-slow" />
        <MessageCircleQuestion className="absolute text-white/10 w-32 h-32 top-40 right-[15%] animate-float-slower" />
        <MessageCircleQuestion className="absolute text-white/5 w-20 h-20 bottom-20 right-[25%] animate-float" />
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col my-auto border border-white/20 z-10">
        {/* Header / Logo Area */}
        <div className="pt-12 pb-2 px-8 flex flex-col items-center">
          <img src="/superiortrofeu.png" alt="ZUPiT! Logo" className="h-32 object-contain drop-shadow-xl" />
        </div>

        {/* Form Area */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-bold text-gray-700">Senha</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer">
                    Esqueci a senha
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-lg rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Aguarde...' : mode === 'register' ? 'Criar minha conta' : 'Entrar'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600 font-medium">
              {mode === 'login' ? 'Ainda não tem acesso?' : 'Já possui uma conta?'}
            </p>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="mt-2 text-purple-700 font-bold hover:text-purple-900 transition-colors cursor-pointer"
            >
              {mode === 'login' ? 'Criar um usuário agora' : 'Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
