import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../app/dashboard/page';

const mockPush = jest.fn();
const mockGet = jest.fn().mockReturnValue(null);

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockGet }),
}));

jest.mock('../lib/api', () => ({
  api: {
    getMyMechanics: jest.fn(),
    deleteMechanic: jest.fn(),
    updateMechanic: jest.fn(),
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

const mockMechanics = [
  {
    id: '1',
    businessName: 'Kwame Auto',
    phone: '0771234567',
    latitude: -17.83,
    longitude: 31.05,
    address: '45 Main Street',
    description: 'Expert car repair',
    priceRange: 'MODERATE',
    verificationStatus: 'VERIFIED',
    vehicleTypes: ['CAR'],
    services: ['Engine Repair'],
    specialties: [],
    photos: [],
  },
  {
    id: '2',
    businessName: 'Quick Fix Garage',
    phone: '0779999999',
    latitude: -17.84,
    longitude: 31.06,
    priceRange: 'BUDGET',
    verificationStatus: 'UNVERIFIED',
    vehicleTypes: ['SUV'],
    services: [],
    specialties: [],
    photos: [],
  },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to login when not authenticated', () => {
    render(<DashboardPage />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('renders My Listings heading when authenticated', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('My Listings')).toBeInTheDocument();
    });
  });

  it('shows empty state when no mechanics', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/no listings yet/i)).toBeInTheDocument();
      expect(screen.getByText(/add your first mechanic/i)).toBeInTheDocument();
    });
  });

  it('renders mechanic cards', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue(mockMechanics);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Kwame Auto')).toBeInTheDocument();
      expect(screen.getByText('Quick Fix Garage')).toBeInTheDocument();
    });
  });

  it('shows verification status badges', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue(mockMechanics);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Unverified')).toBeInTheDocument();
    });
  });

  it('shows edit and delete buttons', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue(mockMechanics);

    render(<DashboardPage />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });
  });

  it('deletes a listing on confirm', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue(mockMechanics);
    api.deleteMechanic.mockResolvedValue({ success: true });

    window.confirm = jest.fn().mockReturnValue(true);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Kwame Auto')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.deleteMechanic).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Kwame Auto')).not.toBeInTheDocument();
    });
  });

  it('shows success banner after creating a mechanic', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue(mockMechanics);
    mockGet.mockReturnValue('1');

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/listing created successfully/i)).toBeInTheDocument();
    });
  });

  it('shows Add Mechanic link', async () => {
    localStorage.setItem('token', 'test-token');
    api.getMyMechanics.mockResolvedValue([]);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('+ Add Mechanic')).toBeInTheDocument();
    });
  });
});
