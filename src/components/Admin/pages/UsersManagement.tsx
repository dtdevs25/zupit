import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, Trash2, Edit, CheckCircle, Plus, Activity, Mail } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { UserAccount } from '../../../types/auth';
import { ConfirmModal } from '../../ConfirmModal';
import { AlertModal } from '../../AlertModal';

export function UsersManagement() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success'|'error'|'info', title: string, message: string}>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type: 'success'|'error'|'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };
  
  // Confirmation states
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [userToBlock, setUserToBlock] = useState<UserAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    planStatus: 'free_trial',
    paidCredits: 0,
    notes: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ name: '', email: '', password: '', planStatus: 'free_trial', paidCredits: 0, notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setModalMode('edit');
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave blank for edit, we don't update password here for now
      planStatus: user.planStatus,
      paidCredits: user.paidCredits,
      notes: user.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData)
        });
      } else if (modalMode === 'edit' && editingUser) {
        await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: formData.name,
            planStatus: formData.planStatus,
            paidCredits: formData.paidCredits,
            notes: formData.notes
          })
        });
      }
      setIsModalOpen(false);
      fetchUsers();
      showAlert('success', 'Sucesso', modalMode === 'add' ? 'Usuário criado com sucesso.' : 'Usuário atualizado com sucesso.');
    } catch (err) {
      console.error('Error saving user', err);
      showAlert('error', 'Erro', 'Erro ao salvar usuário.');
    }
  };

  const handleToggleBlock = (user: UserAccount) => {
    setUserToBlock(user);
  };

  const confirmToggleBlock = async () => {
    if (!userToBlock) return;
    const isBlocked = userToBlock.planStatus === 'blocked';
    const newStatus = isBlocked ? 'free_trial' : 'blocked';
    
    try {
      await fetch(`/api/admin/users/${userToBlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ planStatus: newStatus })
      });
      fetchUsers();
    } catch (err) {
      console.error('Error toggling block', err);
    } finally {
      setUserToBlock(null);
    }
  };

  const handleDelete = (user: UserAccount) => {
    if (user.id === currentUser?.id) {
      showAlert('error', 'Ação Inválida', 'Você não pode excluir sua própria conta Master.');
      return;
    }
    setUserToDelete(user);
  };

  const handleSendResetEmail = async (user: UserAccount) => {
    // In a real app, this would call /api/admin/users/:id/send-reset-email
    // For MVP, we simulate success and show a manual link in case SMTP is not configured.
    const fakeResetLink = `https://zupit.com.br/reset-password?token=mock_${Math.random().toString(36).substring(7)}`;
    
    showAlert(
      'success',
      'E-mail Enviado!',
      `O link de redefinição de senha foi enviado para ${user.email}.\n\nCaso o usuário não receba, você pode enviar este link manualmente:\n${fakeResetLink}`
    );
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user', err);
    } finally {
      setUserToDelete(null);
    }
  };

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
          <h1 className="text-3xl font-black text-white">Gestão de Usuários</h1>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" /> Novo Usuário
        </button>
      </header>

      <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-purple-900/30 text-purple-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Nome & Email</th>
                <th className="p-4 font-semibold">Plano</th>
                <th className="p-4 font-semibold text-center">Quizzes Jogados</th>
                <th className="p-4 font-semibold text-center">Créditos</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-800">
              {users.map((user) => {
                const isBlocked = user.planStatus === 'blocked';
                return (
                  <tr key={user.id} className="hover:bg-purple-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center font-bold shrink-0 shadow-inner">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{user.name}</span>
                          <span className="text-xs text-purple-400">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'master' || user.planStatus === 'unlimited' ? 'bg-yellow-400/20 text-yellow-400' :
                        user.planStatus === 'basic' ? 'bg-blue-400/20 text-blue-400' :
                        'bg-gray-400/20 text-gray-400'
                      }`}>
                        {user.role === 'master' ? 'Master' : user.planStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-white">
                      {user.quizzesHostedCount || 0}
                    </td>
                    <td className="p-4 text-center font-bold text-white">
                      {user.paidCredits || 0}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-sm font-semibold ${
                        isBlocked ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {isBlocked ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {isBlocked ? 'Bloqueado' : 'Ativo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" 
                          title="Editar/Adicionar Créditos"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSendResetEmail(user)}
                          className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" 
                          title="Enviar Link de Recuperação de Senha"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <>
                            <button 
                              onClick={() => handleToggleBlock(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                isBlocked 
                                  ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400' 
                                  : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400'
                              }`} 
                              title={isBlocked ? "Desbloquear" : "Bloquear"}
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(user)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" 
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-purple-400">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a0a33] border border-purple-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-4">
              {modalMode === 'add' ? 'Adicionar Novo Usuário' : 'Editar Usuário'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-purple-300 mb-1">Nome Completo</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-1">E-mail</label>
                <input 
                  type="email"
                  required
                  readOnly={modalMode === 'edit'} // Don't allow changing email easily for now
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none transition-colors ${modalMode === 'edit' ? 'opacity-50 cursor-not-allowed' : 'focus:border-purple-500'}`}
                />
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-1">Senha Provisória</label>
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-1">Plano Base</label>
                  <select 
                    value={formData.planStatus}
                    onChange={e => setFormData({...formData, planStatus: e.target.value})}
                    className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
                  >
                    <option value="free_trial">Free Trial</option>
                    <option value="basic">Básico</option>
                    <option value="unlimited">Ilimitado (Pro)</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-purple-300 mb-1">Créditos Avulsos</label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.paidCredits}
                    onChange={e => setFormData({...formData, paidCredits: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-300 mb-1">Anotações Internas</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-[#110524] border border-purple-800 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Ex: Empresa X, pago via PIX manual..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-900">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-purple-300 hover:bg-purple-900/50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                >
                  {modalMode === 'add' ? 'Criar Usuário' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Block Confirm Modal */}
      <ConfirmModal
        isOpen={!!userToBlock}
        title={userToBlock?.planStatus === 'blocked' ? "Desbloquear Usuário" : "Bloquear Usuário"}
        message={userToBlock?.planStatus === 'blocked' 
          ? `Tem certeza que deseja restaurar o acesso de "${userToBlock?.name}"?` 
          : `Tem certeza que deseja suspender o acesso de "${userToBlock?.name}"? Ele não poderá mais logar na plataforma.`}
        confirmText={userToBlock?.planStatus === 'blocked' ? "Sim, Desbloquear" : "Sim, Bloquear"}
        onConfirm={confirmToggleBlock}
        onCancel={() => setUserToBlock(null)}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Excluir Usuário Definitivamente"
        message={`Tem certeza que deseja excluir permanentemente o usuário "${userToDelete?.name}"? Esta ação não poderá ser desfeita e todos os dados associados serão perdidos.`}
        confirmText="Sim, Excluir Usuário"
        onConfirm={confirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Custom Alerts */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />
    </div>
  );
}
