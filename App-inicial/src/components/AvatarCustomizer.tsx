import React, { useState, useEffect } from 'react';
import { CharacterConfig } from '../types';
import {
  CharacterAvatar,
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_COLORS,
  BG_COLORS,
  CHARACTER_PRESETS,
  getRandomCharacter,
} from './CharacterAvatar';
import { Sparkles, Dices, Check, X, Smile, Shirt, Glasses, Palette, Users, Wand2, Pencil, User } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface AvatarCustomizerProps {
  config: CharacterConfig;
  onChange: (newConfig: CharacterConfig) => void;
  nickname?: string;
  onRename?: (newName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'presets' | 'face' | 'hair' | 'clothes' | 'accessories' | 'colors';

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  config,
  onChange,
  nickname,
  onRename,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [nameInput, setNameInput] = useState<string>(nickname || '');

  useEffect(() => {
    if (nickname !== undefined) {
      setNameInput(nickname);
    }
  }, [nickname]);

  if (!isOpen) return null;

  const handleSelectOption = <T extends Partial<CharacterConfig>>(patch: T) => {
    sounds.playAnswerSelect();
    onChange({ ...config, ...patch });
  };

  const handleRandomize = () => {
    sounds.playPlayerJoin();
    onChange(getRandomCharacter());
  };

  const handleSave = () => {
    sounds.playPlayerJoin();
    if (onRename && nameInput.trim()) {
      onRename(nameInput.trim());
    }
    onClose();
  };

  const expressions: { id: CharacterConfig['expression']; label: string; icon: string }[] = [
    { id: 'smile', label: 'Alegre', icon: '😊' },
    { id: 'cool', label: 'Descolado', icon: '😎' },
    { id: 'wink', label: 'Piscadinha', icon: '😉' },
    { id: 'focused', label: 'Focado', icon: '🔥' },
    { id: 'laugh', label: 'Gargalhada', icon: '😄' },
    { id: 'shocked', label: 'Surpreso', icon: '😲' },
    { id: 'starEyes', label: 'Estelar', icon: '🤩' },
    { id: 'nerd', label: 'Gênio Nerd', icon: '🤓' },
  ];

  const hairStyles: { id: CharacterConfig['hairStyle']; label: string; icon: string }[] = [
    { id: 'spiky', label: 'Espetado', icon: '⚡' },
    { id: 'short', label: 'Curto Moderno', icon: '✂️' },
    { id: 'curly', label: 'Cacheado', icon: '🌀' },
    { id: 'long', label: 'Longo Ondulado', icon: '🌊' },
    { id: 'cap', label: 'Boné Frente', icon: '🧢' },
    { id: 'capBack', label: 'Boné p/ Trás', icon: '🧢' },
    { id: 'ponytail', label: 'Coque / Rabo', icon: '🎀' },
    { id: 'afro', label: 'Black Afro', icon: '👑' },
    { id: 'beanie', label: 'Gorro de Lã', icon: '❄️' },
    { id: 'bald', label: 'Careca', icon: '✨' },
  ];

  const clothingStyles: { id: CharacterConfig['clothingStyle']; label: string; icon: string; desc: string }[] = [
    { id: 'hoodie', label: 'Moletom', icon: '🧥', desc: 'Capuz com cordões' },
    { id: 'tshirt', label: 'Camiseta', icon: '👕', desc: 'Gola redonda clássica' },
    { id: 'jacket', label: 'Jaqueta Track', icon: '🏃', desc: 'Listras esportivas e zíper' },
    { id: 'suit', label: 'Terno Formal', icon: '👔', desc: 'Paletó e gravata' },
    { id: 'jersey', label: 'Regata Nº 7', icon: '🏀', desc: 'Estilo basquete / atlético' },
    { id: 'striped', label: 'Listrado', icon: '⛵', desc: 'Estampa náutica' },
    { id: 'overalls', label: 'Macacão Jeans', icon: '👖', desc: 'Jardineira com suspensórios' },
    { id: 'cape', label: 'Capa de Herói', icon: '🦸', desc: 'Capa com medalhão estelar' },
  ];

  const accessories: { id: CharacterConfig['accessory']; label: string; icon: string; category: string }[] = [
    { id: 'none', label: 'Nenhum', icon: '🚫', category: 'Básico' },
    { id: 'glasses', label: 'Óculos de Grau', icon: '👓', category: 'Óculos' },
    { id: 'roundGlasses', label: 'Óculos Redondos', icon: '🧐', category: 'Óculos' },
    { id: 'sunglasses', label: 'Óculos Escuros', icon: '🕶️', category: 'Óculos' },
    { id: 'pixelShades', label: 'Óculos Thug Pixel', icon: '😎', category: 'Óculos' },
    { id: 'headphones', label: 'Fones Gamer', icon: '🎧', category: 'Tecnologia' },
    { id: 'vrHeadset', label: 'Óculos VR Visor', icon: '🥽', category: 'Tecnologia' },
    { id: 'crown', label: 'Coroa Dourada', icon: '👑', category: 'Chapéus' },
    { id: 'partyHat', label: 'Chapéu de Festa', icon: '🎉', category: 'Chapéus' },
    { id: 'mustache', label: 'Bigode Elegante', icon: '👨', category: 'Estilo' },
    { id: 'piratePatch', label: 'Tapa-Olho Pirata', icon: '🏴‍☠️', category: 'Aventura' },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-[#240b4d] border-2 border-purple-600/70 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-purple-800/80 bg-[#1e0840] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-300 to-pink-500 flex items-center justify-center text-purple-950 shadow-lg">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Criador de Personagem
              </h3>
              <p className="text-xs text-purple-300">
                Personalize o nome, roupas, corte de cabelo e acessórios do seu avatar!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-2 rounded-xl text-xl font-bold transition-colors cursor-pointer hover:bg-purple-900/60"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Live Preview Bar with Character Name Input */}
        <div className="bg-gradient-to-b from-[#1b0638] via-[#240b4d] to-[#1f0942] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 border-b border-purple-800/80">
          <div className="relative group shrink-0">
            <div className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-indigo-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-300 animate-pulse" />
            <CharacterAvatar
              config={config}
              size={110}
              animate
              className="relative border-4 border-white/90 shadow-2xl ring-4 ring-purple-900/50"
            />
          </div>

          <div className="flex flex-col gap-2.5 w-full max-w-sm">
            {/* Nickname input */}
            <div className="bg-purple-950/90 border border-purple-700/80 rounded-2xl p-3 shadow-inner">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black uppercase text-yellow-300 tracking-wider flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Nome do Personagem</span>
                </label>
                <span className="text-[10px] text-purple-300 font-mono font-bold">
                  {nameInput.length}/18
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={18}
                  value={nameInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNameInput(val);
                    if (onRename && val.trim()) {
                      onRename(val.trim());
                    }
                  }}
                  placeholder="Ex: Pedro Estelar"
                  className="w-full bg-[#16052f] text-white font-black text-base py-2 px-3 rounded-xl border border-purple-500/80 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-purple-400/50 shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRandomize}
                className="flex-1 px-3.5 py-2 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border border-purple-500/60 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5 text-yellow-300" />
                <span>Sortear Visual 🎲</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-purple-800/80 bg-[#1e0840] px-2 py-1.5 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mascotes Prontos</span>
          </button>

          <button
            onClick={() => setActiveTab('face')}
            className={`py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'face'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/60'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Rosto</span>
          </button>

          <button
            onClick={() => setActiveTab('hair')}
            className={`py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'hair'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/60'
            }`}
          >
            <span>💇 Cabelo</span>
          </button>

          <button
            onClick={() => setActiveTab('clothes')}
            className={`py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'clothes'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/60'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Roupas</span>
          </button>

          <button
            onClick={() => setActiveTab('accessories')}
            className={`py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'accessories'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/60'
            }`}
          >
            <Glasses className="w-4 h-4" />
            <span>Óculos & Acessórios</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`py-2 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-yellow-400 text-purple-950 shadow-md'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Pele & Fundo</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* TAB 0: PRESET MASCOTS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-yellow-300 block">
                  Escolha um Mascote Base ou Monte do Zero
                </span>
                <span className="text-xs text-purple-300">
                  Clique para vestir
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CHARACTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      sounds.playPlayerJoin();
                      onChange(preset.config);
                    }}
                    className="p-3 rounded-2xl bg-purple-950/70 border border-purple-800/80 hover:border-yellow-400 hover:bg-purple-900/80 flex flex-col items-center gap-2 transition-all cursor-pointer group hover:scale-102 shadow-md"
                  >
                    <div className="relative">
                      <CharacterAvatar config={preset.config} size={62} className="border-2 border-white/60 shadow-md" />
                      <span className="absolute -bottom-1 -right-1 text-sm bg-purple-900 p-0.5 rounded-full border border-purple-700">
                        {preset.icon}
                      </span>
                    </div>

                    <div className="text-center">
                      <span className="font-black text-xs text-white group-hover:text-yellow-300 transition-colors block">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-purple-300 font-semibold block">
                        {preset.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: FACE & EXPRESSION */}
          {activeTab === 'face' && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 block">
                Expressão Facial
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {expressions.map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => handleSelectOption({ expression: exp.id })}
                    className={`p-3 rounded-2xl border text-xs sm:text-sm font-black flex items-center gap-2.5 transition-all cursor-pointer ${
                      config.expression === exp.id
                        ? 'bg-yellow-400 text-purple-950 border-white ring-2 ring-yellow-300 shadow-md scale-102'
                        : 'bg-purple-950/70 text-white border-purple-800 hover:bg-purple-900/80'
                    }`}
                  >
                    <span className="text-2xl">{exp.icon}</span>
                    <span>{exp.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-200 block mb-2">
                  Tom de Pele do Personagem
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => handleSelectOption({ skinTone: tone.hex })}
                      title={tone.label}
                      className={`h-11 rounded-xl transition-transform flex items-center justify-center border-2 cursor-pointer ${
                        config.skinTone === tone.hex
                          ? 'ring-2 ring-white scale-110 border-white shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                    >
                      {config.skinTone === tone.hex && (
                        <Check className="w-4 h-4 text-purple-950 stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HAIR & HAIR COLOR */}
          {activeTab === 'hair' && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 block">
                Estilo de Cabelo & Bonés
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {hairStyles.map((hs) => (
                  <button
                    key={hs.id}
                    onClick={() => handleSelectOption({ hairStyle: hs.id })}
                    className={`py-3 px-2 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      config.hairStyle === hs.id
                        ? 'bg-yellow-400 text-purple-950 border-white ring-2 ring-yellow-300 shadow-md scale-102'
                        : 'bg-purple-950/70 text-white border-purple-800 hover:bg-purple-900/80'
                    }`}
                  >
                    <span className="text-lg">{hs.icon}</span>
                    <span className="text-center">{hs.label}</span>
                  </button>
                ))}
              </div>

              {config.hairStyle !== 'bald' && (
                <div className="pt-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-200 block mb-2">
                    Cor do Cabelo
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.id}
                        onClick={() => handleSelectOption({ hairColor: hc.hex })}
                        title={hc.label}
                        className={`h-11 rounded-xl transition-transform flex items-center justify-center border-2 cursor-pointer ${
                          config.hairColor === hc.hex
                            ? 'ring-2 ring-white scale-110 border-white shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: hc.hex }}
                      >
                        {config.hairColor === hc.hex && (
                          <Check className={`w-4 h-4 stroke-[3] ${
                            hc.id === '#e2e8f0' || hc.id === '#e5c158' ? 'text-black' : 'text-white'
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLOTHES & CLOTHING COLOR */}
          {activeTab === 'clothes' && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 block">
                Modelo de Roupa
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {clothingStyles.map((cs) => (
                  <button
                    key={cs.id}
                    onClick={() => handleSelectOption({ clothingStyle: cs.id })}
                    className={`p-3 rounded-2xl border text-xs sm:text-sm font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      config.clothingStyle === cs.id
                        ? 'bg-yellow-400 text-purple-950 border-white ring-2 ring-yellow-300 shadow-md scale-102'
                        : 'bg-purple-950/70 text-white border-purple-800 hover:bg-purple-900/80'
                    }`}
                  >
                    <span className="text-2xl">{cs.icon}</span>
                    <span className="font-extrabold">{cs.label}</span>
                    <span className="text-[10px] opacity-75 font-normal text-center">{cs.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-200 block mb-2">
                  Cor da Roupa
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {CLOTHING_COLORS.map((cc) => (
                    <button
                      key={cc.id}
                      onClick={() => handleSelectOption({ clothingColor: cc.hex })}
                      title={cc.label}
                      className={`h-11 rounded-xl transition-transform flex items-center justify-center border-2 cursor-pointer ${
                        config.clothingColor === cc.hex
                          ? 'ring-2 ring-white scale-110 border-white shadow-lg'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: cc.hex }}
                    >
                      {config.clothingColor === cc.hex && (
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSORIES (GLASSES, SUNGLASSES, HEADPHONES, CROWN, ETC.) */}
          {activeTab === 'accessories' && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 block">
                Escolha Óculos ou Acessório
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {accessories.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectOption({ accessory: acc.id })}
                    className={`p-3 rounded-2xl border text-xs sm:text-sm font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                      config.accessory === acc.id
                        ? 'bg-yellow-400 text-purple-950 border-white ring-2 ring-yellow-300 shadow-md scale-102'
                        : 'bg-purple-950/70 text-white border-purple-800 hover:bg-purple-900/80'
                    }`}
                  >
                    <span className="text-2xl">{acc.icon}</span>
                    <span className="truncate">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BACKGROUND COLOR */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-300 block">
                Cor de Fundo do Avatar
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BG_COLORS.map((bg, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption({ bgColor: bg })}
                    className={`h-12 rounded-xl transition-transform flex items-center justify-center border-2 cursor-pointer ${
                      config.bgColor === bg
                        ? 'ring-2 ring-white scale-110 border-white shadow-lg'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: bg }}
                  >
                    {config.bgColor === bg && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-purple-800/80 bg-[#1e0840] flex items-center justify-between">
          <button
            onClick={handleRandomize}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Dices className="w-4 h-4 text-yellow-400" />
            <span>Sortear Outro Visual</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-yellow-400/40"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Pronto, Salvar Visual & Nome!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
