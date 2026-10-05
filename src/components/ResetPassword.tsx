import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Eye, EyeOff, MessageCircleQuestion, Lock } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente ou inválido.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setError(null);
    setLoading(true);

    try {
      if (password.length < 4) {
        throw new Error('A senha deve ter ao menos 4 caracteres.');
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir a senha.');
      
      setSuccess('Senha alterada com sucesso! Redirecionando...');
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#46178f] flex items-center justify-center p-4 sm:p-6 z-[100] animate-fadeIn">
      {/* Floating Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MessageCircleQuestion className="absolute text-white/10 w-24 h-24 top-20 left-[10%] animate-float" />
        <MessageCircleQuestion className="absolute text-white/5 w-16 h-16 bottom-10 left-[20%] animate-float-slow" />
        <MessageCircleQuestion className="absolute text-white/10 w-32 h-32 top-40 right-[15%] animate-float-slower" />
        <MessageCircleQuestion className="absolute text-white/5 w-20 h-20 bottom-20 right-[25%] animate-float" />
      </div>

      <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col z-10 max-h-[90vh]">
        {/* Header / Logo Area */}
        <div className="pt-8 pb-0 px-6 flex flex-col items-center">
          <img src="/superiortrofeu.png" alt="ZUPiT! Logo" className="h-24 object-contain drop-shadow-xl" />
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nova Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={!token || loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all font-medium text-sm"
                  />
                  <button
                    type="button"
                    disabled={!token || loading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3 mt-1 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-base rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Aguarde...' : 'Salvar Nova Senha'}
                {!loading && <Lock className="w-4 h-4" />}
              </button>
            </form>
          )}

          <div className="mt-4 text-center border-t border-gray-100 pt-3">
            <button
              onClick={() => navigate('/')}
              className="mt-2 text-purple-700 font-bold hover:text-purple-900 transition-colors cursor-pointer text-sm"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
