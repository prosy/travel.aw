import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

export interface EncryptedData {
  ciphertext: string;  // Base64
  iv: string;          // Base64
  authTag: string;     // Base64
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns ciphertext, IV, and auth tag (all Base64 encoded).
 */
export function encrypt(plaintext: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM.
 * Requires ciphertext, IV, and auth tag (all Base64 encoded).
 */
export function decrypt(encrypted: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Encrypt data for database storage.
 * Returns a combined string (ciphertext:authTag) and IV separately.
 * The IV should be stored in a separate column for retrieval.
 */
export function encryptForDb(plaintext: string): { encrypted: string; iv: string } {
  const data = encrypt(plaintext);
  return {
    encrypted: `${data.ciphertext}:${data.authTag}`,
    iv: data.iv,
  };
}

/**
 * Decrypt data from database storage.
 * Takes the combined string (ciphertext:authTag) and IV.
 */
export function decryptFromDb(encrypted: string, iv: string): string {
  const [ciphertext, authTag] = encrypted.split(':');
  if (!ciphertext || !authTag) {
    throw new Error('Invalid encrypted data format');
  }
  return decrypt({ ciphertext, iv, authTag });
}

/**
 * Encrypt a JSON object for database storage.
 */
export function encryptJson<T>(data: T): { encrypted: string; iv: string } {
  const json = JSON.stringify(data);
  return encryptForDb(json);
}

/**
 * Decrypt and parse JSON from database storage.
 */
export function decryptJson<T>(encrypted: string, iv: string): T {
  const json = decryptFromDb(encrypted, iv);
  return JSON.parse(json) as T;
}

/**
 * Check if encryption is configured.
 * Returns false if ENCRYPTION_KEY is missing or invalid.
 */
export function isEncryptionConfigured(): boolean {
  const key = process.env.ENCRYPTION_KEY;
  return !!key && key.length === 64;
}
