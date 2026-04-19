/**
 * Client-side encryption utilities using Web Crypto API
 * Secrets are encrypted before hitting the server - true end-to-end encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

/**
 * Generate a random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive a key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with a generated key
 */
export async function encryptData(
  plaintext: string,
  password?: string
): Promise<{ encrypted: EncryptedData; keyString: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  let key: CryptoKey;
  let salt: Uint8Array;
  
  if (password) {
    // Derive key from password
    salt = crypto.getRandomValues(new Uint8Array(16));
    key = await deriveKeyFromPassword(password, salt);
  } else {
    // Generate random key
    key = await generateKey();
    salt = new Uint8Array(0);
  }
  
  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer,
    },
    key,
    data
  );
  
  // Export key for URL (only if no password)
  let keyString = '';
  if (!password) {
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    keyString = arrayBufferToBase64(exportedKey);
  }
  
  return {
    encrypted: {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: arrayBufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer),
      salt: arrayBufferToBase64(salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer),
    },
    keyString,
  };
}

/**
 * Decrypt data with a key
 */
export async function decryptData(
  encrypted: EncryptedData,
  keyString: string,
  password?: string
): Promise<string> {
  let key: CryptoKey;
  
  if (password && encrypted.salt) {
    // Derive key from password
    const salt = base64ToUint8Array(encrypted.salt);
    key = await deriveKeyFromPassword(password, salt);
  } else if (keyString) {
    // Import key from string
    const keyData = base64ToArrayBuffer(keyString);
    key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: ALGORITHM,
        length: KEY_LENGTH,
      },
      false,
      ['decrypt']
    );
  } else {
    throw new Error('No decryption key or password provided');
  }
  
  const ciphertext = base64ToArrayBuffer(encrypted.ciphertext);
  const iv = base64ToUint8Array(encrypted.iv);
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer,
    },
    key,
    ciphertext
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Generate a shareable link with embedded key fragment
 */
export function generateShareableLink(id: string, key: string): string {
  // Key fragment goes in hash (never sent to server)
  return `${window.location.origin}/s/${id}#${key}`;
}

/**
 * Extract key from URL hash
 */
export function extractKeyFromUrl(): string | null {
  const hash = window.location.hash.slice(1);
  return hash || null;
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}