import React, { useEffect, useState } from 'react';
import { RoomState } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home, Sparkles, Award } from 'lucide-react';

interface HostPodiumProps {
  room: RoomState;
  onRestartGame: () => void;
  onLeaveRoom: () => void;
}

export const HostPodium: React.FC<HostPodiumProps> = ({
  room,
  onRestartGame,
  onLeaveRoom,
}) => {
  const [showFullRank, setShowFullRank] = useState(false);

  const podium = room.podium;
  const first = podium?.first;
  const second = podium?.second;
  const third = podium?.third;
  const allRanked = podium?.allRanked || room.players;

  // Trigger grand confetti
  useEffect(() => {
    const end = Date.now() + 4 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] w-full max-w-5xl mx-auto px-4 py-6 justify-between items-center text-center">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 bg-yellow-400 text-purple-950 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest mb-2 shadow-lg animate-bounce-short">
          <Sparkles className="w-4 h-4 fill-current" />
          Fim de Jogo!
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          O Grande Pódio!
        </h1>
        <p className="text-sm sm:text-base text-purple-300 mt-1 font-semibold">
          Quiz: {room.quizTitle}
        </p>
      </div>

      {/* 3D Visual Podium Blocks */}
      <div className="w-full flex-1 flex items-end justify-center gap-3 sm:gap-6 my-8 max-w-3xl px-2">
        {/* 2nd Place (Silver) */}
        {second ? (
          <div className="flex-1 flex flex-col items-center">
            {/* Player Info */}
            <div className="flex flex-col items-center mb-3 animate-fadeIn">
              {second.avatarConfig ? (
                <CharacterAvatar config={second.avatarConfig} size={70} className="border-4 border-slate-300 shadow-xl" />
              ) : (
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-slate-200 border-2 border-slate-300 flex items-center justify-center text-3xl sm:text-4xl shadow-xl">
                  {second.avatar}
                </div>
              )}
              <span className="font-extrabold text-sm sm:text-lg text-white mt-1.5 truncate max-w-[110px] sm:max-w-[150px]">
                {second.nickname}
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-yellow-300">
                {second.score.toLocaleString()} pts
              </span>
            </div>

            {/* Podium step 2 */}
            <div className="w-full h-44 sm:h-52 bg-gradient-to-t from-slate-600 via-slate-400 to-slate-300 rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-white/50">
              <span className="font-black text-3xl sm:text-5xl text-slate-900 font-mono">
                2
              </span>
              <span className="text-[11px] uppercase font-black text-slate-800 tracking-wider">
                Prata
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* 1st Place (Champion Gold) */}
        {first ? (
          <div className="flex-1 flex flex-col items-center z-10">
            {/* Crown and Avatar */}
            <div className="flex flex-col items-center mb-3 animate-bounce-short">
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 fill-yellow-400 filter drop-shadow-md mb-0.5" />
              {first.avatarConfig ? (
                <CharacterAvatar config={first.avatarConfig} size={84} className="border-4 border-yellow-300 shadow-2xl ring-4 ring-yellow-400/50" />
              ) : (
                <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-tr from-yellow-300 to-amber-400 border-4 border-white flex items-center justify-center text-4xl sm:text-5xl shadow-2xl ring-4 ring-yellow-400/50">
                  {first.avatar}
                </div>
              )}
              <span className="font-black text-base sm:text-2xl text-yellow-300 mt-2 truncate max-w-[130px] sm:max-w-[180px]">
                {first.nickname}
              </span>
              <span className="font-mono font-black text-sm sm:text-base text-white">
                {first.score.toLocaleString()} pts
              </span>
            </div>

            {/* Podium step 1 */}
            <div className="w-full h-56 sm:h-68 bg-gradient-to-t from-amber-600 via-yellow-500 to-yellow-300 rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-white">
              <span className="font-black text-4xl sm:text-6xl text-purple-950 font-mono">
                1
              </span>
              <span className="text-xs uppercase font-black text-purple-950 tracking-wider">
                Campeão 🏆
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* 3rd Place (Bronze) */}
        {third ? (
          <div className="flex-1 flex flex-col items-center">
            {/* Player Info */}
            <div className="flex flex-col items-center mb-3 animate-fadeIn">
              {third.avatarConfig ? (
                <CharacterAvatar config={third.avatarConfig} size={62} className="border-4 border-amber-600 shadow-xl" />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-800 border-2 border-amber-600 flex items-center justify-center text-2xl sm:text-3xl shadow-xl">
                  {third.avatar}
                </div>
              )}
              <span className="font-extrabold text-sm sm:text-lg text-white mt-1.5 truncate max-w-[100px] sm:max-w-[140px]">
                {third.nickname}
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-yellow-300">
                {third.score.toLocaleString()} pts
              </span>
            </div>

            {/* Podium step 3 */}
            <div className="w-full h-32 sm:h-40 bg-gradient-to-t from-amber-950 via-amber-800 to-amber-700 rounded-t-3xl shadow-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-amber-500/50">
              <span className="font-black text-3xl sm:text-4xl text-amber-200 font-mono">
                3
              </span>
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider">
                Bronze
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Action buttons */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setShowFullRank(!showFullRank)}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700/60 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Award className="w-4 h-4 text-yellow-400" />
          <span>{showFullRank ? 'Ocultar Classificação Geral' : 'Ver Todos os Jogadores'}</span>
        </button>

        <button
          onClick={onRestartGame}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4 stroke-[3]" />
          <span>Jogar Novamente</span>
        </button>

        <button
          onClick={onLeaveRoom}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-800/80 hover:bg-purple-700 border border-purple-600/50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Menu Principal</span>
        </button>
      </div>

      {/* Full Ranking Modal */}
      {showFullRank && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#240b4d] border border-purple-700/60 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl text-left relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setShowFullRank(false)}
              className="absolute top-4 right-4 text-purple-300 hover:text-white text-2xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-yellow-300 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Classificação Completa
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allRanked.map((player, idx) => (
                <div
                  key={player.id}
                  className="bg-purple-950/80 border border-purple-800 p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-purple-900 font-black text-xs text-yellow-300 flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    {player.avatarConfig ? (
                      <CharacterAvatar config={player.avatarConfig} size={36} className="border border-white/30" />
                    ) : (
                      <span className="text-xl">{player.avatar}</span>
                    )}
                    <span className="font-extrabold text-sm truncate max-w-[150px]">
                      {player.nickname}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-yellow-400">
                    {player.score.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
