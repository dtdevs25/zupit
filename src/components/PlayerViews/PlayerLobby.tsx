import React, { useState, useEffect } from 'react';
import { Player, RoomState, CharacterConfig } from '../../types';
import { CharacterAvatar, DEFAULT_CHARACTER } from '../CharacterAvatar';
import { AvatarCustomizer } from '../AvatarCustomizer';
import { useGameAudio } from '../../context/GameAudioContext';
import { Sparkles, CheckCircle2, Palette, Pencil, Check, X } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface PlayerLobbyProps {
  player: Player;
  room: RoomState;
  onUpdateAvatar?: (config: CharacterConfig, nickname?: string) => void;
  onRenamePlayer?: (nickname: string) => void;
}

export const PlayerLobby: React.FC<PlayerLobbyProps> = ({
  player,
  room,
  onUpdateAvatar,
  onRenamePlayer,
}) => {
  const { playGameEvent } = useGameAudio();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(
    player.avatarConfig || DEFAULT_CHARACTER
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.nickname);

  useEffect(() => {
    playGameEvent('ROOM_JOIN');
  }, [playGameEvent]);

  useEffect(() => {
    if (player.avatarConfig) {
      setCharacterConfig(player.avatarConfig);
    }
  }, [player.avatarConfig]);

  useEffect(() => {
    setNameInput(player.nickname);
  }, [player.nickname]);

  const handleSaveAvatar = (newConfig: CharacterConfig) => {
    setCharacterConfig(newConfig);
    if (onUpdateAvatar) {
      onUpdateAvatar(newConfig, nameInput);
    }
  };

  const handleRename = (newName: string) => {
    const clean = newName.trim().substring(0, 18);
    if (clean) {
      setNameInput(clean);
      if (onRenamePlayer) {
        onRenamePlayer(clean);
      } else if (onUpdateAvatar) {
        onUpdateAvatar(characterConfig, clean);
      }
    }
  };

  const handleSubmitInlineName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    sounds.playPlayerJoin();
    handleRename(nameInput.trim());
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] w-full px-4 text-center">
      {/* Custom Character Avatar */}
      <div className="mb-3 animate-bounce-short relative group flex flex-col items-center">
        <CharacterAvatar
          config={characterConfig}
          size={96}
          animate
          className="border-4 border-yellow-400 shadow-2xl"
        />

        {/* Action Buttons: Rename & Customize */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditingName(true)}
            className="px-3 py-1.5 bg-[#42177f] hover:bg-[#521d9c] text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-purple-500/50 transition-transform active:scale-95 cursor-pointer"
            title="Trocar o nome do seu personagem"
          >
            <Pencil className="w-3.5 h-3.5 text-yellow-300" />
            <span>Trocar Nome</span>
          </button>

          {onUpdateAvatar && (
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Personalizar roupas, cabelo e óculos"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Mudar Visual</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#321066] border border-purple-700/60 rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-2xl flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-green-400 bg-green-950/60 px-3 py-1 rounded-full border border-green-700/60 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Conectado
        </div>

        {/* Nickname display or inline form */}
        {isEditingName ? (
          <form onSubmit={handleSubmitInlineName} className="w-full flex flex-col items-center gap-2 mb-1">
            <div className="relative w-full">
              <input
                type="text"
                maxLength={18}
                value={nameInput}
                autoFocus
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Novo nome do personagem"
                className="w-full bg-[#1b0638] text-white text-center font-black text-xl py-2 px-3 rounded-2xl border-2 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/40 shadow-inner"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 font-mono font-bold">
                {nameInput.length}/18
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-purple-950 font-black rounded-xl text-xs flex items-center gap-1 shadow transition-transform active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Salvar Nome</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNameInput(player.nickname);
                  setIsEditingName(false);
                }}
                className="px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        ) : (
          <div
            onClick={() => setIsEditingName(true)}
            className="flex items-center justify-center gap-2 group cursor-pointer max-w-full hover:bg-purple-900/40 px-3 py-1 rounded-2xl transition-all"
            title="Clique para trocar o nome do seu personagem"
          >
            <h2 className="text-2xl sm:text-3xl font-black text-white truncate max-w-[220px]">
              {player.nickname}
            </h2>
            <div className="p-1 rounded-lg bg-purple-800/80 group-hover:bg-yellow-400 group-hover:text-purple-950 text-yellow-300 transition-colors shadow">
              <Pencil className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        <p className="text-xs sm:text-sm font-semibold text-yellow-300 mt-2">
          Você está dentro do jogo! 🎉
        </p>

        <div className="w-full h-px bg-purple-800/80 my-3.5" />

        <p className="text-xs text-purple-300 leading-relaxed">
          Olhe para a tela do apresentador. Quando o jogo começar, os botões coloridos de resposta aparecerão no seu aparelho!
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-400 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          Aguardando o anfitrião iniciar...
        </div>
      </div>

      {/* Avatar Customizer Modal */}
      {isCustomizerOpen && (
        <AvatarCustomizer
          config={characterConfig}
          onChange={handleSaveAvatar}
          nickname={nameInput}
          onRename={handleRename}
          isOpen={isCustomizerOpen}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}
    </div>
  );
};
