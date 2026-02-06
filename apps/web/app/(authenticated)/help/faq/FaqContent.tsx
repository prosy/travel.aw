'use client';

import { useState } from 'react';
import type { FaqArticle } from '@travel/contracts';
import { FaqAccordion } from '@/app/_components/help/FaqAccordion';

interface FaqContentProps {
  categories: string[];
  articles: Record<string, FaqArticle[]>;
}

export function FaqContent({ categories, articles }: FaqContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');

  return (
    <div className="space-y-6">
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
              <span className="ml-1.5 text-xs opacity-70">
                ({articles[category]?.length || 0})
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedCategory && articles[selectedCategory] && (
        <FaqAccordion articles={articles[selectedCategory]} />
      )}
    </div>
  );
}
