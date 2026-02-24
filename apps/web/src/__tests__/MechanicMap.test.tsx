import React from 'react';
import { render, screen } from '@testing-library/react';
import MechanicMap from '../components/MechanicMap';

// Mock react-leaflet since it needs browser APIs not available in jsdom
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" data-center={JSON.stringify(props.center)} data-zoom={props.zoom}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: any) => (
    <div data-testid="map-marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="map-popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    flyTo: jest.fn(),
  }),
}));

const mechanics = [
  {
    id: 'mech-1',
    businessName: 'Fix-It Garage',
    phone: '+263771234567',
    latitude: -17.8292,
    longitude: 31.0522,
    address: '123 Samora Machel Ave',
    priceRange: 'MODERATE' as const,
    verificationStatus: 'VERIFIED' as const,
    vehicleTypes: ['CAR'],
    services: ['Oil Change'],
    specialties: [],
    photos: [],
  },
  {
    id: 'mech-2',
    businessName: 'Truck Masters',
    phone: '+263772345678',
    latitude: -17.83,
    longitude: 31.05,
    address: '456 Julius Nyerere Way',
    priceRange: 'PREMIUM' as const,
    verificationStatus: 'UNVERIFIED' as const,
    vehicleTypes: ['TRUCK'],
    services: ['Engine Overhaul'],
    specialties: [],
    photos: [],
  },
];

describe('MechanicMap', () => {
  it('renders map container', () => {
    render(<MechanicMap mechanics={mechanics} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('centers on Harare by default', () => {
    render(<MechanicMap mechanics={mechanics} />);
    const container = screen.getByTestId('map-container');
    const center = JSON.parse(container.getAttribute('data-center')!);
    expect(center[0]).toBeCloseTo(-17.8292, 2);
    expect(center[1]).toBeCloseTo(31.0522, 2);
  });

  it('renders a marker for each mechanic', () => {
    render(<MechanicMap mechanics={mechanics} />);
    const markers = screen.getAllByTestId('map-marker');
    expect(markers).toHaveLength(2);
  });

  it('renders popup with business name', () => {
    render(<MechanicMap mechanics={mechanics} />);
    const popups = screen.getAllByTestId('map-popup');
    expect(popups[0]).toHaveTextContent('Fix-It Garage');
    expect(popups[1]).toHaveTextContent('Truck Masters');
  });

  it('renders marker at correct position', () => {
    render(<MechanicMap mechanics={mechanics} />);
    const markers = screen.getAllByTestId('map-marker');
    const pos = JSON.parse(markers[0].getAttribute('data-position')!);
    expect(pos[0]).toBeCloseTo(-17.8292, 4);
    expect(pos[1]).toBeCloseTo(31.0522, 4);
  });

  it('accepts custom center coordinates', () => {
    render(
      <MechanicMap
        mechanics={mechanics}
        center={[-17.76, 31.09]}
      />
    );
    const container = screen.getByTestId('map-container');
    const center = JSON.parse(container.getAttribute('data-center')!);
    expect(center[0]).toBeCloseTo(-17.76, 2);
    expect(center[1]).toBeCloseTo(31.09, 2);
  });

  it('renders with empty mechanics array', () => {
    render(<MechanicMap mechanics={[]} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });
});
