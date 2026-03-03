'use client';

import { useState, useEffect, useCallback } from 'react';

interface WikiCard {
  title: string;
  description: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  pageUrl: string;
  extract: string;
}

interface DiscoverGridProps {
  initialQuery: string;
  initialCards: WikiCard[];
  categories: { label: string; query: string }[];
}

export function DiscoverGrid({ initialQuery, initialCards, categories }: DiscoverGridProps) {
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [cards, setCards] = useState<WikiCard[]>(initialCards);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seattle/discover?q=${encodeURIComponent(q)}&limit=24`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards ?? []);
      }
    } catch {
      // keep existing cards on error
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActiveCategory(null);
    setQuery(inputValue);
    search(inputValue);
  }

  function handleCategoryClick(cat: { label: string; query: string }) {
    setActiveCategory(cat.label);
    setInputValue(cat.query);
    setQuery(cat.query);
    search(cat.query);
  }

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative mb-6">
        <div className="flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-lg focus-within:border-zinc-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-3 h-5 w-5 shrink-0 text-zinc-500">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search destinations, landmarks, activities..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(''); }}
              className="ml-2 text-zinc-500 hover:text-zinc-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => handleCategoryClick(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.label
                ? 'bg-white text-zinc-900'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        </div>
      )}

      {/* Masonry grid */}
      {!loading && cards.length === 0 && (
        <p className="py-12 text-center text-zinc-500">No results found. Try a different search.</p>
      )}

      {!loading && cards.length > 0 && (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {cards.map((card, i) => (
            <a
              key={`${card.title}-${i}`}
              href={card.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl bg-zinc-900 transition-transform hover:scale-[1.02]"
            >
              {card.thumbUrl && (
                <div className="relative overflow-hidden">
                  <img
                    src={card.thumbUrl}
                    alt={card.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white leading-snug">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                    {card.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
