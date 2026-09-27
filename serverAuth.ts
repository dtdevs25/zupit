import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { UserAccount, AllowanceCheckResult, AdminMetrics } from './src/types/auth.ts';

const { Pool } = pg;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Para conexões externas, pode precisar de ssl: { rejectUnauthorized: false } dependendo da configuração da Hetzner
});

// Setup Initial Table
export async function initDb() {
  if (!process.env.DATABASE_URL) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        plan_status VARCHAR(50) DEFAULT 'free_trial',
        free_trial_used BOOLEAN DEFAULT FALSE,
        quizzes_hosted_count INT DEFAULT 0,
        paid_credits INT DEFAULT 0,
        monthly_quizzes_limit INT DEFAULT 10,
        max_participants INT DEFAULT 15,
        created_at BIGINT NOT NULL,
        last_login_at BIGINT NOT NULL,
        notes TEXT,
        password_hash VARCHAR(255) NOT NULL
      );
    `);
    
    // Create master user if not exists
    const masterEmail = 'dani.dk.santos@gmail.com';
    const res = await client.query('SELECT * FROM users WHERE email = $1', [masterEmail]);
    if (res.rows.length === 0) {
      await client.query(`
        INSERT INTO users (id, name, email, role, plan_status, free_trial_used, quizzes_hosted_count, paid_credits, monthly_quizzes_limit, max_participants, created_at, last_login_at, notes, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        'master-1', 'Dani Master', masterEmail, 'master', 'unlimited', false, 0, 9999, 999999, 999999, Date.now(), Date.now(), 'Administrador Master', hashPassword('master123')
      ]);
    }
  } finally {
    client.release();
  }
}

initDb().catch(console.error);

interface StoredUser extends UserAccount {
  password_hash?: string;
  plan_status?: string;
  free_trial_used?: boolean;
  quizzes_hosted_count?: number;
  paid_credits?: number;
  monthly_quizzes_limit?: number;
  max_participants?: number;
  created_at?: number;
  last_login_at?: number;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_quizpop_salt').digest('hex');
}

const JWT_SECRET = process.env.JWT_SECRET || 'secret_de_fallback_inseguro_mude_no_env';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Convert DB row to UserAccount
function mapDbToUser(row: any): UserAccount {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as any,
    planStatus: row.plan_status as any,
    freeTrialUsed: row.free_trial_used,
    quizzesHostedCount: row.quizzes_hosted_count,
    paidCredits: row.paid_credits,
    monthlyQuizzesLimit: row.monthly_quizzes_limit,
    maxParticipants: row.max_participants,
    createdAt: Number(row.created_at),
    lastLoginAt: Number(row.last_login_at),
    notes: row.notes || undefined,
  };
}

export async function getUserByToken(token: string): Promise<UserAccount | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (res.rows.length === 0) return null;
    return mapDbToUser(res.rows[0]);
  } catch (e) {
    return null;
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ user: UserAccount; token: string }> {
  const cleanEmail = email.trim().toLowerCase();
  
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
  if (existing.rows.length > 0) {
    throw new Error('E-mail já cadastrado. Faça login para continuar.');
  }

  const isMaster = cleanEmail === 'dani.dk.santos@gmail.com';
  const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  
  const row = {
    id,
    name: name.trim() || 'Usuário QuizPop',
    email: cleanEmail,
    role: isMaster ? 'master' : 'user',
    plan_status: isMaster ? 'unlimited' : 'free_trial',
    free_trial_used: false,
    quizzes_hosted_count: 0,
    paid_credits: isMaster ? 9999 : 0,
    monthly_quizzes_limit: isMaster ? 999999 : 10,
    max_participants: isMaster ? 999999 : 15,
    created_at: Date.now(),
    last_login_at: Date.now(),
    notes: '',
    password_hash: hashPassword(password),
  };

  await pool.query(`
    INSERT INTO users (id, name, email, role, plan_status, free_trial_used, quizzes_hosted_count, paid_credits, monthly_quizzes_limit, max_participants, created_at, last_login_at, notes, password_hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `, [row.id, row.name, row.email, row.role, row.plan_status, row.free_trial_used, row.quizzes_hosted_count, row.paid_credits, row.monthly_quizzes_limit, row.max_participants, row.created_at, row.last_login_at, row.notes, row.password_hash]);

  const user = mapDbToUser(row);
  const token = generateToken(user.id);
  return { user, token };
}

