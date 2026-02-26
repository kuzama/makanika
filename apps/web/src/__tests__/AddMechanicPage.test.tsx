import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddMechanicPage from '../app/mechanics/new/page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../lib/api', () => ({
  api: {
    createMechanic: jest.fn(),
  },
  CreateMechanicInput: {},
}));

// Mock Header to avoid fetch calls
jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Makanika</header>;
  };
});

const { api } = require('../lib/api');

describe('AddMechanicPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to login when not authenticated', () => {
    render(<AddMechanicPage />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders the form when authenticated', () => {
    localStorage.setItem('token', 'test-token');

    render(<AddMechanicPage />);

    expect(screen.getByText('Add a Car Mechanic')).toBeInTheDocument();
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
  });

  it('submits form and redirects to dashboard on success', async () => {
    localStorage.setItem('token', 'test-token');
    api.createMechanic.mockResolvedValue({ id: '123', businessName: 'Test' });

    render(<AddMechanicPage />);

    await userEvent.type(screen.getByLabelText(/business name/i), 'Test Garage');
    await userEvent.type(screen.getByLabelText(/phone number/i), '0771234567');
    await userEvent.type(screen.getByLabelText(/latitude/i), '-17.83');
    await userEvent.type(screen.getByLabelText(/longitude/i), '31.05');

    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    await waitFor(() => {
      expect(api.createMechanic).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/dashboard?created=1');
    });
  });

  it('shows error on API failure', async () => {
    localStorage.setItem('token', 'test-token');
    api.createMechanic.mockRejectedValue(new Error('Phone format is invalid'));

    render(<AddMechanicPage />);

    await userEvent.type(screen.getByLabelText(/business name/i), 'Test Garage');
    await userEvent.type(screen.getByLabelText(/phone number/i), 'invalid');
    await userEvent.type(screen.getByLabelText(/latitude/i), '-17.83');
    await userEvent.type(screen.getByLabelText(/longitude/i), '31.05');

    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    await waitFor(() => {
      expect(screen.getByText(/phone format is invalid/i)).toBeInTheDocument();
    });
  });
});
