import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, Player, Quiz, CharacterConfig } from '../types';
import { sounds } from '../utils/soundEffects';

export interface UseQuizSocketReturn {
  isConnected: boolean;
  room: RoomState | null;
  myPlayer: Player | null;
  playerId: string | null;
  pin: string | null;
  isHost: boolean;
  errorMessage: string | null;
  clearError: () => void;
  // Host actions
  createRoom: (quiz: Quiz, token?: string) => void;
  startGame: () => void;
  addBots: (count: number) => void;
  kickPlayer: (playerId: string) => void;
  nextStage: () => void;
  skipQuestion: () => void;
  restartGame: () => void;
  allowanceError: string | null;
  clearAllowanceError: () => void;
  // Player actions
  joinRoom: (pin: string, nickname: string, avatar: string, color: string, avatarConfig?: CharacterConfig) => void;
  updateAvatar: (avatarConfig: CharacterConfig, nickname?: string) => void;
  renamePlayer: (nickname: string) => void;
  submitAnswer: (answerIndex: number) => void;
  // Leave
  leaveRoom: () => void;
  // Sound controls
  soundEnabled: boolean;
  toggleSound: () => void;
  // Last player result
  lastPlayerResult: {
    correct: boolean;
    points: number;
    score: number;
    streak: number;
    correctAnswerIndex: number;
  } | null;
}

