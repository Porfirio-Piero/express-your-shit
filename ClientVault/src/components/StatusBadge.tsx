'use client';

import { STATUS_COLORS, STATUS_ICONS } from '@/lib/types';

interface StatusBadgeProps {
  status: 'complete' | 'pending' | 'overdue';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${STATUS_COLORS[status]}`}>
      {STATUS_ICONS[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}