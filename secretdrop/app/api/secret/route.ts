import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { generateSecretId } from '@/app/lib/utils';

interface SecretMetadata {
  id: string;
  createdAt: number;
  expiresAt: number;
  maxViews: number;
  currentViews: number;
  hasPassword: boolean;
  passwordHash?: string;
}

/**
 * POST /api/secret
 * Create a new secret
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encrypted, expiresIn, maxViews, passwordHash } = body;

    // Validate input
    if (!encrypted || !encrypted.ciphertext) {
      return NextResponse.json(
        { error: 'Encrypted data required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = generateSecretId();

    // Calculate expiration
    const createdAt = Date.now();
    const expiresAt = createdAt + (expiresIn || 24) * 60 * 60 * 1000;

    // Create metadata
    const metadata: SecretMetadata = {
      id,
      createdAt,
      expiresAt,
      maxViews: maxViews || 1,
      currentViews: 0,
      hasPassword: !!passwordHash,
      passwordHash: passwordHash || undefined,
    };

    // Store encrypted secret in Vercel Blob
    const secretData = {
      metadata,
      encrypted,
    };

    await put(`secrets/${id}.json`, JSON.stringify(secretData), {
      access: 'public',
      contentType: 'application/json',
    });

    // Return success (no key - that's client-side only!)
    return NextResponse.json({
      success: true,
      id,
      expiresAt,
    });
  } catch (error) {
    console.error('Error creating secret:', error);
    return NextResponse.json(
      { error: 'Failed to create secret' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/secret
 * List secrets (admin/debug only - remove in production)
 */
export async function GET() {
  // In production, this should require authentication
  // For now, just return empty to prevent data leakage
  return NextResponse.json({ secrets: [] });
}