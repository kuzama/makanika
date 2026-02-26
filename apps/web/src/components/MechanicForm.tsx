'use client';

import { useState } from 'react';
import TagInput from './TagInput';
import { CreateMechanicInput } from '../lib/api';

const VEHICLE_TYPES = [
  { value: 'CAR', label: 'Car' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'HEAVY_PLANT', label: 'Heavy Plant' },
  { value: 'BUS', label: 'Bus' },
  { value: 'OTHER', label: 'Other' },
];

interface MechanicFormProps {
  initialValues?: Partial<CreateMechanicInput>;
  onSubmit: (data: CreateMechanicInput) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function MechanicForm({
  initialValues,
  onSubmit,
  submitLabel = 'Create Listing',
  loading = false,
}: MechanicFormProps) {
  const [businessName, setBusinessName] = useState(initialValues?.businessName || '');
  const [phone, setPhone] = useState(initialValues?.phone || '');
  const [latitude, setLatitude] = useState(
    initialValues?.latitude !== undefined ? String(initialValues.latitude) : ''
  );
  const [longitude, setLongitude] = useState(
    initialValues?.longitude !== undefined ? String(initialValues.longitude) : ''
  );
  const [address, setAddress] = useState(initialValues?.address || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [priceRange, setPriceRange] = useState<'BUDGET' | 'MODERATE' | 'PREMIUM'>(
    initialValues?.priceRange || 'MODERATE'
  );
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(initialValues?.vehicleTypes || []);
  const [services, setServices] = useState<string[]>(initialValues?.services || []);
  const [specialties, setSpecialties] = useState<string[]>(initialValues?.specialties || []);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const handleVehicleTypeToggle = (type: string) => {
    setVehicleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setError('Unable to get your location. Please enter coordinates manually.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim() || businessName.trim().length < 2) {
      setError('Business name is required (minimum 2 characters)');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Valid coordinates are required. Use "Use My Location" or enter manually.');
      return;
    }
    if (lat < -22 || lat > -15) {
      setError('Latitude must be within Zimbabwe bounds (-22 to -15)');
      return;
    }
    if (lng < 25 || lng > 34) {
      setError('Longitude must be within Zimbabwe bounds (25 to 34)');
      return;
    }

    try {
      await onSubmit({
        businessName: businessName.trim(),
        phone: phone.trim(),
        latitude: lat,
        longitude: lng,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        priceRange,
        vehicleTypes,
        services,
        specialties,
      });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
          Business Name *
        </label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Kwame's Auto Repair"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 0771234567 or +263771234567"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">Zimbabwe format: 07XXXXXXXX or +2637XXXXXXXX</p>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="block text-sm font-medium text-gray-700">Location *</span>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
          >
            {locating ? 'Getting location...' : 'Use My Location'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="latitude" className="block text-xs text-gray-500 mb-1">
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-17.8292"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-xs text-gray-500 mb-1">
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="31.0522"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Coordinates should be within Zimbabwe (Lat: -22 to -15, Lng: 25 to 34)
        </p>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 45 Samora Machel Ave, Harare"
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the services offered, experience, specialties..."
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">{description.length}/1000</p>
      </div>

      {/* Price Range */}
      <div>
        <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
          Price Range
        </label>
        <select
          id="priceRange"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value as 'BUDGET' | 'MODERATE' | 'PREMIUM')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="BUDGET">Budget</option>
          <option value="MODERATE">Moderate</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      {/* Vehicle Types */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">Vehicle Types</legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
      </fieldset>

      {/* Services */}
      <TagInput
        label="Services"
        tags={services}
        onChange={setServices}
        placeholder="e.g. Engine Repair"
        id="services"
      />

      {/* Specialties */}
      <TagInput
        label="Specialties"
        tags={specialties}
        onChange={setSpecialties}
        placeholder="e.g. Toyota Specialist"
        id="specialties"
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold text-lg disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
