import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MechanicsListPage from '../app/mechanics/page';

jest.mock('../lib/api', () => ({
  api: {
    getMechanics: jest.fn(),
    sendCode: jest.fn(),
    verifyCode: jest.fn(),
  },
}));

import { api } from '../lib/api';

const mockGetMechanics = api.getMechanics as jest.MockedFunction<
  typeof api.getMechanics
>;

const mechanicsList = {
  mechanics: [
    {
      id: 'mech-1',
      businessName: 'Fix-It Garage',
      phone: '+263771234567',
      latitude: -17.8292,
      longitude: 31.0522,
      address: '123 Samora Machel Ave',
      description: 'General repairs',
      priceRange: 'MODERATE',
      verificationStatus: 'VERIFIED',
      vehicleTypes: ['CAR'],
      services: ['Oil Change'],
      specialties: ['Toyota'],
      photos: [],
      averageRating: 4.5,
      reviewCount: 12,
    },
    {
      id: 'mech-2',
      businessName: 'Truck Masters',
      phone: '+263772345678',
      latitude: -17.83,
      longitude: 31.05,
      address: '456 Julius Nyerere Way',
      description: 'Truck specialists',
      priceRange: 'PREMIUM',
      verificationStatus: 'UNVERIFIED',
      vehicleTypes: ['TRUCK'],
      services: ['Engine Overhaul'],
      specialties: ['Mercedes'],
      photos: [],
      averageRating: 3.8,
      reviewCount: 5,
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
};

describe('MechanicsListPage', () => {
  beforeEach(() => {
    mockGetMechanics.mockReset();
  });

  it('renders mechanic cards after loading', async () => {
    mockGetMechanics.mockResolvedValue(mechanicsList);

    render(<MechanicsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Fix-It Garage')).toBeInTheDocument();
      expect(screen.getByText('Truck Masters')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockGetMechanics.mockReturnValue(new Promise(() => {})); // never resolves

    render(<MechanicsListPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when no mechanics found', async () => {
    mockGetMechanics.mockResolvedValue({
      mechanics: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    render(<MechanicsListPage />);

    await waitFor(() => {
      expect(screen.getByText(/no mechanics/i)).toBeInTheDocument();
    });
  });

  it('calls API with search query', async () => {
    mockGetMechanics.mockResolvedValue(mechanicsList);

    render(<MechanicsListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Toyota');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(mockGetMechanics).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Toyota' })
      );
    });
  });
});
