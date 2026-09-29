import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { UserAccount, PlanStatus, UserRole, AllowanceCheckResult, AdminMetrics } from './src/types/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const USERS_FILE = path.resolve(DATA_DIR, 'users.json');

interface StoredUser extends UserAccount {
  passwordHash: string;
}

const MASTER_EMAIL = 'Dani.dk.santos@gmail.com'.toLowerCase();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_quizpop_salt').digest('hex');
}

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultUsers(): StoredUser[] {
  const now = Date.now();
  return [
    {
      id: 'master-1',
      name: 'Dani Master',
      email: MASTER_EMAIL,
      role: 'master',
      planStatus: 'unlimited',
      freeTrialUsed: false,
      quizzesHostedCount: 32,
      paidCredits: 9999,
      monthlyQuizzesLimit: 999999,
      maxParticipants: 999999,
      createdAt: now - 30 * 86400000,
      lastLoginAt: now,
      notes: 'Super Administrador Master - Acesso Ilimitado Geral',
      passwordHash: hashPassword('master123'),
    },
    {
      id: 'user-sample-1',
      name: 'Prof. Marcos Silva',
      email: 'marcos.professor@escola.com.br',
      role: 'user',
      planStatus: 'free_trial',
      freeTrialUsed: true,
      quizzesHostedCount: 1,
      paidCredits: 0,
      maxParticipants: 15,
      createdAt: now - 2 * 86400000,
      lastLoginAt: now - 86400000,
      notes: 'Realizou 1 quiz gratuito (limite de 15 participantes). Teste esgotado.',
      passwordHash: hashPassword('senha123'),
    },
    {
      id: 'user-sample-2',
      name: 'Carla Mendes (Escola Criativa)',
      email: 'carla.escola@educacao.com.br',
      role: 'user',
      planStatus: 'basic',
      freeTrialUsed: true,
      quizzesHostedCount: 3,
      paidCredits: 7, // 7 out of 10 quizzes remaining this month
      monthlyQuizzesLimit: 10,
      maxParticipants: 30,
      createdAt: now - 15 * 86400000,
      lastLoginAt: now - 4000000,
      notes: 'Pacote Básico R$ 8,99/mês (10 quizzes/mês e até 30 participantes)',
      passwordHash: hashPassword('senha123'),
    },
    {
      id: 'user-sample-3',
      name: 'Lucas Dev',
      email: 'lucas.dev@tech.io',
      role: 'user',
      planStatus: 'free_trial',
      freeTrialUsed: false,
      quizzesHostedCount: 0,
      paidCredits: 0,
      maxParticipants: 15,
      createdAt: now - 3600000,
      lastLoginAt: now - 1800000,
      notes: 'Novo cadastro, 1 quiz gratuito disponível (até 15 participantes)',
      passwordHash: hashPassword('senha123'),
    },
  ];
}

export function loadUsers(): StoredUser[] {
  ensureDataDirectory();
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const defaults = getDefaultUsers();
      saveUsers(defaults);
      return defaults;
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const users: StoredUser[] = JSON.parse(data);

    // Guarantee master exists
    const hasMaster = users.some(u => u.email.toLowerCase() === MASTER_EMAIL);
    if (!hasMaster) {
      users.unshift({
        id: 'master-1',
        name: 'Dani Master',
        email: MASTER_EMAIL,
        role: 'master',
        planStatus: 'unlimited',
        freeTrialUsed: false,
        quizzesHostedCount: 0,
        paidCredits: 9999,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        notes: 'Administrador Master',
        passwordHash: hashPassword('master123'),
      });
      saveUsers(users);
    }

    return users;
  } catch (err) {
    console.error('Error loading users:', err);
    return getDefaultUsers();
  }
}

