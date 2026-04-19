'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Zap, 
  Check, 
  X, 
  Loader2, 
  Shield,
  Clock,
  Eye,
  Infinity,
  Sparkles
} from 'lucide-react';

export default function UpgradePage() {
  const handleUpgrade = () => {
    // Redirect to Stripe checkout
    window.location.href = '/api/stripe/checkout';
  };

  const features = [
    { icon: Infinity, text: 'Unlimited secrets per month', free: false, pro: true },
    { icon: Clock, text: 'Up to 30 day expiration', free: '24 hours', pro: true },
    { icon: Eye, text: 'Up to 10 views per secret', free: '1 view', pro: true },
    { icon: Shield, text: 'Password protection', free: true, pro: true },
    { icon: Zap, text: 'Priority support', free: false, pro: true },
    { icon: Sparkles, text: '7-day free trial', free: false, pro: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Upgrade to <span className="gradient-text">Pro</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get unlimited secrets, longer expiration times, and more views per secret. 
              Start with a 7-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Free</h2>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                  <span className="text-slate-500 dark:text-slate-400">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.free === true ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : feature.free === false ? (
                      <X className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">{feature.free}</span>
                    )}
                    <span className={`text-sm ${feature.free === false ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button 
                disabled
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-xl font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 rounded-full">
                <span className="text-xs font-semibold text-white">BEST VALUE</span>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Pro</h2>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-white">$8</span>
                  <span className="text-white/70">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-white/90">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                className="w-full py-3 px-4 bg-white text-orange-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Free Trial
              </button>

              <p className="text-center text-xs text-white/70 mt-4">
                7-day free trial • Cancel anytime
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Yes! You can cancel your subscription at any time. You'll continue to have 
                  Pro access until the end of your billing period.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">What happens after the trial?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  After your 7-day free trial, you'll be charged $8/month. We'll send you 
                  a reminder before the trial ends.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Is my payment secure?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Absolutely. We use Stripe for secure payment processing. We never store 
                  your credit card information.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Can I get a refund?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  If you're not satisfied, contact us within 14 days of your first payment 
                  for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}