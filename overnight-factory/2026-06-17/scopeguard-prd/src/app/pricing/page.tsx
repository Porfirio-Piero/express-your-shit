import Link from 'next/link';

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-bold">⛨</div>
            <span className="text-lg font-bold text-zinc-100">ScopeGuard</span>
          </a>
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Dashboard</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">Stop Losing Money to Scope Creep</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            57% of freelancers lose $1,000+/month to scope creep. ScopeGuard makes it easy to document scope, get client approval, and charge for changes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-zinc-200 mb-2">Free</h2>
            <p className="text-zinc-500 text-sm mb-6">Perfect for trying ScopeGuard</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-100">$0</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span> 1 project
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span> Scope builder
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span> Client approval links
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span> 2 change orders
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-emerald-400">✓</span> Creep tracking
              </li>
            </ul>
            <a href="/project/new" className="block w-full py-3 bg-zinc-800 text-zinc-300 text-center font-semibold rounded-lg hover:bg-zinc-700 transition-colors">
              Get Started Free
            </a>
          </div>

          {/* Pro */}
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <h2 className="text-xl font-bold text-amber-400 mb-2">Pro</h2>
            <p className="text-zinc-500 text-sm mb-6">For working freelancers</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-100">$19</span>
              <span className="text-zinc-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-amber-400">✓</span> Unlimited projects
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-amber-400">✓</span> Everything in Free
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-amber-400">✓</span> Unlimited change orders
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-amber-400">✓</span> PDF export
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-amber-400">✓</span> Custom branding
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-amber-400">✓</span> Priority support
              </li>
            </ul>
            <a href="/project/new" className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-center font-bold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all">
              Start Pro Trial
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-lg font-semibold text-zinc-200 mb-4">Why ScopeGuard?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4">
              <div className="text-3xl mb-2">🛡️</div>
              <h4 className="font-medium text-zinc-200 mb-1">Protect Revenue</h4>
              <p className="text-sm text-zinc-500">Document scope upfront so clients can't claim "it was included."</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-medium text-zinc-200 mb-1">2-Click Change Orders</h4>
              <p className="text-sm text-zinc-500">When scope creep happens, generate a professional change order in seconds.</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-medium text-zinc-200 mb-1">Track Creep</h4>
              <p className="text-sm text-zinc-500">See exactly how much scope creep each project has — and charge for it.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}