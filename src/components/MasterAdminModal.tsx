import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Users,
  Crown,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Zap,
  Shield,
  DollarSign,
  TrendingUp,
  UserCheck,
  Ban,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAccount, PlanStatus, AdminMetrics } from '../types/auth';

interface MasterAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MasterAdminModal: React.FC<MasterAdminModalProps> = ({ isOpen, onClose }) => {
  const { token, isMaster } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free_trial' | 'basic' | 'pro' | 'blocked'>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New user form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<PlanStatus>('free_trial');
  const [newUserCredits, setNewUserCredits] = useState<number>(0);
  const [newUserNotes, setNewUserNotes] = useState('');

  const fetchUsersAndMetrics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && isMaster) {
      fetchUsersAndMetrics();
    }
  }, [isOpen, isMaster, fetchUsersAndMetrics]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserAccount>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showToast('Usuário atualizado com sucesso!');
        fetchUsersAndMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!token) return;
    if (!window.confirm(`Deseja realmente remover o usuário "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast(`Usuário "${name}" excluído.`);
        fetchUsersAndMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          planStatus: newUserPlan,
          paidCredits: newUserPlan === 'basic' && newUserCredits === 0 ? 10 : newUserCredits,
          notes: newUserNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar usuário');

      showToast(`Usuário "${newUserName}" cadastrado com sucesso!`);
      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserNotes('');
      fetchUsersAndMetrics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.notes && u.notes.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterPlan === 'all') return true;
    if (filterPlan === 'pro') return u.planStatus === 'pro' || u.planStatus === 'unlimited';
    if (filterPlan === 'basic') return u.planStatus === 'basic';
    return u.planStatus === filterPlan;
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-fadeIn">
      <div className="bg-[#1c0638] border-2 border-yellow-500/60 rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col text-white shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-purple-800 bg-[#16042e] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 text-purple-950 flex items-center justify-center shadow-lg font-black">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Painel de Controle Master
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-black uppercase tracking-wider">
                  Admin Dani
                </span>
              </div>
              <p className="text-xs text-purple-300">
                Gerencie todos os usuários cadastrados, libere créditos e controle acessos comerciais.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsersAndMetrics()}
              title="Atualizar dados"
              disabled={loading}
              className="p-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-amber-200 text-purple-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Usuário</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Scrollable Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Metrics Overview Cards */}
          {metrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#240b4d] border border-purple-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                    Total de Usuários
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                    {metrics.totalUsers}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-900/80 flex items-center justify-center text-purple-300">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#240b4d] border border-purple-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Pacote Básico (R$ 8,99)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1 block">
                    {metrics.basicUsers || 0}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-900/40 text-indigo-300 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#240b4d] border border-purple-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-yellow-300 uppercase tracking-wider block">
                    Pacote Master (R$ 18,99)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-yellow-400 mt-1 block">
                    {metrics.proUsers}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#240b4d] border border-purple-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Receita Mensal Estimada
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                    R$ {(metrics.totalRevenueSimulated || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-300 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#240b4d] p-3 rounded-2xl border border-purple-800/80">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, e-mail ou notas..."
                className="w-full bg-[#16042e] border border-purple-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-purple-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-purple-300 font-bold mr-1 shrink-0">Filtrar:</span>
              <button
                onClick={() => setFilterPlan('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterPlan === 'all' ? 'bg-yellow-400 text-purple-950 font-black' : 'bg-purple-900/60 text-purple-200'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                onClick={() => setFilterPlan('basic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterPlan === 'basic' ? 'bg-indigo-500 text-white font-black' : 'bg-purple-900/60 text-purple-200'
                }`}
              >
                Básico R$ 8,99 ({users.filter(u => u.planStatus === 'basic').length})
              </button>
              <button
                onClick={() => setFilterPlan('pro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterPlan === 'pro' ? 'bg-yellow-400 text-purple-950 font-black' : 'bg-purple-900/60 text-purple-200'
                }`}
              >
                Master R$ 18,99 ({users.filter(u => u.planStatus === 'pro' || u.planStatus === 'unlimited').length})
              </button>
              <button
                onClick={() => setFilterPlan('free_trial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterPlan === 'free_trial' ? 'bg-purple-600 text-white font-black' : 'bg-purple-900/60 text-purple-200'
                }`}
              >
                Teste Grátis ({users.filter(u => u.planStatus === 'free_trial').length})
              </button>
              <button
                onClick={() => setFilterPlan('blocked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  filterPlan === 'blocked' ? 'bg-red-500 text-white font-black' : 'bg-purple-900/60 text-purple-200'
                }`}
              >
                Bloqueados
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#240b4d] border border-purple-800/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#180530] text-purple-300 uppercase tracking-wider font-extrabold border-b border-purple-800 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Usuário / E-mail</th>
                    <th className="py-3.5 px-3">Plano & Status</th>
                    <th className="py-3.5 px-3 text-center">Partidas Feitas</th>
                    <th className="py-3.5 px-3 text-center">Créditos Extras</th>
                    <th className="py-3.5 px-3 text-center">Teste Grátis (1x)</th>
                    <th className="py-3.5 px-4 text-right">Ações de Gestão</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-purple-900/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-purple-300 text-xs">
                        Nenhum usuário encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isMasterUser = u.role === 'master';
                      return (
                        <tr key={u.id} className="hover:bg-purple-900/30 transition-colors">
                          {/* Name and email */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isMasterUser
                                    ? 'bg-yellow-400 text-purple-950 font-black'
                                    : 'bg-purple-800 text-purple-200'
                                }`}
                              >
                                {isMasterUser ? '👑' : u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isMasterUser && (
                                    <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-400/40">
                                      MASTER
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-purple-300">{u.email}</div>
                                {u.notes && (
                                  <div className="text-[10px] text-purple-400 italic mt-0.5 max-w-xs truncate">
                                    {u.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Plan Status */}
                          <td className="py-3 px-3">
                            {isMasterUser ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/40 text-[11px]">
                                <Crown className="w-3 h-3 fill-current" />
                                Master Total
                              </span>
                            ) : (
                              <select
                                value={u.planStatus === 'pro' ? 'unlimited' : u.planStatus}
                                onChange={(e) =>
                                  handleUpdateUser(u.id, { planStatus: e.target.value as PlanStatus })
                                }
                                className="bg-[#16042e] border border-purple-700/60 rounded-lg px-2 py-1 text-xs text-purple-100 font-medium focus:outline-none focus:ring-1 focus:ring-yellow-400"
                              >
                                <option value="free_trial">Gratuito (15 part.)</option>
                                <option value="basic">Básico (R$ 8,99 - 30 part.)</option>
                                <option value="unlimited">Master (R$ 18,99 - Ilimitado)</option>
                                <option value="blocked">Bloqueado 🚫</option>
                              </select>
                            )}
                          </td>

                          {/* Hosted count */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-white text-sm bg-purple-900/60 px-2 py-0.5 rounded-lg border border-purple-800">
                              {u.quizzesHostedCount || 0}
                            </span>
                          </td>

                          {/* Paid credits counter */}
                          <td className="py-3 px-3 text-center">
                            {isMasterUser ? (
                              <span className="text-yellow-400 text-xs font-bold">∞</span>
                            ) : (
                              <div className="inline-flex items-center gap-1 bg-[#16042e] p-1 rounded-xl border border-purple-800">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateUser(u.id, {
                                      paidCredits: Math.max(0, (u.paidCredits || 0) - 1),
                                    })
                                  }
                                  title="Diminuir 1 crédito"
                                  className="w-5 h-5 rounded bg-purple-800 hover:bg-purple-700 text-purple-200 text-xs font-black flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-mono font-black text-xs text-yellow-300 px-2">
                                  {u.paidCredits || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateUser(u.id, {
                                      paidCredits: (u.paidCredits || 0) + 1,
                                    })
                                  }
                                  title="Adicionar 1 crédito"
                                  className="w-5 h-5 rounded bg-purple-800 hover:bg-purple-700 text-purple-200 text-xs font-black flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Free trial status & reset */}
                          <td className="py-3 px-3 text-center">
                            {isMasterUser ? (
                              <span className="text-purple-400 text-[11px]">-</span>
                            ) : u.freeTrialUsed ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="px-2 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-300 text-[10px] font-bold">
                                  Esgotado
                                </span>
                                <button
                                  onClick={() => handleUpdateUser(u.id, { freeTrialUsed: false })}
                                  title="Liberar mais 1 teste gratuito para este usuário"
                                  className="text-[10px] text-yellow-300 hover:text-yellow-200 underline cursor-pointer"
                                >
                                  Resetar Teste
                                </button>
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                                Disponível (1x)
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            {isMasterUser ? (
                              <span className="text-xs text-purple-400 italic">Conta Master</span>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {u.planStatus !== 'unlimited' && u.planStatus !== 'pro' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateUser(u.id, {
                                        planStatus: 'unlimited',
                                        notes: 'Promovido a Master Ilimitado (R$ 18,99) pelo Dani Master',
                                      })
                                    }
                                    title="Tornar Master (Tudo Ilimitado)"
                                    className="p-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-purple-950 transition-colors cursor-pointer"
                                  >
                                    <Crown className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                )}

                                {u.planStatus !== 'basic' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateUser(u.id, {
                                        planStatus: 'basic',
                                        paidCredits: 10,
                                        monthlyQuizzesLimit: 10,
                                        maxParticipants: 30,
                                        notes: 'Ativado Pacote Básico (R$ 8,99) pelo Dani Master',
                                      })
                                    }
                                    title="Ativar Pacote Básico (10 Quizzes / 30 Participantes)"
                                    className="px-2 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-indigo-500/50"
                                  >
                                    <Zap className="w-3 h-3 text-yellow-300" />
                                    <span>Básico</span>
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    handleUpdateUser(u.id, {
                                      paidCredits: (u.paidCredits || 0) + 3,
                                      notes: 'Adicionado +3 quizzes pelo Master',
                                    })
                                  }
                                  title="Adicionar +3 Quizzes"
                                  className="px-2 py-1 rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Zap className="w-3 h-3 text-yellow-300" />
                                  <span>+3</span>
                                </button>

                                <button
                                  onClick={() =>
                                    handleUpdateUser(u.id, {
                                      planStatus: u.planStatus === 'blocked' ? 'free_trial' : 'blocked',
                                    })
                                  }
                                  title={u.planStatus === 'blocked' ? 'Desbloquear usuário' : 'Bloquear usuário'}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    u.planStatus === 'blocked'
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      : 'bg-purple-800 hover:bg-purple-700 text-purple-300'
                                  }`}
                                >
                                  {u.planStatus === 'blocked' ? (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  ) : (
                                    <Ban className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  title="Excluir usuário"
                                  className="p-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-300 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for adding user manually */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#240b4d] border border-purple-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-purple-300 hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-xl font-black text-white mb-1">Cadastrar Novo Usuário</h3>
              <p className="text-xs text-purple-300 mb-4">
                Adicione um cliente ou parceiro diretamente no sistema.
              </p>

              <form onSubmit={handleAddUserSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Costa"
                    className="w-full bg-[#16042e] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="juliana@clinica.com"
                    className="w-full bg-[#16042e] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Plano Inicial</label>
                    <select
                      value={newUserPlan}
                      onChange={(e) => setNewUserPlan(e.target.value as PlanStatus)}
                      className="w-full bg-[#16042e] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="free_trial">Gratuito (15 part.)</option>
                      <option value="basic">Básico R$ 8,99 (10 quizzes / 30 part.)</option>
                      <option value="unlimited">Master R$ 18,99 (Tudo Ilimitado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Créditos Extras</label>
                    <input
                      type="number"
                      min={0}
                      value={newUserCredits}
                      onChange={(e) => setNewUserCredits(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-[#16042e] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-200 mb-1">Observações / Empresa</label>
                  <input
                    type="text"
                    value={newUserNotes}
                    onChange={(e) => setNewUserNotes(e.target.value)}
                    placeholder="Ex: Treinamento Corporativo Março"
                    className="w-full bg-[#16042e] border border-purple-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-2.5 bg-purple-900 hover:bg-purple-800 text-purple-200 font-bold rounded-xl text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-xs shadow-md"
                  >
                    Salvar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
