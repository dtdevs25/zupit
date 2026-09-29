import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Crown, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user, simulateUpgrade, refreshAuth } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivatePlan = async (plan: 'basic' | 'master') => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    setLoadingAction(plan);
    try {
      await simulateUpgrade(plan);
      await refreshAuth();
      if (plan === 'basic') {
        setSuccessMessage('🎉 Pacote Básico ativado com sucesso! Você tem 10 quizzes no mês e até 30 participantes por sala.');
      } else {
        setSuccessMessage('👑 Pacote Master ativado com sucesso! Quizzes e participantes totalmente ilimitados no mês.');
      }
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (count: number) => {
    if (!user) {
      onOpenAuth?.();
      return;
    }
    setLoadingAction(`credits_${count}`);
    try {
      await simulateUpgrade(undefined, count);
      await refreshAuth();
      setSuccessMessage(`⚡ Pacote de +${count} quizzes adicionado à sua conta com sucesso!`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#200742] border-2 border-purple-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-white shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-purple-800/80 flex items-center justify-between bg-[#190533]">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-yellow-400 block mb-1">
              Acesso & Licenciamento Comercial
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Escolha seu Pacote
            </h2>
            <p className="text-xs text-purple-300 mt-0.5">
              Apresente quizzes ao vivo para suas turmas, equipes ou eventos com ranking em tempo real.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-900/80 border border-emerald-500/70 text-emerald-100 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* User status alert if logged in */}
          {user && (
            <div className="bg-purple-950/70 p-3.5 rounded-xl border border-purple-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-purple-200">
                  Conta: <strong className="text-white">{user.name}</strong> <span className="text-purple-400">({user.email})</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-purple-400">Plano ativo:</span>
                <span className="font-bold text-yellow-300">
                  {user.role === 'master'
                    ? '👑 Master Total'
                    : user.planStatus === 'unlimited' || user.planStatus === 'pro'
                    ? 'Pacote Master (Ilimitado)'
                    : user.planStatus === 'basic'
                    ? `Pacote Básico (${user.paidCredits} quizzes no mês)`
                    : user.paidCredits > 0
                    ? `${user.paidCredits} Créditos`
                    : user.freeTrialUsed
                    ? 'Teste Gratuito Esgotado'
                    : '1 Quiz Gratuito (15 participantes)'}
                </span>
              </div>
            </div>
          )}

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Free Trial Card */}
            <div className="bg-[#19052f] border border-purple-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-600/80 transition-all">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                  Teste Inicial
                </div>
                <h3 className="text-xl font-black text-white">Gratuito</h3>
                <p className="text-xs text-purple-300 mt-0.5">Para experimentar a plataforma</p>

                <div className="mt-4 mb-5 pb-4 border-b border-purple-800/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tight">R$ 0</span>
                    <span className="text-xs text-purple-400 font-medium">/ 1 quiz</span>
                  </div>
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
            <div className={`bg-[#1c0638] rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
              user?.planStatus === 'basic' ? 'border-2 border-indigo-400 shadow-lg shadow-indigo-500/10' : 'border border-purple-600/70 hover:border-purple-400'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                    Segundo Pacote
                  </span>
                  {user?.planStatus === 'basic' && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Plano Atual
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white">Pacote Básico</h3>
                <p className="text-xs text-purple-300 mt-0.5">Para professores e salas de aula</p>

                <div className="mt-4 mb-5 pb-4 border-b border-purple-800/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tight">R$ 8,99</span>
                    <span className="text-xs text-purple-400 font-medium">/ mês</span>
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
                    'Escolher Básico'
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
                <h3 className="text-xl font-black text-white">Pacote Master</h3>
                <p className="text-xs text-purple-200 mt-0.5">Tudo liberado sem nenhuma restrição</p>

                <div className="mt-4 mb-5 pb-4 border-b border-purple-800/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-yellow-400 tracking-tight">R$ 18,99</span>
                    <span className="text-xs text-purple-300 font-medium">/ mês</span>
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
                      : 'Escolher Master'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact with Master Dani */}
          <div className="bg-[#180530] p-4 rounded-xl border border-purple-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-900/80 flex items-center justify-center text-yellow-400 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Precisa de faturamento escolar ou institucional?</h4>
                <p className="text-[11px] text-purple-300">
                  Fale com o Administrador Master Dani para liberação corporativa ou pagamento via Pix.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="mailto:Dani.dk.santos@gmail.com?subject=Solicitacao%20de%20Acesso%20Comercial%20QuizPop"
                className="px-3.5 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 hover:text-white rounded-lg text-xs font-bold transition-all border border-purple-700/60"
              >
                Falar com o Master
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
