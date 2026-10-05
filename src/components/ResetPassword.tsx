import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erro ao redefinir a senha.');
      
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#46178f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
        <div className="text-center mb-8">
          <img src="/superiortrofeu.png" alt="ZUPiT! Logo" className="h-16 mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-black text-gray-900">Redefinir Senha</h2>
          <p className="text-gray-500 mt-2">Crie uma nova senha para sua conta</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Senha alterada!</h3>
            <p className="text-gray-600">Sua senha foi atualizada com sucesso.</p>
            <p className="text-sm text-gray-500 mt-4">Redirecionando para o início...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={!token}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl pl-4 pr-12 py-3 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  disabled={!token}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-4 mt-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-lg rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Aguarde...' : 'Salvar Nova Senha'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 font-bold hover:text-purple-800 transition-colors"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  );
};
