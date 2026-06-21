// ScopeGuard — Utility functions
import { Project, ChangeOrder } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getCreepLevel(creepPercent: number): { label: string; color: string; bg: string } {
  if (creepPercent < 10) return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (creepPercent < 25) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  return { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
}

export function getStatusBadge(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'draft': return { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/10' };
    case 'approved': return { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'active': return { label: 'Active', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'completed': return { label: 'Completed', color: 'text-purple-400', bg: 'bg-purple-500/10' };
    default: return { label: status, color: 'text-slate-400', bg: 'bg-slate-500/10' };
  }
}

export function getCOStatusBadge(status: string): { label: string; color: string; bg: string } {
  switch (status) {
    case 'pending': return { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    case 'approved': return { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'declined': return { label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/10' };
    default: return { label: status, color: 'text-slate-400', bg: 'bg-slate-500/10' };
  }
}