import React from 'react';
import { Search, X } from 'lucide-react';
import { Category } from '../types';

interface CategoriesBarProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterTag: string;
  onSelectFilterTag: (tag: string) => void;
}

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  filterTag,
  onSelectFilterTag,
}) => {
  const filterTags = [
    { id: 'all', label: 'הכל' },
    { id: 'popular', label: '🔥 הכי פופולרי' },
    { id: 'custom', label: '🥣 הרכבה אישית' },
    { id: 'new', label: '✨ חדש' },
  ];

  return (
    <div className="sticky top-[69px] sm:top-[77px] z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/80 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Categories Pill list */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => onSelectCategory('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategoryId === 'all'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <span>🍽️</span>
              <span>כל התפריט</span>
            </button>

            {categories
              .filter((c) => c.isActive)
              .map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="חפש סלט, מרכיב, שתייה..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-9 pl-8 py-1.5 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-900 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Dietary tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
          <span className="text-stone-400 font-medium text-[11px] shrink-0 ml-1">סינון:</span>
          {filterTags.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectFilterTag(t.id)}
              className={`shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                filterTag === t.id
                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                  : 'bg-stone-200/60 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
