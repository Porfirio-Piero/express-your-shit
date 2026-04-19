'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { X, ArrowLeft } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <X className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Upgrade Cancelled
            </h1>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              No worries! You can still use SecretDrop for free with 10 secrets per month. 
              Upgrade anytime when you need more.
            </p>

            <a
              href="/upgrade"
              className="inline-flex items-center gap-2 py-3 px-6 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}