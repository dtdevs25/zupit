import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_QUIZZES } from './src/data/defaultQuizzes.ts';
import { Quiz, Player, GameState, RoomState, QuizQuestion, CharacterConfig } from './src/types.ts';
import {
  registerUser,
  loginUser,
  getUserByToken,
  checkAllowance,
  consumeAllowance,
  updateUserByAdmin,
  deleteUserByAdmin,
  getAllUsersAdmin,
  getAdminMetrics,
} from './serverAuth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const BOT_CHARACTERS: CharacterConfig[] = [
  {
    expression: 'cool',
    skinTone: '#f1c27d',
    hairStyle: 'spiky',
    hairColor: '#e5c158',
    clothingStyle: 'jacket',
    clothingColor: '#1368ce',
    accessory: 'sunglasses',
    bgColor: '#1368ce',
  },
  {
    expression: 'wink',
    skinTone: '#e0ac69',
    hairStyle: 'curly',
    hairColor: '#1e1b18',
    clothingStyle: 'hoodie',
    clothingColor: '#e21b3c',
    accessory: 'headphones',
    bgColor: '#e21b3c',
  },
  {
    expression: 'laugh',
    skinTone: '#ffdbac',
    hairStyle: 'cap',
    hairColor: '#3b82f6',
    clothingStyle: 'jersey',
    clothingColor: '#d89e00',
    accessory: 'glasses',
    bgColor: '#d89e00',
  },
  {
    expression: 'focused',
    skinTone: '#c68642',
    hairStyle: 'afro',
    hairColor: '#1e1b18',
    clothingStyle: 'suit',
    clothingColor: '#26890c',
    accessory: 'roundGlasses',
    bgColor: '#26890c',
  },
  {
    expression: 'smile',
    skinTone: '#8d5524',
    hairStyle: 'short',
    hairColor: '#5c3826',
    clothingStyle: 'tshirt',
    clothingColor: '#864cbf',
    accessory: 'crown',
    bgColor: '#864cbf',
  },
  {
    expression: 'cool',
    skinTone: '#f1c27d',
    hairStyle: 'ponytail',
    hairColor: '#ec4899',
    clothingStyle: 'striped',
    clothingColor: '#0ea5e9',
    accessory: 'pixelShades',
    bgColor: '#0284c7',
  },
  {
    expression: 'smile',
    skinTone: '#ffdbac',
    hairStyle: 'long',
    hairColor: '#b55239',
    clothingStyle: 'hoodie',
    clothingColor: '#e21b3c',
    accessory: 'glasses',
    bgColor: '#9333ea',
  },
  {
    expression: 'focused',
    skinTone: '#4a2c11',
    hairStyle: 'spiky',
    hairColor: '#1e1b18',
    clothingStyle: 'jacket',
    clothingColor: '#26890c',
    accessory: 'headphones',
    bgColor: '#1e293b',
  },
];

// In-memory rooms
interface ActivePlayer {
  ws?: WebSocket;
  player: Player;
  hasAnswered: boolean;
  answerTime?: number;
  answerIndex?: number;
}

interface ServerRoom {
  pin: string;
  hostWs: WebSocket;
  hostUserId?: string;
  maxParticipants: number;
  planName?: string;
  quiz: Quiz;
  state: GameState;
  currentQuestionIndex: number;
  players: Map<string, ActivePlayer>;
  timeRemaining: number;
  timerInterval?: NodeJS.Timeout;
  countdownTimeout?: NodeJS.Timeout;
  botTimeouts: NodeJS.Timeout[];
}

const rooms = new Map<string, ServerRoom>();

// Generate 6-digit pin
function generatePin(): string {
  let pin = '';
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(pin));
  return pin;
}

// Bot names and avatars for easy testing
const BOT_NAMES = [
  'Lucas Turbo ⚡', 'Beatriz Gamer 🎮', 'Gabriel Dev 💻', 'Mariana Foguete 🚀',
  'Felipe Mestre 🧠', 'Camila Ninja 🥷', 'Thiago Sabe-Tudo 👑', 'Sofia Curiosa 🦊'
];

