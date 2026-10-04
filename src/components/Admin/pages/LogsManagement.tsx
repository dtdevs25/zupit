import React, { useEffect, useState } from 'react';
import { Activity, ShieldAlert, List, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: number;
}

export function LogsManagement() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error('Error fetching logs', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchLogs();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-purple-300">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Auditoria & Logs</h1>
          <p className="text-purple-300 mt-1">Histórico completo de ações, bloqueios e pagamentos.</p>
        </div>
      </header>

      <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-purple-800 bg-[#1a0a33] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-purple-400" />
            Atividades Recentes
          </h3>
          <span className="text-xs font-bold bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full border border-blue-800">
            {logs.length} registros
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-purple-900/30 text-purple-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold w-48">Data e Hora</th>
                <th className="p-4 font-semibold w-64">Usuário</th>
                <th className="p-4 font-semibold w-48">Ação</th>
                <th className="p-4 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-purple-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-purple-300">
                      <Clock className="w-4 h-4 shrink-0" />
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{log.userName}</span>
                    <span className="text-xs text-purple-400">{log.userEmail || 'Sistema'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      log.action.includes('PAYMENT') ? 'bg-green-500/20 text-green-400' :
                      log.action.includes('BLOCK') ? 'bg-red-500/20 text-red-400' :
                      log.action.includes('QUIZ') ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-purple-200">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-purple-400">Nenhum registro encontrado no banco de dados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
