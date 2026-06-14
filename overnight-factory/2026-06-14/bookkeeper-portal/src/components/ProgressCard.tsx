'use client';

import { formatCurrency } from '@/lib/constants';

interface ProgressCardProps {
  total: number;
  categorized: number;
  uncategorized: number;
  label?: string;
}

export default function ProgressCard({ total, categorized, uncategorized, label = 'Progress' }: ProgressCardProps) {
  const progress = total > 0 ? Math.round((categorized / total) * 100) : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <span className="text-2xl font-bold text-gray-900">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{categorized} categorized</span>
        <span>{uncategorized} remaining</span>
        <span>{total} total</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export function StatCard({ label, value, icon, color = 'bg-blue-50 text-blue-700' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color.includes('text-') ? color.split(' ')[1] : 'text-gray-900'}`}>
        {typeof value === 'number' && label.toLowerCase().includes('amount')
          ? formatCurrency(value)
          : value}
      </p>
    </div>
  );
}