function broadcastToRoom(room: ServerRoom, message: object) {
  const json = JSON.stringify(message);

  // Send to host
  if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
    room.hostWs.send(json);
  }

  // Send to players
  for (const p of room.players.values()) {
    if (p.ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(json);
    }
  }
}

function sendTo(ws: WebSocket | undefined, message: object) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function getPublicRoomState(room: ServerRoom, forPlayerId?: string): RoomState {
  const playersList = Array.from(room.players.values()).map(p => ({
    ...p.player,
    hasAnswered: p.hasAnswered,
  })).sort((a, b) => b.score - a.score);

  // Assign ranks & calculate movement diff
  playersList.forEach((p, idx) => {
    const newRank = idx + 1;
    p.rank = newRank;
    if (p.prevRank !== undefined) {
      p.rankDiff = p.prevRank - newRank;
    } else {
      p.rankDiff = 0;
    }
  });

  const curQ: QuizQuestion | undefined = room.quiz.questions[room.currentQuestionIndex];

  // Calculate answer distribution if in REVEAL, LEADERBOARD, or PODIUM
  let answerDistribution: number[] | undefined = undefined;
  if (curQ && (room.state === 'REVEAL' || room.state === 'LEADERBOARD' || room.state === 'PODIUM')) {
    const dist = [0, 0, 0, 0];
    for (const p of room.players.values()) {
      if (p.answerIndex !== undefined && p.answerIndex >= 0 && p.answerIndex < 4) {
        dist[p.answerIndex]++;
      }
    }
    answerDistribution = dist;
  }

  let sanitizedQuestion = undefined;
  if (curQ) {
    sanitizedQuestion = {
      text: curQ.text,
      mediaUrl: curQ.mediaUrl,
      timeLimit: curQ.timeLimit,
      points: curQ.points,
      type: curQ.type,
      options: curQ.options,
      explanation: curQ.explanation,
      // Only disclose correctAnswer when not in active QUESTION phase
      correctAnswer: (room.state === 'QUESTION' || room.state === 'COUNTDOWN') ? undefined : curQ.correctAnswer,
    };
  }

  // Count answered
  let answeredCount = 0;
  for (const p of room.players.values()) {
    if (p.hasAnswered) answeredCount++;
  }

  return {
    pin: room.pin,
    quizTitle: room.quiz.title,
    quizCategory: room.quiz.category,
    state: room.state,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.quiz.questions.length,
    timeRemaining: room.timeRemaining,
    totalTime: curQ ? curQ.timeLimit : 20,
    players: playersList,
    playerCount: playersList.length,
    maxParticipants: room.maxParticipants || 15,
    planName: room.planName || 'Teste Gratuito',
    answeredCount,
    currentQuestion: sanitizedQuestion,
    answerDistribution,
    leaderboard: playersList.slice(0, 5),
    podium: room.state === 'PODIUM' ? {
      first: playersList[0],
      second: playersList[1],
      third: playersList[2],
      allRanked: playersList,
    } : undefined,
  };
}

function broadcastRoomUpdate(room: ServerRoom) {
  // We can broadcast to host
  if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
    room.hostWs.send(JSON.stringify({
      type: 'ROOM_UPDATE',
      room: getPublicRoomState(room),
    }));
  }

  // To each player
  for (const [pId, p] of room.players.entries()) {
    if (p.ws && p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify({
        type: 'ROOM_UPDATE',
        room: getPublicRoomState(room, pId),
        myPlayer: p.player,
      }));
    }
  }
}

