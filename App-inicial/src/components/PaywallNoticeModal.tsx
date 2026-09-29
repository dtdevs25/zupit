import React from 'react';
import { X, Lock, Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PaywallNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans: () => void;
  onOpenAuth: () => void;
}

export const PaywallNoticeModal: React.FC<PaywallNoticeModalProps> = ({
  isOpen,
  onClose,
  onOpenPlans,
  onOpenAuth,
}) => {
  const { user, quickLoginMaster } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-[#240b4d] border-2 border-yellow-500/80 rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden text-center my-auto">
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto pr-1">
          {/* Lock Icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-300 text-purple-950 flex items-center justify-center mx-auto mb-3 shadow-xl">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold uppercase tracking-wider mb-2">
            Teste Grátis Utilizado
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Limite Comercial Atingido
          </h3>

          <p className="text-xs sm:text-sm text-purple-200 mt-2 mb-4 leading-relaxed">
            {user ? (
              <>
                Olá, <strong className="text-white">{user.name}</strong>! Você já realizou seu{' '}
                <strong className="text-yellow-300">1º quiz gratuito de teste (com até 15 participantes)</strong>. Para continuar
                apresentando salas ao vivo com seus alunos ou equipe, assine um dos planos comerciais disponíveis.
              </>
            ) : (
              <>
                Você precisa entrar ou cadastrar sua conta gratuita para apresentar uma partida ao vivo (1º teste com até 15 participantes).
              </>
            )}
          </p>

          {/* Benefits reminder */}
          <div className="bg-[#190533] p-3.5 rounded-2xl border border-purple-800 text-left text-xs space-y-2 mb-5 text-purple-200">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>Opções Disponíveis para Você:</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span><strong>Pacote Básico (R$ 8,99/mês):</strong> 10 quizzes e até 30 participantes</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span><strong>Pacote Master (R$ 18,99/mês):</strong> Quizzes & participantes ILIMITADOS</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => {
                onClose();
                onOpenPlans();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-amber-300 hover:from-yellow-300 hover:to-amber-200 text-purple-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>Ver Planos</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!user ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2 bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold text-xs rounded-xl transition-all cursor-pointer border border-purple-700/60"
              >
                Criar Conta ou Entrar
              </button>
            ) : (
              <button
                onClick={async () => {
                  await quickLoginMaster();
                  onClose();
                }}
                className="w-full py-1.5 text-purple-400 hover:text-purple-200 text-xs font-medium cursor-pointer"
              >
                Acessar Painel Master
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