export function saveUsers(users: StoredUser[]): void {
  ensureDataDirectory();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

// In-memory token session map
const activeTokens = new Map<string, { userId: string; expiresAt: number }>();

export function generateToken(userId: string): string {
  const token = 'qp_' + crypto.randomBytes(24).toString('hex');
  activeTokens.set(token, {
    userId,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
}

export function getUserByToken(token: string): UserAccount | null {
  const session = activeTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeTokens.delete(token);
    return null;
  }
  const users = loadUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export function registerUser(name: string, email: string, password: string): { user: UserAccount; token: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('E-mail já cadastrado. Faça login para continuar.');
  }

  const isMaster = cleanEmail === MASTER_EMAIL;
  const newUser: StoredUser = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim() || 'Usuário QuizPop',
    email: cleanEmail,
    role: isMaster ? 'master' : 'user',
    planStatus: isMaster ? 'unlimited' : 'free_trial',
    freeTrialUsed: false,
    quizzesHostedCount: 0,
    paidCredits: isMaster ? 9999 : 0,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    passwordHash: hashPassword(password),
  };

  users.push(newUser);
  saveUsers(users);

  const token = generateToken(newUser.id);
  const { passwordHash: _, ...safeUser } = newUser;
  return { user: safeUser, token };
}

export function loginUser(email: string, password?: string, skipPasswordForMasterQuick?: boolean): { user: UserAccount; token: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    // If it's the master email logging in for the first time, auto-create
    if (cleanEmail === MASTER_EMAIL) {
      return registerUser('Dani Master', cleanEmail, password || 'master123');
    }
    throw new Error('Usuário não encontrado. Verifique seu e-mail ou crie uma conta gratuita.');
  }

  if (!skipPasswordForMasterQuick && password) {
    if (user.passwordHash !== hashPassword(password)) {
      throw new Error('Senha incorreta. Tente novamente.');
    }
  }

  user.lastLoginAt = Date.now();
  saveUsers(users);

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export function checkAllowance(user: UserAccount | null): AllowanceCheckResult {
  if (!user) {
    return {
      allowed: false,
      reason: 'NOT_LOGGED_IN',
      message: 'Você precisa entrar ou cadastrar sua conta para apresentar uma partida.',
      quizzesRemaining: 0,
      isUnlimited: false,
      maxParticipants: 15,
      planName: 'Sem Cadastro',
    };
  }

  if (user.planStatus === 'blocked') {
    return {
      allowed: false,
      reason: 'BLOCKED',
      message: 'Seu acesso foi temporariamente suspenso. Entre em contato com o suporte ou administrador master.',
      quizzesRemaining: 0,
      isUnlimited: false,
      maxParticipants: 0,
      planName: 'Bloqueado',
    };
  }

  // Master user or Unlimited Plan (Pacote Master - R$ 18,99)
  if (user.role === 'master' || user.planStatus === 'unlimited' || user.planStatus === 'pro') {
    return {
      allowed: true,
      reason: 'OK',
      quizzesRemaining: 999,
      isUnlimited: true,
      maxParticipants: 999999,
      planName: 'Pacote Master (Ilimitado)',
    };
  }

  // Basic Plan (Pacote Básico - R$ 8,99 - 10 quizzes/mês e até 30 participantes)
  if (user.planStatus === 'basic') {
    if (user.paidCredits > 0) {
      return {
        allowed: true,
        reason: 'OK',
        quizzesRemaining: user.paidCredits,
        isUnlimited: false,
        maxParticipants: 30,
        planName: 'Pacote Básico (Até 30 Participantes)',
      };
    } else {
      return {
        allowed: false,
        reason: 'TRIAL_EXHAUSTED',
        message: 'Você utilizou os 10 quizzes da sua cota mensal do Pacote Básico. Faça upgrade para o Pacote Master (R$ 18,99 - Tudo Ilimitado) ou renove seu pacote!',
        quizzesRemaining: 0,
        isUnlimited: false,
        maxParticipants: 30,
        planName: 'Pacote Básico (Esgotado)',
      };
    }
  }

  // Extra paid credits
  if (user.paidCredits > 0) {
    return {
      allowed: true,
      reason: 'OK',
      quizzesRemaining: user.paidCredits,
      isUnlimited: false,
      maxParticipants: 30,
      planName: 'Créditos Avulsos',
    };
  }

  // Free trial (1 free quiz - limit of 15 participants)
  if (!user.freeTrialUsed) {
    return {
      allowed: true,
      reason: 'OK',
      quizzesRemaining: 1,
      isUnlimited: false,
      maxParticipants: 15,
      planName: 'Teste Gratuito (Até 15 Participantes)',
    };
  }

  return {
    allowed: false,
    reason: 'TRIAL_EXHAUSTED',
    message: 'Você já utilizou seu 1 quiz gratuito de teste (com até 15 participantes)! Escolha o Pacote Básico (R$ 8,99 com 10 quizzes/mês e até 30 participantes) ou o Pacote Master (R$ 18,99 com quizzes e participantes ilimitados) para continuar.',
    quizzesRemaining: 0,
    isUnlimited: false,
    maxParticipants: 15,
    planName: 'Teste Gratuito Esgotado',
  };
}

export function consumeAllowance(userId: string): { success: boolean; quizzesRemaining: number } {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { success: false, quizzesRemaining: 0 };

  user.quizzesHostedCount = (user.quizzesHostedCount || 0) + 1;

  if (user.role === 'master' || user.planStatus === 'unlimited' || user.planStatus === 'pro') {
    saveUsers(users);
    return { success: true, quizzesRemaining: 999 };
  }

  if (user.planStatus === 'basic' || user.paidCredits > 0) {
    if (user.paidCredits > 0) {
      user.paidCredits -= 1;
      saveUsers(users);
      return { success: true, quizzesRemaining: user.paidCredits };
    }
  }

  if (!user.freeTrialUsed) {
    user.freeTrialUsed = true;
    saveUsers(users);
    return { success: true, quizzesRemaining: 0 };
  }

  return { success: false, quizzesRemaining: 0 };
}

export function updateUserByAdmin(id: string, updates: Partial<UserAccount>): UserAccount {
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('Usuário não encontrado.');

  if (updates.name !== undefined) user.name = updates.name;
  if (updates.planStatus !== undefined) {
    user.planStatus = updates.planStatus;
    if (updates.planStatus === 'basic') {
      user.maxParticipants = 30;
      user.monthlyQuizzesLimit = 10;
      if (user.paidCredits === 0) user.paidCredits = 10;
    } else if (updates.planStatus === 'pro' || updates.planStatus === 'unlimited') {
      user.maxParticipants = 999999;
      user.monthlyQuizzesLimit = 999999;
    } else if (updates.planStatus === 'free_trial') {
      user.maxParticipants = 15;
    }
  }
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.freeTrialUsed !== undefined) user.freeTrialUsed = updates.freeTrialUsed;
  if (updates.paidCredits !== undefined) user.paidCredits = Math.max(0, updates.paidCredits);
  if (updates.monthlyQuizzesLimit !== undefined) user.monthlyQuizzesLimit = updates.monthlyQuizzesLimit;
  if (updates.maxParticipants !== undefined) user.maxParticipants = updates.maxParticipants;
  if (updates.notes !== undefined) user.notes = updates.notes;

  saveUsers(users);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export function deleteUserByAdmin(id: string): void {
  const users = loadUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) throw new Error('Usuário não encontrado.');
  saveUsers(filtered);
}

export function getAllUsersAdmin(): UserAccount[] {
  const users = loadUsers();
  return users.map(({ passwordHash: _, ...safe }) => safe);
}

export function getAdminMetrics(): AdminMetrics {
  const users = loadUsers();
  const totalUsers = users.length;
  const freeTrialUsers = users.filter(u => u.planStatus === 'free_trial').length;
  const basicUsers = users.filter(u => u.planStatus === 'basic').length;
  const proUsers = users.filter(u => u.planStatus === 'pro' || u.planStatus === 'unlimited').length;
  const totalQuizzesHosted = users.reduce((acc, u) => acc + (u.quizzesHostedCount || 0), 0);
  // Basic: R$ 8,99 | Master: R$ 18,99
  const totalRevenueSimulated = Number(((basicUsers * 8.99) + (proUsers * 18.99)).toFixed(2));

  return {
    totalUsers,
    freeTrialUsers,
    basicUsers,
    proUsers,
    totalQuizzesHosted,
    totalRevenueSimulated,
  };
}
