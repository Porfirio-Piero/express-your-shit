'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (sessionId) {
      verifySession();
    } else {
      setVerifying(false);
    }
  }, [sessionId]);

  const verifySession = async () => {
    try {
      const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setVerified(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-green-200 dark:border-green-800 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome to Pro!
            </h1>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your subscription is now active. You can now create unlimited secrets 
              with extended expiration times.
            </p>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-300">7-day free trial started</span>
              </div>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 py-3 px-6 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
            >
              Create Your First Pro Secret
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}