export function useQuizSocket(): UseQuizSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allowanceError, setAllowanceError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastPlayerResult, setLastPlayerResult] = useState<{
    correct: boolean;
    points: number;
    score: number;
    streak: number;
    correctAnswerIndex: number;
  } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const prevPlayersCountRef = useRef<number>(0);
  const prevStateRef = useRef<string>('');
  const playerIdRef = useRef<string | null>(null);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      sounds.enabled = next;
      if (!next) sounds.stopLobbyMusic();
      return next;
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // Initialize WebSocket connection
  const connectWs = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'ROOM_CREATED':
              setPin(msg.pin);
              setRoom(msg.room);
              setIsHost(true);
              sounds.startLobbyMusic();
              break;

            case 'JOINED_SUCCESS':
              setPin(msg.pin);
              setPlayerId(msg.playerId);
              setMyPlayer(msg.player);
              setRoom(msg.room);
              setIsHost(false);
              break;

            case 'ROOM_UPDATE': {
              const updatedRoom: RoomState = msg.room;
              setRoom(updatedRoom);

              if (msg.myPlayer) {
                setMyPlayer(msg.myPlayer);
              } else if (playerIdRef.current && updatedRoom.players) {
                const me = updatedRoom.players.find(p => p.id === playerIdRef.current);
                if (me) {
                  setMyPlayer(me);
                }
              }

              // Sound effects on state transition
              if (prevStateRef.current !== updatedRoom.state) {
                if (updatedRoom.state === 'COUNTDOWN') {
                  sounds.stopLobbyMusic();
                  sounds.playCountdownBeep(false);
                } else if (updatedRoom.state === 'QUESTION') {
                  sounds.stopLobbyMusic();
                } else if (updatedRoom.state === 'REVEAL') {
                  sounds.playTimesUp();
                } else if (updatedRoom.state === 'PODIUM') {
                  sounds.stopLobbyMusic();
                  sounds.playPodiumFanfare();
                }
                prevStateRef.current = updatedRoom.state;
              }

              // Sound when new players join lobby
              if (updatedRoom.state === 'LOBBY' && updatedRoom.playerCount > prevPlayersCountRef.current) {
                sounds.playPlayerJoin();
              }
              prevPlayersCountRef.current = updatedRoom.playerCount;

              // Sound on countdown ticks
              if (updatedRoom.state === 'COUNTDOWN') {
                sounds.playCountdownBeep(updatedRoom.timeRemaining === 1);
              } else if (updatedRoom.state === 'QUESTION' && updatedRoom.timeRemaining <= 5 && updatedRoom.timeRemaining > 0) {
                sounds.playTick();
              }
              break;
            }

            case 'PLAYER_RESULT':
              setLastPlayerResult({
                correct: msg.correct,
                points: msg.points,
                score: msg.score,
                streak: msg.streak,
                correctAnswerIndex: msg.correctAnswerIndex,
              });
              if (msg.correct) {
                sounds.playCorrect();
              } else {
                sounds.playIncorrect();
              }
              break;

            case 'ERROR':
              setErrorMessage(msg.message || 'Ocorreu um erro.');
              if (msg.errorCode === 'ALLOWANCE_EXHAUSTED') {
                setAllowanceError(msg.message || 'Limite de apresentações atingido.');
              }
              break;

            case 'KICKED':
              setErrorMessage(msg.message || 'Você foi desconectado.');
              setRoom(null);
              setPin(null);
              setPlayerId(null);
              setMyPlayer(null);
              break;
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect if ws was cleanly closed or failed
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWs();
          }, 2500);
        }
      };

      ws.onerror = () => {
        // Prevent noisy unhandled error event in browser console
        setIsConnected(false);
      };
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
  }, []);

  useEffect(() => {
    connectWs();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
      sounds.stopLobbyMusic();
    };
  }, [connectWs]);

  const send = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      setErrorMessage('Conexão perdida com o servidor. Tentando reconectar...');
    }
  }, []);

  // Host methods
  const createRoom = useCallback((quiz: Quiz, token?: string) => {
    send({ type: 'HOST_CREATE_ROOM', quiz, token });
  }, [send]);

  const startGame = useCallback(() => {
    send({ type: 'HOST_START_GAME' });
  }, [send]);

  const addBots = useCallback((count: number) => {
    send({ type: 'HOST_ADD_BOTS', count });
  }, [send]);

  const kickPlayer = useCallback((targetPlayerId: string) => {
    send({ type: 'HOST_KICK_PLAYER', playerId: targetPlayerId });
  }, [send]);

  const nextStage = useCallback(() => {
    send({ type: 'HOST_NEXT_STAGE' });
  }, [send]);

  const skipQuestion = useCallback(() => {
    send({ type: 'HOST_SKIP_QUESTION' });
  }, [send]);

  const restartGame = useCallback(() => {
    send({ type: 'HOST_RESTART_GAME' });
  }, [send]);

  // Player methods
  const joinRoom = useCallback((pinStr: string, nickname: string, avatar: string, color: string, avatarConfig?: CharacterConfig) => {
    send({ type: 'PLAYER_JOIN', pin: pinStr, nickname, avatar, color, avatarConfig });
  }, [send]);

  const updateAvatar = useCallback((avatarConfig: CharacterConfig, nickname?: string) => {
    send({ type: 'PLAYER_UPDATE_AVATAR', avatarConfig, nickname });
  }, [send]);

  const renamePlayer = useCallback((nickname: string) => {
    const clean = nickname.trim().substring(0, 18);
    if (clean) {
      send({ type: 'PLAYER_RENAME', nickname: clean });
    }
  }, [send]);

  const submitAnswer = useCallback((answerIndex: number) => {
    sounds.playAnswerSelect();
    send({ type: 'PLAYER_ANSWER', answerIndex });
  }, [send]);

  const leaveRoom = useCallback(() => {
    sounds.stopLobbyMusic();
    setRoom(null);
    setPin(null);
    setPlayerId(null);
    setMyPlayer(null);
    setIsHost(false);
    setLastPlayerResult(null);
    setErrorMessage(null);
  }, []);

  return {
    isConnected,
    room,
    myPlayer,
    playerId,
    pin,
    isHost,
    errorMessage,
    clearError,
    createRoom,
    startGame,
    addBots,
    kickPlayer,
    nextStage,
    skipQuestion,
    restartGame,
    joinRoom,
    updateAvatar,
    renamePlayer,
    submitAnswer,
    leaveRoom,
    soundEnabled,
    toggleSound,
    lastPlayerResult,
    allowanceError,
    clearAllowanceError: () => setAllowanceError(null),
  };
}
