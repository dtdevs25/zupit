import React, { useEffect, useState } from 'react';
import { Users, FileText, CreditCard, Activity, DollarSign } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Metrics {
  totalUsers: number;
  freeTrialUsers: number;
  basicUsers: number;
  proUsers: number;
  totalQuizzesHosted: number;
  totalRevenueSimulated: number;
  usageHistory?: Array<{ date: string, signups: number, quizzes: number }>;
}

export function Overview() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setMetrics(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching metrics', err);
          setLoading(false);
        });
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-purple-300">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total de Usuários', value: metrics?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Assinantes PRO', value: metrics?.proUsers || 0, icon: CrownIcon, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Quizzes Jogados', value: metrics?.totalQuizzesHosted || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Receita Simulada', value: `R$ ${(metrics?.totalRevenueSimulated || 0).toFixed(2)}`, icon: CreditCard, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  const chartData = metrics?.usageHistory || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-white">Visão Geral</h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 h-96 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Gráfico de Uso (Últimos 7 Dias)</h3>
          <div className="flex-1 w-full h-full min-h-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="quizzes" stroke="#c084fc" name="Quizzes Criados/Jogados" strokeWidth={3} dot={{ r: 4, fill: '#c084fc' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="signups" stroke="#60a5fa" name="Novos Cadastros" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa' }} />
                  <CartesianGrid stroke="#4c1d95" strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="date" stroke="#a78bfa" tick={{ fill: '#a78bfa' }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#a78bfa" tick={{ fill: '#a78bfa' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a0a33', borderColor: '#6b21a8', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-purple-400">
                <Activity className="w-12 h-12 mb-2 opacity-50" />
                <p>Nenhum dado recente encontrado.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Distribuição de Planos</h3>
          <div className="space-y-4 mt-4 flex-1">
            <div className="flex justify-between items-center pb-3 border-b border-purple-800">
              <span className="text-gray-300 font-semibold">Free Trial</span>
              <span className="font-bold text-white bg-gray-600/50 px-3 py-1 rounded-full">{metrics?.freeTrialUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-purple-800">
              <span className="text-blue-300 font-semibold">Básico</span>
              <span className="font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">{metrics?.basicUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-yellow-300 font-semibold">Pro / Ilimitado</span>
              <span className="font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">{metrics?.proUsers || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.956-.734L2.02 6.02a.5.5 0 0 1 .798-.518l4.276 3.664a1 1 0 0 0 1.516-.294z"/>
      <path d="M5 21h14"/>
    </svg>
  );
}
