'use client';

import { formatCurrency, formatDate } from '@/lib/constants';

interface TransactionCardProps {
  transaction: {
    id: string;
    date: string;
    description: string;
    amount: number;
    category?: string | null;
    status?: string;
  };
  showActions?: boolean;
  onCategorize?: () => void;
  onSkip?: () => void;
}

export default function TransactionCard({
  transaction,
  showActions = true,
  onCategorize,
  onSkip,
}: TransactionCardProps) {
  const isExpense = transaction.amount < 0;
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
          <p className="text-base font-semibold text-gray-900 truncate mt-1">
            {transaction.description}
          </p>
        </div>
        <div className={`text-lg font-bold ml-4 ${
          isExpense ? 'text-red-600' : 'text-green-600'
        }`}>
          {formatCurrency(transaction.amount)}
        </div>
      </div>
      
      {transaction.category && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {transaction.category}
          </span>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={onCategorize}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors text-sm"
          >
            Categorize
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}