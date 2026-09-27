export type ShapeType = 'triangle' | 'diamond' | 'circle' | 'square';

export interface QuizOption {
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  timeLimit: number; // in seconds: 10, 20, 30, 60
  points: number; // 1000 standard, 2000 double, 0 none
  type: 'multiple' | 'boolean';
  options: QuizOption[];
  correctAnswer: number; // index: 0, 1, 2, 3
  mediaUrl?: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  coverEmoji: string;
  themeColor?: string;
  questions: QuizQuestion[];
  createdAt: number;
}

export type GameState = 
  | 'LOBBY' 
  | 'COUNTDOWN' 
  | 'QUESTION' 
  | 'REVEAL' 
  | 'LEADERBOARD' 
  | 'PODIUM';

export interface CharacterConfig {
  expression: 'smile' | 'cool' | 'wink' | 'focused' | 'laugh' | 'shocked' | 'starEyes' | 'nerd';
  skinTone: string;
  hairStyle: 'short' | 'curly' | 'spiky' | 'long' | 'cap' | 'capBack' | 'ponytail' | 'afro' | 'beanie' | 'bald';
  hairColor: string;
  clothingStyle: 'tshirt' | 'hoodie' | 'jacket' | 'suit' | 'striped' | 'jersey' | 'overalls' | 'cape';
  clothingColor: string;
  accessory: 'none' | 'glasses' | 'sunglasses' | 'roundGlasses' | 'pixelShades' | 'headphones' | 'crown' | 'mustache' | 'piratePatch' | 'vrHeadset' | 'partyHat';
  bgColor: string;
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  color: string;
  score: number;
  streak: number;
  isBot?: boolean;
  hasAnswered?: boolean;
  lastPointsEarned?: number;
  lastAnswerCorrect?: boolean;
  lastAnswerIndex?: number;
  rank?: number;
  prevRank?: number;
  rankDiff?: number;
  prevScore?: number;
  avatarConfig?: CharacterConfig;
}

export interface RoomState {
  pin: string;
  quizTitle: string;
  quizCategory: string;
  state: GameState;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  totalTime: number;
  players: Player[];
  playerCount: number;
  maxParticipants?: number;
  planName?: string;
  answeredCount: number;
  currentQuestion?: {
    text: string;
    mediaUrl?: string;
    timeLimit: number;
    points: number;
    type: 'multiple' | 'boolean';
    options: { text: string }[];
    // Correct answer is hidden during 'QUESTION' phase to prevent inspect cheating
    correctAnswer?: number;
    explanation?: string;
  };
  answerDistribution?: number[]; // [count0, count1, count2, count3]
  leaderboard?: Player[];
  podium?: {
    first?: Player;
    second?: Player;
    third?: Player;
    allRanked?: Player[];
  };
}

export const KAHOOT_COLORS = [
  { name: 'Vermelho', shape: 'triangle', bg: 'bg-[#e21b3c]', hover: 'hover:bg-[#c01733]', text: 'text-white', icon: '▲', border: 'border-[#c01733]' },
  { name: 'Azul', shape: 'diamond', bg: 'bg-[#1368ce]', hover: 'hover:bg-[#0f54a8]', text: 'text-white', icon: '◆', border: 'border-[#0f54a8]' },
  { name: 'Amarelo', shape: 'circle', bg: 'bg-[#d89e00]', hover: 'hover:bg-[#b58400]', text: 'text-white', icon: '●', border: 'border-[#b58400]' },
  { name: 'Verde', shape: 'square', bg: 'bg-[#26890c]', hover: 'hover:bg-[#1d6f09]', text: 'text-white', icon: '■', border: 'border-[#1d6f09]' },
];

export const PLAYER_AVATARS = [
  '🦊', '🦁', '🐯', '🐼', '🐨', '🦄', '🐸', '🐙',
  '🚀', '⚡', '🔥', '💎', '🎮', '🍕', '🎸', '👑'
];

export const PLAYER_COLORS = [
  '#e21b3c', '#1368ce', '#ffa602', '#26890c', 
  '#864cbf', '#e91e63', '#00b0ff', '#00e676'
];
