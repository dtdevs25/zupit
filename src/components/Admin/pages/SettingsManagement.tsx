import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Globe, Database, Clock } from 'lucide-react';
import { Settings, Save, ShieldCheck, Globe, Database, Clock, Users, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
export function SettingsManagement() {
  const { token } = useAuth();
  const [platformName, setPlatformName] = useState('');
  const [freeLimit, setFreeLimit] = useState(10);
  const [defaultTime, setDefaultTime] = useState(20);
  // Novos parametros
  const [maxParticipantsFree, setMaxParticipantsFree] = useState(15);
  const [allowAI, setAllowAI] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setPlatformName(data.name || 'Zupit Master');
      setFreeLimit(data.free_limit || 10);
      setDefaultTime(data.default_time || 20);
      // Se não vier do backend (pq a tabela não tem as colunas novas ainda), a gente usa os states
      if (data.max_participants !== undefined) setMaxParticipantsFree(data.max_participants);
      if (data.allow_ai !== undefined) setAllowAI(data.allow_ai);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          name: platformName, 
          free_limit: freeLimit, 
          default_time: defaultTime,
          max_participants: maxParticipantsFree,
          allow_ai: allowAI
        })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Configurações globais salvas com sucesso!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-8">Carregando...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Configurações Globais</h1>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl border font-bold flex items-center gap-2 animate-fadeIn ${
          message.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-300' : 'bg-red-900/50 border-red-500 text-red-300'
        }`}>
          {message.type === 'success' && <ShieldCheck className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Global Settings */}
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-800">
            <div className="p-3 bg-purple-700/50 rounded-xl">
              <Globe className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Parâmetros da Plataforma</h2>
              <p className="text-xs text-purple-400">Variáveis e configurações de uso geral do sistema</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2">
                  Nome da Plataforma
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full bg-[#1a0a33] border border-purple-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2">
                  Limite Mensal de Quizzes (Contas Gratuitas)
                </label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="number"
                    value={freeLimit}
                    onChange={(e) => setFreeLimit(Number(e.target.value))}
                    className="w-full bg-[#1a0a33] border border-purple-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2">
                  Tempo Padrão por Pergunta (segundos)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="number"
                    value={defaultTime}
                    onChange={(e) => setDefaultTime(Number(e.target.value))}
                    className="w-full bg-[#1a0a33] border border-purple-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-2">
                  Máximo de Participantes (Gratuito)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="number"
                    value={maxParticipantsFree}
                    onChange={(e) => setMaxParticipantsFree(Number(e.target.value))}
                    className="w-full bg-[#1a0a33] border border-purple-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#1a0a33] border border-purple-700 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <div>
                    <span className="block font-bold text-white">Geração de Quiz por IA</span>
                    <span className="text-xs text-purple-400">Permitir que usuários usem IA para gerar questionários</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={allowAI}
                    onChange={(e) => setAllowAI(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-purple-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