function finishCurrentQuestion(room: ServerRoom) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }
  // Clear any pending bot timeouts
  room.botTimeouts.forEach(t => clearTimeout(t));
  room.botTimeouts = [];

  const curQ = room.quiz.questions[room.currentQuestionIndex];
  if (!curQ) return;

  // Save previous score and rank for leaderboard roll-up animation
  for (const [pId, ap] of room.players.entries()) {
    ap.player.prevScore = ap.player.score;
    ap.player.prevRank = ap.player.rank;
  }

  // Calculate scores for all players
  for (const [pId, ap] of room.players.entries()) {
    if (ap.hasAnswered && ap.answerIndex === curQ.correctAnswer) {
      // Calculate speed points: faster gives more points up to question.points
      // formula: points * (1 - ((timeTaken / totalTime) / 2))
      const timeTaken = ap.answerTime || (curQ.timeLimit / 2);
      const speedRatio = Math.max(0, Math.min(1, timeTaken / curQ.timeLimit));
      const scoreGain = Math.round(curQ.points * (1 - speedRatio * 0.5));

      ap.player.streak = (ap.player.streak || 0) + 1;
      const streakBonus = ap.player.streak > 1 ? Math.min(500, (ap.player.streak - 1) * 100) : 0;
      const totalEarned = scoreGain + streakBonus;

      ap.player.score += totalEarned;
      ap.player.lastPointsEarned = totalEarned;
      ap.player.lastAnswerCorrect = true;
    } else {
      ap.player.streak = 0;
      ap.player.lastPointsEarned = 0;
      ap.player.lastAnswerCorrect = false;
    }
    ap.player.lastAnswerIndex = ap.answerIndex;
  }

  room.state = 'REVEAL';
  broadcastRoomUpdate(room);

  // Send individual result to each connected player
  for (const [pId, ap] of room.players.entries()) {
    if (ap.ws && ap.ws.readyState === WebSocket.OPEN) {
      ap.ws.send(JSON.stringify({
        type: 'PLAYER_RESULT',
        correct: ap.player.lastAnswerCorrect,
        points: ap.player.lastPointsEarned || 0,
        score: ap.player.score,
        streak: ap.player.streak,
        correctAnswerIndex: curQ.correctAnswer,
      }));
    }
  }
}

function startQuestion(room: ServerRoom) {
  const curQ = room.quiz.questions[room.currentQuestionIndex];
  if (!curQ) return;

  room.state = 'QUESTION';
  room.timeRemaining = curQ.timeLimit;

  // Reset player answers for this question
  for (const ap of room.players.values()) {
    ap.hasAnswered = false;
    ap.answerIndex = undefined;
    ap.answerTime = undefined;
  }

  broadcastRoomUpdate(room);

  const startTime = Date.now();

  // Schedule bot answers realistically
  room.botTimeouts.forEach(t => clearTimeout(t));
  room.botTimeouts = [];

  for (const [pId, ap] of room.players.entries()) {
    if (ap.player.isBot) {
      // Pick random delay between 2s and timeLimit - 1s
      const delaySec = 1.5 + Math.random() * Math.min(8, curQ.timeLimit - 2);
      const timeout = setTimeout(() => {
        if (room.state !== 'QUESTION') return;
        // Bots have ~75% chance to guess correctly
        const isCorrect = Math.random() < 0.75;
        const answer = isCorrect ? curQ.correctAnswer : Math.floor(Math.random() * curQ.options.length);
        
        ap.hasAnswered = true;
        ap.answerIndex = answer;
        ap.answerTime = delaySec;

        // Check if all players answered
        checkAllAnswered(room);
      }, delaySec * 1000);

      room.botTimeouts.push(timeout);
    }
  }

  // Timer countdown
  if (room.timerInterval) clearInterval(room.timerInterval);
  room.timerInterval = setInterval(() => {
    room.timeRemaining -= 1;
    if (room.timeRemaining <= 0) {
      room.timeRemaining = 0;
      finishCurrentQuestion(room);
    } else {
      broadcastRoomUpdate(room);
    }
  }, 1000);
}

function checkAllAnswered(room: ServerRoom) {
  if (room.state !== 'QUESTION') return;
  const total = room.players.size;
  if (total === 0) return;

  let answered = 0;
  for (const ap of room.players.values()) {
    if (ap.hasAnswered) answered++;
  }

  broadcastRoomUpdate(room);

  if (answered >= total) {
    // Everyone answered! Finish immediately with brief pause
    setTimeout(() => {
      if (room.state === 'QUESTION') {
        finishCurrentQuestion(room);
      }
    }, 400);
  }
}

