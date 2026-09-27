import React from 'react';
import { RoomState, KAHOOT_COLORS } from '../../types';
import { FastForward, CheckCircle2 } from 'lucide-react';

interface HostQuestionProps {
  room: RoomState;
  onSkipQuestion: () => void;
}

export const HostQuestion: React.FC<HostQuestionProps> = ({ room, onSkipQuestion }) => {
  const currentQ = room.currentQuestion;
  if (!currentQ) return null;

  const totalTime = room.totalTime || 20;
  const timeRemaining = room.timeRemaining;
  const progressRatio = Math.max(0, Math.min(1, timeRemaining / totalTime));

  const isWarning = timeRemaining <= 5;

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] w-full max-w-6xl mx-auto px-4 py-4 justify-between">
      {/* Top Header info */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <span className="bg-[#321066] border border-purple-700/60 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm text-yellow-300 uppercase tracking-wider">
            {room.currentQuestionIndex + 1} de {room.totalQuestions}
          </span>
          <span className="text-xs sm:text-sm font-bold text-purple-300 hidden sm:inline">
            {room.quizCategory}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#321066] border border-purple-700/60 px-4 py-1.5 rounded-full font-extrabold text-xs sm:text-sm text-purple-200">
            Respostas: <span className="text-white font-black text-base ml-1">{room.answeredCount}</span> / {room.playerCount}
          </div>
          <button
            onClick={onSkipQuestion}
            className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            title="Pular pergunta imediatamente"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pular</span>
          </button>
        </div>
      </div>

      {/* Main Question Card with Center Timer */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-3">
        {/* Question Text Box */}
        <div className="w-full bg-white text-[#240b4d] rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-purple-400/40 text-center relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
            {currentQ.text}
          </h2>
        </div>

        {/* Mid bar: Timer & Answer Counter visual */}
        <div className="flex items-center justify-center gap-8 my-5">
          {/* Animated circular timer */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                stroke="currentColor"
                strokeWidth="10"
                className="text-purple-900/60 fill-none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={260}
                strokeDashoffset={260 * (1 - progressRatio)}
                strokeLinecap="round"
                className={`fill-none transition-all duration-1000 ${
                  isWarning ? 'text-red-500 animate-pulse' : 'text-yellow-400'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono font-black text-3xl sm:text-4xl ${
                isWarning ? 'text-red-400 animate-bounce-short' : 'text-white'
              }`}>
                {timeRemaining}
              </span>
              <span className="text-[10px] uppercase font-bold text-purple-300">seg</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Colored Answer Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2">
        {currentQ.options.map((option, idx) => {
          const colorMeta = KAHOOT_COLORS[idx % KAHOOT_COLORS.length];
          return (
            <div
              key={idx}
              className={`${colorMeta.bg} rounded-2xl p-4 sm:p-5 shadow-xl flex items-center gap-4 text-white transform transition-transform border-b-4 ${colorMeta.border}`}
            >
              <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center font-black text-2xl flex-shrink-0">
                {colorMeta.icon}
              </div>
              <span className="font-extrabold text-lg sm:text-2xl flex-1 leading-snug">
                {option.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
