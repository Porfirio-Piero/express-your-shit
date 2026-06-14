export const CATEGORIES = [
  'Advertising & Marketing',
  'Auto & Transportation',
  'Bank Fees & Interest',
  'Cost of Goods Sold',
  'Dues & Subscriptions',
  'Equipment & Technology',
  'Food & Meals',
  'Insurance',
  'Legal & Professional',
  'Office Supplies',
  'Payroll',
  'Rent & Lease',
  'Repairs & Maintenance',
  'Shipping & Freight',
  'Taxes',
  'Travel',
  'Utilities',
  'Uncategorized',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Advertising & Marketing': 'bg-purple-100 text-purple-800',
  'Auto & Transportation': 'bg-blue-100 text-blue-800',
  'Bank Fees & Interest': 'bg-red-100 text-red-800',
  'Cost of Goods Sold': 'bg-orange-100 text-orange-800',
  'Dues & Subscriptions': 'bg-indigo-100 text-indigo-800',
  'Equipment & Technology': 'bg-cyan-100 text-cyan-800',
  'Food & Meals': 'bg-yellow-100 text-yellow-800',
  'Insurance': 'bg-green-100 text-green-800',
  'Legal & Professional': 'bg-pink-100 text-pink-800',
  'Office Supplies': 'bg-gray-100 text-gray-800',
  'Payroll': 'bg-emerald-100 text-emerald-800',
  'Rent & Lease': 'bg-amber-100 text-amber-800',
  'Repairs & Maintenance': 'bg-lime-100 text-lime-800',
  'Shipping & Freight': 'bg-teal-100 text-teal-800',
  'Taxes': 'bg-rose-100 text-rose-800',
  'Travel': 'bg-sky-100 text-sky-800',
  'Utilities': 'bg-violet-100 text-violet-800',
  'Uncategorized': 'bg-slate-100 text-slate-800',
};

export const CSV_TEMPLATE_HEADERS = ['Date', 'Description', 'Amount'];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}