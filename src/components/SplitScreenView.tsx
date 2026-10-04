import React, { useState } from 'react';
import { useQuizSocket } from '../hooks/useQuizSocket';
import { HostLobby } from './HostViews/HostLobby';
import { HostCountdown } from './HostViews/HostCountdown';
import { HostQuestion } from './HostViews/HostQuestion';
import { HostReveal } from './HostViews/HostReveal';
import { HostLeaderboard } from './HostViews/HostLeaderboard';
import { HostPodium } from './HostViews/HostPodium';
import { PlayerLobby } from './PlayerViews/PlayerLobby';
import { PlayerQuestion } from './PlayerViews/PlayerQuestion';
import { PlayerResult } from './PlayerViews/PlayerResult';
import { PlayerLeaderboard } from './PlayerViews/PlayerLeaderboard';
import { PlayerPodium } from './PlayerViews/PlayerPodium';
import { AvatarCustomizer } from './AvatarCustomizer';
import { DEFAULT_QUIZZES } from '../data/defaultQuizzes';
import { CharacterConfig } from '../types';
import { CHARACTER_PRESETS } from './CharacterAvatar';
import { Smartphone, Monitor, Bot, Sparkles, X, Palette } from 'lucide-react';

interface SplitScreenViewProps {
  onClose: () => void;
}

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({ onClose }) => {
  // Host connection
  const host = useQuizSocket();
  // Player connection
  const player = useQuizSocket();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [playerCharacter, setPlayerCharacter] = useState<CharacterConfig>(CHARACTER_PRESETS[0].config);

  // Create room on mount if not yet created
  React.useEffect(() => {
    if (host.isConnected && !host.pin) {
      host.createRoom(DEFAULT_QUIZZES[0]);
    }
  }, [host.isConnected, host.pin]);

  // Join player automatically once host room is ready, and populate with test players
  React.useEffect(() => {
    if (host.pin && player.isConnected && !player.pin) {
      player.joinRoom(host.pin, 'Você (Jogador) 📱', '🦊', '#e21b3c', playerCharacter);
      // Automatically add bots after a brief moment so the user immediately sees competitors in the test
      const botTimer = setTimeout(() => {
        if (host.room?.state === 'LOBBY') {
          host.addBots(4);
        }
      }, 600);
      return () => clearTimeout(botTimer);
    }
  }, [host.pin, player.isConnected, player.pin, host.room?.state, host.addBots]);

  const handleUpdateAvatar = (newConfig: CharacterConfig, newNickname?: string) => {
    setPlayerCharacter(newConfig);
    player.updateAvatar(newConfig, newNickname);
  };

  const handleRenamePlayer = (newName: string) => {
    player.renamePlayer(newName);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] w-full overflow-hidden bg-[#1f073d]">
      {/* Top Banner for Split Screen */}
      <div className="bg-[#2a0c54] border-b border-purple-800 px-4 py-2 flex items-center justify-between text-xs text-purple-200">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-yellow-400 text-purple-950 font-black uppercase text-[10px]">
            Modo Teste Dividido
          </span>
          <span className="hidden sm:inline">
            Veja a tela do Host (esquerda) e o celular do Jogador (direita) sincronizados em tempo real!
          </span>
        </div>

        <div className="flex items-center gap-2">
          {host.room?.state === 'LOBBY' && (
            <button
              onClick={() => host.addBots(2)}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+2 Jogadores Bots</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-1 text-purple-300 hover:text-white font-bold bg-purple-900/60 px-2.5 py-1 rounded-lg border border-purple-700/60 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Sair do Modo Teste</span>
          </button>
        </div>
      </div>

      {/* Two Panes: Left = Host / Right = Player Phone */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Host Screen (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-purple-800/80 overflow-y-auto bg-[#321066]">
          <div className="p-2 bg-purple-950/80 border-b border-purple-800/60 flex items-center justify-between text-xs font-bold text-purple-200">
            <div className="flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-yellow-400" />
              <span>TELA DO ANFITRIÃO / PROJETOR</span>
            </div>
            {host.pin && (
              <span className="font-mono text-yellow-300">
                PIN: {host.pin}
              </span>
            )}
          </div>

          <div className="flex-1 p-2 sm:p-4">
            {host.room ? (
              <>
                {host.room.state === 'LOBBY' && (
                  <HostLobby
                    room={host.room}
                    onStartGame={host.startGame}
                    onAddBots={host.addBots}
                    onKickPlayer={host.kickPlayer}
                  />
                )}

                {host.room.state === 'COUNTDOWN' && (
                  <HostCountdown room={host.room} />
                )}

                {host.room.state === 'QUESTION' && (
                  <HostQuestion
                    room={host.room}
                    onSkipQuestion={host.skipQuestion}
                  />
                )}

                {host.room.state === 'REVEAL' && (
                  <HostReveal
                    room={host.room}
                    onNextStage={host.nextStage}
                  />
                )}

                {host.room.state === 'LEADERBOARD' && (
                  <HostLeaderboard
                    room={host.room}
                    onNextStage={host.nextStage}
                  />
                )}

                {host.room.state === 'PODIUM' && (
                  <HostPodium
                    room={host.room}
                    onRestartGame={host.restartGame}
                    onLeaveRoom={onClose}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-purple-300 text-sm">
                Iniciando sala do anfitrião...
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Player Mobile Phone Frame (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#1a0533] flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-sm flex items-center justify-between text-xs font-bold text-purple-200 mb-2">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-green-400" />
              <span>CELULAR DO JOGADOR</span>
            </div>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-400 text-purple-950 font-black text-[11px] shadow hover:bg-yellow-300 transition-transform active:scale-95 cursor-pointer"
              title="Personalizar seu personagem, roupas, cabelo e óculos ou trocar nome"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Editar Personagem & Nome</span>
            </button>
          </div>

          {/* Phone Bezel */}
          <div className="w-full max-w-sm h-[580px] bg-[#240b4d] rounded-[36px] border-4 border-purple-700/80 shadow-2xl overflow-hidden flex flex-col relative ring-8 ring-purple-950/80">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-purple-950 rounded-b-xl mx-auto flex items-center justify-center z-10">
              <div className="w-10 h-1 bg-purple-800 rounded-full" />
            </div>

            {/* Phone Screen Content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {player.room ? (
                <>
                  {player.room.state === 'LOBBY' && player.myPlayer && (
                    <PlayerLobby
                      player={player.myPlayer}
                      room={player.room}
                      onUpdateAvatar={handleUpdateAvatar}
                      onRenamePlayer={handleRenamePlayer}
                    />
                  )}

                  {player.room.state === 'COUNTDOWN' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-3xl font-black text-yellow-300 animate-bounce">
                        {player.room.timeRemaining}
                      </span>
                      <p className="text-sm font-bold text-white mt-2">
                        Prepare-se!
                      </p>
                    </div>
                  )}

                  {player.room.state === 'QUESTION' && (
                    <PlayerQuestion
                      room={player.room}
                      onSubmitAnswer={player.submitAnswer}
                      hasAnswered={player.myPlayer?.hasAnswered}
                    />
                  )}

                  {player.room.state === 'REVEAL' && player.myPlayer && (
                    <PlayerResult
                      player={player.myPlayer}
                      lastResult={player.lastPlayerResult}
                    />
                  )}

                  {player.room.state === 'LEADERBOARD' && player.myPlayer && (
                    <PlayerLeaderboard
                      player={player.myPlayer}
                      room={player.room}
                    />
                  )}

                  {player.room.state === 'PODIUM' && player.myPlayer && (
                    <PlayerPodium
                      player={player.myPlayer}
                      room={player.room}
                      onLeaveRoom={onClose}
                    />
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-xs text-purple-300">
                  Conectando celular à sala...
                </div>
              )}
            </div>

            {/* Phone Home Bar */}
            <div className="w-24 h-1 bg-white/30 rounded-full mx-auto my-2" />
          </div>
        </div>
      </div>

      {/* Avatar Customizer for Split Screen Player */}
      <AvatarCustomizer
        config={player.myPlayer?.avatarConfig || playerCharacter}
        onChange={handleUpdateAvatar}
        nickname={player.myPlayer?.nickname || 'Você (Jogador)'}
        onRename={handleRenamePlayer}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
};
