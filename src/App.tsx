/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuizSocket } from './hooks/useQuizSocket';
import { DEFAULT_QUIZZES } from './data/defaultQuizzes';
import { Quiz } from './types';
import { Header } from './components/Header';
import { HomeEntry } from './components/HomeEntry';
import { LandingPage } from './components/LandingPage';
import { QuizSelector } from './components/QuizManager/QuizSelector';
import { QuizBuilder } from './components/QuizManager/QuizBuilder';
import { AIGeneratorModal } from './components/QuizManager/AIGeneratorModal';
import { SplitScreenView } from './components/SplitScreenView';
import { MasterSidebar } from './components/MasterSidebar';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Admin Dashboard Views
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Overview } from './components/Admin/pages/Overview';
import { UsersManagement } from './components/Admin/pages/UsersManagement';
import { PaymentsManagement } from './components/Admin/pages/PaymentsManagement';
import { QuizzesManagement } from './components/Admin/pages/QuizzesManagement';
import { LogsManagement } from './components/Admin/pages/LogsManagement';
import { SettingsManagement } from './components/Admin/pages/SettingsManagement';

// Host Views
import { HostLobby } from './components/HostViews/HostLobby';
import { HostCountdown } from './components/HostViews/HostCountdown';
import { HostQuestion } from './components/HostViews/HostQuestion';
import { HostReveal } from './components/HostViews/HostReveal';
import { HostLeaderboard } from './components/HostViews/HostLeaderboard';
import { HostPodium } from './components/HostViews/HostPodium';

// Player Views
import { PlayerLobby } from './components/PlayerViews/PlayerLobby';
import { PlayerQuestion } from './components/PlayerViews/PlayerQuestion';
import { PlayerResult } from './components/PlayerViews/PlayerResult';
import { PlayerLeaderboard } from './components/PlayerViews/PlayerLeaderboard';
import { PlayerPodium } from './components/PlayerViews/PlayerPodium';

import { AlertCircle, X } from 'lucide-react';
import { GameAudioProvider } from './context/GameAudioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { CommercialModal } from './components/CommercialModal';
import { MasterAdminModal } from './components/MasterAdminModal';
import { PaywallNoticeModal } from './components/PaywallNoticeModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { ConfirmModal } from './components/ConfirmModal';

