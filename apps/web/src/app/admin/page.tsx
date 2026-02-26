'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../components/AdminDashboard';
import Header from '../../components/Header';
import { api } from '../../lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!user || user.role !== 'ADMIN') {
          router.push('/');
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setChecking(false));
  }, [router]);

  const getStats = useCallback(() => api.getAdminStats(), []);
  const getPending = useCallback(() => api.getAdminPending(), []);
  const onApprove = useCallback((id: string) => api.adminApprove(id), []);
  const onReject = useCallback((id: string) => api.adminReject(id), []);

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-8 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AdminDashboard
        getStats={getStats}
        getPending={getPending}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
}