// WebSocket Setup
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = request.url || '';
  // Check if upgrade is for /ws (or /ws/ with query params)
  if (url.startsWith('/ws')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', (ws) => {
  let boundPin: string | null = null;
  let boundPlayerId: string | null = null;
  let isHost = false;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'HOST_CREATE_ROOM': {
          let hostUserId: string | undefined = undefined;
          let maxParticipants = 15;
          let planName = 'Teste Gratuito (Até 15 Participantes)';

          if (msg.token) {
            const user = getUserByToken(msg.token);
            if (user) {
              const allowance = checkAllowance(user);
              if (!allowance.allowed) {
                sendTo(ws, {
                  type: 'ERROR',
                  errorCode: 'ALLOWANCE_EXHAUSTED',
                  message: allowance.message || 'Limite comercial atingido. Adquira créditos para continuar.',
                });
                return;
              }
              hostUserId = user.id;
              maxParticipants = allowance.maxParticipants || (user.role === 'master' ? 999999 : 15);
              planName = allowance.planName || (user.planStatus === 'basic' ? 'Pacote Básico' : user.role === 'master' ? 'Pacote Master' : 'Teste Gratuito');
            }
          }

          const pin = generatePin();
          const quiz: Quiz = msg.quiz || DEFAULT_QUIZZES[0];

          const newRoom: ServerRoom = {
            pin,
            hostWs: ws,
            hostUserId,
            maxParticipants,
            planName,
            quiz,
            state: 'LOBBY',
            currentQuestionIndex: 0,
            players: new Map(),
            timeRemaining: 0,
            botTimeouts: [],
          };

          rooms.set(pin, newRoom);
          boundPin = pin;
          isHost = true;

          sendTo(ws, {
            type: 'ROOM_CREATED',
            pin,
            room: getPublicRoomState(newRoom),
          });
          break;
        }

        case 'PLAYER_JOIN': {
          const pin = (msg.pin || '').replace(/\s+/g, '');
          const nickname = (msg.nickname || 'Jogador').trim().slice(0, 18);
          const avatar = msg.avatar || '🦊';
          const color = msg.color || '#e21b3c';

          const room = rooms.get(pin);
          if (!room) {
            sendTo(ws, { type: 'ERROR', message: 'PIN da sala inválido ou jogo não encontrado!' });
            return;
          }

          if (room.state !== 'LOBBY') {
            sendTo(ws, { type: 'ERROR', message: 'Este jogo já foi iniciado!' });
            return;
          }

          // Check participant capacity
          const maxCapacity = room.maxParticipants || 15;
          if (room.players.size >= maxCapacity) {
            sendTo(ws, {
              type: 'ERROR',
              message: `Esta sala atingiu a capacidade máxima de ${maxCapacity} participantes para o plano do anfitrião (${room.planName || 'Plano Atual'}).`,
            });
            return;
          }

          // Check if nickname taken
          const existingNick = Array.from(room.players.values()).some(p => p.player.nickname.toLowerCase() === nickname.toLowerCase());
          if (existingNick) {
            sendTo(ws, { type: 'ERROR', message: 'Esse apelido já está em uso nesta sala!' });
            return;
          }

          const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
          const avatarConfig: CharacterConfig = msg.avatarConfig || {
            expression: 'smile',
            skinTone: '#f1c27d',
            hairStyle: 'spiky',
            hairColor: '#5c3826',
            clothingStyle: 'hoodie',
            clothingColor: color,
            accessory: 'none',
            bgColor: color,
          };

          const newPlayer: Player = {
            id: playerId,
            nickname,
            avatar,
            color,
            score: 0,
            streak: 0,
            hasAnswered: false,
            avatarConfig,
          };

          room.players.set(playerId, {
            ws,
            player: newPlayer,
            hasAnswered: false,
          });

          boundPin = pin;
          boundPlayerId = playerId;

          sendTo(ws, {
            type: 'JOINED_SUCCESS',
            pin,
            playerId,
            player: newPlayer,
            room: getPublicRoomState(room, playerId),
          });

          broadcastRoomUpdate(room);
          break;
        }

        case 'PLAYER_UPDATE_AVATAR': {
          if (!boundPin || !boundPlayerId) return;
          const room = rooms.get(boundPin);
          if (!room) return;
          const ap = room.players.get(boundPlayerId);
          if (ap) {
            if (msg.nickname && typeof msg.nickname === 'string') {
              const clean = msg.nickname.trim();
              if (clean) {
                ap.player.nickname = clean.substring(0, 18);
              }
            }
            if (msg.avatarConfig) {
              ap.player.avatarConfig = msg.avatarConfig;
              if (msg.avatarConfig.clothingColor) {
                ap.player.color = msg.avatarConfig.clothingColor;
              }
            }
            broadcastRoomUpdate(room);
          }
          break;
        }

        case 'PLAYER_RENAME': {
          if (!boundPin || !boundPlayerId) return;
          const room = rooms.get(boundPin);
          if (!room) return;
          const ap = room.players.get(boundPlayerId);
          const newName = (msg.nickname || msg.name || '').trim();
          if (ap && newName) {
            ap.player.nickname = newName.substring(0, 18);
            broadcastRoomUpdate(room);
          }
          break;
        }

        case 'HOST_ADD_BOTS': {
          if (!boundPin || !isHost) return;
          const room = rooms.get(boundPin);
          if (!room || room.state !== 'LOBBY') return;

          const maxCapacity = room.maxParticipants || 15;
          const availableSlots = maxCapacity - room.players.size;
          if (availableSlots <= 0) {
            sendTo(ws, {
              type: 'NOTIFICATION',
              message: `Capacidade máxima atingida (${maxCapacity} participantes permitidos neste plano).`,
            });
            return;
          }

          const count = Math.min(msg.count || 1, 8, availableSlots);
          let added = 0;
          for (let i = 0; i < BOT_NAMES.length && added < count; i++) {
            const botName = BOT_NAMES[i];
            const alreadyExists = Array.from(room.players.values()).some(p => p.player.nickname === botName);
            if (!alreadyExists) {
              const botId = 'bot_' + Math.random().toString(36).substring(2, 8);
              const avatars = ['🤖', '🦊', '🦁', '🚀', '⚡', '🐼'];
              const botCharacter = BOT_CHARACTERS[i % BOT_CHARACTERS.length];
              room.players.set(botId, {
                player: {
                  id: botId,
                  nickname: botName,
                  avatar: avatars[added % avatars.length],
                  color: botCharacter.clothingColor,
                  score: 0,
                  streak: 0,
                  isBot: true,
                  avatarConfig: botCharacter,
                },
                hasAnswered: false,
              });
              added++;
            }
          }

          broadcastRoomUpdate(room);
          break;
        }

        case 'HOST_KICK_PLAYER': {
          if (!boundPin || !isHost) return;
          const room = rooms.get(boundPin);
          if (!room || !msg.playerId) return;

          const player = room.players.get(msg.playerId);
          if (player && player.ws) {
            sendTo(player.ws, { type: 'KICKED', message: 'Você foi removido da sala pelo anfitrião.' });
          }
          room.players.delete(msg.playerId);
          broadcastRoomUpdate(room);
          break;
        }

        case 'HOST_START_GAME': {
          if (!boundPin || !isHost) return;
          const room = rooms.get(boundPin);
          if (!room || room.state !== 'LOBBY') return;

          if (room.players.size === 0) {
            sendTo(ws, { type: 'ERROR', message: 'Aguarde ao menos 1 jogador (ou adicione bots) para começar!' });
            return;
          }

          // Deduct 1 hosted quiz allowance if associated with user
          if (room.hostUserId) {
            consumeAllowance(room.hostUserId);
          }

          room.state = 'COUNTDOWN';
          room.currentQuestionIndex = 0;
          room.timeRemaining = 3;
          broadcastRoomUpdate(room);

          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
              room.timeRemaining = count;
              broadcastRoomUpdate(room);
            } else {
              clearInterval(countdownInterval);
              startQuestion(room);
            }
          }, 1000);
          break;
        }

        case 'PLAYER_ANSWER': {
          if (!boundPin || !boundPlayerId) return;
          const room = rooms.get(boundPin);
          if (!room || room.state !== 'QUESTION') return;

          const ap = room.players.get(boundPlayerId);
          if (!ap || ap.hasAnswered) return;

          const curQ = room.quiz.questions[room.currentQuestionIndex];
          if (!curQ) return;

          const timeTaken = curQ.timeLimit - room.timeRemaining;
          ap.hasAnswered = true;
          ap.answerIndex = msg.answerIndex;
          ap.answerTime = Math.max(0.5, timeTaken);

          sendTo(ws, { type: 'ANSWER_RECEIVED', answerIndex: msg.answerIndex });
          checkAllAnswered(room);
          break;
        }

        case 'HOST_NEXT_STAGE': {
          if (!boundPin || !isHost) return;
          const room = rooms.get(boundPin);
          if (!room) return;

          if (room.state === 'REVEAL') {
            // Move to Leaderboard
            room.state = 'LEADERBOARD';
            broadcastRoomUpdate(room);
          } else if (room.state === 'LEADERBOARD') {
            // Check if there are more questions
            if (room.currentQuestionIndex + 1 < room.quiz.questions.length) {
              room.currentQuestionIndex += 1;
              room.state = 'COUNTDOWN';
              room.timeRemaining = 3;
              broadcastRoomUpdate(room);

              let count = 3;
              const countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                  room.timeRemaining = count;
                  broadcastRoomUpdate(room);
                } else {
                  clearInterval(countdownInterval);
                  startQuestion(room);
                }
              }, 1000);
            } else {
              // Final podium!
              room.state = 'PODIUM';
              broadcastRoomUpdate(room);
            }
          }
          break;
        }

        case 'HOST_SKIP_QUESTION': {
          if (!boundPin || !isHost) return;
          const room = rooms.get(boundPin);
          if (!room || room.state !== 'QUESTION') return;
          finishCurrentQuestion(room);
          break;
        }

        case 'HOST_RESTART_GAME': {
          if (!boundPin || !isHost) return;
          const room = rooms.get(boundPin);
          if (!room) return;

          // Reset all player scores
          for (const ap of room.players.values()) {
            ap.player.score = 0;
            ap.player.streak = 0;
            ap.player.lastPointsEarned = 0;
            ap.player.lastAnswerCorrect = false;
            ap.hasAnswered = false;
          }
          room.currentQuestionIndex = 0;
          room.state = 'LOBBY';
          broadcastRoomUpdate(room);
          break;
        }
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => {
    if (boundPin) {
      const room = rooms.get(boundPin);
      if (room) {
        if (isHost) {
          // If host disconnects, give 30 seconds before tearing down
          setTimeout(() => {
            const checkRoom = rooms.get(boundPin!);
            if (checkRoom && checkRoom.hostWs.readyState !== WebSocket.OPEN) {
              if (checkRoom.timerInterval) clearInterval(checkRoom.timerInterval);
              checkRoom.botTimeouts.forEach(t => clearTimeout(t));
              rooms.delete(boundPin!);
            }
          }, 30000);
        } else if (boundPlayerId) {
          // Mark disconnected or remove if in lobby
          if (room.state === 'LOBBY') {
            room.players.delete(boundPlayerId);
            broadcastRoomUpdate(room);
          }
        }
      }
    }
  });
});

