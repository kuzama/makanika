'use client';

import { useState } from 'react';

interface FilterValues {
  vehicleType: string;
  priceRange: string;
  verifiedOnly: boolean;
}

interface SearchFiltersProps {
  onFilter: (filters: FilterValues) => void;
}

export default function SearchFilters({ onFilter }: SearchFiltersProps) {
  const [vehicleType, setVehicleType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleApply = () => {
    onFilter({ vehicleType, priceRange, verifiedOnly });
  };

  const handleClear = () => {
    setVehicleType('');
    setPriceRange('');
    setVerifiedOnly(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold mb-3">Filters</h3>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="vehicleType"
            className="block text-sm font-medium mb-1"
          >
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Types</option>
            <option value="CAR">Car</option>
            <option value="SUV">SUV</option>
            <option value="SEDAN">Sedan</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priceRange"
            className="block text-sm font-medium mb-1"
          >
            Price Range
          </label>
          <select
            id="priceRange"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Any Price</option>
            <option value="BUDGET">Budget</option>
            <option value="MODERATE">Moderate</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="verifiedOnly"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="verifiedOnly" className="text-sm">
            Verified Only
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClear}
            className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
