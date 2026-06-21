'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/store';

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState(75);
  const [budget, setBudget] = useState(5000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client.trim()) return;
    const project = createProject({
      name: name.trim(),
      client: client.trim(),
      description: description.trim(),
      hourlyRate,
      budget,
    });
    router.push(`/project/${project.id}`);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">← Dashboard</a>
          </div>
          <h1 className="text-lg font-semibold text-zinc-200">New Project</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">🛡️ Define Your Project Scope</h2>
            <p className="text-zinc-500">Start by setting the basics. You'll add deliverables and exclusions on the next screen.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Website Redesign for Acme Corp"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Client Name *</label>
              <input
                type="text"
                value={client}
                onChange={e => setClient(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief project overview..."
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</a>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all"
              >
                Create Project →
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}