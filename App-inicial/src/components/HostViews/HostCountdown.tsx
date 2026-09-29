import React from 'react';
import { RoomState } from '../../types';

interface HostCountdownProps {
  room: RoomState;
}

export const HostCountdown: React.FC<HostCountdownProps> = ({ room }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 text-center select-none">
      <span className="text-xl sm:text-2xl font-black text-purple-300 uppercase tracking-widest mb-3">
        Pergunta {room.currentQuestionIndex + 1} de {room.totalQuestions}
      </span>
      <h2 className="text-3xl sm:text-5xl font-black text-white max-w-2xl mb-8">
        Preparem-se!
      </h2>

      {/* Pulsing countdown circle */}
      <div className="relative flex items-center justify-center w-40 h-40 sm:w-52 sm:h-52">
        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl border-4 border-yellow-300 transform scale-100 transition-transform">
          <span className="font-black text-7xl sm:text-9xl text-purple-950 font-mono">
            {room.timeRemaining || 1}
          </span>
        </div>
      </div>

      <p className="mt-8 text-sm sm:text-base font-bold text-yellow-300">
        Fiquem atentos às opções na tela!
      </p>
    </div>
  );
};
