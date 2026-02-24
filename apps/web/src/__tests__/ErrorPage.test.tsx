import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component — note: "Error" shadows global Error, so be careful
import ErrorPage from '../app/error';

describe('Error Page', () => {
  const mockReset = jest.fn();
  // Use global.Error explicitly to avoid shadowing
  const mockError = new global.Error('Test error') as globalThis.Error & { digest?: string };

  beforeEach(() => {
    mockReset.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders error message', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders Try Again button', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls reset when Try Again is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorPage error={mockError} reset={mockReset} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockReset).toHaveBeenCalled();
  });

  it('renders Go Home link', () => {
    render(<ErrorPage error={mockError} reset={mockReset} />);
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});
