import React from 'react';
import { RoomState, KAHOOT_COLORS } from '../../types';
import { Check, X, ArrowRight, Lightbulb } from 'lucide-react';

interface HostRevealProps {
  room: RoomState;
  onNextStage: () => void;
}

export const HostReveal: React.FC<HostRevealProps> = ({ room, onNextStage }) => {
  const currentQ = room.currentQuestion;
  if (!currentQ) return null;

  const correctIndex = currentQ.correctAnswer ?? 0;
  const distribution = room.answerDistribution || [0, 0, 0, 0];
  const maxVotes = Math.max(1, ...distribution);

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] w-full max-w-6xl mx-auto px-4 py-4 justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="bg-[#321066] border border-purple-700/60 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm text-yellow-300 uppercase tracking-wider">
          Resultado da Pergunta {room.currentQuestionIndex + 1} de {room.totalQuestions}
        </span>

        <button
          onClick={onNextStage}
          className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-purple-950 font-black rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-yellow-400/50"
        >
          <span>Avançar para o Placar</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Main Question Reminder */}
      <div className="w-full bg-[#240b4d] border border-purple-700/60 rounded-2xl p-4 sm:p-5 text-center shadow-lg my-2">
        <h3 className="text-xl sm:text-3xl font-black text-white">
          {currentQ.text}
        </h3>
      </div>

      {/* Answer Distribution Vertical Bar Chart */}
      <div className="w-full flex-1 flex flex-col justify-center my-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 items-end h-56 sm:h-64 pt-6 px-4">
          {currentQ.options.map((option, idx) => {
            const isCorrect = idx === correctIndex;
            const count = distribution[idx] || 0;
            const colorMeta = KAHOOT_COLORS[idx % KAHOOT_COLORS.length];
            const heightPercent = Math.max(15, Math.round((count / maxVotes) * 100));

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end">
                {/* Vote Count indicator */}
                <span className="font-black text-xl sm:text-2xl text-white mb-2 font-mono">
                  {count}
                </span>

                {/* Vertical Bar */}
                <div
                  className={`w-full rounded-t-2xl transition-all duration-700 flex flex-col items-center justify-between p-2 shadow-xl ${
                    colorMeta.bg
                  } ${isCorrect ? 'ring-4 ring-white shadow-green-500/50' : 'opacity-85'}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-black/25 flex items-center justify-center font-bold text-base text-white">
                    {isCorrect ? <Check className="w-5 h-5 text-white stroke-[3]" /> : <X className="w-4 h-4 text-white/70" />}
                  </div>
                  <span className="text-xl">{colorMeta.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Option text cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3">
          {currentQ.options.map((option, idx) => {
            const isCorrect = idx === correctIndex;
            const colorMeta = KAHOOT_COLORS[idx % KAHOOT_COLORS.length];

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl flex items-center gap-2 border text-sm font-bold transition-all ${
                  isCorrect
                    ? `${colorMeta.bg} text-white border-white ring-2 ring-white/80 shadow-md font-extrabold`
                    : 'bg-purple-950/60 text-purple-300 border-purple-800/80 opacity-60'
                }`}
              >
                <span className="text-base flex-shrink-0">{colorMeta.icon}</span>
                <span className="truncate flex-1">{option.text}</span>
                {isCorrect && <Check className="w-4 h-4 text-white flex-shrink-0 stroke-[3]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation curiosity fact */}
      {currentQ.explanation && (
        <div className="w-full bg-purple-900/60 border border-purple-600/60 rounded-2xl p-4 flex items-start gap-3 shadow-md my-2">
          <div className="p-2 bg-yellow-400 text-purple-950 rounded-xl font-bold flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-xs font-black text-yellow-300 uppercase tracking-wider block">
              Você Sabia?
            </span>
            <p className="text-sm sm:text-base text-purple-100 font-medium mt-0.5">
              {currentQ.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Button */}
      <div className="w-full flex justify-end mt-2">
        <button
          onClick={onNextStage}
          className="w-full sm:w-auto px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <span>Ver Placar Geral</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
