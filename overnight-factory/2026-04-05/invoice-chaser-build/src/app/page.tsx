'use client';

import { useState, useEffect } from 'react';
import { Invoice, getInvoices, addInvoice, updateInvoice, deleteInvoice, getSettings, saveSettings, updateInvoiceStatuses } from '@/lib/storage';
import InvoiceForm from '@/components/InvoiceForm';
import Dashboard from '@/components/Dashboard';
import SettingsPanel from '@/components/SettingsPanel';

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'settings'>('dashboard');
  const [mounted, setMounted] = useState(false);

  // Load invoices on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    updateInvoiceStatuses();
    setInvoices(getInvoices());
  }, []);

  // Refresh invoices when switching tabs
  useEffect(() => {
    if (mounted) {
      updateInvoiceStatuses();
      setInvoices(getInvoices());
    }
  }, [mounted, activeTab]);

  const handleAddInvoice = (data: Parameters<typeof addInvoice>[0]) => {
    addInvoice(data);
    setInvoices(getInvoices());
    setActiveTab('dashboard');
  };

  const handleMarkPaid = (id: string) => {
    updateInvoice(id, { status: 'paid', paidAt: new Date().toISOString() });
    setInvoices(getInvoices());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      setInvoices(getInvoices());
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">InvoiceChaser Lite</h1>
              <p className="text-sm text-gray-500">Track invoices, send reminders, get paid</p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.603 2.263.29 2.573-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="mt-4 flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'add'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Add Invoice
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            invoices={invoices}
            onMarkPaid={handleMarkPaid}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'add' && (
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">New Invoice</h2>
            <InvoiceForm onSubmit={handleAddInvoice} onCancel={() => setActiveTab('dashboard')} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SettingsPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>InvoiceChaser Lite — Your invoices stay in your browser</p>
        </div>
      </footer>
    </div>
  );
}