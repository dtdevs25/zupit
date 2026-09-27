import React, { useState } from 'react';
import { Quiz } from '../../types';
import { Sparkles, Loader2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: Quiz) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('médio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          questionCount,
          difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao gerar quiz');
      }

      const data = await res.json();
      if (data.quiz) {
        onQuizGenerated(data.quiz);
        onClose();
      } else {
        throw new Error('Formato inválido retornado');
      }
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível gerar o quiz neste momento. Tente outro tema ou crie manualmente.');
    } finally {
      setLoading(false);
    }
  };

  const sampleTopics = [
    'Mitologia Grega e Deuses do Olimpo ⚡',
    'Curiosidades do Espaço e Astronomia 🪐',
    'História dos Videogames e Consoles 🕹️',
    'Mundo dos Animais e Vida Selvagem 🐾',
    'Grandes Invenções da Humanidade 💡',
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#240b4d] border border-purple-700/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 text-purple-300 hover:text-white text-2xl font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-yellow-400 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              Criar Quiz com IA
            </h3>
            <p className="text-xs text-purple-300">
              Digite qualquer assunto e a IA gera perguntas completas com opções e respostas!
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-1.5">
              Tema ou Assunto do Quiz
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Harry Potter, Revolução Francesa, Programação Python..."
              disabled={loading}
              className="w-full bg-purple-950/80 border border-purple-700/70 rounded-xl px-4 py-3 text-white text-sm font-semibold placeholder:text-purple-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="text-[11px] font-bold text-purple-300 block mb-1">
              Sugestões rápidas de temas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((sample, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTopic(sample.replace(/[^\w\sÀ-ÿ]/g, '').trim())}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-medium border border-purple-700/50 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-1.5">
                Quantidade
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={loading}
                className="w-full bg-purple-950/80 border border-purple-700/70 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value={3}>3 Perguntas (Express)</option>
                <option value={5}>5 Perguntas (Padrão)</option>
                <option value={8}>8 Perguntas (Completo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-1.5">
                Dificuldade
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={loading}
                className="w-full bg-purple-950/80 border border-purple-700/70 rounded-xl px-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="fácil">Fácil (Iniciante)</option>
                <option value="médio">Médio (Equilibrado)</option>
                <option value="difícil">Desafiador (Expert)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full mt-4 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 disabled:opacity-50 text-purple-950 font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ring-2 ring-yellow-400/40"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gerando Quiz Inteligente...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gerar Quiz em Segundos ✨</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
