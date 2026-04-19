// Local storage utilities for InvoiceChaser Lite
'use client';

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  notes?: string;
  status: 'pending' | 'overdue' | 'paid';
  createdAt: string;
  paidAt?: string;
  reminder7Sent?: boolean;
  reminder14Sent?: boolean;
  reminder21Sent?: boolean;
}

export interface Settings {
  reminderDay7Enabled: boolean;
  reminderDay14Enabled: boolean;
  reminderDay21Enabled: boolean;
  customTemplateDay7?: string;
  customTemplateDay14?: string;
  customTemplateDay21?: string;
  yourName: string;
}

const INVOICES_KEY = 'invoicechaser_invoices';
const SETTINGS_KEY = 'invoicechaser_settings';

export const defaultSettings: Settings = {
  reminderDay7Enabled: true,
  reminderDay14Enabled: true,
  reminderDay21Enabled: true,
  yourName: '',
};

export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveInvoices(invoices: Invoice[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'status'>): Invoice {
  const invoices = getInvoices();
  const newInvoice: Invoice = {
    ...invoice,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
}

export function updateInvoice(id: string, updates: Partial<Invoice>): void {
  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === id);
  if (index !== -1) {
    invoices[index] = { ...invoices[index], ...updates };
    saveInvoices(invoices);
  }
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices().filter((inv) => inv.id !== id);
  saveInvoices(invoices);
}

export function markAsPaid(id: string): void {
  updateInvoice(id, { status: 'paid', paidAt: new Date().toISOString() });
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function updateInvoiceStatuses(): void {
  const invoices = getInvoices();
  let updated = false;
  invoices.forEach((invoice) => {
    if (invoice.status === 'pending') {
      const daysOverdue = calculateDaysOverdue(invoice.dueDate);
      if (daysOverdue > 0) {
        invoice.status = 'overdue';
        updated = true;
      }
    }
  });
  if (updated) saveInvoices(invoices);
}

export function getReminderSchedule(dueDate: string): { day: number; label: string; date: Date; passed: boolean }[] {
  const due = new Date(dueDate);
  const schedule = [
    { day: 7, label: 'Friendly Reminder' },
    { day: 14, label: 'Firm Reminder' },
    { day: 21, label: 'Final Notice' },
  ];
  
  return schedule.map(({ day, label }) => {
    const reminderDate = new Date(due);
    reminderDate.setDate(due.getDate() + day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      day,
      label,
      date: reminderDate,
      passed: reminderDate <= today,
    };
  });
}