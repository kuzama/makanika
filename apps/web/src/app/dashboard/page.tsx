'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, Mechanic, CreateMechanicInput } from '../../lib/api';
import Header from '../../components/Header';
import MechanicForm from '../../components/MechanicForm';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  VERIFIED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
  UNVERIFIED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Unverified' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get('created') === '1';

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(justCreated);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .getMyMechanics()
      .then(setMechanics)
      .catch(() => setError('Failed to load your listings'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteMechanic(id);
      setMechanics((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError('Failed to delete listing');
    }
  };

  const handleUpdate = async (id: string, data: CreateMechanicInput) => {
    setEditLoading(true);
    try {
      await api.updateMechanic(id, data);
      const updated = await api.getMyMechanics();
      setMechanics(updated);
      setEditingId(null);
    } catch (err: any) {
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <Link
            href="/mechanics/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
          >
            + Add Mechanic
          </Link>
        </div>

        {/* Success Banner */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6" role="status">
            Mechanic listing created successfully!
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6" role="alert">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-6 border border-gray-200">
                <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-64 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && mechanics.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">🔧</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No listings yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven&apos;t listed any mechanics yet. Get started by adding your first one.
            </p>
            <Link
              href="/mechanics/new"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              Add Your First Mechanic
            </Link>
          </div>
        )}

        {/* Mechanic Cards */}
        {!loading && mechanics.length > 0 && (
          <div className="space-y-4">
            {mechanics.map((mechanic) => {
              const status = STATUS_STYLES[mechanic.verificationStatus] || STATUS_STYLES.UNVERIFIED;
              const isEditing = editingId === mechanic.id;

              return (
                <div
                  key={mechanic.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  {isEditing ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Edit Listing</h3>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                      <MechanicForm
                        initialValues={{
                          businessName: mechanic.businessName,
                          phone: mechanic.phone,
                          latitude: mechanic.latitude,
                          longitude: mechanic.longitude,
                          address: mechanic.address || undefined,
                          description: mechanic.description || undefined,
                          priceRange: mechanic.priceRange,
                          vehicleTypes: mechanic.vehicleTypes,
                          services: mechanic.services,
                          specialties: mechanic.specialties,
                        }}
                        onSubmit={(data) => handleUpdate(mechanic.id, data)}
                        submitLabel="Save Changes"
                        loading={editLoading}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{mechanic.businessName}</h3>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${status.bg} ${status.text}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{mechanic.phone}</p>
                          {mechanic.address && (
                            <p className="text-sm text-gray-500 mt-1">{mechanic.address}</p>
                          )}
                          {mechanic.description && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                              {mechanic.description}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {mechanic.vehicleTypes.map((type) => (
                              <span
                                key={type}
                                className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
                              >
                                {type}
                              </span>
                            ))}
                            {mechanic.services.map((service) => (
                              <span
                                key={service}
                                className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setEditingId(mechanic.id)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium px-3 py-1 border border-green-200 rounded-md hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(mechanic.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 border border-red-200 rounded-md hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-6" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
