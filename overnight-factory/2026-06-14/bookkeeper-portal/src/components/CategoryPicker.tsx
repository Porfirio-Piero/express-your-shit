'use client';

import { Category, CATEGORY_COLORS } from '@/lib/constants';

interface CategoryPickerProps {
  categories: readonly Category[];
  onSelect: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoryPicker({ categories, onSelect, selectedCategory }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto p-1">
      {categories.map((cat) => {
        const colorClass = CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-800';
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
              isSelected
                ? 'ring-2 ring-blue-500 ring-offset-1 ' + colorClass
                : colorClass + ' hover:opacity-80'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}