// REST API Endpoints

// Get pre-made quizzes
app.get('/api/quizzes', (req, res) => {
  res.json({ quizzes: DEFAULT_QUIZZES });
});

// AI Quiz Generator using Google Gemini API
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, questionCount = 5, difficulty = 'médio' } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'O tema do quiz é obrigatório.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return smart fallback quiz based on topic
      const fallbackQuiz: Quiz = {
        id: 'quiz-' + Date.now(),
        title: `🎯 Quiz Especial: ${topic}`,
        description: `Quiz temático desafiador sobre ${topic}, criado especialmente para a turma!`,
        category: topic,
        coverEmoji: '✨',
        createdAt: Date.now(),
        questions: [
          {
            id: 'q1_' + Date.now(),
            text: `Sobre ${topic}, qual destes aspectos é mais fascinante ou representativo?`,
            timeLimit: 20,
            points: 1000,
            type: 'multiple',
            options: [
              { text: `A sua origem histórica marcante` },
              { text: `O seu impacto na cultura moderna` },
              { text: `A evolução científica e tecnológica` },
              { text: `Todas as alternativas anteriores!` },
            ],
            correctAnswer: 3,
            explanation: `O tema ${topic} abrange múltiplos fatores históricos, culturais e práticos.`,
          },
          {
            id: 'q2_' + Date.now(),
            text: `No universo de ${topic}, o pioneirismo foi fundamental para sua consolidação. Verdadeiro ou Falso?`,
            timeLimit: 15,
            points: 1000,
            type: 'boolean',
            options: [
              { text: 'Verdadeiro' },
              { text: 'Falso' },
            ],
            correctAnswer: 0,
            explanation: 'Os primeiros avanços estabeleceram as bases para tudo o que conhecemos hoje.',
          },
          {
            id: 'q3_' + Date.now(),
            text: `Qual habilidade é mais estimulada ao estudar e praticar conceitos ligados a ${topic}?`,
            timeLimit: 20,
            points: 1000,
            type: 'multiple',
            options: [
              { text: 'Raciocínio lógico e dedução' },
              { text: 'Apenas memorização rápida' },
              { text: 'Nenhum aprendizado relevante' },
              { text: 'Sorte aleatória' },
            ],
            correctAnswer: 0,
            explanation: 'A compreensão aprofundada desenvolve análise crítica e dedução.',
          },
        ],
      };
      return res.json({ quiz: fallbackQuiz });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Você é um criador especialista de quizzes interativos como o Kahoot!
