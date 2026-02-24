import React from 'react';
import { render, screen } from '@testing-library/react';
import MechanicCard from '../components/MechanicCard';

const baseMechanic = {
  id: 'mech-1',
  businessName: 'Fix-It Garage',
  phone: '+263771234567',
  latitude: -17.8292,
  longitude: 31.0522,
  address: '123 Samora Machel Ave, Harare',
  description: 'General auto repairs and diagnostics',
  priceRange: 'MODERATE' as const,
  verificationStatus: 'VERIFIED' as const,
  vehicleTypes: ['CAR', 'TRUCK'],
  services: ['Oil Change', 'Brake Repair', 'Engine Diagnostics'],
  specialties: ['Toyota', 'Honda'],
  photos: [],
  averageRating: 4.5,
  reviewCount: 12,
};

describe('MechanicCard', () => {
  it('renders business name', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText('Fix-It Garage')).toBeInTheDocument();
  });

  it('renders address', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText(/123 Samora Machel Ave/)).toBeInTheDocument();
  });

  it('renders services list', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText(/Oil Change/)).toBeInTheDocument();
  });

  it('renders vehicle types', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText(/CAR/)).toBeInTheDocument();
  });

  it('renders price range', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText(/MODERATE/i)).toBeInTheDocument();
  });

  it('renders verification badge for verified mechanics', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it('does not render verified badge for unverified mechanics', () => {
    render(
      <MechanicCard
        mechanic={{ ...baseMechanic, verificationStatus: 'UNVERIFIED' }}
      />
    );
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
  });

  it('renders average rating and review count', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/12 reviews/)).toBeInTheDocument();
  });

  it('renders phone number', () => {
    render(<MechanicCard mechanic={baseMechanic} />);
    expect(screen.getByText(/\+263771234567/)).toBeInTheDocument();
  });
});
