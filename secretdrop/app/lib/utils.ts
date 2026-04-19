import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a random ID for secrets
 */
export function generateSecretId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 12;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Format expiration time for display
 */
export function formatExpiration(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}

/**
 * Calculate expiration timestamp
 */
export function calculateExpiration(hours: number): number {
  return Date.now() + hours * 60 * 60 * 1000;
}

/**
 * Check if secret has expired
 */
export function isExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Format remaining time
 */
export function formatRemainingTime(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  
  if (remaining <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  return { valid: true };
}

/**
 * Validate secret content
 */
export function validateSecret(content: string): { valid: boolean; message?: string } {
  if (!content.trim()) {
    return { valid: false, message: 'Secret cannot be empty' };
  }
  if (content.length > 10000) {
    return { valid: false, message: 'Secret must be less than 10,000 characters' };
  }
  return { valid: true };
}