Crie um quiz divertido, educativo e dinâmico com ${questionCount} perguntas sobre o tema: "${topic}".
Dificuldade: ${difficulty}.
Responda EXCLUSIVAMENTE em formato JSON válido com a seguinte estrutura:
{
  "title": "Título chamativo com emoji",
  "description": "Breve descrição empolgante",
  "category": "Categoria curta",
  "coverEmoji": "Emoji que representa o tema",
  "questions": [
    {
      "text": "Texto da pergunta claro e direto",
      "timeLimit": 20,
      "points": 1000,
      "type": "multiple",
      "options": [
        { "text": "Opção A" },
        { "text": "Opção B" },
        { "text": "Opção C" },
        { "text": "Opção D" }
      ],
      "correctAnswer": 0, // índice de 0 a 3 da resposta correta
      "explanation": "Explicação rápida e curiosa do porquê está certa"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const parsedData = JSON.parse(responseText);

    const generatedQuiz: Quiz = {
      id: 'ai-quiz-' + Date.now(),
      title: parsedData.title || `Quiz: ${topic}`,
      description: parsedData.description || `Quiz interativo sobre ${topic}`,
      category: parsedData.category || 'Geral',
      coverEmoji: parsedData.coverEmoji || '🧠',
      createdAt: Date.now(),
      questions: (parsedData.questions || []).map((q: any, idx: number) => ({
        id: `q_${Date.now()}_${idx}`,
        text: q.text,
        timeLimit: q.timeLimit || 20,
        points: q.points || 1000,
        type: q.type || 'multiple',
        options: q.options || [{ text: 'Sim' }, { text: 'Não' }],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || '',
      })),
    };

    return res.json({ quiz: generatedQuiz });
  } catch (error: any) {
    console.error('Error generating quiz with AI:', error);
    return res.status(500).json({ error: 'Erro ao gerar quiz com IA.' });
  }
});