function AppContent() {
  const socket = useQuizSocket();
  const { user, token, allowance, isMaster, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.role === 'master' && location.pathname === '/') {
      navigate('/admin');
    }
  }, [user, location, navigate]);

  // Local Quizzes State (Default + User Custom)
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem('quizpop_custom_quizzes') || localStorage.getItem('quizoot_custom_quizzes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEFAULT_QUIZZES, ...parsed];
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_QUIZZES;
  });

  // Navigation
  const [currentView, setCurrentView] = useState<'landing' | 'home' | 'quizzes' | 'split'>('landing');
  const [urlPin, setUrlPin] = useState<string>('');

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Commercial & Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isPaywallNoticeOpen, setIsPaywallNoticeOpen] = useState(false);
  const [pendingQuizToHost, setPendingQuizToHost] = useState<Quiz | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  // Check URL parameters for direct PIN join
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pinParam = params.get('pin');
      if (pinParam) {
        setUrlPin(pinParam);
        setCurrentView('home');
      }
      const splitParam = params.get('split');
      if (splitParam === 'true') {
        setCurrentView('split');
      }
    }
  }, []);

  // Fetch quizzes from DB
  useEffect(() => {
    if (user && token) {
      fetch('/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.quizzes) {
          setQuizzes(data.quizzes);
        }
      })
      .catch(err => console.error('Error fetching quizzes:', err));
    }
  }, [user, token]);

  // Watch for server-side allowance errors on socket
  useEffect(() => {
    if (socket.allowanceError) {
      setIsPaywallNoticeOpen(true);
      socket.clearAllowanceError();
    }
  }, [socket.allowanceError, socket]);

  // Save new custom quiz
  const handleSaveQuiz = async (newQuiz: Quiz) => {
    try {
      // Save locally as fallback
      const customOnly = quizzes.filter(q => !DEFAULT_QUIZZES.some(dq => dq.id === q.id));
      const existingIdx = customOnly.findIndex(q => q.id === newQuiz.id);
      let updatedCustom: Quiz[];
      if (existingIdx >= 0) {
        updatedCustom = [...customOnly];
        updatedCustom[existingIdx] = newQuiz;
      } else {
        updatedCustom = [newQuiz, ...customOnly];
      }

      localStorage.setItem('quizpop_custom_quizzes', JSON.stringify(updatedCustom));
      localStorage.setItem('quizoot_custom_quizzes', JSON.stringify(updatedCustom));
      setQuizzes([...DEFAULT_QUIZZES, ...updatedCustom]);

      // Save to database if logged in
      if (user && token) {
        await fetch('/api/quizzes', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quiz: newQuiz })
        });
        
        // Refresh quizzes from server to get the new list with correct IDs and ordering
        const res = await fetch('/api/quizzes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.quizzes) {
          setQuizzes(data.quizzes);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    // Delete from state immediately for optimistic UI
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
    
    // Save locally as fallback
    const customOnly = quizzes.filter(q => !DEFAULT_QUIZZES.some(dq => dq.id === q.id));
    const updatedCustom = customOnly.filter(q => q.id !== quizId);
    localStorage.setItem('quizpop_custom_quizzes', JSON.stringify(updatedCustom));
    localStorage.setItem('quizoot_custom_quizzes', JSON.stringify(updatedCustom));

    if (user && token) {
      try {
        await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Launch a game as Host (with commercial gate check)
  const handleSelectQuizToHost = (quiz: Quiz) => {
    // If no user AND no token at all — must log in first
    if (!user && !token) {
      setPendingQuizToHost(quiz);
      setIsAuthModalOpen(true);
      return;
    }

    // If user context is loaded and allowance is denied (and not master) — show paywall
    if (user && allowance && !allowance.allowed && !isMaster) {
      setIsPaywallNoticeOpen(true);
      return;
    }

    // Proceed — server validates token and allowance
    socket.createRoom(quiz, token || undefined);
    refreshAuth();
  };

  const handleAuthSuccess = () => {
    if (pendingQuizToHost) {
      const quiz = pendingQuizToHost;
      setPendingQuizToHost(null);
      setTimeout(() => {
        socket.createRoom(quiz, token || undefined);
      }, 350);
    } else {
      if (user?.role === 'master') {
        navigate('/admin');
      } else {
        setCurrentView('quizzes');
      }
    }
  };

  // When AI generates a quiz, add it and open prompt to host
  const handleQuizGenerated = async (newQuiz: Quiz) => {
    await handleSaveQuiz(newQuiz);
    handleSelectQuizToHost(newQuiz);
  };

  // Determine active view mode
  const activeRoom = socket.room;

  return (
    <div className="min-h-screen bg-[#46178f] text-white flex flex-col font-['Montserrat',sans-serif]">
      {/* Global Header (Hidden during game) */}
      {!activeRoom && (
        <Header
          pin={socket.pin}
          soundEnabled={socket.soundEnabled}
          onToggleSound={socket.toggleSound}
          onLeaveRoom={undefined}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenPlans={() => setIsPlansModalOpen(true)}
          onLogoutSuccess={() => setCurrentView('landing')}
          onGoToHost={() => setCurrentView('quizzes')}
        />
      )}

      {/* Error notification toast */}
      {socket.errorMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 border border-red-400 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold animate-fadeIn max-w-md w-full mx-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{socket.errorMessage}</span>
          <button
            onClick={socket.clearError}
            className="p-1 hover:bg-red-700 rounded-lg text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col`}>
        {activeRoom ? (
          // Active Game Room
          socket.isHost ? (
            // HOST SCREENS
            <>
              {activeRoom.state === 'LOBBY' && (
                <HostLobby
                  room={activeRoom}
                  onStartGame={socket.startGame}
                  onAddBots={socket.addBots}
                  onKickPlayer={socket.kickPlayer}
                />
              )}

              {activeRoom.state === 'COUNTDOWN' && (
                <HostCountdown room={activeRoom} />
              )}

              {activeRoom.state === 'QUESTION' && (
                <HostQuestion
                  room={activeRoom}
                  onSkipQuestion={socket.skipQuestion}
                />
              )}

              {activeRoom.state === 'REVEAL' && (
                <HostReveal
                  room={activeRoom}
                  onNextStage={socket.nextStage}
                />
              )}

              {activeRoom.state === 'LEADERBOARD' && (
                <HostLeaderboard
                  room={activeRoom}
                  onNextStage={socket.nextStage}
                />
              )}

              {activeRoom.state === 'PODIUM' && (
                <HostPodium
                  room={activeRoom}
                  onRestartGame={socket.restartGame}
                  onLeaveRoom={socket.leaveRoom}
                />
              )}
            </>
          ) : (
            // PLAYER SCREENS
            <>
              {activeRoom.state === 'LOBBY' && socket.myPlayer && (
                <PlayerLobby
                  player={socket.myPlayer}
                  room={activeRoom}
                  onUpdateAvatar={(avatarConfig, nickname) => {
                    socket.updateAvatar(avatarConfig, nickname);
                  }}
                  onRenamePlayer={(nickname) => {
                    socket.renamePlayer(nickname);
                  }}
                />
              )}

              {activeRoom.state === 'COUNTDOWN' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-xl sm:text-2xl font-black text-purple-300 uppercase tracking-widest mb-2">
                    Prepare-se!
                  </span>
                  <div className="w-28 h-28 rounded-full bg-yellow-400 text-purple-950 font-black text-6xl flex items-center justify-center shadow-2xl animate-bounce-short">
                    {activeRoom.timeRemaining}
                  </div>
                  <p className="text-xs sm:text-sm text-yellow-300 font-bold mt-6">
                    A pergunta já vai aparecer!
                  </p>
                </div>
              )}

              {activeRoom.state === 'QUESTION' && (
                <PlayerQuestion
                  room={activeRoom}
                  onSubmitAnswer={socket.submitAnswer}
                  hasAnswered={socket.myPlayer?.hasAnswered}
                />
              )}

              {activeRoom.state === 'REVEAL' && socket.myPlayer && (
                <PlayerResult
                  player={socket.myPlayer}
                  lastResult={socket.lastPlayerResult}
                />
              )}

              {activeRoom.state === 'LEADERBOARD' && socket.myPlayer && (
                <PlayerLeaderboard
                  player={socket.myPlayer}
                  room={activeRoom}
                />
              )}

              {activeRoom.state === 'PODIUM' && socket.myPlayer && (
                <PlayerPodium
                  player={socket.myPlayer}
                  room={activeRoom}
                  onLeaveRoom={socket.leaveRoom}
                />
              )}
            </>
          )
        ) : (
          // Pre-game Screens
          <>
            {currentView === 'split' ? (
              <SplitScreenView onClose={() => setCurrentView('home')} quizzes={quizzes} />
            ) : currentView === 'quizzes' ? (
              <QuizSelector
                quizzes={quizzes}
                onSelectQuiz={handleSelectQuizToHost}
                onEditQuiz={(quiz) => {
                  setEditingQuiz(quiz);
                  setIsBuilderOpen(true);
                }}
                onDeleteQuiz={(quizId) => setQuizToDelete(quizId)}
                onOpenBuilder={() => {
                  setEditingQuiz(null);
                  setIsBuilderOpen(true);
                }}
                onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
                onBackToHome={() => setCurrentView('home')}
              />
            ) : currentView === 'landing' ? (
              <LandingPage
                onEnterPin={() => setCurrentView('home')}
                onGoToHost={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  } else {
                    setCurrentView('quizzes');
                  }
                }}
                onOpenPlans={() => setIsPlansModalOpen(true)}
              />
            ) : (
              <HomeEntry
                initialPin={urlPin}
                onJoinGame={(pin, nickname, avatar, color, avatarConfig) => {
                  socket.joinRoom(pin, nickname, avatar, color, avatarConfig);
                }}
                onGoToHost={() => setCurrentView('quizzes')}
                onGoBack={() => setCurrentView('landing')}
              />
            )}
          </>
        )}
      </main>

      {/* Quiz Modals */}
      <QuizBuilder
        isOpen={isBuilderOpen}
        initialQuiz={editingQuiz}
        onClose={() => setIsBuilderOpen(false)}
        onSaveQuiz={handleSaveQuiz}
      />

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onQuizGenerated={handleQuizGenerated}
      />

      {/* Commercial & Master Management Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <CommercialModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        onOpenAuth={() => {
          setIsPlansModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      <MasterAdminModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
      />

      <PaywallNoticeModal
        isOpen={isPaywallNoticeOpen}
        onClose={() => setIsPaywallNoticeOpen(false)}
        onOpenPlans={() => {
          setIsPaywallNoticeOpen(false);
          setIsPlansModalOpen(true);
        }}
        onOpenAuth={() => {
          setIsPaywallNoticeOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Global WhatsApp Widget (Hidden during game) */}
      {!activeRoom && <WhatsAppWidget />}
      <ConfirmModal
        isOpen={quizToDelete !== null}
        title="Excluir Quiz?"
        message="Esta aǜo nǜo poderǭ ser desfeita. Tem certeza que deseja apagar este quiz?"
        onCancel={() => setQuizToDelete(null)}
        onConfirm={() => {
          if (quizToDelete) {
            handleDeleteQuiz(quizToDelete);
            setQuizToDelete(null);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameAudioProvider>
          <Routes>
            {/* Rota principal (Jogo) */}
            <Route path="/*" element={<AppContent />} />
            
            {/* Rotas de Administração */}
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="payments" element={<PaymentsManagement />} />
              <Route path="quizzes" element={<QuizzesManagement />} />
              <Route path="logs" element={<LogsManagement />} />
              <Route path="settings" element={<SettingsManagement />} />
            </Route>
          </Routes>
        </GameAudioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Wrapper to protect Admin Routes
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isMaster } = useAuth();
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!isMaster) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
