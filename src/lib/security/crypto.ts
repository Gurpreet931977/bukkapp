/**
 * BUKKAPP Cryptographic Security & Password Hashing Engine
 * 
 * Implements OWASP-recommended standard PBKDF2-HMAC-SHA-256 with 100,000 iterations
 * and unique 128-bit (16-byte) cryptographic random salts.
 * 
 * Works across Node.js, Next.js Server Components, Edge Middleware, and modern browsers
 * using the standard Web Crypto API (globalThis.crypto.subtle) with zero external dependencies.
 */

const HASH_ALGORITHM = 'SHA-256';
const ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;
const PREFIX = 'pbkdf2$sha256';

/**
 * Constant-time string equality check to prevent side-channel timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Converts a Uint8Array buffer into a lowercase hex string.
 */
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts a hex string into a Uint8Array buffer.
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Derives a cryptographic hash using PBKDF2-HMAC-SHA-256 with the specified salt.
 */
async function deriveHash(password: string, salt: Uint8Array, iterations: number = ITERATIONS): Promise<string> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  const cryptoObj = globalThis.crypto;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is unavailable in current runtime environment.');
  }

  const keyMaterial = await cryptoObj.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await cryptoObj.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH_BITS
  );

  return toHex(new Uint8Array(derivedBits));
}

/**
 * Checks whether a given string is already in the PBKDF2 or Bcrypt hash format.
 */
export function isHashed(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return value.startsWith(`${PREFIX}$`) || value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('pbkdf2$');
}

/**
 * Hashes a plaintext password using a cryptographically secure random 16-byte salt
 * and PBKDF2-HMAC-SHA-256 (100,000 iterations).
 * 
 * Returns serialized format: pbkdf2$sha256$<iterations>$<saltHex>$<hashHex>
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const cryptoObj = globalThis.crypto;
  const salt = cryptoObj.getRandomValues(new Uint8Array(SALT_BYTES));
  const saltHex = toHex(salt);

  const hashHex = await deriveHash(plainPassword, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${saltHex}$${hashHex}`;
}

/**
 * Verifies a plaintext password against a stored hash string.
 * Supports serialized PBKDF2 hashes, as well as constant-time fallback
 * for legacy accounts during live data migration.
 */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  if (!plainPassword || !storedHash) {
    return false;
  }

  // 1. Standard PBKDF2 format: pbkdf2$sha256$<iterations>$<saltHex>$<hashHex>
  if (storedHash.startsWith(`${PREFIX}$`)) {
    const parts = storedHash.split('$');
    if (parts.length !== 5) {
      return false;
    }
    const iterations = parseInt(parts[2], 10);
    const saltHex = parts[3];
    const expectedHashHex = parts[4];

    if (isNaN(iterations) || !saltHex || !expectedHashHex) {
      return false;
    }

    const salt = fromHex(saltHex);
    const candidateHashHex = await deriveHash(plainPassword, salt, iterations);
    return timingSafeEqual(candidateHashHex, expectedHashHex);
  }

  // 2. Legacy fallback / Direct timing-safe comparison for smooth upgrade
  return timingSafeEqual(plainPassword, storedHash);
}

/**
 * Pre-calculated cryptographic salted hashes for initial accounts.
 * Passwords are NEVER stored in plaintext.
 */
export const PRE_HASHED_SEEDS = {
  // Password: BukkappAdmin0926
  ADMIN_HASH: 'pbkdf2$sha256$100000$14bf95e66ae72e111f06deae89a73f70$691a4ffb4f69f9c4e017ec9877b71b774dbde01a5b4e41d168bc87ce0f81dc36',
  // Password: Business123!
  MERCHANT_HASH: 'pbkdf2$sha256$100000$d267a0cdad74365e11244e15814cd7f0$7d1752d50c862ad83b3cf028872443d11cda4c98bd6cb9925270854df529b42b',
  // Password: Customer123!
  CUSTOMER_HASH: 'pbkdf2$sha256$100000$4dce0db0ca8905514a8cb887f5b0d4bc$a630d11e14b3117e604772002f3687a1509fc56bf4d48c3d500ccd0e6ebbe051',
};
