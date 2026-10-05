import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Crown, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertModal } from './AlertModal';

interface CommercialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const CommercialModal: React.FC<CommercialModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { user, token, refreshAuth } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success'|'error'|'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });

  const showAlert = (type: 'success'|'error'|'info', title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  if (!isOpen) return null;

  const handleActivatePlan = async (plan: 'basic' | 'master') => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    setLoadingAction(plan);
    try {
      const planPayload = billingCycle === 'annual' ? `${plan}_annual` : plan;
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType: planPayload === 'master' || planPayload === 'master_annual' ? planPayload.replace('master', 'pro') : planPayload })
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        showAlert('error', 'Erro', 'Erro ao gerar o link de pagamento.');
      }
    } catch (err) {
      console.error(err);
      showAlert('error', 'Erro', 'Erro de conexão ao processar pagamento.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (count: number) => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    // Para simplificar, créditos avulsos podem redirecionar para um link genérico ou no futuro implementarmos.
    showAlert('info', 'Em Breve', 'A compra de créditos avulsos estará disponível em breve!');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-[#200742] border-2 border-purple-700/80 rounded-3xl max-w-5xl w-full max-h-[95vh] flex flex-col text-white shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-800/80 flex items-center justify-between bg-[#190533] shrink-0">
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-yellow-400 block">
              Planos & Preços
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1">
          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-4 mt-3">
            <div className="relative">
              {billingCycle === 'annual' && (
                <div className="absolute -top-3 -right-2 z-20 animate-bounce">
                  <span className="bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black shadow-lg">
                    Desconto Aplicado
                  </span>
                </div>
              )}
              <div className="bg-purple-900/40 p-1 rounded-full border border-purple-800/60 inline-flex relative w-64">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-full transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-purple-400 hover:text-purple-200'}`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-full transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-purple-400 hover:text-purple-200'}`}
                >
                  Anual
                </button>
                
                {/* Sliding background indicator */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-purple-600 rounded-full shadow-md transition-transform duration-300 ease-in-out ${billingCycle === 'annual' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'} left-1`}
                />
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-900/80 border border-emerald-500/70 text-emerald-100 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}



          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-4">
            {/* Free Trial Card */}
            <div className="bg-[#19052f] border border-purple-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-600/80 transition-all">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                  Teste Inicial
                </div>
                <h3 className="text-lg font-black text-white">Plano Grátis</h3>
                <p className="text-[11px] text-purple-300 mt-0.5">Para experimentar a plataforma</p>

                <div className="mt-3 mb-4 pb-3 border-b border-purple-800/60 flex flex-col justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white tracking-tight">R$ 0</span>
                    <span className="text-[11px] text-purple-400 font-medium">/ 1 quiz</span>
                  </div>
                  <div className="text-[10px] opacity-0 mt-1 pointer-events-none select-none">.</div>
                </div>

                <ul className="space-y-2.5 text-xs text-purple-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>1 Partida completa de teste</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Até <strong className="text-white">15 participantes</strong> por sala</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Editor de Quizzes e Personagens</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ranking dinâmico e efeitos sonoros</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-800/60">
                {!user ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth?.();
                    }}
                    className="w-full py-2.5 bg-purple-800/80 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-purple-600/50"
                  >
                    Começar Grátis
                  </button>
                ) : user.freeTrialUsed ? (
                  <div className="text-center py-2 text-xs text-purple-400 font-medium bg-purple-950/60 rounded-xl border border-purple-900">
                    Teste Já Utilizado
                  </div>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-purple-800/80 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-purple-600/50"
                  >
                    Usar Quiz Grátis
                  </button>
                )}
              </div>
            </div>

            {/* Basic Plan (R$ 8,99) */}
            <div className={`bg-[#1c0638] rounded-2xl p-4 flex flex-col justify-between transition-all relative ${
              user?.planStatus === 'basic' ? 'border-2 border-indigo-400 shadow-lg shadow-indigo-500/10' : 'border border-purple-600/70 hover:border-purple-400'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Intermediário
                  </span>
                  {user?.planStatus === 'basic' && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Plano Atual
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white">Plano Prata</h3>
                <p className="text-[11px] text-purple-300 mt-0.5">Para professores e salas de aula</p>

                <div className="mt-3 mb-4 pb-3 border-b border-purple-800/60 flex flex-col justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white tracking-tight">
                      R$ {billingCycle === 'monthly' ? '8,99' : '89,90'}
                    </span>
                    <span className="text-[11px] text-purple-400 font-medium">
                      / {billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  <div className={`text-[10px] text-green-400 font-bold mt-1 transition-opacity ${billingCycle === 'annual' ? 'opacity-100' : 'opacity-0 select-none'}`}>
                    Equivale a R$ 7,49 por mês
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-purple-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong className="text-white">10 Quizzes</strong> no mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Até <strong className="text-white">30 participantes</strong> por sala</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Salas ao vivo com PIN rápido</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Histórico e relatórios de rodadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Editor completo com temas e avatares</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-800/60">
                <button
                  onClick={() => handleActivatePlan('basic')}
                  disabled={loadingAction === 'basic' || user?.planStatus === 'basic'}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                    user?.planStatus === 'basic'
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {loadingAction === 'basic' ? (
                    'Ativando...'
                  ) : user?.planStatus === 'basic' ? (
                    'Plano Ativo'
                  ) : (
                    'Escolher Prata'
                  )}
                </button>
              </div>
            </div>

            {/* Master Unlimited Card (R$ 18,99) */}
            <div className="bg-gradient-to-b from-[#2a0b52] to-[#180430] border-2 border-yellow-400/90 rounded-2xl p-5 flex flex-col justify-between relative shadow-xl shadow-yellow-500/10 transition-all">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-300 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Mais Escolhido
                  </span>
                  {(user?.role === 'master' || user?.planStatus === 'unlimited' || user?.planStatus === 'pro') && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                      Plano Ativo
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-white">Plano Ouro</h3>
                <p className="text-[11px] text-purple-200 mt-0.5">Tudo liberado sem nenhuma restrição</p>

                <div className="mt-3 mb-4 pb-3 border-b border-purple-800/60 flex flex-col justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-yellow-400 tracking-tight">
                      R$ {billingCycle === 'monthly' ? '18,99' : '189,90'}
                    </span>
                    <span className="text-[11px] text-purple-300 font-medium">
                      / {billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  <div className={`text-[10px] text-green-400 font-bold mt-1 transition-opacity ${billingCycle === 'annual' ? 'opacity-100' : 'opacity-0 select-none'}`}>
                    Equivale a R$ 15,82 por mês
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-purple-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong className="text-white">Quizzes ilimitados</strong> no mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span><strong className="text-white">Participantes ilimitados</strong> na sala</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Criador de Quizzes Inteligente com IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Histórico completo de partidas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Suporte prioritário via WhatsApp</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-800/60">
                <button
                  onClick={() => handleActivatePlan('master')}
                  disabled={loadingAction === 'master' || user?.role === 'master' || user?.planStatus === 'unlimited' || user?.planStatus === 'pro'}
                  className={`w-full py-2.5 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                    user?.role === 'master' || user?.planStatus === 'unlimited' || user?.planStatus === 'pro'
                      ? 'bg-purple-900/60 text-purple-300 border border-purple-700/60 cursor-default'
                      : 'bg-gradient-to-r from-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-amber-200 text-purple-950'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>
                    {loadingAction === 'master'
                      ? 'Ativando...'
                      : user?.role === 'master' || user?.planStatus === 'unlimited' || user?.planStatus === 'pro'
                      ? 'Plano Ativo'
                      : 'Escolher Ouro'}
                  </span>
                </button>
              </div>
            </div>
          </div>
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
};
