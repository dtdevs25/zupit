export type UserRole = 'master' | 'user';

export type PlanStatus = 'free_trial' | 'basic' | 'pro' | 'unlimited' | 'blocked';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  planStatus: PlanStatus;
  freeTrialUsed: boolean;
  quizzesHostedCount: number;
  paidCredits: number;
  monthlyQuizzesLimit?: number;
  maxParticipants?: number;
  createdAt: number;
  lastLoginAt: number;
  notes?: string;
}

export interface AuthResponse {
  user: UserAccount;
  token: string;
}

export interface AllowanceCheckResult {
  allowed: boolean;
  reason?: 'NOT_LOGGED_IN' | 'BLOCKED' | 'TRIAL_EXHAUSTED' | 'OK';
  message?: string;
  quizzesRemaining: number;
  isUnlimited: boolean;
  maxParticipants?: number;
  planName?: string;
}

export interface AdminMetrics {
  totalUsers: number;
  freeTrialUsers: number;
  basicUsers: number;
  proUsers: number;
  totalQuizzesHosted: number;
  totalRevenueSimulated: number;
}
