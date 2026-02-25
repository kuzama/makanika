import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';

// Mock next/script to render children without loading external scripts
jest.mock('next/script', () => {
  return function MockScript(props: any) {
    return null;
  };
});

// Mock the API client
jest.mock('../lib/api', () => ({
  api: {
    sendCode: jest.fn(),
    verifyCode: jest.fn(),
    googleLogin: jest.fn(),
  },
}));

import { api } from '../lib/api';

const mockSendCode = api.sendCode as jest.MockedFunction<typeof api.sendCode>;
const mockVerifyCode = api.verifyCode as jest.MockedFunction<typeof api.verifyCode>;
const mockGoogleLogin = api.googleLogin as jest.MockedFunction<typeof api.googleLogin>;

describe('LoginPage', () => {
  beforeEach(() => {
    mockSendCode.mockReset();
    mockVerifyCode.mockReset();
    mockGoogleLogin.mockReset();
  });

  it('renders phone input initially', () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
  });

  it('renders Google sign-in button container', () => {
    render(<LoginPage />);

    expect(document.getElementById('google-signin-button')).toBeInTheDocument();
  });

  it('renders "or" divider between Google and phone login', () => {
    render(<LoginPage />);

    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('sends code when phone is submitted', async () => {
    mockSendCode.mockResolvedValue({ success: true });

    render(<LoginPage />);

    const phoneInput = screen.getByPlaceholderText(/phone/i);
    const sendButton = screen.getByRole('button', { name: /send code/i });

    await userEvent.type(phoneInput, '0771234567');
    await userEvent.click(sendButton);

    expect(mockSendCode).toHaveBeenCalledWith('0771234567');
  });

  it('shows code input after successful send', async () => {
    mockSendCode.mockResolvedValue({ success: true });

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/phone/i), '0771234567');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/code/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
  });

  it('shows error for invalid phone', async () => {
    mockSendCode.mockResolvedValue({ success: false, error: 'Invalid phone' });

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/phone/i), '12345');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });
  });

  it('verifies code and stores token', async () => {
    mockSendCode.mockResolvedValue({ success: true });
    mockVerifyCode.mockResolvedValue({
      success: true,
      token: 'test-jwt-token',
      user: { id: 'user-1', phone: '+263771234567', role: 'CUSTOMER' },
    });

    render(<LoginPage />);

    // Step 1: Enter phone
    await userEvent.type(screen.getByPlaceholderText(/phone/i), '0771234567');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    // Step 2: Enter code
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/code/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/code/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(mockVerifyCode).toHaveBeenCalledWith('0771234567', '123456');
  });

  it('shows error for wrong code', async () => {
    mockSendCode.mockResolvedValue({ success: true });
    mockVerifyCode.mockResolvedValue({
      success: false,
      error: 'Invalid verification code',
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByPlaceholderText(/phone/i), '0771234567');
    await userEvent.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/code/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/code/i), '000000');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });
  });

  it('handles Google login API success', async () => {
    mockGoogleLogin.mockResolvedValue({
      success: true,
      token: 'google-jwt-token',
      user: { id: 'user-2', email: 'test@gmail.com', name: 'Test User', role: 'CUSTOMER' },
    });

    const result = await api.googleLogin('fake-google-credential');
    expect(result.success).toBe(true);
    expect(result.token).toBe('google-jwt-token');
    expect(mockGoogleLogin).toHaveBeenCalledWith('fake-google-credential');
  });

  it('handles Google login API failure', async () => {
    mockGoogleLogin.mockResolvedValue({
      success: false,
      error: 'Google token expired or invalid. Please try again.',
    });

    const result = await api.googleLogin('expired-credential');
    expect(result.success).toBe(false);
    expect(result.error).toContain('expired');
  });
});
