'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES } from '@/lib/constants';
import CategoryPicker from '@/components/CategoryPicker';
import ProgressCard from '@/components/ProgressCard';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  status: string;
}

interface CategorizeData {
  client: { id: string; name: string };
  transactions: Transaction[];
  stats: {
    total: number;
    categorized: number;
    uncategorized: number;
    skipped: number;
    progress_pct: number;
  };
  categories: string[];
}

export default function CategorizePage({ params }: { params: Promise<{ uuid: string }> }) {
  const [uuid, setUuid] = useState<string>('');
  const [data, setData] = useState<CategorizeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    params.then(p => setUuid(p.uuid));
  }, [params]);

  const fetchData = useCallback(async () => {
    if (!uuid) return;
    try {
      const res = await fetch(`/api/categorize/${uuid}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to load');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const uncategorized = data?.transactions.filter(t => t.status === 'uncategorized') || [];
  const currentTransaction = uncategorized[currentIndex];

  const handleCategorize = async (category: string) => {
    if (!currentTransaction) return;
    setCategorizing(true);
    setShowPicker(false);

    try {
      const res = await fetch(`/api/transactions/${currentTransaction.id}/categorize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });

      if (!res.ok) throw new Error('Failed to categorize');

      setAnimating(true);
      setTimeout(() => {
        // Move to next uncategorized or show completion
        if (currentIndex + 1 >= uncategorized.length) {
          setCompleted(true);
        } else {
          setCurrentIndex(currentIndex + 1);
        }
        setAnimating(false);
      }, 300);

      // Refresh stats
      fetchData();
    } catch (err) {
      console.error('Categorize error:', err);
    } finally {
      setCategorizing(false);
    }
  };

  const handleSkip = async () => {
    if (!currentTransaction) return;
    setCategorizing(true);

    try {
      await fetch(`/api/transactions/${currentTransaction.id}/categorize`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'Uncategorized', status: 'skipped' }),
      });

      if (currentIndex + 1 >= uncategorized.length) {
        setCompleted(true);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
      fetchData();
    } catch (err) {
      console.error('Skip error:', err);
    } finally {
      setCategorizing(false);
    }
  };

  const handleGoBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Note: this doesn't "un-categorize" - just shows the previous card
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📒</div>
          <p className="text-gray-600">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <p className="text-sm text-gray-400">Please contact your bookkeeper for a new link.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = data.stats;
  const progressPct = stats?.progress_pct ?? 0;
  const totalUncategorized = stats?.uncategorized ?? 0;
  const totalCategorized = stats?.categorized ?? 0;
  const total = stats?.total ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📒</span>
            <span className="font-semibold text-gray-900">{data.client.name}</span>
          </div>
          <div className="text-sm text-gray-500">
            {totalCategorized} / {total} done
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress */}
        <div className="mb-6">
          <ProgressCard
            total={total}
            categorized={totalCategorized}
            uncategorized={totalUncategorized}
            label="Categorization Progress"
          />
        </div>

        {completed || uncategorized.length === 0 ? (
          /* Completion Screen */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
            <p className="text-gray-500 mb-6">
              You&apos;ve categorized all your transactions. Your bookkeeper will be notified.
            </p>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-green-700 font-medium">
                ✅ {totalCategorized} of {total} transactions categorized
              </p>
            </div>
          </div>
        ) : showPicker ? (
          /* Category Picker */
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-gray-500">{currentTransaction?.date}</p>
                <span className="text-xs text-gray-400">
                  {currentIndex + 1} of {uncategorized.length}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-900 mb-1">
                {currentTransaction?.description}
              </p>
              <p className={`text-lg font-bold ${
                (currentTransaction?.amount || 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {currentTransaction?.amount != null && 
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                    .format(currentTransaction.amount)
                }
              </p>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pick a category:</h3>
            <CategoryPicker
              categories={CATEGORIES}
              onSelect={handleCategorize}
            />
            <button
              onClick={() => setShowPicker(false)}
              className="w-full mt-3 py-2.5 text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              ← Back to transaction
            </button>
          </div>
        ) : (
          /* Transaction Card */
          <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {currentTransaction?.date && new Date(currentTransaction.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                  {currentIndex + 1} of {uncategorized.length}
                </span>
              </div>

              <p className="text-xl font-semibold text-gray-900 mb-3">
                {currentTransaction?.description}
              </p>

              <p className={`text-3xl font-bold ${
                (currentTransaction?.amount || 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {currentTransaction?.amount != null &&
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                    .format(currentTransaction.amount)
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowPicker(true)}
                disabled={categorizing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
              >
                Categorize This Transaction
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleGoBack}
                  disabled={currentIndex === 0}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium transition-colors hover:bg-gray-50 disabled:opacity-30"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSkip}
                  disabled={categorizing}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Skip →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}