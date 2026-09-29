import React, { useState } from 'react';
import { RoomState } from '../../types';
import { CharacterAvatar } from '../CharacterAvatar';
import { Users, Bot, Play, Copy, Check, QrCode, Sparkles, X } from 'lucide-react';

interface HostLobbyProps {
  room: RoomState;
  onStartGame: () => void;
  onAddBots: (count: number) => void;
  onKickPlayer: (playerId: string) => void;
}

export const HostLobby: React.FC<HostLobbyProps> = ({
  room,
  onStartGame,
  onAddBots,
  onKickPlayer,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const formattedPin = room.pin.length === 6 
    ? `${room.pin.slice(0, 3)} ${room.pin.slice(3)}` 
    : room.pin;

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?pin=${room.pin}` 
    : `pin=${room.pin}`;

  const copyPin = () => {
    navigator.clipboard.writeText(room.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-65px)] w-full max-w-6xl mx-auto px-4 py-6">
      {/* Top Banner: Join instructions */}
      <div className="w-full bg-[#321066] border border-purple-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-sm sm:text-base font-extrabold text-purple-300 uppercase tracking-widest">
            Acesse no celular ou aba:
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
            Entre com o PIN do Jogo:
          </h2>
          <span className="text-xs sm:text-sm text-yellow-300 font-semibold mt-1">
            Quiz: {room.quizTitle} ({room.totalQuestions} perguntas)
          </span>
        </div>

        {/* Huge PIN card */}
        <div className="flex items-center gap-3">
          <div 
            onClick={copyPin}
            className="bg-white hover:bg-yellow-50 text-[#321066] cursor-pointer px-6 sm:px-10 py-3 sm:py-4 rounded-2xl shadow-xl flex items-center gap-4 transition-transform active:scale-95 group"
            title="Clique para copiar o PIN"
          >
            <span className="font-mono font-black text-3xl sm:text-5xl tracking-widest text-[#240b4d]">
              {formattedPin}
            </span>
            <button className="text-purple-600 group-hover:text-purple-900 transition-colors">
              {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>

          <button
            onClick={() => setShowQr(!showQr)}
            className="p-4 bg-purple-800/80 hover:bg-purple-700 border border-purple-600/50 rounded-2xl text-purple-200 transition-colors shadow-lg"
            title="Exibir QR Code"
          >
            <QrCode className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* QR Code Popup */}
      {showQr && (
        <div className="my-4 bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-purple-950 animate-bounce-short">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            {/* Direct Google Charts QR code or visual placeholder */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`}
              alt="QR Code do Jogo"
              className="w-44 h-44 rounded-lg shadow-inner"
            />
          </div>
          <p className="text-xs font-bold text-purple-900 text-center">
            Aponte a câmera do celular para entrar direto com o PIN!
          </p>
          <button 
            onClick={() => setShowQr(false)}
            className="text-xs font-bold text-purple-700 hover:text-purple-950 underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Center Section: Players Joined */}
      <div className="w-full my-8 flex-1 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mb-4">
          <div className="flex flex-wrap items-center gap-2 text-purple-200 font-extrabold text-base sm:text-xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 shrink-0" />
            <span>
              {room.playerCount}
              {room.maxParticipants && room.maxParticipants < 9999 ? ` / ${room.maxParticipants}` : ''}{' '}
              {room.playerCount === 1 ? 'Jogador conectado' : 'Jogadores conectados'}
            </span>
            {room.maxParticipants && room.maxParticipants < 9999 ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-900/80 text-yellow-300 border border-purple-700">
                Limite: {room.maxParticipants} participantes
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                👑 Participantes Ilimitados
              </span>
            )}
          </div>

          {/* Quick bot adder for testing */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-300 hidden sm:inline">Para testar sozinho:</span>
            <button
              onClick={() => onAddBots(1)}
              disabled={Boolean(room.maxParticipants && room.playerCount >= room.maxParticipants)}
              className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              +1 Bot
            </button>
            <button
              onClick={() => onAddBots(3)}
              disabled={Boolean(room.maxParticipants && room.playerCount + 1 > room.maxParticipants)}
              className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              +3 Bots
            </button>
          </div>
        </div>

        {/* Players List Grid */}
        {room.players.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-purple-900/60 border-2 border-dashed border-purple-500 flex items-center justify-center animate-pulse mb-4">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-purple-200">Aguardando jogadores entrarem...</h3>
            <p className="text-sm text-purple-400 max-w-md mt-1">
              Peça para os participantes inserirem o PIN <span className="text-yellow-300 font-mono font-bold">{room.pin}</span> ou use o botão <span className="text-indigo-300 font-semibold">+Bots</span> acima para testar agora mesmo!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-h-[380px] overflow-y-auto p-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="group relative bg-[#240b4d] hover:bg-[#2c0e5e] border border-purple-700/60 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-lg transition-transform hover:-translate-y-1"
                style={{ borderLeftColor: player.color, borderLeftWidth: '5px' }}
              >
                {player.avatarConfig ? (
                  <CharacterAvatar config={player.avatarConfig} size={44} className="border border-white/30" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-purple-900/90 flex items-center justify-center text-2xl shadow-inner">
                    {player.avatar}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm sm:text-base text-white truncate">
                    {player.nickname}
                  </p>
                  {player.isBot && (
                    <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                      Bot
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onKickPlayer(player.id)}
                  title="Remover jogador"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-500/30 text-red-400 hover:text-red-200 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: Start Game Button */}
      <div className="w-full max-w-md flex flex-col items-center gap-2">
        <button
          onClick={onStartGame}
          disabled={room.playerCount === 0}
          className={`w-full py-4 sm:py-5 px-8 rounded-2xl font-black text-xl sm:text-2xl shadow-2xl flex items-center justify-center gap-3 transition-all transform ${
            room.playerCount > 0
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-purple-950 active:scale-98 cursor-pointer ring-4 ring-yellow-400/30 shadow-yellow-500/20'
              : 'bg-purple-900/50 text-purple-400/50 cursor-not-allowed border border-purple-800'
          }`}
        >
          <Play className="w-6 h-6 fill-current" />
          <span>INICIAR JOGO</span>
        </button>
        {room.playerCount === 0 && (
          <span className="text-xs text-purple-400 font-medium">
            Entre com ao menos 1 jogador ou adicione 1 bot para iniciar
          </span>
        )}
      </div>
    </div>
  );
};
