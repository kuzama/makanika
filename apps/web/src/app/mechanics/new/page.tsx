'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import MechanicForm from '../../../components/MechanicForm';
import { api, CreateMechanicInput } from '../../../lib/api';

export default function AddMechanicPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleSubmit = async (data: CreateMechanicInput) => {
    setLoading(true);
    setError('');
    try {
      await api.createMechanic(data);
      router.push('/dashboard?created=1');
    } catch (err: any) {
      setError(err?.message || 'Failed to create listing. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a Car Mechanic</h1>
        <p className="text-gray-600 mb-8">
          List a car mechanic on Makanika so car owners in Harare can find them.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6" role="alert">
            {error}
          </div>
        )}

        <MechanicForm
          onSubmit={handleSubmit}
          submitLabel="Create Listing"
          loading={loading}
        />
      </div>
    </div>
  );
}
