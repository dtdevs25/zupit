import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { UserAccount, AllowanceCheckResult, AdminMetrics } from './src/types/auth.ts';
import { DEFAULT_QUIZZES } from './src/data/defaultQuizzes.ts';

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
      
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        cover_emoji VARCHAR(10),
        is_public BOOLEAN DEFAULT false,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
      
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(255) PRIMARY KEY,
        quiz_id VARCHAR(255) REFERENCES quizzes(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'multiple_choice',
        time_limit INT DEFAULT 20,
        points INT DEFAULT 1000,
        options JSONB NOT NULL,
        correct_answer INT NOT NULL,
        explanation TEXT,
        media_url TEXT,
        order_index INT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS system_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS platform_settings (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        free_limit INT NOT NULL,
        default_time INT NOT NULL,
        max_participants INT DEFAULT 15,
        allow_ai BOOLEAN DEFAULT true
      );
      
      ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS max_participants INT DEFAULT 15;
      ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS allow_ai BOOLEAN DEFAULT true;
    `);
    
    // Create or update master user
    const masterEmail = 'dani.dk.santos@gmail.com';
    const res = await client.query('SELECT * FROM users WHERE email = $1', [masterEmail]);
    if (res.rows.length === 0) {
      await client.query(`
        INSERT INTO users (id, name, email, role, plan_status, free_trial_used, quizzes_hosted_count, paid_credits, monthly_quizzes_limit, max_participants, created_at, last_login_at, notes, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        'master-1', 'Dani Master', masterEmail, 'master', 'unlimited', false, 0, 9999, 999999, 999999, Date.now(), Date.now(), 'Administrador Master', hashPassword('master123')
      ]);
    } else {
      await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashPassword('master123'), masterEmail]);
    }

    // Wipe old public quizzes to fix any bugged empty ones, then re-seed
    await client.query('DELETE FROM quizzes WHERE is_public = true');

    // Seed default quizzes
    for (const dq of DEFAULT_QUIZZES) {
      await client.query(`
        INSERT INTO quizzes (id, user_id, title, description, category, cover_emoji, is_public, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [dq.id, 'master-1', dq.title, dq.description, dq.category, dq.coverEmoji, true, Date.now(), Date.now()]);
      
      for (let i = 0; i < dq.questions.length; i++) {
        const q = dq.questions[i];
        await client.query(`
          INSERT INTO questions (id, quiz_id, text, type, time_limit, points, options, correct_answer, explanation, media_url, order_index)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `, [
          `${dq.id}_q${i}`, dq.id, q.text, q.type || 'multiple_choice', q.timeLimit || 20, 
          q.points || 1000, JSON.stringify(q.options), q.correctAnswer, 
          q.explanation || '', q.mediaUrl || '', i
        ]);
      }
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

const JWT_SECRET = process.env.JWT_SECRET || 'secret_de_fallback_inseguro_mude_no_env';

// Hashing de nível bancário/militar usando SCRYPT (resistente a ataques de Força Bruta e GPU)
function hashPassword(password: string): string {
  // Usa o JWT_SECRET do arquivo .env como salt, o que vincula as senhas à sua infraestrutura
  const derivedKey = crypto.scryptSync(password, JWT_SECRET, 64);
  return derivedKey.toString('hex');
}

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
  await logSystemAction(user.id, 'REGISTER', `Usuário cadastrado: ${user.email}`);
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
  await logSystemAction(user.id, 'LOGIN', `Usuário fez login.`);
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

export async function changeUserPasswordByAdmin(id: string, newPassword: string): Promise<void> {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (res.rows.length === 0) throw new Error('Usuário não encontrado.');
  
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashPassword(newPassword), id]);
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

// --- Quiz CRUD ---
export async function saveQuiz(userId: string, quiz: any) {
  if (!quiz.questions || quiz.questions.length < 5) {
    throw new Error('Um quiz precisa ter pelo menos 5 perguntas.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if quiz exists
    const res = await client.query('SELECT id, user_id FROM quizzes WHERE id = $1', [quiz.id]);
    const exists = res.rows.length > 0;
    
    // If it exists but belongs to someone else (e.g. system default), we duplicate it
    let actualQuizId = quiz.id;
    let isUpdate = false;
    
    if (exists) {
      if (res.rows[0].user_id === userId) {
        isUpdate = true;
      } else {
        // Create duplicate ID for the user
        actualQuizId = `${quiz.id}_${Date.now()}_${Math.random().toString(36).substring(2,7)}`;
      }
    }
    
    if (isUpdate) {
      await client.query(`
        UPDATE quizzes SET 
          title = $1, description = $2, category = $3, cover_emoji = $4, updated_at = $5
        WHERE id = $6 AND user_id = $7
      `, [quiz.title, quiz.description, quiz.category, quiz.coverEmoji, Date.now(), actualQuizId, userId]);
      
      // Delete old questions
      await client.query('DELETE FROM questions WHERE quiz_id = $1', [actualQuizId]);
    } else {
      await client.query(`
        INSERT INTO quizzes (id, user_id, title, description, category, cover_emoji, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [actualQuizId, userId, quiz.title, quiz.description, quiz.category, quiz.coverEmoji, Date.now(), Date.now()]);
    }

    // Insert questions
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      // Generate new question IDs to avoid collisions
      const qId = `${actualQuizId}_q${i}`;
      await client.query(`
        INSERT INTO questions (id, quiz_id, text, type, time_limit, points, options, correct_answer, explanation, media_url, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        qId, actualQuizId, q.text, q.type || 'multiple_choice', q.timeLimit || 20, 
        q.points || 1000, JSON.stringify(q.options), q.correctAnswer, 
        q.explanation || '', q.mediaUrl || '', i
      ]);
    }
    
    await client.query('COMMIT');
    await logSystemAction(userId, 'QUIZ_SAVED', `Quiz "${quiz.title}" atualizado/criado.`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
export async function getAllQuizzesForMasterPlay() {
  const quizzesRes = await pool.query(`
    SELECT * FROM quizzes 
    ORDER BY updated_at DESC
  `);
  let quizzes = quizzesRes.rows;
  
  const result = [];
  for (const q of quizzes) {
    const questionsRes = await pool.query('SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC', [q.id]);
    result.push({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      coverEmoji: q.cover_emoji,
      isPublic: q.is_public,
      isOwner: true, // Master can edit all
      questions: questionsRes.rows.map(row => ({
        id: row.id,
        text: row.text,
        type: row.type,
        timeLimit: row.time_limit,
        points: row.points,
        options: row.options,
        correctAnswer: row.correct_answer_index
      }))
    });
  }
  return result;
}


export async function getQuizzesByUser(userId: string) {
  const quizzesRes = await pool.query(`
    SELECT * FROM quizzes 
    WHERE user_id = $1 OR is_public = true 
    ORDER BY updated_at DESC
  `, [userId]);
  let quizzes = quizzesRes.rows;
  
  const result = [];
  for (const q of quizzes) {
    const questionsRes = await pool.query('SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC', [q.id]);
    result.push({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      coverEmoji: q.cover_emoji,
      isPublic: q.is_public,
      isOwner: q.user_id === userId,
      questions: questionsRes.rows.map(row => ({
        id: row.id,
        text: row.text,
        type: row.type,
        timeLimit: row.time_limit,
        points: row.points,
        options: row.options,
        correctAnswer: row.correct_answer,
        explanation: row.explanation,
        mediaUrl: row.media_url,
      }))
    });
  }
  return result;
}

export async function deleteQuiz(userId: string, quizId: string) {
  await pool.query('DELETE FROM quizzes WHERE id = $1 AND user_id = $2', [quizId, userId]);
  await logSystemAction(userId, 'QUIZ_DELETED', `Quiz ${quizId} removido pelo usuário.`);
}

export async function getAllQuizzesAdmin() {
  const quizzesRes = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC');
  let quizzes = quizzesRes.rows;
  
  const result = [];
  for (const q of quizzes) {
    const questionsRes = await pool.query('SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index ASC', [q.id]);
    
    // Fetch owner name
    const ownerRes = await pool.query('SELECT name FROM users WHERE id = $1', [q.user_id]);
    const ownerName = ownerRes.rows.length > 0 ? ownerRes.rows[0].name : 'Desconhecido';

    result.push({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      coverEmoji: q.cover_emoji,
      isPublic: q.is_public,
      ownerId: q.user_id,
      ownerName: ownerName,
      createdAt: Number(q.created_at),
      questionsCount: questionsRes.rows.length,
    });
  }
  return result;
}

export async function deleteQuizByAdmin(quizId: string) {
  await pool.query('DELETE FROM quizzes WHERE id = $1', [quizId]);
  await logSystemAction(null, 'QUIZ_DELETED_ADMIN', `Quiz ${quizId} removido pelo Admin.`);
}

export async function toggleQuizPublicStatus(quizId: string, isPublic: boolean) {
  await pool.query('UPDATE quizzes SET is_public = $1 WHERE id = $2', [isPublic, quizId]);
}

export async function logSystemAction(userId: string | null, action: string, details: string = '') {
  try {
    await pool.query(`
      INSERT INTO system_logs (id, user_id, action, details, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [crypto.randomUUID(), userId, action, details, Date.now()]);
  } catch (err) {
    console.error('Failed to write system log', err);
  }
}

