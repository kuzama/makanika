import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MechanicDetail from '../components/MechanicDetail';

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => (
    <div data-testid="map-marker">{children}</div>
  ),
  Popup: ({ children }: any) => <div data-testid="map-popup">{children}</div>,
}));

const mechanic = {
  id: 'mech-1',
  businessName: 'Fix-It Garage',
  phone: '+263771234567',
  latitude: -17.8292,
  longitude: 31.0522,
  address: '123 Samora Machel Ave, Harare',
  description: 'General auto repairs and diagnostics. Specializing in Japanese vehicles.',
  priceRange: 'MODERATE' as const,
  verificationStatus: 'VERIFIED' as const,
  vehicleTypes: ['CAR', 'SUV'],
  services: ['Oil Change', 'Brake Repair', 'Engine Diagnostics'],
  specialties: ['Toyota', 'Honda'],
  photos: [],
  reviews: [
    {
      id: 'rev-1',
      rating: 5,
      comment: 'Excellent work on my Corolla!',
      author: { name: 'John', phone: '+263771111111' },
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'rev-2',
      rating: 4,
      comment: 'Good service, fair prices.',
      author: { name: 'Sarah', phone: '+263772222222' },
      createdAt: '2025-02-01T14:00:00Z',
    },
  ],
};

describe('MechanicDetail', () => {
  it('renders business name as heading', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(
      screen.getByRole('heading', { name: 'Fix-It Garage' })
    ).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText(/Specializing in Japanese/)).toBeInTheDocument();
  });

  it('renders address', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText(/123 Samora Machel Ave/)).toBeInTheDocument();
  });

  it('renders phone with call link', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    const phoneLink = screen.getByRole('link', { name: /\+263771234567/ });
    expect(phoneLink).toHaveAttribute('href', 'tel:+263771234567');
  });

  it('renders map with mechanic location', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('map-marker')).toBeInTheDocument();
  });

  it('renders services list', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText('Oil Change')).toBeInTheDocument();
    expect(screen.getByText('Brake Repair')).toBeInTheDocument();
    expect(screen.getByText('Engine Diagnostics')).toBeInTheDocument();
  });

  it('renders specialties', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.getByText('Honda')).toBeInTheDocument();
  });

  it('renders reviews', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText(/Excellent work on my Corolla/)).toBeInTheDocument();
    expect(screen.getByText(/Good service, fair prices/)).toBeInTheDocument();
  });

  it('renders verified badge', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it('renders vehicle types', () => {
    render(<MechanicDetail mechanic={mechanic} />);
    expect(screen.getByText(/CAR/)).toBeInTheDocument();
    expect(screen.getByText(/SUV/)).toBeInTheDocument();
  });
});
