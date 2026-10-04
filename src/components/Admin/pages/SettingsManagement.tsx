import React, { useState } from 'react';
import { Settings, Key, User, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SettingsManagement() {
  const { user, token } = useAuth();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage(null);
    try {
      // In a real app, you would have a specific endpoint for updating own profile: /api/admin/profile
      // For now, we can use the admin endpoint if we send our own ID
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, email }) // Note: our backend might need to support email updates
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar o perfil.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    try {
      // Future implementation: endpoint for password change
      setMessage({ type: 'success', text: 'Módulo de alteração de senha estará disponível na próxima atualização de segurança!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao tentar alterar senha.' });
    } finally {
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Configurações</h1>
          <p className="text-purple-300 mt-1">Gerencie seu perfil Master e preferências globais.</p>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl border font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'
        }`}>
          {message.type === 'success' && <ShieldCheck className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-800">
            <div className="p-3 bg-purple-700/50 rounded-xl">
              <User className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Perfil do Administrador</h2>
              <p className="text-xs text-purple-400">Informações da sua conta Master</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-1">Nome Completo</label>
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-1">E-mail de Acesso</label>
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                readOnly
                className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-purple-400 opacity-70 cursor-not-allowed focus:outline-none"
                title="O e-mail master não pode ser alterado por aqui"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Salvar Perfil
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-800">
            <div className="p-3 bg-indigo-700/50 rounded-xl">
              <Key className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Segurança</h2>
              <p className="text-xs text-purple-400">Alteração de senha de acesso</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-purple-300 mb-1">Senha Atual</label>
              <input 
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-1">Nova Senha</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-1">Confirmar Senha</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Atualizar Senha
            </button>
          </form>
        </div>
      </div>
      
      {/* Global Platform Settings Block - Future implementation */}
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-800/50 rounded-2xl p-6 mt-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-900/50 rounded-full">
            <Settings className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Configurações Globais da Plataforma</h3>
            <p className="text-sm text-purple-400 mt-1 max-w-2xl">
              Em breve você poderá alterar os preços, enviar logotipo personalizado e mudar o e-mail de suporte por aqui, sem precisar alterar código.
            </p>
          </div>
        </div>
        <button className="px-6 py-2 rounded-xl border border-purple-600 text-purple-300 text-sm font-bold opacity-50 cursor-not-allowed">
          Em Desenvolvimento
        </button>
      </div>
    </div>
  );
}