// ==========================================
// Authentication & Commercial Control Routes
// ==========================================

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }
    const result = registerUser(name || 'Usuário', email, password);
    const allowance = checkAllowance(result.user);
    res.json({ ...result, allowance });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao registrar.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório.' });
    }
    const result = loginUser(email, password);
    const allowance = checkAllowance(result.user);
    res.json({ ...result, allowance });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao entrar.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autenticado' });
  const token = authHeader.replace(/^Bearer\s+/, '');
  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Sessão expirada' });
  const allowance = checkAllowance(user);
  res.json({ user, allowance });
});

app.post('/api/auth/quick-master', (_req, res) => {
  try {
    const result = loginUser('Dani.dk.santos@gmail.com', 'master123', true);
    const allowance = checkAllowance(result.user);
    res.json({ ...result, allowance });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/allowance/check', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : '';
  const user = token ? getUserByToken(token) : null;
  const allowance = checkAllowance(user);
  res.json(allowance);
});

app.post('/api/auth/simulate-upgrade', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autenticado' });
  const token = authHeader.replace(/^Bearer\s+/, '');
  const user = getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Usuário inválido' });

  const { planType, addCredits } = req.body;
  const updates: any = {};
  if (planType === 'basic') {
    updates.planStatus = 'basic';
    updates.paidCredits = 10;
    updates.monthlyQuizzesLimit = 10;
    updates.maxParticipants = 30;
    updates.notes = 'Assinatura Pacote Básico Ativa (R$ 8,99/mês - 10 quizzes e até 30 participantes)';
  } else if (planType === 'pro' || planType === 'master' || planType === 'unlimited') {
    updates.planStatus = 'unlimited';
    updates.paidCredits = 9999;
    updates.monthlyQuizzesLimit = 999999;
    updates.maxParticipants = 999999;
    updates.notes = 'Assinatura Pacote Master Ativa (R$ 18,99/mês - Quizzes & Participantes Ilimitados)';
  } else if (addCredits) {
    updates.paidCredits = (user.paidCredits || 0) + Number(addCredits);
    updates.notes = `Pacote +${addCredits} Quizzes ativado`;
  }

  const updated = updateUserByAdmin(user.id, updates);
  res.json({ user: updated, allowance: checkAllowance(updated) });
});

