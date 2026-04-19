'use client';

import { useState, useMemo } from 'react';
import InvoiceCard from './InvoiceCard';
import { Invoice, calculateDaysOverdue } from '@/lib/storage';

interface DashboardProps {
  invoices: Invoice[];
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortField = 'dueDate' | 'amount' | 'clientName' | 'daysOverdue';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'pending' | 'overdue' | 'paid';

export default function Dashboard({ invoices, onMarkPaid, onDelete }: DashboardProps) {
  const [sortField, setSortField] = useState<SortField>('daysOverdue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((inv) => inv.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(query) ||
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.clientEmail.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'daysOverdue':
          comparison = calculateDaysOverdue(a.dueDate) - calculateDaysOverdue(b.dueDate);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [invoices, filterStatus, searchQuery, sortField, sortOrder]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const pending = invoices.filter((inv) => inv.status === 'pending');
    const overdue = invoices.filter((inv) => inv.status === 'overdue');
    const paid = invoices.filter((inv) => inv.status === 'paid');

    const totalOverdue = overdue.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = pending.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = paid.reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalInvoices: invoices.length,
      pending: pending.length,
      overdue: overdue.length,
      paid: paid.length,
      totalOverdue,
      totalPending,
      totalPaid,
    };
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</div>
          <div className="text-sm text-gray-500">Total Invoices</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-500">Paid</div>
        </div>
      </div>

      {/* Amount Summary */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-red-600">
              ${stats.totalOverdue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Overdue Amount</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              ${stats.totalPending.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Pending Amount</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              ${stats.totalPaid.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Paid Amount</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>

        {/* Sort Field */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="daysOverdue">Days Overdue</option>
          <option value="dueDate">Due Date</option>
          <option value="amount">Amount</option>
          <option value="clientName">Client Name</option>
        </select>

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-gray-500 mb-2">No invoices found</div>
            {invoices.length === 0 ? (
              <div className="text-sm text-gray-400">Add your first invoice to get started</div>
            ) : (
              <div className="text-sm text-gray-400">Try adjusting your search or filters</div>
            )}
          </div>
        ) : (
          filteredAndSortedInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onMarkPaid={onMarkPaid}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}