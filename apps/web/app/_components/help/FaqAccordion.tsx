'use client';

import { useState } from 'react';
import type { FaqArticle } from '@travel/contracts';

interface FaqAccordionProps {
  articles: FaqArticle[];
  defaultOpenId?: string;
}

interface FaqItemProps {
  article: FaqArticle;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ article, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {article.question}
        </span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">{article.answer}</p>
      </div>
    </div>
  );
}

export function FaqAccordion({ articles, defaultOpenId }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">No FAQs available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
      {articles.map((article) => (
        <FaqItem
          key={article.id}
          article={article}
          isOpen={openId === article.id}
          onToggle={() => handleToggle(article.id)}
        />
      ))}
    </div>
  );
}

interface FaqCategoryListProps {
  categories: string[];
  articles: Record<string, FaqArticle[]>;
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export function FaqCategoryList({
  categories,
  articles,
  selectedCategory,
  onSelectCategory,
}: FaqCategoryListProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category}
            <span className="ml-1.5 text-xs opacity-70">
              ({articles[category]?.length || 0})
            </span>
          </button>
        ))}
      </div>

      {selectedCategory && articles[selectedCategory] && (
        <FaqAccordion articles={articles[selectedCategory]} />
      )}
    </div>
  );
}
