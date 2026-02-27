'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    issueDescription: '',
    serviceDate: new Date().toISOString().split('T')[0],
    cost: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles/list');
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data);
      }
      setFetching(false);
    } catch (err) {
      setError('Failed to load vehicles');
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/maintenance/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          issueDescription: formData.issueDescription,
          serviceDate: formData.serviceDate,
          cost: Number(formData.cost),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create maintenance log');
      }

      router.push('/dashboard/maintenance');
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
          href="/dashboard/maintenance"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule Maintenance</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new maintenance log</p>
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
            Vehicle
          </label>
          <select
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.licensePlate} - {vehicle.model} ({vehicle.status})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Note: Vehicle will be marked as IN_SHOP after creating this log
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Issue Description
          </label>
          <textarea
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the maintenance issue or service needed..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Date
            </label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Cost ($)
            </label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="250.00"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create Maintenance Log'}
          </button>
          <Link
            href="/dashboard/maintenance"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
