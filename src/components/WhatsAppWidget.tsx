import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [config, setConfig] = useState({ number: '5519991472282', greeting: 'Olá! Como podemos te ajudar com o ZUPiT! hoje?' });
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        setConfig({
          number: data.whatsapp_number || '5519991472282',
          greeting: data.whatsapp_greeting || 'Olá! Como podemos te ajudar com o ZUPiT! hoje?'
        });
      })
      .catch(console.error);
  }, []);

  // Ocultar widget para o usuário Master
  if (user?.role === 'master') return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Remover tudo que não for número
    const cleanNumber = config.number.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chatbox Popup */}
      {isOpen && (
        <div className="bg-white w-80 rounded-2xl shadow-2xl mb-4 border border-gray-200 overflow-hidden animate-slideUp">
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 fill-current" />
              <span className="font-bold">Fale conosco</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-gray-50 h-32 overflow-y-auto">
            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%] whitespace-pre-wrap">
              {config.greeting}
            </div>
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-gray-100 border-none rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
              autoFocus
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="w-10 h-10 bg-[#25D366] hover:bg-[#20bd5a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 cursor-pointer ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-90' : 'bg-[#25D366] hover:bg-[#20bd5a] hover:scale-105'
          }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-8 h-8 fill-current" />}
      </button>
    </div>
  );
};
