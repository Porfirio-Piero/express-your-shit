import { NextRequest, NextResponse } from 'next/server';
import { head, del, put } from '@vercel/blob';

interface SecretData {
  metadata: {
    id: string;
    createdAt: number;
    expiresAt: number;
    maxViews: number;
    currentViews: number;
    hasPassword: boolean;
    passwordHash?: string;
  };
  encrypted: {
    ciphertext: string;
    iv: string;
    salt: string;
  };
}

/**
 * GET /api/secret/[id]
 * Retrieve a secret (one-time view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format (alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(id) || id.length > 20) {
      return NextResponse.json(
        { error: 'Invalid secret ID' },
        { status: 400 }
      );
    }

    // Construct blob URL
    const blobUrl = `${process.env.BLOB_PUBLIC_URL || 'https://public.blob.vercel-storage.com'}/secrets/${id}.json`;
    
    // Check if blob exists
    let blobInfo;
    try {
      blobInfo = await head(blobUrl);
    } catch {
      return NextResponse.json(
        { error: 'Secret not found or already viewed' },
        { status: 404 }
      );
    }
    
    if (!blobInfo) {
      return NextResponse.json(
        { error: 'Secret not found or already viewed' },
        { status: 404 }
      );
    }

    // Fetch the actual content
    const response = await fetch(blobUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Secret not found or already viewed' },
        { status: 404 }
      );
    }
    
    const secretData: SecretData = await response.json();
    const { metadata, encrypted } = secretData;

    // Check if expired
    if (Date.now() > metadata.expiresAt) {
      // Delete expired secret
      await del(blobUrl);
      return NextResponse.json(
        { error: 'Secret has expired' },
        { status: 410 }
      );
    }

    // Check view limit
    if (metadata.currentViews >= metadata.maxViews) {
      // Delete over-viewed secret
      await del(blobUrl);
      return NextResponse.json(
        { error: 'Secret has already been viewed' },
        { status: 410 }
      );
    }

    // Increment view count
    metadata.currentViews += 1;

    // If max views reached, delete the secret
    if (metadata.currentViews >= metadata.maxViews) {
      await del(blobUrl);
    } else {
      // Otherwise, update with new view count
      await put(`secrets/${id}.json`, JSON.stringify({ metadata, encrypted }), {
        access: 'public',
        contentType: 'application/json',
      });
    }

    // Return encrypted data (client will decrypt)
    return NextResponse.json({
      encrypted,
      hasPassword: metadata.hasPassword,
      expiresAt: metadata.expiresAt,
      remainingViews: metadata.maxViews - metadata.currentViews,
    });
  } catch (error) {
    console.error('Error retrieving secret:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve secret' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/secret/[id]
 * Delete a secret (manual burn)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!/^[a-zA-Z0-9]+$/.test(id) || id.length > 20) {
      return NextResponse.json(
        { error: 'Invalid secret ID' },
        { status: 400 }
      );
    }

    // Construct blob URL
    const blobUrl = `${process.env.BLOB_PUBLIC_URL || 'https://public.blob.vercel-storage.com'}/secrets/${id}.json`;

    // Delete the secret
    try {
      await del(blobUrl);
    } catch {
      // Ignore errors if blob doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json(
      { error: 'Failed to delete secret' },
      { status: 500 }
    );
  }
}