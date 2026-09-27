import React from 'react';
import { Player, KAHOOT_COLORS } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import { Check, X, Flame, Trophy, Award } from 'lucide-react';

interface PlayerResultProps {
  player: Player;
  lastResult: {
    correct: boolean;
    points: number;
    score: number;
    streak: number;
    correctAnswerIndex: number;
  } | null;
}

export const PlayerResult: React.FC<PlayerResultProps> = ({ player, lastResult }) => {
  const isCorrect = lastResult ? lastResult.correct : player.lastAnswerCorrect;
  const pointsEarned = lastResult ? lastResult.points : (player.lastPointsEarned || 0);
  const currentStreak = lastResult ? lastResult.streak : player.streak;
  const correctColor = lastResult ? KAHOOT_COLORS[lastResult.correctAnswerIndex % KAHOOT_COLORS.length] : null;

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 text-center text-white transition-colors duration-500 ${
        isCorrect ? 'bg-[#26890c]' : 'bg-[#e21b3c]'
      }`}
    >
      <div className="max-w-md w-full flex flex-col items-center animate-fadeIn p-6">
        {/* Outcome Icon */}
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-2xl animate-bounce-short border-2 border-white/40">
          {isCorrect ? (
            <Check className="w-14 h-14 stroke-[3.5] text-white" />
          ) : (
            <X className="w-14 h-14 stroke-[3.5] text-white" />
          )}
        </div>

        {/* Big Verdict Header */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
          {isCorrect ? 'CORRETO!' : 'QUE PENA!'}
        </h1>

        {/* Points & Streak or Info */}
        {isCorrect ? (
          <div className="flex flex-col items-center my-4">
            <span className="font-mono font-black text-3xl sm:text-4xl text-yellow-300 drop-shadow">
              +{pointsEarned.toLocaleString()} <span className="text-xl">pts</span>
            </span>

            {currentStreak > 1 && (
              <div className="inline-flex items-center gap-1.5 bg-black/25 px-4 py-1.5 rounded-full mt-3 font-extrabold text-sm text-orange-200 border border-white/20 shadow-md">
                <Flame className="w-4 h-4 fill-orange-400 text-orange-400 animate-pulse" />
                <span>Sequência de {currentStreak} acertos!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center my-4">
            <span className="text-base text-white/90 font-medium">
              Não desanime! Na próxima você recupera.
            </span>
            {correctColor && (
              <div className="inline-flex items-center gap-2 bg-black/30 px-4 py-2 rounded-2xl mt-3 font-bold text-xs sm:text-sm border border-white/20">
                <span>A resposta correta era:</span>
                <span className="font-black text-yellow-300 text-base">
                  {correctColor.icon} {correctColor.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Player Current Standings card */}
        <div className="w-full bg-black/25 backdrop-blur-md rounded-2xl p-4 sm:p-5 mt-4 border border-white/20 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {player.avatarConfig ? (
              <CharacterAvatar config={player.avatarConfig} size={42} className="border border-white/40" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                {player.avatar}
              </div>
            )}
            <div className="text-left">
              <span className="text-xs uppercase font-extrabold text-white/70 block">
                Sua Pontuação
              </span>
              <span className="font-mono font-black text-xl text-yellow-300">
                {player.score.toLocaleString()} pts
              </span>
            </div>
          </div>

          {player.rank && (
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase font-extrabold text-white/70">
                Posição
              </span>
              <div className="flex items-center gap-1 font-black text-xl text-white">
                <Award className="w-5 h-5 text-yellow-300" />
                <span>#{player.rank}</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs font-bold text-white/80 animate-pulse">
          Olhe para a tela principal para ver o placar completo!
        </p>
      </div>
    </div>
  );
};
