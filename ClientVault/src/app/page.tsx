'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getClients, getDashboardStats, recalculateAllStatuses, deleteClient } from '@/lib/storage';
import { Client, STATUS_COLORS, STATUS_ICONS } from '@/lib/types';

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState({ total: 0, complete: 0, pending: 0, overdue: 0, completionRate: 0, avgDays: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'complete' | 'pending' | 'overdue'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', projectType: '' });

  useEffect(() => {
    recalculateAllStatuses();
    loadData();
  }, []);

  function loadData() {
    setClients(getClients());
    setStats(getDashboardStats());
  }

  const filtered = clients.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.projectType.toLowerCase().includes(s);
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function handleCreate() {
    if (!newClient.name.trim()) return;
    const { createClient } = require('@/lib/storage');
    createClient(newClient);
    setNewClient({ name: '', email: '', projectType: '' });
    setShowNewModal(false);
    loadData();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    deleteClient(id);
    loadData();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ClientVault</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/templates" className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors">Templates</Link>
              <Link href="/form-builder" className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors">Form Builder</Link>
              <Link href="/settings" className="text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors">Settings</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Total Clients</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Avg Days</div>
            <div className="text-2xl font-bold text-gray-900">{stats.avgDays}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-sm text-gray-500 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'complete', 'overdue'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Client
          </button>
        </div>

        {/* Client Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No clients yet</h3>
            <p className="text-gray-500 text-sm mb-4">Add your first client to start collecting documents and intake forms.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Client
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(client => (
              <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow animate-fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/client/${client.id}`} className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate block">
                      {client.name}
                    </Link>
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[client.status]}`}>
                    {STATUS_ICONS[client.status]} {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">{client.projectType || 'No project type'}</div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Created {new Date(client.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    {client.documents.filter(d => d.uploadedAt).length > 0 && (
                      <span className="text-green-600">{client.documents.filter(d => d.uploadedAt).length} doc{client.documents.filter(d => d.uploadedAt).length !== 1 ? 's' : ''}</span>
                    )}
                    {client.formSubmission && (
                      <span className="text-green-600">Form ✓</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/client/${client.id}`}
                    className="flex-1 text-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium hover:bg-indigo-100 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Client Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="e.g. Acme Corp"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="contact@acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <input
                  type="text"
                  value={newClient.projectType}
                  onChange={e => setNewClient(prev => ({ ...prev, projectType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="e.g. Website Redesign, Brand Identity"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={!newClient.name.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Create Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}