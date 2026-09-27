import React from 'react';
import { Player, RoomState } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import { Flame, ArrowUp, ArrowDown, Minus, Crown, Award, Trophy, Sparkles } from 'lucide-react';

interface PlayerLeaderboardProps {
  player: Player;
  room: RoomState;
}

export const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({ player, room }) => {
  const rank = player.rank || 1;
  const isTop1 = rank === 1;
  const isPodium = rank <= 3;
  const climbed = (player.rankDiff || 0) > 0;
  const dropped = (player.rankDiff || 0) < 0;

  // Find points difference with player in 1st place or player ahead
  const top1Player = room.players[0];
  const pointsToFirst = top1Player && top1Player.id !== player.id
    ? Math.max(0, top1Player.score - player.score)
    : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 text-center animate-fadeIn">
      <div className="bg-[#240b4d] border-2 border-purple-600/70 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center relative overflow-hidden backdrop-blur-md">
        {/* Subtle decorative background glow */}
        <div
          className="absolute -top-16 -left-16 w-36 h-36 rounded-full blur-2xl opacity-30"
          style={{ backgroundColor: player.color || '#e21b3c' }}
        />

        {/* Player Avatar */}
        <div className="relative mb-3 flex-shrink-0 animate-bounce-short">
          <CharacterAvatar
            config={player.avatarConfig}
            size={88}
            animate
            className={`border-4 shadow-2xl ${
              isTop1
                ? 'border-yellow-400 ring-4 ring-yellow-400/40'
                : isPodium
                ? 'border-purple-300'
                : 'border-purple-600'
            }`}
          />
          {isTop1 && (
            <div className="absolute -top-3 -right-2 bg-yellow-400 text-purple-950 p-1.5 rounded-full shadow-lg animate-bounce-short">
              <Crown className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        {/* Nickname */}
        <h2 className="text-xl sm:text-2xl font-black text-white truncate max-w-[200px]">
          {player.nickname}
        </h2>

        {/* Rank Position Banner */}
        <div className="my-3 py-2 px-5 rounded-2xl bg-purple-950/80 border border-purple-700/80 flex items-center justify-center gap-2 shadow-inner">
          <Award className={`w-5 h-5 ${isTop1 ? 'text-yellow-400' : 'text-purple-300'}`} />
          <span className="text-xs uppercase font-extrabold text-purple-200">
            Você está em
          </span>
          <span className={`text-2xl font-black font-mono ${isTop1 ? 'text-yellow-300' : 'text-white'}`}>
            #{rank}º
          </span>
          <span className="text-xs text-purple-300 font-bold">
            de {room.playerCount}
          </span>
        </div>

        {/* Movement Indicator (Kahoot Rank Shift) */}
        <div className="flex items-center gap-2 mb-3">
          {climbed && (
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-green-300 bg-green-950/80 border border-green-500/50 px-3 py-1 rounded-full animate-pulse shadow-md">
              <ArrowUp className="w-3.5 h-3.5 stroke-[3] text-green-400" />
              <span>Subiu {player.rankDiff} {player.rankDiff === 1 ? 'posição' : 'posições'}!</span>
            </div>
          )}

          {dropped && (
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-red-300 bg-red-950/80 border border-red-500/50 px-3 py-1 rounded-full shadow-md">
              <ArrowDown className="w-3.5 h-3.5 stroke-[3] text-red-400" />
              <span>Caiu {Math.abs(player.rankDiff || 0)} {Math.abs(player.rankDiff || 0) === 1 ? 'posição' : 'posições'}</span>
            </div>
          )}

          {!climbed && !dropped && (
            <div className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 bg-purple-900/60 border border-purple-700/50 px-3 py-1 rounded-full">
              <Minus className="w-3.5 h-3.5" />
              <span>Manteve a posição</span>
            </div>
          )}

          {player.streak > 1 && (
            <div className="inline-flex items-center gap-1 text-xs font-black text-orange-300 bg-orange-950/80 border border-orange-500/50 px-2.5 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
              <span>{player.streak}🔥</span>
            </div>
          )}
        </div>

        {/* Points Display */}
        <div className="w-full bg-[#1b0638] rounded-2xl p-3 border border-purple-800/80 my-1 flex items-center justify-between">
          <span className="text-xs uppercase font-extrabold text-purple-300">
            Pontuação Total
          </span>
          <span className="text-2xl font-black text-yellow-300 font-mono">
            {player.score.toLocaleString()} <span className="text-xs text-purple-300">pts</span>
          </span>
        </div>

        {/* Motivational Proximity Message */}
        <div className="mt-3 text-xs font-bold text-purple-200">
          {isTop1 ? (
            <span className="text-yellow-300 flex items-center justify-center gap-1">
              <Crown className="w-4 h-4 fill-current" />
              Você está na liderança! Mantenha a coroa!
            </span>
          ) : pointsToFirst > 0 ? (
            <span>
              A apenas <strong className="text-yellow-300 font-mono font-black">{pointsToFirst.toLocaleString()}</strong> pts do 1º lugar!
            </span>
          ) : isPodium ? (
            <span className="text-purple-200">
              Você está no pódio! Continue na disputa! ⚡
            </span>
          ) : (
            <span>
              Foco na próxima pergunta para subir posições! 🚀
            </span>
          )}
        </div>

        {/* Bottom waiting message */}
        <div className="mt-5 flex items-center gap-2 text-[11px] font-bold text-purple-400 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Olhe para a tela do apresentador para ver o placar completo!</span>
        </div>
      </div>
    </div>
  );
};
