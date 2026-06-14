'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientWithStats } from '@/lib/db';
import ClientList from '@/components/ClientList';
import AddClientModal from '@/components/AddClientModal';
import CSVImport from '@/components/CSVImport';
import TransactionCard from '@/components/TransactionCard';
import ProgressCard from '@/components/ProgressCard';
import { formatCurrency } from '@/lib/constants';

interface DashboardData {
  stats: {
    totalClients: number;
    totalTransactions: number;
    totalUncategorized: number;
    totalCategorized: number;
    overallProgress: number;
  };
  clients: ClientWithStats[];
}

interface Transaction {
  id: string;
  client_id: string;
  date: string;
  description: string;
  amount: number;
  category: string | null;
  status: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientWithStats | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const fetchTransactions = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/transactions`);
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.transactions);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  }, []);

  const handleSelectClient = useCallback((client: ClientWithStats) => {
    setSelectedClient(client);
    setShowImport(false);
    fetchTransactions(client.id);
  }, [fetchTransactions]);

  const handleDeleteClient = useCallback(async (id: string) => {
    if (!confirm('Delete this client and all their transactions?')) return;
    try {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (selectedClient?.id === id) setSelectedClient(null);
      fetchDashboard();
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  }, [selectedClient, fetchDashboard]);

  const handleExportClient = useCallback((id: string) => {
    window.open(`/api/clients/${id}/export`, '_blank');
  }, []);

  const handleCopyLink = useCallback(() => {
    if (!selectedClient) return;
    const link = `${window.location.origin}/categorize/${selectedClient.shareable_uuid}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [selectedClient]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📒</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📒</span>
              <h1 className="text-xl font-bold text-gray-900">Bookkeeper Portal</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{stats?.totalClients || 0} clients</span>
              <span className="text-gray-300">|</span>
              <span>{stats?.totalUncategorized || 0} pending</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Uncategorized</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalUncategorized}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</p>
            </div>
          </div>
        )}

        {stats && stats.totalTransactions > 0 && (
          <div className="mb-6">
            <ProgressCard
              total={stats.totalTransactions}
              categorized={stats.totalCategorized}
              uncategorized={stats.totalUncategorized}
              label="Overall Progress"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List - Left */}
          <div className="lg:col-span-1">
            <ClientList
              clients={data?.clients || []}
              onSelectClient={handleSelectClient}
              onAddClient={() => setShowAddClient(true)}
              onDeleteClient={handleDeleteClient}
              onExportClient={handleExportClient}
              selectedId={selectedClient?.id}
            />
          </div>

          {/* Detail Panel - Right */}
          <div className="lg:col-span-2 space-y-4">
            {selectedClient ? (
              <>
                {/* Client Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedClient.name}</h2>
                      <p className="text-sm text-gray-500">{selectedClient.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {copiedLink ? '✅ Copied!' : '📋 Share Link'}
                      </button>
                      <button
                        onClick={() => setShowImport(!showImport)}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        {showImport ? 'Hide Import' : '📤 Import CSV'}
                      </button>
                    </div>
                  </div>

                  {selectedClient.shareable_uuid && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                      <span className="font-medium">Shareable link:</span>{' '}
                      <span className="text-blue-600 break-all">
                        {typeof window !== 'undefined' ? `${window.location.origin}/categorize/${selectedClient.shareable_uuid}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* CSV Import */}
                {showImport && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Import Transactions</h3>
                    <CSVImport
                      clientId={selectedClient.id}
                      onImportComplete={() => {
                        fetchTransactions(selectedClient.id);
                        fetchDashboard();
                        setShowImport(false);
                      }}
                    />
                  </div>
                )}

                {/* Transactions */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Transactions ({transactions.length})
                  </h3>
                  {transactions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                      <div className="text-4xl mb-3">📤</div>
                      <p className="text-gray-500">No transactions yet. Import a CSV to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {transactions.map((t) => (
                        <TransactionCard
                          key={t.id}
                          transaction={t}
                          showActions={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-5xl mb-4">👈</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a client</h3>
                <p className="text-gray-500">Choose a client from the list to view their transactions and shareable link.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddClientModal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
        onClientAdded={fetchDashboard}
      />
    </div>
  );
}