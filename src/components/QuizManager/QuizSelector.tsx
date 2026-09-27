import React from 'react';
import { Quiz } from '../../types';
import { Play, Plus, Sparkles, Clock, HelpCircle, Layers } from 'lucide-react';

interface QuizSelectorProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onOpenBuilder: () => void;
  onOpenAIGenerator: () => void;
  onBackToHome: () => void;
}

export const QuizSelector: React.FC<QuizSelectorProps> = ({
  quizzes,
  onSelectQuiz,
  onOpenBuilder,
  onOpenAIGenerator,
  onBackToHome,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-purple-300 hover:text-white mb-2 flex items-center gap-1 transition-colors"
          >
            ← Voltar para Início
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Biblioteca de Quizzes
          </h1>
          <p className="text-sm text-purple-300 mt-1">
            Selecione um quiz pronto para apresentar para a sua turma ou crie um novo!
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onOpenAIGenerator}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Gerar com IA ✨</span>
          </button>

          <button
            onClick={onOpenBuilder}
            className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Quiz</span>
          </button>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-[#240b4d] border border-purple-700/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-yellow-400/80 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl p-2 rounded-2xl bg-purple-900/60 border border-purple-800 shadow-inner group-hover:scale-110 transition-transform">
                  {quiz.coverEmoji}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-[11px] font-black uppercase text-yellow-300">
                  {quiz.category}
                </span>
              </div>

              <h3 className="text-xl font-black text-white group-hover:text-yellow-300 transition-colors leading-snug">
                {quiz.title}
              </h3>

              <p className="text-xs text-purple-300 font-medium mt-2 line-clamp-2">
                {quiz.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{quiz.questions.length} perguntas</span>
              </div>

              <button
                onClick={() => onSelectQuiz(quiz)}
                className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Apresentar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
