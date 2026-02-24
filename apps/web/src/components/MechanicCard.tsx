import { Mechanic } from '../lib/api';

interface MechanicCardProps {
  mechanic: Mechanic;
}

export default function MechanicCard({ mechanic }: MechanicCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{mechanic.businessName}</h3>
          {mechanic.address && (
            <p className="text-sm text-gray-600 mt-1">{mechanic.address}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mechanic.verificationStatus === 'VERIFIED' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Verified
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {mechanic.priceRange}
          </span>
        </div>
      </div>

      {mechanic.description && (
        <p className="text-sm text-gray-700 mt-2">{mechanic.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {mechanic.vehicleTypes.map((type) => (
          <span
            key={type}
            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {mechanic.services.map((service) => (
          <span
            key={service}
            className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded"
          >
            {service}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {mechanic.averageRating !== undefined && (
            <span className="font-medium text-yellow-600">
              {mechanic.averageRating}
            </span>
          )}
          {mechanic.reviewCount !== undefined && (
            <span className="text-gray-500">({mechanic.reviewCount} reviews)</span>
          )}
        </div>
        <a
          href={`tel:${mechanic.phone}`}
          className="text-blue-600 hover:underline"
        >
          {mechanic.phone}
        </a>
      </div>
    </div>
  );
}