export async function getSystemLogsAdmin() {
  const res = await pool.query(`
    SELECT l.*, u.name as user_name, u.email as user_email
    FROM system_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 200
  `);
  return res.rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name || 'Sistema',
    userEmail: r.user_email,
    action: r.action,
    details: r.details,
    createdAt: Number(r.created_at)
  }));
}

export async function getPlatformSettings() {
  const res = await pool.query('SELECT * FROM platform_settings LIMIT 1');
  if (res.rows.length === 0) {
    return { name: 'Zupit Master', free_limit: 10, default_time: 20, max_participants: 15, allow_ai: true };
  }
  return res.rows[0];
}

export async function updatePlatformSettings(name: string, freeLimit: number, defaultTime: number, maxParticipants: number = 15, allowAI: boolean = true) {
  const res = await pool.query('SELECT * FROM platform_settings LIMIT 1');
  if (res.rows.length === 0) {
    await pool.query(`
      INSERT INTO platform_settings (id, name, free_limit, default_time, max_participants, allow_ai)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [crypto.randomUUID(), name, freeLimit, defaultTime, maxParticipants, allowAI]);
  } else {
    await pool.query(`
      UPDATE platform_settings
      SET name = $1, free_limit = $2, default_time = $3, max_participants = $4, allow_ai = $5
      WHERE id = $6
    `, [name, freeLimit, defaultTime, maxParticipants, allowAI, res.rows[0].id]);
  }
}
