import React, { useEffect, useState } from 'react';
import { FileText, Trash2, Eye, EyeOff, Activity, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AdminQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  coverEmoji: string;
  isPublic: boolean;
  ownerId: string;
  ownerName: string;
  createdAt: number;
  questionsCount: number;
}

export function QuizzesManagement() {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.quizzes) {
        setQuizzes(data.quizzes);
      }
    } catch (err) {
      console.error('Error fetching quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchQuizzes();
    }
  }, [token]);

  const handleTogglePublic = async (quiz: AdminQuiz) => {
    try {
      await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isPublic: !quiz.isPublic })
      });
      fetchQuizzes();
    } catch (err) {
      console.error('Error toggling public status', err);
    }
  };

  const handleDelete = async (quiz: AdminQuiz) => {
    if (confirm(`Tem certeza que deseja excluir o quiz "${quiz.title}"? Esta ação não pode ser desfeita.`)) {
      try {
        await fetch(`/api/admin/quizzes/${quiz.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchQuizzes();
      } catch (err) {
        console.error('Error deleting quiz', err);
      }
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-purple-300">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Quizzes & Conteúdo</h1>
          <p className="text-purple-300 mt-1">Gerencie todos os quizzes criados na plataforma.</p>
        </div>
        <button 
          onClick={fetchQuizzes}
          className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> Atualizar
        </button>
      </header>

      <div className="bg-[#2b0e5c] border border-purple-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-purple-900/30 text-purple-300 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Quiz</th>
                <th className="p-4 font-semibold">Criador</th>
                <th className="p-4 font-semibold text-center">Perguntas</th>
                <th className="p-4 font-semibold text-center">Público (Template)</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-800">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-purple-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-700/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        {quiz.coverEmoji || '📝'}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{quiz.title}</span>
                        <span className="text-xs text-purple-400">{quiz.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-purple-300 font-medium">{quiz.ownerName}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-white">
                    {quiz.questionsCount}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleTogglePublic(quiz)}
                      title={quiz.isPublic ? "Tornar Privado" : "Tornar Público"}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        quiz.isPublic 
                          ? 'bg-green-400/20 text-green-400 hover:bg-green-400/30' 
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {quiz.isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {quiz.isPublic ? 'Público' : 'Privado'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(quiz)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" 
                      title="Excluir Definitivamente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-purple-400">Nenhum quiz encontrado no sistema.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
