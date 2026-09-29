import React from 'react';
import { CharacterConfig } from '../types';

export const SKIN_TONES = [
  { id: '#ffdbac', label: 'Claro 1', hex: '#ffdbac' },
  { id: '#f1c27d', label: 'Claro 2', hex: '#f1c27d' },
  { id: '#e0ac69', label: 'Médio', hex: '#e0ac69' },
  { id: '#c68642', label: 'Bronze', hex: '#c68642' },
  { id: '#8d5524', label: 'Escuro 1', hex: '#8d5524' },
  { id: '#4a2c11', label: 'Escuro 2', hex: '#4a2c11' },
  { id: '#38bdf8', label: 'Alien Ciano', hex: '#38bdf8' },
  { id: '#c084fc', label: 'Místico Lilás', hex: '#c084fc' },
];

export const HAIR_COLORS = [
  { id: '#1e1b18', label: 'Preto', hex: '#1e1b18' },
  { id: '#5c3826', label: 'Castanho', hex: '#5c3826' },
  { id: '#e5c158', label: 'Loiro', hex: '#e5c158' },
  { id: '#b55239', label: 'Ruivo', hex: '#b55239' },
  { id: '#3b82f6', label: 'Azul Elétrico', hex: '#3b82f6' },
  { id: '#ec4899', label: 'Rosa Neon', hex: '#ec4899' },
  { id: '#10b981', label: 'Verde', hex: '#10b981' },
  { id: '#e2e8f0', label: 'Prata / Branco', hex: '#e2e8f0' },
];

export const CLOTHING_COLORS = [
  { id: '#e21b3c', label: 'Vermelho Rubi', hex: '#e21b3c' },
  { id: '#1368ce', label: 'Azul Real', hex: '#1368ce' },
  { id: '#d89e00', label: 'Amarelo Ouro', hex: '#d89e00' },
  { id: '#26890c', label: 'Verde Floresta', hex: '#26890c' },
  { id: '#864cbf', label: 'Roxo Místico', hex: '#864cbf' },
  { id: '#0ea5e9', label: 'Ciano Vibrante', hex: '#0ea5e9' },
  { id: '#0f172a', label: 'Preto Noite', hex: '#0f172a' },
  { id: '#f97316', label: 'Laranja Fogo', hex: '#f97316' },
];

export const BG_COLORS = [
  '#46178f', '#1368ce', '#e21b3c', '#26890c', '#d89e00', '#0284c7', '#9333ea', '#e11d48'
];

