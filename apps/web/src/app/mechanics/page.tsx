'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Mechanic, GetMechanicsParams } from '../../lib/api';
import MechanicCard from '../../components/MechanicCard';
import MechanicCardSkeleton from '../../components/MechanicCardSkeleton';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import Header from '../../components/Header';

function MechanicsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const justCreated = searchParams.get('created') === '1';
  const [showSuccess, setShowSuccess] = useState(justCreated);

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchMechanics() {
      setLoading(true);
      setError('');
      try {
        const params: GetMechanicsParams = { page, limit: 10 };
        if (searchQuery) params.search = searchQuery;

        const result = await api.getMechanics(params);
        setMechanics(result.mechanics || []);
        setTotal(result.total || 0);
      } catch (err: any) {
        console.error('Failed to fetch mechanics:', err);
        setError(err.message || 'Failed to load mechanics. Please try again.');
        setMechanics([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }

    fetchMechanics();
  }, [page, searchQuery]);

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleSearchBarSelect = (mechanicId: string) => {
    router.push(`/mechanics/${mechanicId}`);
  };

  const handleFilterChange = useCallback((filters: any) => {
    // In production, pass filters to API call
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        {/* Success Banner */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between" role="status">
            <span>✅ Mechanic listing created successfully! It will appear once verified.</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-600 hover:text-green-800 font-bold ml-4"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Find a Car Mechanic in Harare</h1>
          <SearchBar onSearch={handleSearchBarSelect} />
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <FilterPanel onFilterChange={handleFilterChange} />
          </aside>

          {/* Main Content */}
          <main className="flex-1" role="main" aria-label="Mechanics list">
            {/* Search bar (classic text + button) */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Search mechanics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Search mechanics by name"
              />
              <button
                onClick={handleSearch}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Search
              </button>
            </div>

            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-4" aria-live="polite" aria-busy="true">
                <span className="sr-only">Loading mechanics...</span>
                {[1, 2, 3, 4].map((i) => (
                  <MechanicCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="text-center py-12" role="alert">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => setPage(page)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && mechanics.length === 0 && (
              <div className="text-center py-12 text-gray-500" role="status">
                No mechanics found. Try a different search.
              </div>
            )}

            {/* Results */}
            {!loading && mechanics.length > 0 && (
              <div className="space-y-4" aria-live="polite">
                {mechanics.map((mechanic) => (
                  <MechanicCard key={mechanic.id} mechanic={mechanic} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 10 && (
              <nav className="flex justify-center gap-2 mt-6" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-600" aria-current="page">
                  Page {page} of {Math.ceil(total / 10)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function MechanicsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto p-4">
          <div className="animate-pulse h-8 w-64 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <MechanicCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <MechanicsContent />
    </Suspense>
  );
}
