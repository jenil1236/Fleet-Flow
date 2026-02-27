'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    model: '',
    type: '',
    maxCapacityKg: '',
    odometerKm: '',
    acquisitionCost: '',
  });

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch vehicle');
      
      if (data.success) {
        const vehicle = data.data;
        setFormData({
          model: vehicle.model,
          type: vehicle.type,
          maxCapacityKg: vehicle.maxCapacityKg,
          odometerKm: vehicle.odometerKm,
          acquisitionCost: vehicle.acquisitionCost,
        });
      }
      setFetching(false);
    } catch (err) {
      setError(err.message);
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacityKg' || name === 'odometerKm' || name === 'acquisitionCost' 
        ? parseFloat(value) || '' 
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: formData.model,
          type: formData.type,
          maxCapacityKg: Number(formData.maxCapacityKg),
          odometerKm: Number(formData.odometerKm),
          acquisitionCost: Number(formData.acquisitionCost),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update vehicle');
      }

      router.push('/dashboard/vehicles');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/vehicles"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Vehicle</h1>
          <p className="text-gray-600 dark:text-gray-400">Update vehicle information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="TRAILER">Trailer</option>
            <option value="PICKUP">Pickup</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Capacity (kg)
            </label>
            <input
              type="number"
              name="maxCapacityKg"
              value={formData.maxCapacityKg}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Odometer (km)
            </label>
            <input
              type="number"
              name="odometerKm"
              value={formData.odometerKm}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Acquisition Cost ($)
            </label>
            <input
              type="number"
              name="acquisitionCost"
              value={formData.acquisitionCost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
          >
            {loading ? 'Updating...' : 'Update Vehicle'}
          </button>
          <Link
            href="/dashboard/vehicles"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
