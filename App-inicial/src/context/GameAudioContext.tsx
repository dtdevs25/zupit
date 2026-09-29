import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { sounds } from '../utils/soundEffects';

export type GameAudioEvent = 
  | 'ROOM_JOIN' 
  | 'PLAYER_JOIN' 
  | 'ANSWER_SUBMIT' 
  | 'ANSWER_CORRECT' 
  | 'ANSWER_INCORRECT' 
  | 'COUNTDOWN_TICK' 
  | 'COUNTDOWN_FINAL' 
  | 'TIMER_TICK' 
  | 'TIMES_UP' 
  | 'LEADERBOARD' 
  | 'PODIUM';

interface AudioContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playGameEvent: (event: GameAudioEvent) => void;
  startLobbyMusic: () => void;
  stopLobbyMusic: () => void;
}

const GameAudioContext = createContext<AudioContextType | undefined>(undefined);

export const GameAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quizpop_sound_enabled') || localStorage.getItem('quizoot_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.enabled = next;
      if (!next) {
        sounds.stopLobbyMusic();
      }
      try {
        localStorage.setItem('quizpop_sound_enabled', String(next));
        localStorage.setItem('quizoot_sound_enabled', String(next));
      } catch {}
      return next;
    });
  }, []);

  const playGameEvent = useCallback((event: GameAudioEvent) => {
    if (!sounds.enabled) return;

    switch (event) {
      case 'ROOM_JOIN':
      case 'PLAYER_JOIN':
        sounds.playPlayerJoin();
        break;
      case 'ANSWER_SUBMIT':
        sounds.playAnswerSelect();
        break;
      case 'ANSWER_CORRECT':
        sounds.playCorrect();
        break;
      case 'ANSWER_INCORRECT':
        sounds.playIncorrect();
        break;
      case 'COUNTDOWN_TICK':
        sounds.playCountdownBeep(false);
        break;
      case 'COUNTDOWN_FINAL':
        sounds.playCountdownBeep(true);
        break;
      case 'TIMER_TICK':
        sounds.playTick();
        break;
      case 'TIMES_UP':
        sounds.playTimesUp();
        break;
      case 'PODIUM':
        sounds.stopLobbyMusic();
        sounds.playPodiumFanfare();
        break;
      default:
        break;
    }
  }, []);

  const startLobbyMusic = useCallback(() => {
    sounds.startLobbyMusic();
  }, []);

  const stopLobbyMusic = useCallback(() => {
    sounds.stopLobbyMusic();
  }, []);

  return (
    <GameAudioContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playGameEvent,
        startLobbyMusic,
        stopLobbyMusic,
      }}
    >
      {children}
    </GameAudioContext.Provider>
  );
};

export function useGameAudio(): AudioContextType {
  const context = useContext(GameAudioContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      soundEnabled: sounds.enabled,
      toggleSound: () => {
        sounds.enabled = !sounds.enabled;
        if (!sounds.enabled) sounds.stopLobbyMusic();
      },
      playGameEvent: (event: GameAudioEvent) => {
        if (!sounds.enabled) return;
        if (event === 'ANSWER_SUBMIT') sounds.playAnswerSelect();
        if (event === 'ANSWER_CORRECT') sounds.playCorrect();
        if (event === 'ANSWER_INCORRECT') sounds.playIncorrect();
        if (event === 'PODIUM') sounds.playPodiumFanfare();
        if (event === 'ROOM_JOIN' || event === 'PLAYER_JOIN') sounds.playPlayerJoin();
      },
      startLobbyMusic: () => sounds.startLobbyMusic(),
      stopLobbyMusic: () => sounds.stopLobbyMusic(),
    };
  }
  return context;
}
