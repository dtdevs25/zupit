import React, { useState, useEffect } from 'react';
import { RoomState, Player } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import { ArrowRight, Flame, ArrowUp, ArrowDown, Minus, Crown, Zap, Sparkles, Trophy } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface HostLeaderboardProps {
  room: RoomState;
  onNextStage: () => void;
}

export const HostLeaderboard: React.FC<HostLeaderboardProps> = ({ room, onNextStage }) => {
  const isLastQuestion = room.currentQuestionIndex + 1 >= room.totalQuestions;
  const topPlayers = room.leaderboard || [];

  // Find max score for relative progress bar fill
  const maxScore = Math.max(1, ...(topPlayers.map(p => p.score)));

  // Animate score roll-up: start with prevScore, roll up to current score
  const [animatedScores, setAnimatedScores] = useState<{ [playerId: string]: number }>(() => {
    const initial: { [id: string]: number } = {};
    topPlayers.forEach((p) => {
      const prev = p.prevScore !== undefined ? p.prevScore : Math.max(0, p.score - (p.lastPointsEarned || 0));
      initial[p.id] = prev;
    });
    return initial;
  });

  const [hasRolledUp, setHasRolledUp] = useState(false);
  const [barProgress, setBarProgress] = useState(false);

  useEffect(() => {
    // Start bar fill after brief mount
    const barTimer = setTimeout(() => {
      setBarProgress(true);
    }, 150);

    // Roll up numbers with sound ticks
    const rollTimer = setTimeout(() => {
      setHasRolledUp(true);

      const startTime = performance.now();
      const duration = 1200; // ms

      const initialValues: { [id: string]: number } = {};
      const targetValues: { [id: string]: number } = {};

      topPlayers.forEach((p) => {
        const prev = p.prevScore !== undefined ? p.prevScore : Math.max(0, p.score - (p.lastPointsEarned || 0));
        initialValues[p.id] = prev;
        targetValues[p.id] = p.score;
      });

      let lastTickSound = 0;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Easing out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        const current: { [id: string]: number } = {};
        topPlayers.forEach((p) => {
          const start = initialValues[p.id] || 0;
          const target = targetValues[p.id] || 0;
          current[p.id] = Math.round(start + (target - start) * ease);
        });

        // Trigger light ticks during roll
        if (now - lastTickSound > 85 && progress < 0.9) {
          sounds.playTick();
          lastTickSound = now;
        }

        setAnimatedScores(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }, 400);

    return () => {
      clearTimeout(barTimer);
      clearTimeout(rollTimer);
    };
  }, []);

  // Find player who climbed the most spots
  const maxClimbPlayer = topPlayers.reduce<Player | null>((best, p) => {
    const climb = p.rankDiff || 0;
    if (climb > 0 && (!best || climb > (best.rankDiff || 0))) {
      return p;
    }
    return best;
  }, null);

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-65px)] w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 justify-between animate-fadeIn overflow-hidden">
      {/* Kahoot Ambient Floating Background Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex justify-between">
        <span className="text-8xl text-red-500 font-bold select-none translate-x-4 translate-y-12">▲</span>
        <span className="text-8xl text-blue-500 font-bold select-none translate-x-12 translate-y-64">◆</span>
        <span className="text-8xl text-yellow-500 font-bold select-none -translate-x-12 translate-y-96">●</span>
        <span className="text-8xl text-green-500 font-bold select-none -translate-x-4 translate-y-32">■</span>
      </div>

      {/* Top Banner (Kahoot Scoreboard Header) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-yellow-300 bg-yellow-400/20 px-2.5 py-0.5 rounded-full border border-yellow-400/40">
              Pergunta {room.currentQuestionIndex + 1} de {room.totalQuestions}
            </span>
            <span className="text-purple-400 font-bold">·</span>
            <span className="text-xs sm:text-sm font-bold text-purple-200">
              {room.quizTitle}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            Placar
            <span className="text-yellow-400 font-mono text-2xl sm:text-4xl">#TOP 5</span>
          </h1>
        </div>

        <button
          onClick={onNextStage}
          className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-purple-950 font-black rounded-2xl text-base sm:text-lg flex items-center gap-2.5 shadow-2xl transition-transform active:scale-95 cursor-pointer ring-4 ring-yellow-400/40 hover:shadow-yellow-400/30"
        >
          <span>{isLastQuestion ? 'Ver Grande Pódio 🏆' : 'Próxima Pergunta'}</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>

      {/* Leaderboard Cards List (Authentic Kahoot High-Impact Style) */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center gap-3 my-2">
        {topPlayers.map((player, index) => {
          const rank = index + 1;
          const isTop1 = rank === 1;
          const displayScore = animatedScores[player.id] !== undefined ? animatedScores[player.id] : player.score;
          const climbed = (player.rankDiff || 0) > 0;
          const dropped = (player.rankDiff || 0) < 0;
          const isHighestClimber = maxClimbPlayer && maxClimbPlayer.id === player.id && (player.rankDiff || 0) > 1;
          const fillWidthPct = barProgress ? Math.max(12, Math.round((player.score / maxScore) * 100)) : 10;

          return (
            <div
              key={player.id}
              className={`relative w-full rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xl border-2 transition-all overflow-hidden ${
                isTop1
                  ? 'bg-[#290d56] border-yellow-400 ring-4 ring-yellow-400/40 shadow-yellow-500/20 scale-[1.01]'
                  : 'bg-[#220a4a] border-purple-700/80 hover:border-purple-500'
              }`}
            >
              {/* Background dynamic score fill bar (Kahoot style) */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out opacity-20 pointer-events-none ${
                  isTop1
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                }`}
                style={{ width: `${fillWidthPct}%` }}
              />

              {/* Left Section: Rank Badge, Character Avatar, Nickname & Movement Indicators */}
              <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
                {/* Metallic Rank Badge */}
                <div
                  className={`w-10 h-10 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl shadow-xl flex-shrink-0 ${
                    rank === 1
                      ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-purple-950 border-2 border-white'
                      : rank === 2
                      ? 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 text-slate-900 border-2 border-white/80'
                      : rank === 3
                      ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 border-2 border-amber-400'
                      : 'bg-purple-950/90 text-purple-200 border border-purple-700 font-mono'
                  }`}
                >
                  #{rank}
                </div>

                {/* Character Avatar with Clothes, Hair & Accessories */}
                <div className="relative flex-shrink-0">
                  <CharacterAvatar
                    config={player.avatarConfig}
                    size={56}
                    className="border-2 border-white/50 shadow-lg"
                  />
                  {isTop1 && (
                    <div className="absolute -top-3 -right-2 bg-yellow-400 text-purple-950 p-1.5 rounded-full shadow-lg animate-bounce-short">
                      <Crown className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>

                {/* Nickname, streak & position changes */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-base sm:text-2xl text-white truncate max-w-[150px] sm:max-w-[240px]">
                      {player.nickname}
                    </span>

                    {isTop1 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase bg-yellow-400 text-purple-950 px-2 py-0.5 rounded-full shadow-sm">
                        <Crown className="w-3 h-3 fill-current" />
                        Na Liderança!
                      </span>
                    )}

                    {player.isBot && (
                      <span className="text-[10px] font-black uppercase bg-purple-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        Bot
                      </span>
                    )}
                  </div>

                  {/* Highlights under nickname */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                    {/* Flame streak badge */}
                    {player.streak > 1 && (
                      <div className="inline-flex items-center gap-1 font-black text-orange-300 bg-orange-950/80 border border-orange-500/60 px-2 py-0.5 rounded-md shadow-sm">
                        <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-pulse" />
                        <span>{player.streak} seguidas!</span>
                      </div>
                    )}

                    {/* Position Movement Badges */}
                    {climbed && (
                      <div className="inline-flex items-center gap-1 font-extrabold text-green-300 bg-green-950/80 border border-green-500/50 px-2 py-0.5 rounded-md animate-fadeIn shadow-sm">
                        <ArrowUp className="w-3.5 h-3.5 text-green-400 stroke-[3]" />
                        <span>Subiu {player.rankDiff} {player.rankDiff === 1 ? 'posição' : 'posições'}!</span>
                      </div>
                    )}

                    {dropped && (
                      <div className="inline-flex items-center gap-1 font-bold text-red-300 bg-red-950/80 border border-red-500/50 px-2 py-0.5 rounded-md shadow-sm">
                        <ArrowDown className="w-3.5 h-3.5 text-red-400 stroke-[3]" />
                        <span>Caiu {Math.abs(player.rankDiff || 0)}</span>
                      </div>
                    )}

                    {!climbed && !dropped && (
                      <div className="hidden sm:inline-flex items-center gap-1 font-bold text-purple-300/80 bg-purple-950/50 px-1.5 py-0.5 rounded text-[11px]">
                        <Minus className="w-3 h-3" />
                        <span>Manteve</span>
                      </div>
                    )}

                    {isHighestClimber && (
                      <div className="inline-flex items-center gap-1 font-black text-yellow-300 bg-gradient-to-r from-purple-900 to-indigo-900 px-2 py-0.5 rounded-md border border-yellow-400/50 shadow-sm animate-pulse">
                        <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>Maior subida! 🚀</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section: Animated Score & Score Increase Badge */}
              <div className="relative z-10 flex flex-col items-end flex-shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-2xl sm:text-4xl text-white font-mono tracking-tight drop-shadow-md">
                    {displayScore.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-yellow-300">
                    pts
                  </span>
                </div>

                {/* Score delta increase */}
                {player.lastPointsEarned ? (
                  <span
                    className={`text-xs sm:text-sm font-black text-green-400 font-mono transition-all duration-300 ${
                      hasRolledUp ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                    }`}
                  >
                    +{player.lastPointsEarned.toLocaleString()} pts
                  </span>
                ) : (
                  <span className="text-xs font-bold text-purple-400/80 font-mono">
                    +0 pts
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2">
        <span className="text-xs text-purple-300 font-bold hidden sm:inline flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>{topPlayers.length} competidores pontuando no topo</span>
        </span>

        <button
          onClick={onNextStage}
          className="w-full sm:w-auto px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-2xl transition-transform active:scale-95 cursor-pointer ml-auto ring-4 ring-yellow-400/30"
        >
          <span>{isLastQuestion ? 'Ir para o Pódio Final! 🏆' : 'Avançar para Próxima Pergunta'}</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
