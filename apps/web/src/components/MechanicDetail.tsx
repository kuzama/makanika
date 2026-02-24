'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  author: { name?: string; phone: string };
  createdAt: string;
}

interface MechanicDetailProps {
  mechanic: {
    id: string;
    businessName: string;
    phone: string;
    latitude: number;
    longitude: number;
    address?: string;
    description?: string;
    priceRange: string;
    verificationStatus: string;
    vehicleTypes: string[];
    services: string[];
    specialties: string[];
    photos: string[];
    reviews?: Review[];
  };
}

export default function MechanicDetail({ mechanic }: MechanicDetailProps) {
  const averageRating =
    mechanic.reviews && mechanic.reviews.length > 0
      ? (
          mechanic.reviews.reduce((sum, r) => sum + r.rating, 0) /
          mechanic.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{mechanic.businessName}</h1>
          {mechanic.address && (
            <p className="text-gray-600 mt-1">{mechanic.address}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mechanic.verificationStatus === 'VERIFIED' && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Verified
            </span>
          )}
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {mechanic.priceRange}
          </span>
        </div>
      </div>

      {/* Phone */}
      <div className="mb-4">
        <a
          href={`tel:${mechanic.phone}`}
          className="text-blue-600 hover:underline text-lg"
        >
          {mechanic.phone}
        </a>
      </div>

      {/* Description */}
      {mechanic.description && (
        <p className="text-gray-700 mb-6">{mechanic.description}</p>
      )}

      {/* Map */}
      <div className="h-64 rounded-lg overflow-hidden mb-6">
        <MapContainer
          center={[mechanic.latitude, mechanic.longitude]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[mechanic.latitude, mechanic.longitude]}>
            <Popup>{mechanic.businessName}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Vehicle Types */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Vehicle Types</h2>
        <div className="flex flex-wrap gap-2">
          {mechanic.vehicleTypes.map((type) => (
            <span
              key={type}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <h2 className="font-semibold mb-2">Services</h2>
        <div className="flex flex-wrap gap-2">
          {mechanic.services.map((service) => (
            <span
              key={service}
              className="bg-purple-50 text-purple-700 px-3 py-1 rounded text-sm"
            >
              {service}
            </span>
          ))}
        </div>
      </div>

      {/* Specialties */}
      {mechanic.specialties.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {mechanic.specialties.map((spec) => (
              <span
                key={spec}
                className="bg-orange-50 text-orange-700 px-3 py-1 rounded text-sm"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {mechanic.reviews && mechanic.reviews.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold mb-3">
            Reviews ({mechanic.reviews.length})
            {averageRating && (
              <span className="text-yellow-600 ml-2">
                Average: {averageRating}
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {mechanic.reviews.map((review) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {review.author.name || 'Anonymous'}
                  </span>
                  <span className="text-yellow-600 font-medium">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700 text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
