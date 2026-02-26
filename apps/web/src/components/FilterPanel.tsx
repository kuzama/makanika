'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface FilterValues {
  vehicleTypes: string[];
  services: string[];
  priceRange: string;
  verifiedOnly: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterValues) => void;
}

const VEHICLE_TYPES = [
  { value: 'CAR', label: 'Car' },
  { value: 'SUV', label: 'SUV' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'OTHER', label: 'Other' },
];

const SERVICES = [
  { value: 'Engine Repair', label: 'Engine Repair' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Body Work', label: 'Body Work' },
  { value: 'Oil Change', label: 'Oil Change' },
  { value: 'Brake Repair', label: 'Brake Repair' },
  { value: 'Transmission', label: 'Transmission' },
];

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [vehicleTypes, setVehicleTypes] = useState<string[]>(() => {
    const param = searchParams.get('vehicleTypes');
    return param ? param.split(',') : [];
  });
  const [services, setServices] = useState<string[]>(() => {
    const param = searchParams.get('services');
    return param ? param.split(',') : [];
  });
  const [priceRange, setPriceRange] = useState(() => searchParams.get('priceRange') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(() => searchParams.get('verifiedOnly') === 'true');

  const updateUrlParams = useCallback(
    (filters: FilterValues) => {
      const params = new URLSearchParams();
      if (filters.vehicleTypes.length) params.set('vehicleTypes', filters.vehicleTypes.join(','));
      if (filters.services.length) params.set('services', filters.services.join(','));
      if (filters.priceRange) params.set('priceRange', filters.priceRange);
      if (filters.verifiedOnly) params.set('verifiedOnly', 'true');

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname]
  );

  const emitChange = useCallback(
    (filters: FilterValues) => {
      onFilterChange(filters);
      updateUrlParams(filters);
    },
    [onFilterChange, updateUrlParams]
  );

  const handleVehicleTypeToggle = (type: string) => {
    const updated = vehicleTypes.includes(type)
      ? vehicleTypes.filter((t) => t !== type)
      : [...vehicleTypes, type];
    setVehicleTypes(updated);
    emitChange({ vehicleTypes: updated, services, priceRange, verifiedOnly });
  };

  const handleServiceToggle = (service: string) => {
    const updated = services.includes(service)
      ? services.filter((s) => s !== service)
      : [...services, service];
    setServices(updated);
    emitChange({ vehicleTypes, services: updated, priceRange, verifiedOnly });
  };

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    emitChange({ vehicleTypes, services, priceRange: value, verifiedOnly });
  };

  const handleVerifiedOnlyToggle = () => {
    const updated = !verifiedOnly;
    setVerifiedOnly(updated);
    emitChange({ vehicleTypes, services, priceRange, verifiedOnly: updated });
  };

  const handleClearAll = () => {
    setVehicleTypes([]);
    setServices([]);
    setPriceRange('');
    setVerifiedOnly(false);
    emitChange({ vehicleTypes: [], services: [], priceRange: '', verifiedOnly: false });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4" role="region" aria-label="Filters">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear All
        </button>
      </div>

      {/* Vehicle Types */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Vehicle Type</h4>
        <div className="space-y-1">
          {VEHICLE_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={vehicleTypes.includes(value)}
                onChange={() => handleVehicleTypeToggle(value)}
                className="rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Services</h4>
        <div className="space-y-1">
          {SERVICES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={services.includes(value)}
                onChange={() => handleServiceToggle(value)}
                className="rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label htmlFor="priceRangeFilter" className="block text-sm font-medium mb-1">
          Price Range
        </label>
        <select
          id="priceRangeFilter"
          value={priceRange}
          onChange={(e) => handlePriceRangeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Any Price</option>
          <option value="BUDGET">Budget</option>
          <option value="MODERATE">Moderate</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      {/* Verified Only */}
      <div className="mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={handleVerifiedOnlyToggle}
            className="rounded"
          />
          <span className="text-sm">Verified Only</span>
        </label>
      </div>
    </div>
  );
}
