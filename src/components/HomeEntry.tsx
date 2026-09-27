import React, { useState, useEffect } from 'react';
import { PLAYER_AVATARS, PLAYER_COLORS, CharacterConfig } from '../types';
import { CharacterAvatar, DEFAULT_CHARACTER, getRandomCharacter } from './CharacterAvatar';
import { AvatarCustomizer } from './AvatarCustomizer';
import { Play, ArrowLeft, ArrowRight, Palette, Dices } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface HomeEntryProps {
  initialPin?: string;
  onJoinGame: (pin: string, nickname: string, avatar: string, color: string, avatarConfig?: CharacterConfig) => void;
  onGoToHost: () => void;
  onGoBack: () => void;
  isConnecting?: boolean;
}

export const HomeEntry: React.FC<HomeEntryProps> = ({
  initialPin = '',
  onJoinGame,
  onGoToHost,
  onGoBack,
  isConnecting = false,
}) => {
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0]);
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [step, setStep] = useState<'pin' | 'profile'>('pin');

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setStep('profile');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onJoinGame(pin.trim(), nickname.trim(), selectedAvatar, selectedColor, characterConfig);
  };

  const handleRandomize = () => {
    const random = getRandomCharacter();
    setCharacterConfig(random);
    setSelectedColor(random.clothingColor);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 py-8">
      {/* Back button — top-left floating icon */}
      <button
        onClick={onGoBack}
        title="Voltar"
        className="absolute top-4 left-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-purple-500/50 text-white transition-colors cursor-pointer shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Main Join Card */}
      <div className={`w-full ${step === 'pin' ? 'max-w-3xl' : 'max-w-md'} bg-[#240b4d] border-2 border-purple-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-300`}>
        {step === 'pin' ? (
          <div className="flex flex-col md:flex-row items-stretch gap-8">
            {/* Left Side: PIN Input */}
            <div className="flex-1 flex flex-col justify-center">
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-2 text-center">
                    PIN do Jogo
                  </label>
                  <input
                    type="text"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="Ex: 849 203"
                    autoFocus
                    className="w-full bg-white text-[#240b4d] text-center font-mono font-black text-3xl sm:text-4xl py-4 px-4 rounded-2xl border-4 border-yellow-400/80 focus:outline-none focus:ring-4 focus:ring-yellow-400/40 tracking-widest shadow-inner placeholder:text-gray-300 placeholder:font-sans placeholder:text-2xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!pin.trim() || pin.length < 3}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-purple-950 font-black text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Entrar na Sala</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="w-px h-full bg-purple-700/50"></div>
              <div className="py-2 text-xs font-bold text-purple-300 uppercase tracking-widest bg-[#240b4d] absolute">OU</div>
            </div>
            
            <div className="flex md:hidden items-center justify-center py-2">
              <div className="h-px w-full bg-purple-700/50"></div>
              <div className="px-2 text-xs font-bold text-purple-300 uppercase tracking-widest absolute bg-[#240b4d]">OU</div>
            </div>

            {/* Right Side: Real QR Code */}
            <div className="flex-1 flex flex-col items-center justify-center bg-purple-900/40 rounded-2xl p-6 border border-purple-700/50 text-center">
              <div className="bg-white rounded-xl mb-4 p-3 shadow-lg border-4 border-yellow-400 inline-block">
                <QRCodeSVG
                  value={typeof window !== 'undefined' ? window.location.origin : 'https://zupit.app'}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#240b4d"
                  level="M"
                  includeMargin={false}
                />
              </div>
              <h3 className="font-black text-yellow-300 mb-1">Câmera do Celular</h3>
              <p className="text-xs text-purple-200 leading-relaxed">
                Aponte a câmera do seu celular para o <strong>QR Code</strong> para entrar instantaneamente!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-purple-800">
              <span className="text-xs text-purple-300 font-bold">
                PIN: <span className="text-yellow-300 font-mono text-sm">{pin}</span>
              </span>
              <button
                type="button"
                onClick={() => setStep('pin')}
                className="text-xs text-purple-400 hover:text-white underline font-semibold cursor-pointer"
              >
                Trocar PIN
              </button>
            </div>

            {/* Character Showcase & Customization Trigger */}
            <div className="bg-purple-950/70 border border-purple-800/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CharacterAvatar
                  config={characterConfig}
                  size={68}
                  animate
                  className="border-2 border-white/60 shadow-lg"
                />
                <div>
                  <span className="text-xs font-black uppercase text-yellow-300 tracking-wider block">
                    Seu Personagem
                  </span>
                  <span className="text-[11px] text-purple-200">
                    Cabelo, óculos & roupas
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Customizar</span>
                </button>

                <button
                  type="button"
                  onClick={handleRandomize}
                  className="px-3 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Dices className="w-3 h-3 text-yellow-400" />
                  <span>Sortear</span>
                </button>
              </div>
            </div>

            {/* Nickname Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-1.5">
                Seu Apelido / Nome
              </label>
              <input
                type="text"
                required
                maxLength={18}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Pedro Astro"
                autoFocus
                className="w-full bg-white text-[#240b4d] font-black text-xl py-3 px-4 rounded-2xl border-2 border-purple-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={!nickname.trim() || isConnecting}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-purple-950 font-black text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ring-4 ring-yellow-400/30 active:scale-98"
            >
              <span>{isConnecting ? 'Entrando...' : 'Entrar no Jogo!'}</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
          </form>
        )}
      </div>

      {/* Avatar Customizer Modal */}
      <AvatarCustomizer
        config={characterConfig}
        onChange={setCharacterConfig}
        nickname={nickname}
        onRename={setNickname}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
};
