'use client';

import { useState } from 'react';
import { api } from '../../lib/api';

type Step = 'phone' | 'code';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api.sendCode(phone);
      if (result.success) {
        setStep('code');
      } else {
        setError(result.error || 'Invalid phone number');
      }
    } catch {
      setError('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await api.verifyCode(phone, code);
      if (result.success && result.token) {
        localStorage.setItem('token', result.token);
        // Will redirect in future phases
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Makanika
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <button
              onClick={handleSendCode}
              disabled={loading || !phone}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        )}

        {step === 'code' && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              We sent a verification code to {phone}
            </p>
            <label className="block text-sm font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !code}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
              }}
              className="w-full mt-2 text-gray-600 py-2"
            >
              Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
