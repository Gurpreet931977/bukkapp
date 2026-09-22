/**
 * BUKKAPP Anti-Brute Force & Rate Limiting Engine
 * 
 * Provides defense against automated credential-stuffing, password spraying,
 * SMS OTP flooding, and booking spam.
 * 
 * Persists failure attempts in sessionStorage/in-memory to resist page-refresh evasion.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockoutUntil: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSec?: number;
  error?: string;
}

export class RateLimiter {
  private inMemoryStore: Map<string, RateLimitRecord> = new Map();
  private storagePrefix = 'bukkapp_rl_';

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
    return null;
  }

  private getRecord(key: string): RateLimitRecord {
    const storage = this.getStorage();
    if (storage) {
      try {
        const item = storage.getItem(this.storagePrefix + key);
        if (item) {
          return JSON.parse(item);
        }
      } catch {}
    }

    const mem = this.inMemoryStore.get(key);
    if (mem) return mem;

    return {
      attempts: 0,
      firstAttemptTime: Date.now(),
      lockoutUntil: 0,
    };
  }

  private saveRecord(key: string, record: RateLimitRecord) {
    this.inMemoryStore.set(key, record);
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(this.storagePrefix + key, JSON.stringify(record));
      } catch {}
    }
  }

  /**
   * Checks if an attempt is currently permitted for the key.
   */
  public check(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000
  ): RateLimitResult {
    const now = Date.now();
    const record = this.getRecord(key);

    // 1. Check if currently locked out
    if (record.lockoutUntil > now) {
      const retryAfterSec = Math.ceil((record.lockoutUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSec,
        error: `Too many attempts. Locked for security. Retry in ${retryAfterSec}s.`,
      };
    }

    // 2. Check window expiration
    if (now - record.firstAttemptTime > windowMs) {
      return {
        allowed: true,
        remainingAttempts: maxAttempts,
      };
    }

    const remaining = Math.max(0, maxAttempts - record.attempts);
    return {
      allowed: remaining > 0,
      remainingAttempts: remaining,
    };
  }

  /**
   * Records a failed attempt for the key and applies lockouts if threshold exceeded.
   */
  public recordFailure(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000,
    lockoutMs: number = 15 * 60 * 1000
  ): RateLimitResult {
    const now = Date.now();
    let record = this.getRecord(key);

    // Reset window if expired
    if (now - record.firstAttemptTime > windowMs && record.lockoutUntil <= now) {
      record = {
        attempts: 1,
        firstAttemptTime: now,
        lockoutUntil: 0,
      };
    } else {
      record.attempts += 1;
    }

    // Trigger lockout if attempts hit max
    if (record.attempts >= maxAttempts) {
      record.lockoutUntil = now + lockoutMs;
      this.saveRecord(key, record);
      const retryAfterSec = Math.ceil(lockoutMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSec,
        error: `Too many failed attempts. Security lockout active for ${retryAfterSec}s.`,
      };
    }

    this.saveRecord(key, record);
    const remaining = Math.max(0, maxAttempts - record.attempts);
    return {
      allowed: true,
      remainingAttempts: remaining,
    };
  }

  /**
   * Resets counter upon successful authentication or action.
   */
  public reset(key: string): void {
    this.inMemoryStore.delete(key);
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.removeItem(this.storagePrefix + key);
      } catch {}
    }
  }
}

export const securityLimiter = new RateLimiter();