export interface CharacterPreset {
  id: string;
  name: string;
  role: string;
  icon: string;
  config: CharacterConfig;
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'gamer',
    name: 'Gamer Pro',
    role: 'Competitivo',
    icon: '🎧',
    config: {
      expression: 'cool',
      skinTone: '#f1c27d',
      hairStyle: 'spiky',
      hairColor: '#3b82f6',
      clothingStyle: 'hoodie',
      clothingColor: '#e21b3c',
      accessory: 'headphones',
      bgColor: '#1368ce',
    },
  },
  {
    id: 'nerd_genius',
    name: 'Gênio dos Quizzes',
    role: 'Sabe-tudo',
    icon: '🤓',
    config: {
      expression: 'nerd',
      skinTone: '#ffdbac',
      hairStyle: 'short',
      hairColor: '#5c3826',
      clothingStyle: 'suit',
      clothingColor: '#d89e00',
      accessory: 'roundGlasses',
      bgColor: '#46178f',
    },
  },
  {
    id: 'starlight',
    name: 'Mago Estelar',
    role: 'Místico',
    icon: '✨',
    config: {
      expression: 'starEyes',
      skinTone: '#c084fc',
      hairStyle: 'long',
      hairColor: '#e2e8f0',
      clothingStyle: 'cape',
      clothingColor: '#864cbf',
      accessory: 'crown',
      bgColor: '#9333ea',
    },
  },
  {
    id: 'thug_pixel',
    name: 'Lenda 8-Bit',
    role: 'Meme King',
    icon: '😎',
    config: {
      expression: 'cool',
      skinTone: '#c68642',
      hairStyle: 'capBack',
      hairColor: '#1e1b18',
      clothingStyle: 'jacket',
      clothingColor: '#0f172a',
      accessory: 'pixelShades',
      bgColor: '#26890c',
    },
  },
  {
    id: 'tech_vr',
    name: 'Explorador VR',
    role: 'Futurista',
    icon: '🥽',
    config: {
      expression: 'focused',
      skinTone: '#38bdf8',
      hairStyle: 'afro',
      hairColor: '#1e1b18',
      clothingStyle: 'jersey',
      clothingColor: '#0ea5e9',
      accessory: 'vrHeadset',
      bgColor: '#0284c7',
    },
  },
  {
    id: 'party_star',
    name: 'Festeiro VIP',
    role: 'Diversão Pura',
    icon: '🎉',
    config: {
      expression: 'laugh',
      skinTone: '#e0ac69',
      hairStyle: 'curly',
      hairColor: '#b55239',
      clothingStyle: 'striped',
      clothingColor: '#f97316',
      accessory: 'partyHat',
      bgColor: '#e11d48',
    },
  },
  {
    id: 'gentleman',
    name: 'Lorde dos Livros',
    role: 'Elegante',
    icon: '🧐',
    config: {
      expression: 'smile',
      skinTone: '#8d5524',
      hairStyle: 'short',
      hairColor: '#1e1b18',
      clothingStyle: 'suit',
      clothingColor: '#1368ce',
      accessory: 'mustache',
      bgColor: '#d89e00',
    },
  },
  {
    id: 'pirate_captain',
    name: 'Capitão Pirata',
    role: 'Caçador de Pontos',
    icon: '🏴‍☠️',
    config: {
      expression: 'focused',
      skinTone: '#4a2c11',
      hairStyle: 'beanie',
      hairColor: '#1e1b18',
      clothingStyle: 'overalls',
      clothingColor: '#e21b3c',
      accessory: 'piratePatch',
      bgColor: '#46178f',
    },
  },
];

export function getRandomCharacter(seedIndex?: number): CharacterConfig {
  const expressions: CharacterConfig['expression'][] = [
    'smile', 'cool', 'wink', 'focused', 'laugh', 'shocked', 'starEyes', 'nerd'
  ];
  const hairStyles: CharacterConfig['hairStyle'][] = [
    'short', 'curly', 'spiky', 'long', 'cap', 'capBack', 'ponytail', 'afro', 'beanie', 'bald'
  ];
  const clothingStyles: CharacterConfig['clothingStyle'][] = [
    'tshirt', 'hoodie', 'jacket', 'suit', 'striped', 'jersey', 'overalls', 'cape'
  ];
  const accessories: CharacterConfig['accessory'][] = [
    'none', 'glasses', 'sunglasses', 'roundGlasses', 'pixelShades', 'headphones', 'crown', 'mustache', 'piratePatch', 'vrHeadset', 'partyHat'
  ];

  function pick<T>(arr: T[], offset = 0): T {
    if (seedIndex !== undefined) {
      return arr[(seedIndex + offset) % arr.length];
    }
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    expression: pick(expressions, 1),
    skinTone: pick(SKIN_TONES, 2).hex,
    hairStyle: pick(hairStyles, 3),
    hairColor: pick(HAIR_COLORS, 4).hex,
    clothingStyle: pick(clothingStyles, 5),
    clothingColor: pick(CLOTHING_COLORS, 6).hex,
    accessory: pick(accessories, 7),
    bgColor: pick(BG_COLORS, 8),
  };
}

export const DEFAULT_CHARACTER: CharacterConfig = CHARACTER_PRESETS[0].config;

