'use client';

import { useState, useCallback } from 'react';
import Script from 'next/script';
import { api } from '../../lib/api';

type Step = 'phone' | 'code';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useCallback(async (response: { credential: string }) => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await api.googleLogin(response.credential);
      if (result.success && result.token) {
        localStorage.setItem('token', result.token);
        window.location.href = '/';
      } else {
        setError(result.error || 'Google sign-in failed');
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const initializeGoogle = useCallback(() => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleLogin,
      });
      const buttonEl = document.getElementById('google-signin-button');
      if (buttonEl) {
        window.google.accounts.id.renderButton(buttonEl, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      }
    }
  }, [handleGoogleLogin]);

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
        window.location.href = '/';
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

        {/* Google Sign-In */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initializeGoogle}
        />
        <div id="google-signin-button" className="mb-4 flex justify-center" />

        {googleLoading && (
          <div className="mb-4 text-center text-gray-600 text-sm">
            Signing in with Google...
          </div>
        )}

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        {/* Phone Login */}
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
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
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
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
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
