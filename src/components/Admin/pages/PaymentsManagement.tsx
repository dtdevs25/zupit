import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle, Activity, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { UserAccount } from '../../../types/auth';
import { AlertModal } from '../../AlertModal';

export function PaymentsManagement() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success'|'error'|'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });

  const showAlert = (type: 'success'|'error'|'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.users) setUsers(data.users);
      } catch (err) {
        console.error('Error fetching users for payments', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-purple-300">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Calculate metrics based on real users
  const subscribers = users.filter(u => u.planStatus === 'basic' || u.planStatus === 'unlimited' || u.planStatus === 'pro');
  
  const basicCount = subscribers.filter(u => u.planStatus === 'basic').length;
  const proCount = subscribers.filter(u => u.planStatus === 'unlimited' || u.planStatus === 'pro').length;
  
  // Basic = R$8.99, Pro = R$18.99
  const monthlyRevenue = (basicCount * 8.99) + (proCount * 18.99);

  const handleGenerateManualLink = async (plan: 'basic' | 'pro') => {
    // Para gerar um link que o Admin pode copiar e mandar no Whatsapp
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // Enviamos um plano, mesmo sem o User estar logado no Modal Comercial, ele usará o email do admin como pagador.
        // O ideal é enviar o email do cliente. Aqui, para simplificar o link genérico:
        body: JSON.stringify({ planType: plan })
      });
      const data = await res.json();
      if (data.init_point) {
        navigator.clipboard.writeText(data.init_point);
        showAlert('success', 'Link Copiado!', `O link do Mercado Pago foi copiado para a área de transferência!\nPlano: ${plan.toUpperCase()}`);
      }
    } catch (err) {
      showAlert('error', 'Erro', 'Erro ao gerar link de pagamento.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-3xl font-black text-white">Assinaturas e Pagamentos</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider">Receita Mensal Estimada</p>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-4xl font-black text-white">
              R$ {monthlyRevenue.toFixed(2).replace('.', ',')}
            </h2>
            <span className="flex items-center text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
              <DollarSign className="w-4 h-4 mr-1" /> Ativa
            </span>
          </div>
        </div>
        
        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider">Assinantes Ativos</p>
          <div className="flex items-center gap-4 mt-2">
            <h2 className="text-4xl font-black text-white">{subscribers.length}</h2>
            <span className="flex items-center text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="w-4 h-4 mr-1" /> Crescendo
            </span>
          </div>
        </div>

        <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
          <p className="text-sm text-purple-300 font-semibold uppercase tracking-wider mb-3">Links de Cobrança (WhatsApp)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleGenerateManualLink('basic')}
              className="flex-1 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500 text-indigo-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <LinkIcon className="w-3 h-3" /> Gerar Prata
            </button>
            <button 
              onClick={() => handleGenerateManualLink('pro')}
              className="flex-1 bg-yellow-600/30 hover:bg-yellow-600 border border-yellow-500 text-yellow-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <LinkIcon className="w-3 h-3" /> Gerar Ouro
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl overflow-hidden shadow-xl mt-8">
        <div className="p-5 border-b border-purple-800 bg-[#1a0a33] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Assinantes Recentes
          </h3>
          <span className="text-xs font-bold bg-green-900/40 text-green-400 px-3 py-1 rounded-full border border-green-800">
            Mercado Pago Integrado e Ativo
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-purple-900/30 text-purple-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Cliente</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Plano</th>
                <th className="p-4 font-semibold text-right">Status do Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-800">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-purple-800/30 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white">{sub.name}</span>
                  </td>
                  <td className="p-4 text-purple-300">
                    {sub.email}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      sub.planStatus === 'unlimited' || sub.planStatus === 'pro' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-blue-400/20 text-blue-400'
                    }`}>
                      {sub.planStatus === 'unlimited' || sub.planStatus === 'pro' ? 'Plano Ouro (R$ 18,99)' : 'Plano Prata (R$ 8,99)'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-green-400">
                      <CheckCircle className="w-4 h-4" /> Pago
                    </span>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-purple-400">Nenhum assinante ativo ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
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