interface CharacterAvatarProps {
  config?: CharacterConfig;
  size?: number | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animate?: boolean;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  config = DEFAULT_CHARACTER,
  size = 'md',
  className = '',
  animate = false,
}) => {
  const sizeMap = {
    sm: 36,
    md: 48,
    lg: 72,
    xl: 104,
    '2xl': 140,
  };

  const dim = typeof size === 'number' ? size : sizeMap[size] || 48;

  const {
    expression = 'smile',
    skinTone = '#f1c27d',
    hairStyle = 'spiky',
    hairColor = '#5c3826',
    clothingStyle = 'hoodie',
    clothingColor = '#e21b3c',
    accessory = 'none',
    bgColor = '#46178f',
  } = config;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl overflow-hidden shadow-md select-none flex-shrink-0 ${
        animate ? 'hover:scale-105 transition-transform duration-200' : ''
      } ${className}`}
      style={{
        width: dim,
        height: dim,
        backgroundColor: bgColor,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`grad-${bgColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient background highlight */}
        <circle cx="50" cy="50" r="50" fill={`url(#grad-${bgColor.replace('#', '')})`} />

        {/* BODY & CLOTHING */}
        <g id="clothing">
          {clothingStyle === 'hoodie' && (
            <>
              <path
                d="M18 96 C18 72, 34 68, 50 68 C66 68, 82 72, 82 96 Z"
                fill={clothingColor}
              />
              <path
                d="M32 68 C34 76, 42 82, 50 82 C58 82, 66 76, 68 68 Z"
                fill="#ffffff"
                opacity="0.25"
              />
              <path d="M44 76 L44 87" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
              <path d="M56 76 L56 87" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            </>
          )}

          {clothingStyle === 'tshirt' && (
            <>
              <path
                d="M20 96 C20 74, 34 70, 50 70 C66 70, 80 74, 80 96 Z"
                fill={clothingColor}
              />
              <path
                d="M38 70 C41 77, 50 79, 59 70 Z"
                fill={skinTone}
              />
              <path
                d="M38 70 C41 77, 50 79, 59 70"
                stroke="#000000"
                strokeWidth="1.5"
                fill="none"
                opacity="0.3"
              />
            </>
          )}

          {clothingStyle === 'jacket' && (
            <>
              <path
                d="M18 96 C18 72, 34 68, 50 68 C66 68, 82 72, 82 96 Z"
                fill={clothingColor}
              />
              {/* White athletic track stripes */}
              <path d="M25 76 L25 96" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
              <path d="M75 76 L75 96" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
              {/* Zipper */}
              <path d="M50 70 L50 96" stroke="#fbbf24" strokeWidth="2" strokeDasharray="2 1" />
            </>
          )}

          {clothingStyle === 'suit' && (
            <>
              <path
                d="M18 96 C18 72, 34 68, 50 68 C66 68, 82 72, 82 96 Z"
                fill="#1e293b"
              />
              <polygon points="50,70 42,72 50,88 58,72" fill="#ffffff" />
              <polygon points="50,73 47,88 50,96 53,88" fill={clothingColor} />
            </>
          )}

          {clothingStyle === 'striped' && (
            <>
              <path
                d="M20 96 C20 74, 34 70, 50 70 C66 70, 80 74, 80 96 Z"
                fill={clothingColor}
              />
              <path d="M22 80 C36 80, 64 80, 78 80" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
              <path d="M20 88 C36 88, 64 88, 80 88" stroke="#ffffff" strokeWidth="3" opacity="0.85" />
            </>
          )}

          {clothingStyle === 'jersey' && (
            <>
              <path
                d="M24 96 C24 74, 36 70, 50 70 C64 70, 76 74, 76 96 Z"
                fill={clothingColor}
              />
              <circle cx="21" cy="78" r="7" fill={bgColor} />
              <circle cx="79" cy="78" r="7" fill={bgColor} />
              <text x="50" y="88" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                7
              </text>
            </>
          )}

          {clothingStyle === 'overalls' && (
            <>
              {/* Undershirt */}
              <path
                d="M20 96 C20 74, 34 70, 50 70 C66 70, 80 74, 80 96 Z"
                fill="#ffffff"
              />
              {/* Blue Denim Bib */}
              <path
                d="M32 96 L32 80 C32 78, 68 78, 68 80 L68 96 Z"
                fill={clothingColor}
              />
              {/* Straps */}
              <path d="M34 72 L34 82" stroke={clothingColor} strokeWidth="5" />
              <path d="M66 72 L66 82" stroke={clothingColor} strokeWidth="5" />
              {/* Silver buttons */}
              <circle cx="34" cy="80" r="1.8" fill="#fbbf24" />
              <circle cx="66" cy="80" r="1.8" fill="#fbbf24" />
            </>
          )}

          {clothingStyle === 'cape' && (
            <>
              {/* Flowing superhero cape in background */}
              <path
                d="M14 96 C14 66, 32 66, 50 66 C68 66, 86 66, 86 96 Z"
                fill="#b91c1c"
              />
              {/* Inner tunic */}
              <path
                d="M22 96 C22 74, 34 70, 50 70 C66 70, 78 74, 78 96 Z"
                fill={clothingColor}
              />
              {/* Gold star medallion fastener */}
              <polygon points="50,68 52,72 56,73 53,76 54,80 50,78 46,80 47,76 44,73 48,72" fill="#fbbf24" />
            </>
          )}
        </g>

        {/* NECK */}
        <rect x="44" y="60" width="12" height="12" rx="3" fill={skinTone} />
        <rect x="44" y="60" width="12" height="4" fill="#000000" opacity="0.12" />

        {/* HEAD & EARS */}
        <g id="head">
          <circle cx="27" cy="46" r="6" fill={skinTone} />
          <circle cx="27" cy="46" r="3.5" fill="#000000" opacity="0.1" />
          <circle cx="73" cy="46" r="6" fill={skinTone} />
          <circle cx="73" cy="46" r="3.5" fill="#000000" opacity="0.1" />

          <rect
            x="28"
            y="24"
            width="44"
            height="44"
            rx="18"
            fill={skinTone}
          />
          {/* Cheek blush */}
          <circle cx="36" cy="52" r="3.5" fill="#f43f5e" opacity="0.25" />
          <circle cx="64" cy="52" r="3.5" fill="#f43f5e" opacity="0.25" />
        </g>

        {/* EXPRESSION */}
        <g id="expression">
          {expression === 'smile' && (
            <>
              <path d="M35 36 Q40 33 45 36" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M55 36 Q60 33 65 36" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <circle cx="40" cy="44" r="4.2" fill="#1e1e1e" />
              <circle cx="38.5" cy="42.5" r="1.5" fill="#ffffff" />
              <circle cx="60" cy="44" r="4.2" fill="#1e1e1e" />
              <circle cx="58.5" cy="42.5" r="1.5" fill="#ffffff" />
              <path d="M43 54 Q50 62 57 54" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {expression === 'cool' && (
            <>
              <path d="M35 34 L45 37" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M55 36 L65 34" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M36 43 Q40 40 44 43" stroke="#1e1e1e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="40" cy="45" r="2.2" fill="#1e1e1e" />
              <path d="M56 43 Q60 40 64 43" stroke="#1e1e1e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="60" cy="45" r="2.2" fill="#1e1e1e" />
              <path d="M45 56 Q52 57 58 52" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {expression === 'wink' && (
            <>
              <path d="M35 36 Q40 33 45 36" stroke="#222222" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M55 35 Q60 33 65 36" stroke="#222222" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M36 44 Q40 41 44 44" stroke="#1e1e1e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="60" cy="44" r="4.2" fill="#1e1e1e" />
              <circle cx="58.5" cy="42.5" r="1.5" fill="#ffffff" />
              <path d="M43 54 Q50 62 57 54 Z" fill="#ffffff" stroke="#1e1e1e" strokeWidth="2" strokeLinejoin="round" />
            </>
          )}

          {expression === 'laugh' && (
            <>
              <path d="M35 44 Q40 39 45 44" stroke="#1e1e1e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M55 44 Q60 39 65 44" stroke="#1e1e1e" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M42 52 Q50 66 58 52 Z" fill="#b91c1c" stroke="#1e1e1e" strokeWidth="2" />
              <path d="M46 59 Q50 63 54 59" fill="#f43f5e" />
            </>
          )}

          {expression === 'focused' && (
            <>
              <path d="M35 38 L45 35" stroke="#222222" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M55 35 L65 38" stroke="#222222" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="41" cy="43" r="3.8" fill="#1e1e1e" />
              <circle cx="59" cy="43" r="3.8" fill="#1e1e1e" />
              <circle cx="40" cy="42" r="1.2" fill="#ffffff" />
              <circle cx="58" cy="42" r="1.2" fill="#ffffff" />
              <path d="M44 55 Q50 58 56 55" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {expression === 'shocked' && (
            <>
              <path d="M35 32 Q40 30 45 32" stroke="#222222" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M55 32 Q60 30 65 32" stroke="#222222" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="40" cy="43" r="5" fill="#1e1e1e" />
              <circle cx="39" cy="41" r="2" fill="#ffffff" />
              <circle cx="60" cy="43" r="5" fill="#1e1e1e" />
              <circle cx="59" cy="41" r="2" fill="#ffffff" />
              <ellipse cx="50" cy="56" rx="4" ry="5.5" fill="#1e1e1e" />
            </>
          )}

          {expression === 'starEyes' && (
            <>
              <path d="M35 35 Q40 31 45 35" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M55 35 Q60 31 65 35" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Star Eyes! */}
              <polygon points="40,38 41.5,42 45.5,42.5 42.5,45 43.5,49 40,46.5 36.5,49 37.5,45 34.5,42.5 38.5,42" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
              <polygon points="60,38 61.5,42 65.5,42.5 62.5,45 63.5,49 60,46.5 56.5,49 57.5,45 54.5,42.5 58.5,42" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
              <path d="M42 53 Q50 63 58 53 Z" fill="#ffffff" stroke="#1e1e1e" strokeWidth="2" />
            </>
          )}

          {expression === 'nerd' && (
            <>
              <path d="M35 33 Q40 36 45 33" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M55 33 Q60 36 65 33" stroke="#222222" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <circle cx="40" cy="43" r="4.2" fill="#1e1e1e" />
              <circle cx="38.5" cy="41.5" r="1.5" fill="#ffffff" />
              <circle cx="60" cy="43" r="4.2" fill="#1e1e1e" />
              <circle cx="58.5" cy="41.5" r="1.5" fill="#ffffff" />
              {/* Cute buck teeth */}
              <path d="M44 54 Q50 56 56 54" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" fill="none" />
              <rect x="47" y="54" width="3" height="4" fill="#ffffff" stroke="#1e1e1e" strokeWidth="0.8" />
              <rect x="50" y="54" width="3" height="4" fill="#ffffff" stroke="#1e1e1e" strokeWidth="0.8" />
            </>
          )}
        </g>

        {/* HAIR */}
        <g id="hair">
          {hairStyle === 'short' && (
            <path
              d="M26 36 C24 22, 38 15, 50 15 C62 15, 76 22, 74 36 C70 28, 62 25, 52 26 C42 27, 34 32, 26 36 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'curly' && (
            <g fill={hairColor}>
              <circle cx="32" cy="24" r="8" />
              <circle cx="44" cy="18" r="9" />
              <circle cx="56" cy="18" r="9" />
              <circle cx="68" cy="24" r="8" />
              <circle cx="26" cy="32" r="7" />
              <circle cx="74" cy="32" r="7" />
              <circle cx="50" cy="24" r="6" />
            </g>
          )}

          {hairStyle === 'spiky' && (
            <path
              d="M25 36 L28 20 L36 24 L42 13 L50 22 L58 13 L64 24 L72 20 L75 36 C68 28, 58 24, 50 25 C42 26, 32 30, 25 36 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'long' && (
            <g fill={hairColor}>
              <path d="M26 36 C24 20, 38 16, 50 16 C62 16, 76 20, 74 36 C70 28, 62 25, 50 25 C38 25, 30 28, 26 36 Z" />
              <path d="M24 34 C20 48, 22 64, 25 72 C28 72, 29 58, 29 46 Z" />
              <path d="M76 34 C80 48, 78 64, 75 72 C72 72, 71 58, 71 46 Z" />
            </g>
          )}

          {hairStyle === 'cap' && (
            <g>
              <path
                d="M26 32 C26 18, 40 16, 50 16 C60 16, 74 18, 74 32 Z"
                fill={hairColor}
              />
              <path
                d="M22 32 C22 30, 48 28, 78 32 C82 34, 76 37, 72 37 C54 35, 34 35, 22 32 Z"
                fill="#ffffff"
                opacity="0.9"
              />
              <circle cx="50" cy="16" r="2.5" fill="#ffffff" />
            </g>
          )}

          {hairStyle === 'capBack' && (
            <g>
              <path
                d="M26 32 C26 18, 40 16, 50 16 C60 16, 74 18, 74 32 Z"
                fill={hairColor}
              />
              {/* Back adjustment strap & peak facing backward */}
              <rect x="42" y="30" width="16" height="5" rx="2" fill="#0f172a" />
              <path d="M44 32 L40 38 L60 38 L56 32 Z" fill="#ffffff" opacity="0.8" />
              <circle cx="50" cy="16" r="2.5" fill="#ffffff" />
            </g>
          )}

          {hairStyle === 'ponytail' && (
            <g fill={hairColor}>
              <path d="M26 34 C26 22, 38 18, 50 18 C62 18, 74 22, 74 34 C68 26, 58 24, 50 24 C42 24, 32 26, 26 34 Z" />
              <path d="M68 22 C78 16, 88 24, 86 38 C80 42, 74 32, 70 26 Z" />
              <circle cx="70" cy="23" r="3.5" fill="#f43f5e" />
            </g>
          )}

          {hairStyle === 'afro' && (
            <path
              d="M20 40 C14 26, 24 10, 50 10 C76 10, 86 26, 80 40 C86 52, 78 62, 72 60 C76 44, 72 32, 50 30 C28 32, 24 44, 28 60 C22 62, 14 52, 20 40 Z"
              fill={hairColor}
            />
          )}

          {hairStyle === 'beanie' && (
            <g>
              <path
                d="M26 36 C24 16, 40 14, 50 14 C60 14, 76 16, 74 36 Z"
                fill={hairColor}
              />
              {/* Folded rim */}
              <rect x="25" y="30" width="50" height="9" rx="4" fill="#ffffff" opacity="0.3" />
              {/* Pom-pom */}
              <circle cx="50" cy="12" r="4.5" fill="#ffffff" />
            </g>
          )}

          {hairStyle === 'bald' && (
            <path d="M36 28 Q44 26 48 30" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" fill="none" />
          )}
        </g>

        {/* ACCESSORIES */}
        <g id="accessory">
          {accessory === 'glasses' && (
            <g stroke="#1e293b" strokeWidth="2.5" fill="none">
              <rect x="33" y="38" width="14" height="11" rx="3" fill="#ffffff" fillOpacity="0.25" />
              <rect x="53" y="38" width="14" height="11" rx="3" fill="#ffffff" fillOpacity="0.25" />
              <path d="M47 43 L53 43" />
              <path d="M28 42 L33 42" />
              <path d="M67 42 L72 42" />
            </g>
          )}

          {accessory === 'roundGlasses' && (
            <g stroke="#fbbf24" strokeWidth="2.2" fill="none">
              <circle cx="40" cy="44" r="7.5" fill="#ffffff" fillOpacity="0.25" />
              <circle cx="60" cy="44" r="7.5" fill="#ffffff" fillOpacity="0.25" />
              <path d="M47.5 44 L52.5 44" />
              <path d="M28 44 L32.5 44" />
              <path d="M67.5 44 L72 44" />
            </g>
          )}

          {accessory === 'sunglasses' && (
            <g fill="#0f172a" stroke="#000000" strokeWidth="1.5">
              <path d="M31 38 L48 38 L46 51 C46 53, 34 53, 32 49 Z" />
              <path d="M52 38 L69 38 L68 49 C66 53, 54 53, 54 51 Z" />
              <rect x="47" y="38" width="6" height="3" fill="#0f172a" stroke="none" />
              <line x1="34" y1="41" x2="42" y2="47" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <line x1="55" y1="41" x2="63" y2="47" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </g>
          )}

          {accessory === 'pixelShades' && (
            <g fill="#000000">
              <rect x="31" y="40" width="17" height="8" />
              <rect x="52" y="40" width="17" height="8" />
              <rect x="47" y="41" width="6" height="3" />
              <rect x="33" y="42" width="3" height="3" fill="#ffffff" />
              <rect x="37" y="44" width="3" height="3" fill="#ffffff" />
              <rect x="54" y="42" width="3" height="3" fill="#ffffff" />
              <rect x="58" y="44" width="3" height="3" fill="#ffffff" />
            </g>
          )}

          {accessory === 'headphones' && (
            <g>
              <path
                d="M24 45 C20 18, 80 18, 76 45"
                stroke="#1e293b"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <rect x="20" y="38" width="7" height="15" rx="3.5" fill="#f43f5e" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="73" y="38" width="7" height="15" rx="3.5" fill="#f43f5e" stroke="#1e293b" strokeWidth="1.5" />
            </g>
          )}

          {accessory === 'crown' && (
            <g>
              <polygon
                points="34,22 30,10 42,16 50,7 58,16 70,10 66,22"
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="38" cy="18" r="1.5" fill="#ef4444" />
              <circle cx="50" cy="14" r="2" fill="#3b82f6" />
              <circle cx="62" cy="18" r="1.5" fill="#10b981" />
            </g>
          )}

          {accessory === 'mustache' && (
            <g fill="#372013">
              {/* Stylish handlebar gentleman's mustache */}
              <path d="M50 54 C46 51, 38 50, 34 54 C32 56, 36 58, 40 56 C44 54, 48 56, 50 58 C52 56, 56 54, 60 56 C64 58, 68 56, 66 54 C62 50, 54 51, 50 54 Z" />
            </g>
          )}

          {accessory === 'piratePatch' && (
            <g>
              {/* Strap across head */}
              <line x1="28" y1="36" x2="72" y2="48" stroke="#1e1e1e" strokeWidth="1.8" />
              {/* Patch over left eye */}
              <rect x="36" y="39" width="9" height="9" rx="2" fill="#0f172a" stroke="#1e1e1e" strokeWidth="1.5" />
            </g>
          )}

          {accessory === 'vrHeadset' && (
            <g>
              {/* Futuristic VR Visor */}
              <rect x="29" y="38" width="42" height="14" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <rect x="34" y="42" width="32" height="4" rx="2" fill="#00f5ff" />
              {/* Strap */}
              <path d="M29 45 L25 45" stroke="#334155" strokeWidth="3" />
              <path d="M71 45 L75 45" stroke="#334155" strokeWidth="3" />
            </g>
          )}

          {accessory === 'partyHat' && (
            <g>
              {/* Festive party cone */}
              <polygon points="50,4 38,24 62,24" fill="#ec4899" stroke="#be185d" strokeWidth="1" />
              {/* Polka dots */}
              <circle cx="48" cy="18" r="1.5" fill="#facc15" />
              <circle cx="54" cy="14" r="1.5" fill="#38bdf8" />
              <circle cx="44" cy="21" r="1.5" fill="#4ade80" />
              {/* Top pom-pom */}
              <circle cx="50" cy="3" r="3" fill="#facc15" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
