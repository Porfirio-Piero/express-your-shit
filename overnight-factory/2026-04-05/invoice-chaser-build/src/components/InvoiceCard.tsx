'use client';

import { useState } from 'react';
import { Invoice, calculateDaysOverdue, getReminderSchedule } from '@/lib/storage';
import { generateDay7Template, generateDay14Template, generateDay21Template, copyToClipboard, getEmailClientLink } from '@/lib/templates';

interface InvoiceCardProps {
  invoice: Invoice;
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function InvoiceCard({ invoice, onMarkPaid, onDelete }: InvoiceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const daysOverdue = calculateDaysOverdue(invoice.dueDate);
  const schedule = getReminderSchedule(invoice.dueDate);
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
  };
  
  const statusLabels = {
    pending: 'Pending',
    overdue: `${daysOverdue} days overdue`,
    paid: 'Paid',
  };

  const templates = {
    day7: generateDay7Template(invoice),
    day14: generateDay14Template(invoice),
    day21: generateDay21Template(invoice),
  };

  const handleCopy = async (template: { subject: string; body: string }, key: string) => {
    const fullText = `Subject: ${template.subject}\n\n${template.body}`;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopySubject = async (subject: string, key: string) => {
    const success = await copyToClipboard(subject);
    if (success) {
      setCopied(`${key}-subject`);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${invoice.status === 'paid' ? 'opacity-70' : ''}`}>
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{invoice.clientName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[invoice.status]}`}>
                {statusLabels[invoice.status]}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Invoice #{invoice.invoiceNumber} • {invoice.currency} {invoice.amount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Due: {new Date(invoice.dueDate).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkPaid(invoice.id);
                }}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Mark Paid
              </button>
            )}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-4 py-3 bg-gray-50">
          {/* Invoice details */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Email: {invoice.clientEmail}</p>
              {invoice.notes && <p>Notes: {invoice.notes}</p>}
              <p>Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              {invoice.paidAt && <p>Paid on: {new Date(invoice.paidAt).toLocaleDateString()}</p>}
            </div>
          </div>

          {/* Reminder Schedule */}
          {invoice.status !== 'paid' && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Reminder Schedule</h4>
              <div className="flex gap-2 flex-wrap">
                {schedule.map((s) => (
                  <div
                    key={s.day}
                    className={`text-xs px-2 py-1 rounded ${
                      s.passed ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    Day {s.day}: {s.label}
                    {s.passed && ' ✓'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Templates */}
          {invoice.status !== 'paid' && daysOverdue > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Email Templates</h4>
              <div className="space-y-2">
                {/* Day 7 */}
                <div className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Day 7 - Friendly Reminder</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopySubject(templates.day7.subject, 'day7')}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {copied === 'day7-subject' ? '✓ Copied!' : 'Copy Subject'}
                      </button>
                      <button
                        onClick={() => handleCopy(templates.day7, 'day7')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        {copied === 'day7' ? '✓ Copied!' : 'Copy Full'}
                      </button>
                      <a
                        href={getEmailClientLink(invoice, templates.day7)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Open Email
                      </a>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                    {templates.day7.body}
                  </pre>
                </div>

                {/* Day 14 */}
                <div className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Day 14 - Firm Reminder</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopySubject(templates.day14.subject, 'day14')}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {copied === 'day14-subject' ? '✓ Copied!' : 'Copy Subject'}
                      </button>
                      <button
                        onClick={() => handleCopy(templates.day14, 'day14')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        {copied === 'day14' ? '✓ Copied!' : 'Copy Full'}
                      </button>
                      <a
                        href={getEmailClientLink(invoice, templates.day14)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Open Email
                      </a>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                    {templates.day14.body}
                  </pre>
                </div>

                {/* Day 21 */}
                <div className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Day 21 - Final Notice</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopySubject(templates.day21.subject, 'day21')}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        {copied === 'day21-subject' ? '✓ Copied!' : 'Copy Subject'}
                      </button>
                      <button
                        onClick={() => handleCopy(templates.day21, 'day21')}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        {copied === 'day21' ? '✓ Copied!' : 'Copy Full'}
                      </button>
                      <a
                        href={getEmailClientLink(invoice, templates.day21)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Open Email
                      </a>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                    {templates.day21.body}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(invoice.id)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Delete Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}