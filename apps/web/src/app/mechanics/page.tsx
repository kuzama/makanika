'use client';

import { useState, useEffect } from 'react';
import { api, Mechanic, GetMechanicsParams } from '../../lib/api';
import MechanicCard from '../../components/MechanicCard';

export default function MechanicsListPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchMechanics() {
      setLoading(true);
      try {
        const params: GetMechanicsParams = { page, limit: 10 };
        if (searchQuery) params.search = searchQuery;

        const result = await api.getMechanics(params);
        setMechanics(result.mechanics);
        setTotal(result.total);
      } catch (error) {
        console.error('Failed to fetch mechanics:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Find a Mechanic in Harare</h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search mechanics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        )}

        {!loading && mechanics.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No mechanics found. Try a different search.
          </div>
        )}

        {!loading && mechanics.length > 0 && (
          <div className="space-y-4">
            {mechanics.map((mechanic) => (
              <MechanicCard key={mechanic.id} mechanic={mechanic} />
            ))}
          </div>
        )}

        {total > 10 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-600">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 10)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
