import React, { useState } from 'react';
import { Quiz, QuizQuestion, KAHOOT_COLORS } from '../../types';
import { Plus, Trash2, CheckCircle2, Clock, Award, Save, X } from 'lucide-react';

interface QuizBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuiz: (quiz: Quiz) => void;
  initialQuiz?: Quiz | null;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  isOpen,
  onClose,
  onSaveQuiz,
  initialQuiz,
}) => {
  const [title, setTitle] = useState(initialQuiz?.title || '');
  const [description, setDescription] = useState(initialQuiz?.description || '');
  const [category, setCategory] = useState(initialQuiz?.category || 'Geral');
  const [coverEmoji, setCoverEmoji] = useState(initialQuiz?.coverEmoji || '🎯');
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuiz?.questions || [
      {
        id: 'q_' + Date.now(),
        text: '',
        timeLimit: 20,
        points: 1000,
        type: 'multiple',
        options: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' },
        ],
        correctAnswer: 0,
        explanation: '',
      },
    ]
  );

  if (!isOpen) return null;

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: 'q_' + Date.now() + '_' + Math.random(),
        text: '',
        timeLimit: 20,
        points: 1000,
        type: 'multiple',
        options: [
          { text: '' },
          { text: '' },
          { text: '' },
          { text: '' },
        ],
        correctAnswer: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].text = text;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  const setCorrectAnswer = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = optIndex;
    setQuestions(updated);
  };

  const updateTimeLimit = (qIndex: number, timeLimit: number) => {
    const updated = [...questions];
    updated[qIndex].timeLimit = timeLimit;
    setQuestions(updated);
  };

  const updateExplanation = (qIndex: number, explanation: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = explanation;
    setQuestions(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate that all questions have non-empty text and at least 2 filled options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Por favor, preencha o texto da Pergunta ${i + 1}.`);
        return;
      }
      const filledOptions = q.options.filter(o => o.text.trim().length > 0);
      if (filledOptions.length < 2) {
        alert(`A Pergunta ${i + 1} precisa ter pelo menos 2 alternativas preenchidas.`);
        return;
      }
      if (!q.options[q.correctAnswer]?.text.trim()) {
        alert(`A alternativa marcada como correta na Pergunta ${i + 1} não pode estar vazia.`);
        return;
      }
    }

    const newQuiz: Quiz = {
      id: initialQuiz?.id || 'custom_' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'Quiz criado pelo usuário',
      category: category.trim() || 'Personalizado',
      coverEmoji: coverEmoji || '🎯',
      questions,
      createdAt: Date.now(),
    };

    onSaveQuiz(newQuiz);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-[#240b4d] border border-purple-700/60 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-purple-800/80 flex items-center justify-between bg-[#1e0840]">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {initialQuiz ? 'Editar Quiz' : 'Criar Novo Quiz'}
            </h2>
            <p className="text-xs text-purple-300">
              Personalize perguntas, opções, tempo e resposta correta para a sua partida
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-2 rounded-xl text-xl font-bold"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quiz Details */}
          <div className="bg-purple-950/70 border border-purple-800/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-yellow-300">
              Informações do Quiz
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Título do Quiz
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Super Desafio de História 5º Ano"
                  className="w-full bg-[#170530] border border-purple-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Emoji de Capa
                </label>
                <input
                  type="text"
                  value={coverEmoji}
                  onChange={(e) => setCoverEmoji(e.target.value)}
                  maxLength={2}
                  className="w-full bg-[#170530] border border-purple-700 rounded-xl px-3 py-2 text-white text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Breve Descrição
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Teste para verificar o aprendizado da turma"
                  className="w-full bg-[#170530] border border-purple-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-200 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Escolar"
                  className="w-full bg-[#170530] border border-purple-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-200">
                Perguntas ({questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Adicionar Pergunta</span>
              </button>
            </div>

            {questions.map((q, qIndex) => (
              <div
                key={q.id}
                className="bg-[#2a0e59] border border-purple-700/60 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="w-7 h-7 rounded-lg bg-yellow-400 text-purple-950 font-black text-xs flex items-center justify-center">
                    {qIndex + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Time limit select */}
                    <div className="flex items-center gap-1 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-800 text-xs">
                      <Clock className="w-3.5 h-3.5 text-yellow-300" />
                      <select
                        value={q.timeLimit}
                        onChange={(e) => updateTimeLimit(qIndex, Number(e.target.value))}
                        className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={10}>10 seg</option>
                        <option value={15}>15 seg</option>
                        <option value={20}>20 seg</option>
                        <option value={30}>30 seg</option>
                        <option value={60}>60 seg</option>
                      </select>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 text-red-300 transition-colors"
                        title="Excluir pergunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-[11px] font-bold text-purple-200 mb-1">
                    Enunciado da Pergunta
                  </label>
                  <input
                    type="text"
                    required
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                    placeholder="Digite a pergunta aqui..."
                    className="w-full bg-[#1b0638] border border-purple-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                {/* 4 Colored Options with Correct Answer Radio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIndex) => {
                    const colorMeta = KAHOOT_COLORS[optIndex % KAHOOT_COLORS.length];
                    const isCorrect = q.correctAnswer === optIndex;

                    return (
                      <div
                        key={optIndex}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                          isCorrect
                            ? `${colorMeta.bg} border-white shadow-md`
                            : 'bg-[#1b0638] border-purple-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setCorrectAnswer(qIndex, optIndex)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 transition-transform ${
                            isCorrect
                              ? 'bg-white text-purple-950 ring-2 ring-yellow-300 scale-105'
                              : 'bg-black/30 text-white/70 hover:scale-105'
                          }`}
                          title={isCorrect ? 'Esta é a resposta correta' : 'Clique para marcar como correta'}
                        >
                          {colorMeta.icon}
                        </button>

                        <input
                          type="text"
                          required={optIndex < 2}
                          value={opt.text}
                          onChange={(e) => updateOptionText(qIndex, optIndex, e.target.value)}
                          placeholder={`Opção ${colorMeta.name}...`}
                          className={`flex-1 bg-black/20 border-0 rounded-lg px-2.5 py-1.5 text-white text-xs font-semibold placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white`}
                        />

                        {isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 stroke-[2.5]" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Optional Explanation */}
                <div>
                  <input
                    type="text"
                    value={q.explanation || ''}
                    onChange={(e) => updateExplanation(qIndex, e.target.value)}
                    placeholder="Explicação ou curiosidade pós-resposta (opcional)..."
                    className="w-full bg-purple-950/60 border border-purple-800/80 rounded-xl px-3 py-1.5 text-xs text-purple-200 placeholder:text-purple-400/50 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed border-purple-600/70 hover:border-yellow-400 rounded-2xl text-purple-200 hover:text-yellow-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Mais Uma Pergunta</span>
          </button>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-purple-800/80 bg-[#1e0840] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-purple-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