export async function loginUser(email: string, password?: string, skipPasswordForMasterQuick?: boolean): Promise<{ user: UserAccount; token: string }> {
  const cleanEmail = email.trim().toLowerCase();
  
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
  
  if (res.rows.length === 0) {
    if (cleanEmail === 'dani.dk.santos@gmail.com') {
      return registerUser('Dani Master', cleanEmail, password || 'master123');
    }
    throw new Error('Usuário não encontrado. Verifique seu e-mail ou crie uma conta gratuita.');
  }

  const dbUser = res.rows[0];

  if (!skipPasswordForMasterQuick && password) {
    if (dbUser.password_hash !== hashPassword(password)) {
      throw new Error('Senha incorreta. Tente novamente.');
    }
  }

  await pool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [Date.now(), dbUser.id]);
  dbUser.last_login_at = Date.now();

  const user = mapDbToUser(dbUser);
  const token = generateToken(user.id);
  return { user, token };
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

  if (user.role === 'master' || user.planStatus === 'unlimited' || user.planStatus === 'pro') {
    return { allowed: true, reason: 'OK', quizzesRemaining: 999, isUnlimited: true, maxParticipants: 999999, planName: 'Pacote Master (Ilimitado)' };
  }

  if (user.planStatus === 'basic') {
    if (user.paidCredits > 0) {
      return { allowed: true, reason: 'OK', quizzesRemaining: user.paidCredits, isUnlimited: false, maxParticipants: 30, planName: 'Pacote Básico (Até 30 Participantes)' };
    } else {
      return { allowed: false, reason: 'TRIAL_EXHAUSTED', message: 'Você utilizou os 10 quizzes da sua cota mensal do Pacote Básico. Faça upgrade para o Pacote Master!', quizzesRemaining: 0, isUnlimited: false, maxParticipants: 30, planName: 'Pacote Básico (Esgotado)' };
    }
  }

  if (user.paidCredits > 0) {
    return { allowed: true, reason: 'OK', quizzesRemaining: user.paidCredits, isUnlimited: false, maxParticipants: 30, planName: 'Créditos Avulsos' };
  }

  if (!user.freeTrialUsed) {
    return { allowed: true, reason: 'OK', quizzesRemaining: 1, isUnlimited: false, maxParticipants: 15, planName: 'Teste Gratuito (Até 15 Participantes)' };
  }

  return { allowed: false, reason: 'TRIAL_EXHAUSTED', message: 'Você já utilizou seu 1 quiz gratuito de teste! Faça upgrade para continuar.', quizzesRemaining: 0, isUnlimited: false, maxParticipants: 15, planName: 'Teste Gratuito Esgotado' };
}

export async function consumeAllowance(userId: string): Promise<{ success: boolean; quizzesRemaining: number }> {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (res.rows.length === 0) return { success: false, quizzesRemaining: 0 };
  
  const user = res.rows[0];
  const newHostedCount = user.quizzes_hosted_count + 1;

  if (user.role === 'master' || user.plan_status === 'unlimited' || user.plan_status === 'pro') {
    await pool.query('UPDATE users SET quizzes_hosted_count = $1 WHERE id = $2', [newHostedCount, userId]);
    return { success: true, quizzesRemaining: 999 };
  }

  if (user.plan_status === 'basic' || user.paid_credits > 0) {
    if (user.paid_credits > 0) {
      await pool.query('UPDATE users SET quizzes_hosted_count = $1, paid_credits = $2 WHERE id = $3', [newHostedCount, user.paid_credits - 1, userId]);
      return { success: true, quizzesRemaining: user.paid_credits - 1 };
    }
  }

  if (!user.free_trial_used) {
    await pool.query('UPDATE users SET quizzes_hosted_count = $1, free_trial_used = true WHERE id = $2', [newHostedCount, userId]);
    return { success: true, quizzesRemaining: 0 };
  }

  return { success: false, quizzesRemaining: 0 };
}

export async function updateUserByAdmin(id: string, updates: Partial<UserAccount>): Promise<UserAccount> {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (res.rows.length === 0) throw new Error('Usuário não encontrado.');
  
  const u = res.rows[0];
  
  if (updates.name !== undefined) u.name = updates.name;
  if (updates.planStatus !== undefined) {
    u.plan_status = updates.planStatus;
    if (updates.planStatus === 'basic') {
      u.max_participants = 30;
      u.monthly_quizzes_limit = 10;
      if (u.paid_credits === 0) u.paid_credits = 10;
    } else if (updates.planStatus === 'pro' || updates.planStatus === 'unlimited') {
      u.max_participants = 999999;
      u.monthly_quizzes_limit = 999999;
    } else if (updates.planStatus === 'free_trial') {
      u.max_participants = 15;
    }
  }
  if (updates.role !== undefined) u.role = updates.role;
  if (updates.freeTrialUsed !== undefined) u.free_trial_used = updates.freeTrialUsed;
  if (updates.paidCredits !== undefined) u.paid_credits = Math.max(0, updates.paidCredits);
  if (updates.monthlyQuizzesLimit !== undefined) u.monthly_quizzes_limit = updates.monthlyQuizzesLimit;
  if (updates.maxParticipants !== undefined) u.max_participants = updates.maxParticipants;
  if (updates.notes !== undefined) u.notes = updates.notes;

  await pool.query(`
    UPDATE users SET 
      name = $1, plan_status = $2, role = $3, free_trial_used = $4, paid_credits = $5, 
      monthly_quizzes_limit = $6, max_participants = $7, notes = $8
    WHERE id = $9
  `, [u.name, u.plan_status, u.role, u.free_trial_used, u.paid_credits, u.monthly_quizzes_limit, u.max_participants, u.notes, id]);

  return mapDbToUser(u);
}

export async function deleteUserByAdmin(id: string): Promise<void> {
  const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  if (res.rowCount === 0) throw new Error('Usuário não encontrado.');
}

export async function getAllUsersAdmin(): Promise<UserAccount[]> {
  const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return res.rows.map(mapDbToUser);
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const res = await pool.query('SELECT * FROM users');
  const users = res.rows;
  
  const totalUsers = users.length;
  const freeTrialUsers = users.filter(u => u.plan_status === 'free_trial').length;
  const basicUsers = users.filter(u => u.plan_status === 'basic').length;
  const proUsers = users.filter(u => u.plan_status === 'pro' || u.plan_status === 'unlimited').length;
  const totalQuizzesHosted = users.reduce((acc, u) => acc + (u.quizzes_hosted_count || 0), 0);
  const totalRevenueSimulated = Number(((basicUsers * 8.99) + (proUsers * 18.99)).toFixed(2));

  return { totalUsers, freeTrialUsers, basicUsers, proUsers, totalQuizzesHosted, totalRevenueSimulated };
}
