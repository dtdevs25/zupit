import React from 'react';
import { Users, FileText, CreditCard, Activity } from 'lucide-react';

export function Overview() {
  // Mock data for initial layout
  const stats = [
    { label: 'Usuários Ativos', value: '1,234', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Quizzes Criados', value: '456', icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Receita Mensal', value: 'R$ 5.678', icon: CreditCard, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Partidas Hoje', value: '89', icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-white">Visão Geral</h1>
        <p className="text-purple-300 mt-1">Bem-vindo ao Painel de Controle Master.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for Charts / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 h-96 flex flex-col justify-center items-center">
          <Activity className="w-16 h-16 text-purple-700 mb-4" />
          <h3 className="text-xl font-bold text-purple-300">Gráfico de Uso (Em Breve)</h3>
          <p className="text-sm text-purple-400 text-center mt-2 max-w-sm">
            Aqui você visualizará as métricas detalhadas de acesso e criação de partidas no decorrer do tempo.
          </p>
        </div>
        
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-start gap-3 border-b border-purple-800 pb-3 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                <div>
                  <p className="text-sm font-semibold text-white">Novo usuário registrado</p>
                  <p className="text-xs text-purple-400">Há {item * 10} minutos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