// ==========================================
// Master Admin Backoffice Routes
// ==========================================

app.get('/api/admin/users', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : '';
  const user = token ? getUserByToken(token) : null;
  if (!user || user.role !== 'master') {
    return res.status(403).json({ error: 'Acesso restrito ao Usuário Master.' });
  }
  res.json({ users: getAllUsersAdmin(), metrics: getAdminMetrics() });
});

app.post('/api/admin/users', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : '';
  const user = token ? getUserByToken(token) : null;
  if (!user || user.role !== 'master') {
    return res.status(403).json({ error: 'Acesso restrito ao Usuário Master.' });
  }
  try {
    const { name, email, password, planStatus, paidCredits, notes } = req.body;
    const created = registerUser(name, email, password || 'senha123');
    if (planStatus || paidCredits !== undefined || notes) {
      updateUserByAdmin(created.user.id, {
        planStatus: planStatus || 'free_trial',
        paidCredits: paidCredits || 0,
        notes,
      });
    }
    res.json({ success: true, users: getAllUsersAdmin(), metrics: getAdminMetrics() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/users/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : '';
  const user = token ? getUserByToken(token) : null;
  if (!user || user.role !== 'master') {
    return res.status(403).json({ error: 'Acesso restrito ao Usuário Master.' });
  }
  try {
    const updated = updateUserByAdmin(req.params.id, req.body);
    res.json({ user: updated, metrics: getAdminMetrics() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : '';
  const user = token ? getUserByToken(token) : null;
  if (!user || user.role !== 'master') {
    return res.status(403).json({ error: 'Acesso restrito ao Usuário Master.' });
  }
  try {
    deleteUserByAdmin(req.params.id);
    res.json({ success: true, metrics: getAdminMetrics() });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/metrics', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : '';
  const user = token ? getUserByToken(token) : null;
  if (!user || user.role !== 'master') {
    return res.status(403).json({ error: 'Acesso restrito ao Usuário Master.' });
  }
  res.json(getAdminMetrics());
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`QuizPop! server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
