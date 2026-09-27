import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, Columns, LogOut, Sparkles, Crown, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  pin?: string | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLeaveRoom?: () => void;
  onToggleSplitScreen?: () => void;
  isSplitScreen?: boolean;
  onOpenAuth?: () => void;
  onOpenMaster?: () => void;
  onOpenPlans?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pin,
  soundEnabled,
  onToggleSound,
  onLeaveRoom,
  onToggleSplitScreen,
  isSplitScreen,
  onOpenAuth,
  onOpenMaster,
  onOpenPlans,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const { user, isMaster, allowance, logout } = useAuth();

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => onLeaveRoom && onLeaveRoom()}>
            <img src="/esquerdatrofeu.png" alt="ZUPiT!" className="h-9 sm:h-14 object-contain transform group-hover:scale-105 transition-transform drop-shadow-md" />
          </div>

          {pin && (
            <div className="hidden sm:flex items-center bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-600">
              PIN: <span className="text-purple-700 ml-1.5 font-mono text-sm tracking-wider">{pin}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Commercial Plans button */}
          {onOpenPlans && (
            <button
              onClick={onOpenPlans}
              className="w-[100px] sm:w-[120px] h-[36px] sm:h-[40px] rounded-xl text-xs sm:text-sm font-black bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] ring-2 ring-orange-500/50 shrink-0"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="inline">Planos</span>
            </button>
          )}

          {/* Master Panel Button if user is Master */}
          {isMaster && onOpenMaster && (
            <button
              onClick={onOpenMaster}
              title="Acessar o Painel Administrativo Master"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-300 text-purple-950 shadow-md flex items-center gap-1.5 hover:from-yellow-300 hover:to-amber-200 transition-all cursor-pointer ring-2 ring-yellow-400/40"
            >
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Painel Master</span>
              <span className="sm:hidden">Master</span>
            </button>
          )}

          {/* User profile or Login trigger */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-gray-100 px-2 sm:px-2.5 py-1 rounded-xl border border-gray-200 text-xs text-gray-700">
              <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                {isMaster ? '👑' : user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="font-bold text-gray-900 max-w-[100px] truncate">{user.name}</span>
                <span className="text-[10px] text-purple-600">
                  {isMaster
                    ? 'Master Total'
                    : user.planStatus === 'pro' || user.planStatus === 'unlimited'
                    ? 'Master Ilimitado'
                    : user.planStatus === 'basic'
                    ? `Básico (${user.paidCredits} quizzes)`
                    : user.paidCredits > 0
                    ? `${user.paidCredits} Créditos`
                    : user.freeTrialUsed
                    ? 'Trial Esgotado'
                    : '1 Quiz Grátis (15p)'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Sair da conta"
                className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="w-[100px] sm:w-[120px] h-[36px] sm:h-[40px] rounded-xl text-xs sm:text-sm font-black bg-yellow-400 hover:bg-yellow-300 text-purple-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shrink-0"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Login</span>
              </button>
            )
          )}

          {onToggleSplitScreen && (
            <button
              onClick={onToggleSplitScreen}
              title="Modo Teste Dividido (Host + Jogador na mesma tela)"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSplitScreen
                  ? 'bg-yellow-400 text-purple-950 shadow-md font-extrabold ring-2 ring-yellow-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span className="hidden lg:inline">{isSplitScreen ? 'Tela Única' : 'Dividir Tela'}</span>
            </button>
          )}

          {user && (
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Silenciar som' : 'Ativar som'}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-purple-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>
          )}

          <button
            onClick={() => setShowHelp(true)}
            title="Como jogar"
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              title="Sair da sala"
              className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#240b4d] border border-purple-700/60 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-purple-300 hover:text-white text-2xl font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 text-purple-950 flex items-center justify-center font-black text-xl">
                ?
              </div>
              <div>
                <h3 className="text-xl font-black">Como Funciona o ZUPiT!</h3>
                <p className="text-xs text-purple-300">A mesma dinâmica emocionante de quiz interativo em tempo real!</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-purple-100">
              <div className="flex items-start gap-3 bg-purple-900/50 p-3 rounded-xl border border-purple-800">
                <span className="text-2xl">📺</span>
                <div>
                  <h4 className="font-bold text-yellow-300">1. O Anfitrião (Host)</h4>
                  <p className="text-xs text-purple-200">
                    Cria a sala, escolhe um quiz e projeta a tela para a turma. Mostra as perguntas e o PIN de 6 dígitos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-purple-900/50 p-3 rounded-xl border border-purple-800">
                <span className="text-2xl">📱</span>
                <div>
                  <h4 className="font-bold text-yellow-300">2. Os Jogadores</h4>
                  <p className="text-xs text-purple-200">
                    Acessam pelo celular ou outra aba com o PIN e escolhem um apelido. Na tela do celular, aparecem apenas os 4 botões coloridos com as formas geométricas!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-purple-900/50 p-3 rounded-xl border border-purple-800">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-bold text-yellow-300">3. Rapidez Vale Pontos</h4>
                  <p className="text-xs text-purple-200">
                    Quanto mais rápido você responder corretamente, mais pontos ganha (até 1.000 pts por pergunta + bônus de sequência de acertos 🔥)!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-purple-900/50 p-3 rounded-xl border border-purple-800">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-yellow-300">4. O Grande Pódio</h4>
                  <p className="text-xs text-purple-200">
                    Ao final de todas as perguntas, os 3 melhores sobem no pódio triunfal com direito a chuva de confetes e fanfarra!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-base transition-colors shadow-lg"
            >
              Entendi, vamos jogar!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
