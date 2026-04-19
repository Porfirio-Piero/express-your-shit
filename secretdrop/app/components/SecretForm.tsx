'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  Clock, 
  Eye, 
  Lock, 
  Copy, 
  Check,
  Shield,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import { encryptData, generateShareableLink } from '@/app/lib/crypto';
import { 
  validateSecret, 
  validatePassword, 
  formatExpiration,
  copyToClipboard 
} from '@/app/lib/utils';

const EXPIRY_OPTIONS = [
  { hours: 1, label: '1 hour', pro: false },
  { hours: 24, label: '24 hours', pro: false },
  { hours: 168, label: '7 days', pro: false },
  { hours: 720, label: '30 days', pro: true },
];

const VIEW_OPTIONS = [
  { views: 1, label: '1 view', pro: false },
  { views: 3, label: '3 views', pro: true },
  { views: 5, label: '5 views', pro: true },
  { views: 10, label: '10 views', pro: true },
];

export default function SecretForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [maxViews, setMaxViews] = useState(1);
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    key: string;
    url: string;
    expiresAt: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate content
    const validation = validateSecret(content);
    if (!validation.valid) {
      setError(validation.message || 'Invalid secret');
      return;
    }

    // Validate password if used
    if (usePassword && password) {
      const passValidation = validatePassword(password);
      if (!passValidation.valid) {
        setError(passValidation.message || 'Invalid password');
        return;
      }
    }

    setIsCreating(true);

    try {
      // Encrypt the secret client-side
      const { encrypted, keyString } = await encryptData(
        content,
        usePassword ? password : undefined
      );

      // Hash password for server storage (if used)
      let passwordHash = '';
      if (usePassword && password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = btoa(String.fromCharCode(...hashArray));
      }

      // Create secret on server
      const response = await fetch('/api/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encrypted,
          expiresIn: expiryHours,
          maxViews,
          passwordHash: passwordHash || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create secret');
      }

      const data = await response.json();

      // Generate shareable link with key in hash
      const url = generateShareableLink(data.id, keyString);

      setResult({
        id: data.id,
        key: keyString,
        url,
        expiresAt: data.expiresAt,
      });
    } catch (err) {
      setError('Failed to create secret. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.url) return;
    
    await copyToClipboard(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    setResult(null);
    setContent('');
    setPassword('');
    setUsePassword(false);
    setExpiryHours(24);
    setMaxViews(1);
  };

  if (result) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Secret Created!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Share this link - it will self-destruct after viewing
          </p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={result.url}
                readOnly
                className="flex-1 bg-transparent text-slate-900 dark:text-white font-mono text-sm outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Expires: {formatExpiration(result.expiresAt)}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {maxViews} view{maxViews > 1 ? 's' : ''}
            </div>
          </div>

          {usePassword && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-6 text-sm text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password protected - recipient will need the password
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCreateAnother}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Secret Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Your Secret
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your password, API key, private note, or any sensitive information..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            <Shield className="w-4 h-4 inline mr-1" />
            Encrypted with AES-256-GCM before leaving your browser
          </p>
        </div>

        {/* Options */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Expires After
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXPIRY_OPTIONS.map((option) => (
                <button
                  key={option.hours}
                  type="button"
                  onClick={() => !option.pro && setExpiryHours(option.hours)}
                  disabled={option.pro}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    expiryHours === option.hours
                      ? 'bg-indigo-600 text-white'
                      : option.pro
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                  {option.pro && <span className="ml-1 text-xs">PRO</span>}
                </button>
              ))}
            </div>
          </div>

          {/* View Limit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Eye className="w-4 h-4 inline mr-1" />
              Max Views
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.views}
                  type="button"
                  onClick={() => !option.pro && setMaxViews(option.views)}
                  disabled={option.pro}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    maxViews === option.views
                      ? 'bg-indigo-600 text-white'
                      : option.pro
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                  {option.pro && <span className="ml-1 text-xs">PRO</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Password Protection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                <Lock className="w-4 h-4 inline mr-1" />
                Password Protection
              </label>
              <button
                type="button"
                onClick={() => setUsePassword(!usePassword)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  usePassword ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    usePassword ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {usePassword && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (optional)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isCreating || !content.trim()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Encrypting...
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              Create Self-Destructing Secret
            </>
          )}
        </button>
      </form>
    </div>
  );
}