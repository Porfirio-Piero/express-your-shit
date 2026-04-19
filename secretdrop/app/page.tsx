import Header from './components/Header';
import Footer from './components/Footer';
import SecretForm from './components/SecretForm';
import { Shield, Lock, Eye, Clock, Trash2, Server, Zap, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              Share Secrets That
              <span className="gradient-text"> Self-Destruct</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              End-to-end encrypted secret sharing. Your passwords, API keys, and private notes 
              are encrypted in your browser before they ever reach our servers. One view, then gone forever.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                <Eye className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">One-Time View</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-Destruct</span>
              </div>
            </div>
          </div>

          <SecretForm />
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 card-hover">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Encrypt</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your secret is encrypted using AES-256-GCM right in your browser. 
                  The encryption key never leaves your device.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 card-hover">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Server className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Upload</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Only the encrypted data is sent to our servers. We never see your 
                  plaintext secret or the decryption key.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 card-hover">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Share</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Send the link to your recipient. Once they view it, the secret 
                  is permanently deleted from our servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              Security Features
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 card-hover">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">End-to-End Encryption</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">AES-256-GCM encryption in your browser</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 card-hover">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Time Expiration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Auto-delete after set time period</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 card-hover">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">View Limits</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Control how many times it can be viewed</p>
              </div>

              <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 card-hover">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 mb-3" />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Burn After Reading</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Permanently deleted after viewing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pro Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-500 to-red-600">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Upgrade to Pro
            </h2>
            <p className="text-orange-100 mb-8">
              Get unlimited secrets, longer expiration, and more views per secret
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="p-8 bg-white/10 backdrop-blur rounded-2xl border border-white/20">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-4">$0</div>
                <ul className="text-left space-y-3 text-white/90 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    10 secrets/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    24h expiration max
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    1 view per secret
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Password protection
                  </li>
                </ul>
                <button className="w-full py-3 bg-white/20 text-white rounded-xl font-medium cursor-not-allowed">
                  Current Plan
                </button>
              </div>

              <div className="p-8 bg-white rounded-2xl">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-slate-900 mb-4">$8<span className="text-lg font-normal text-slate-600">/mo</span></div>
                <ul className="text-left space-y-3 text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Unlimited secrets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 30 day expiration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Up to 10 views per secret
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <a 
                  href="/upgrade" 
                  className="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium text-center hover:from-orange-600 hover:to-red-700 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Start Free Trial
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Zero Knowledge</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">One-Time View</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-medium">Auto-Destruct</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}