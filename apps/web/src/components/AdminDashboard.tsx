'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalMechanics: number;
  pendingVerifications: number;
  verifiedMechanics: number;
  totalUsers: number;
  totalReviews: number;
}

interface PendingMechanic {
  id: string;
  businessName: string;
  phone: string;
  verificationStatus: string;
  verificationDocs: string[];
  listedBy?: { name?: string; phone: string };
  createdAt: string;
}

interface AdminDashboardProps {
  getStats: () => Promise<Stats>;
  getPending: () => Promise<PendingMechanic[]>;
  onApprove: (id: string) => Promise<{ success: boolean }>;
  onReject: (id: string) => Promise<{ success: boolean }>;
}

export default function AdminDashboard({
  getStats,
  getPending,
  onApprove,
  onReject,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingMechanic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, pendingData] = await Promise.all([
          getStats(),
          getPending(),
        ]);
        setStats(statsData);
        setPending(pendingData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getStats, getPending]);

  const handleApprove = async (id: string) => {
    await onApprove(id);
    setPending((prev) => prev.filter((m) => m.id !== id));
    if (stats) {
      setStats({
        ...stats,
        pendingVerifications: stats.pendingVerifications - 1,
        verifiedMechanics: stats.verifiedMechanics + 1,
      });
    }
  };

  const handleReject = async (id: string) => {
    await onReject(id);
    setPending((prev) => prev.filter((m) => m.id !== id));
    if (stats) {
      setStats({
        ...stats,
        pendingVerifications: stats.pendingVerifications - 1,
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Mechanics" value={stats.totalMechanics} />
          <StatCard
            label="Pending Verification"
            value={stats.pendingVerifications}
            highlight
          />
          <StatCard label="Verified" value={stats.verifiedMechanics} />
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Total Reviews" value={stats.totalReviews} />
        </div>
      )}

      {/* Pending Verifications */}
      <h2 className="text-xl font-semibold mb-4">
        Pending Verifications ({pending.length})
      </h2>

      {pending.length === 0 ? (
        <p className="text-gray-500">No pending verifications.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((mechanic) => (
            <div
              key={mechanic.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {mechanic.businessName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mechanic.phone}
                  </p>
                  {mechanic.listedBy && (
                    <p className="text-sm text-gray-500">
                      Listed by: {mechanic.listedBy.name || mechanic.listedBy.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {mechanic.verificationDocs.length}{' '}
                    {mechanic.verificationDocs.length === 1
                      ? 'document'
                      : 'documents'}{' '}
                    submitted
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(mechanic.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(mechanic.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 ${
        highlight ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'
      }`}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
