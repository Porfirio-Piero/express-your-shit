'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { decryptData, extractKeyFromUrl, EncryptedData } from '../../lib/crypto';
import { 
  Flame, 
  Lock, 
  Eye, 
  AlertCircle, 
  Check,
  Copy,
  Loader2,
  Shield,
  Clock,
  Trash2,
  Moon,
  Sun
} from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';

interface SecretResponse {
  encrypted: EncryptedData;
  hasPassword: boolean;
  expiresAt: number;
  remainingViews: number;
}

export default function ViewSecretPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secret, setSecret] = useState<SecretResponse | null>(null);
  const [decryptedContent, setDecryptedContent] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [confirmed, setConfirmed] = useState(false);

  // Extract key from URL hash
  const key = typeof window !== 'undefined' ? extractKeyFromUrl() : null;

  useEffect(() => {
    if (!key) {
      setError('Missing decryption key. Make sure you have the complete link.');
      setLoading(false);
      return;
    }

    fetchSecret();
  }, [id]);

  useEffect(() => {
    if (revealed && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [revealed, countdown]);

  const fetchSecret = async () => {
    try {
      const response = await fetch(`/api/secret/${id}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to retrieve secret');
      }

      const data = await response.json();
      setSecret(data);
    } catch (err: any) {
      setError(err.message || 'This secret has already been viewed or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!secret || !key) return;

    setDecrypting(true);
    setError('');

    try {
      const content = await decryptData(
        secret.encrypted,
        secret.hasPassword ? '' : key,
        secret.hasPassword ? password : undefined
      );
      setDecryptedContent(content);
      setRevealed(true);
    } catch (err) {
      setError(secret.hasPassword 
        ? 'Incorrect password. Please try again.' 
        : 'Failed to decrypt. The link may be corrupted.'
      );
    } finally {
      setDecrypting(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(decryptedContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    handleDecrypt();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Retrieving secret...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Secret Unavailable</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
              <a 
                href="/" 
                className="inline-block py-2 px-6 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                Create New Secret
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Burn confirmation screen
  if (!confirmed && secret) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-800 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6 text-white" />
                  <h2 className="text-lg font-bold text-white">Burn After Reading</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                        This secret can only be viewed once!
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Once you click "View Secret" below, the content will be displayed 
                        and then permanently deleted from our servers. Make sure you're 
                        ready to save any important information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Expires</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatExpiry(secret.expiresAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Encryption</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">AES-256-GCM</span>
                  </div>

                  {secret.hasPassword && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Password Protected</span>
                      </div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Yes</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirm}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/25 dark:shadow-none transition-all flex items-center justify-center gap-2 btn-press"
                >
                  <Eye className="w-5 h-5" />
                  View Secret
                </button>

                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                  This action cannot be undone. The secret will be permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Password input screen
  if (secret?.hasPassword && !revealed) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Password Protected</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  This secret requires a password to decrypt
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Show password</span>
                </label>

                <button
                  onClick={handleDecrypt}
                  disabled={!password || decrypting}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {decrypting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Decrypting...</>
                  ) : (
                    <><Lock className="w-5 h-5" /> Decrypt Secret</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Revealed secret
  if (revealed) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-white" />
                    <h2 className="text-lg font-bold text-white">Secret Revealed</h2>
                  </div>
                  {countdown > 0 && (
                    <div className="px-3 py-1 bg-white/20 rounded-full">
                      <span className="text-sm font-medium text-white">
                        Deleting in {countdown}s
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="relative">
                  <textarea
                    value={decryptedContent}
                    readOnly
                    rows={10}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl secret-textarea text-sm resize-none text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopy}
                    className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      copied
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-white dark:bg-slate-600 shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-500'
                    }`}
                  >
                    {copied ? (
                      <><Check className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy</>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex gap-3">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        This secret has been deleted
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        The encrypted data has been permanently removed from our servers. 
                        If you didn't save this information, it is now lost forever.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="/"
                  className="block w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-medium text-center transition-colors"
                >
                  Create Your Own Secret
                </a>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}

function formatExpiry(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}