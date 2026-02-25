'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) setUser(data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm" role="banner">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-700" aria-label="Makanika Home">
          Makanika
        </Link>
        <nav className="flex gap-4 items-center" aria-label="Main navigation">
          <Link
            href="/mechanics"
            className="text-gray-600 hover:text-green-600 font-medium"
          >
            Browse Mechanics
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-8 h-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-gray-700 font-medium text-sm">
                {user.name || user.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
