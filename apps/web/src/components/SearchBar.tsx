'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api, Mechanic } from '../lib/api';

interface SearchBarProps {
  onSearch: (mechanicId: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Mechanic[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setShowDropdown(false);
      setSearched(false);
      return;
    }

    try {
      const response = await api.searchMechanics({ query: q, limit: 5 });
      setResults(response.mechanics);
      setShowDropdown(true);
      setSearched(true);
    } catch {
      setResults([]);
      setShowDropdown(true);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doSearch]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSearched(false);
  };

  const handleResultClick = (mechanicId: string) => {
    onSearch(mechanicId);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search mechanics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            aria-label="Search mechanics"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((mechanic) => (
              <button
                key={mechanic.id}
                onClick={() => handleResultClick(mechanic.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium">{mechanic.businessName}</div>
                {mechanic.address && (
                  <div className="text-sm text-gray-500">{mechanic.address}</div>
                )}
              </button>
            ))
          ) : searched ? (
            <div className="px-4 py-3 text-gray-500 text-sm">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
