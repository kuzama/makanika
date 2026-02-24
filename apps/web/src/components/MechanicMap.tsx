'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Mechanic } from '../lib/api';

// Default center: Harare CBD
const HARARE_CENTER: [number, number] = [-17.8292, 31.0522];
const DEFAULT_ZOOM = 13;

interface MechanicMapProps {
  mechanics: Mechanic[];
  center?: [number, number];
  zoom?: number;
}

export default function MechanicMap({
  mechanics,
  center = HARARE_CENTER,
  zoom = DEFAULT_ZOOM,
}: MechanicMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mechanics.map((mechanic) => (
        <Marker
          key={mechanic.id}
          position={[mechanic.latitude, mechanic.longitude]}
        >
          <Popup>
            <div>
              <strong>{mechanic.businessName}</strong>
              {mechanic.address && <p className="text-sm">{mechanic.address}</p>}
              <a
                href={`/mechanics/${mechanic.id}`}
                className="text-blue-600 text-sm"
              >
                View details
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
