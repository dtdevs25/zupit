import React, { useEffect } from 'react';
import { Player, RoomState } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import { useGameAudio } from '../../context/GameAudioContext';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, Award, ArrowLeft } from 'lucide-react';

interface PlayerPodiumProps {
  player: Player;
  room: RoomState;
  onLeaveRoom: () => void;
}

export const PlayerPodium: React.FC<PlayerPodiumProps> = ({ player, room, onLeaveRoom }) => {
  const isWinner = player.rank === 1;
  const isPodium = (player.rank || 99) <= 3;
  const { playGameEvent } = useGameAudio();

  useEffect(() => {
    playGameEvent('PODIUM');
    if (isPodium) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isPodium, playGameEvent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 text-center">
      <div className="bg-[#321066] border border-purple-700/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-fadeIn">
        {/* Badge */}
        <div className="relative mb-4">
          {player.avatarConfig ? (
            <CharacterAvatar
              config={player.avatarConfig}
              size={84}
              animate
              className={`border-4 shadow-2xl ${
                isWinner ? 'border-yellow-400 ring-4 ring-yellow-400/40' : isPodium ? 'border-purple-300' : 'border-purple-600'
              }`}
            />
          ) : (
            <div className="w-18 h-18 rounded-3xl bg-purple-900/80 flex items-center justify-center text-4xl border border-purple-700">
              {player.avatar}
            </div>
          )}

          {isWinner && (
            <div className="absolute -top-3 -right-2 bg-yellow-400 text-purple-950 p-1.5 rounded-full shadow-lg animate-bounce-short">
              <Crown className="w-5 h-5 fill-current" />
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {isWinner ? 'Você é o Campeão!' : isPodium ? 'Você subiu no Pódio!' : 'Mandou Bem!'}
        </h2>

        <div className="my-4 py-3 px-6 bg-purple-900/60 rounded-2xl border border-purple-700/60 w-full flex items-center justify-around">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-purple-300">Posição</span>
            <span className="text-2xl font-black text-yellow-300 font-mono">
              #{player.rank || 1}
            </span>
          </div>
          <div className="w-px h-8 bg-purple-700/60" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-purple-300">Total</span>
            <span className="text-2xl font-black text-white font-mono">
              {player.score.toLocaleString()} <span className="text-xs">pts</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-purple-200 leading-relaxed mb-6">
          Obrigado por participar desta rodada de {room.quizTitle}!
        </p>

        <button
          onClick={onLeaveRoom}
          className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Menu</span>
        </button>
      </div>
    </div>
  );
};
