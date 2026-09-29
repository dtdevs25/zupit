import React, { useState } from 'react';
import { RoomState, KAHOOT_COLORS } from '../../types';
import { useGameAudio } from '../../context/GameAudioContext';
import { Check, Clock } from 'lucide-react';

interface PlayerQuestionProps {
  room: RoomState;
  onSubmitAnswer: (index: number) => void;
  hasAnswered?: boolean;
}

export const PlayerQuestion: React.FC<PlayerQuestionProps> = ({
  room,
  onSubmitAnswer,
  hasAnswered = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { playGameEvent } = useGameAudio();

  const currentQ = room.currentQuestion;
  const optionsCount = currentQ?.options.length || 4;

  const handleSelect = (idx: number) => {
    if (hasAnswered || selectedIndex !== null) return;
    setSelectedIndex(idx);
    playGameEvent('ANSWER_SUBMIT');
    onSubmitAnswer(idx);
  };

  if (hasAnswered || selectedIndex !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 text-center">
        <div className="bg-[#321066] border border-purple-700/60 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-yellow-400 text-purple-950 flex items-center justify-center font-black mb-4 shadow-lg animate-pulse">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <h3 className="text-2xl font-black text-white">
            Resposta Enviada!
          </h3>

          <p className="text-sm text-yellow-300 font-bold mt-2">
            Dedos cruzados! 🤞
          </p>

          <p className="text-xs text-purple-300 mt-4 leading-relaxed">
            Aguarde o tempo terminar para conferir se você acertou na tela do anfitrião.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-400">
            <Clock className="w-4 h-4 animate-spin text-purple-400" />
            Restam {room.timeRemaining}s
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] w-full p-2 sm:p-4 justify-between">
      {/* Mini top bar with question number & timer */}
      <div className="w-full flex items-center justify-between px-2 py-1 mb-2">
        <span className="font-black text-xs sm:text-sm text-yellow-300 uppercase tracking-wider">
          Pergunta {room.currentQuestionIndex + 1} de {room.totalQuestions}
        </span>
        <div className="bg-[#321066] px-3 py-1 rounded-full text-xs font-mono font-bold text-white border border-purple-700/60">
          ⏱️ {room.timeRemaining}s
        </div>
      </div>

      {/* 4 Giant Tactile Kahoot Shape Buttons */}
      <div className={`w-full flex-1 grid gap-3 sm:gap-4 ${
        optionsCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'
      }`}>
        {Array.from({ length: optionsCount }).map((_, idx) => {
          const colorMeta = KAHOOT_COLORS[idx % KAHOOT_COLORS.length];
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`${colorMeta.bg} ${colorMeta.hover} active:scale-95 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-4 transition-transform cursor-pointer border-b-6 ${colorMeta.border} select-none group`}
            >
              <span className="text-5xl sm:text-7xl font-black group-hover:scale-110 transition-transform filter drop-shadow-md">
                {colorMeta.icon}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest mt-2 opacity-80">
                {colorMeta.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
