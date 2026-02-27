'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    tripId: '',
    fuelLiters: '',
    fuelCost: '',
    miscCost: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/vehicles/list'),
        fetch('/api/drivers/list'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const driversData = await driversRes.json();

      if (vehiclesData.success) setVehicles(vehiclesData.data);
      if (driversData.success) setDrivers(driversData.data);

      setFetching(false);
    } catch (err) {
      setError('Failed to load vehicles and drivers');
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fuelLiters' || name === 'fuelCost' || name === 'miscCost'
        ? parseFloat(value) || ''
        : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          tripId: formData.tripId || undefined,
          fuelLiters: Number(formData.fuelLiters),
          fuelCost: Number(formData.fuelCost),
          miscCost: Number(formData.miscCost),
          expenseDate: formData.expenseDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create expense');
      }

      router.push('/dashboard/expenses');
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
          href="/dashboard/expenses"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Expense</h1>
          <p className="text-gray-600 dark:text-gray-400">Record a new fleet expense</p>
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
                {vehicle.licensePlate} - {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Driver
          </label>
          <select
            name="driverId"
            value={formData.driverId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a driver</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>
                {driver.user?.name || 'Unknown Driver'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trip ID (Optional)
          </label>
          <input
            type="text"
            name="tripId"
            value={formData.tripId}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Leave empty if not related to a trip"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expense Date
          </label>
          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuel Liters
            </label>
            <input
              type="number"
              name="fuelLiters"
              value={formData.fuelLiters}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuel Cost ($)
            </label>
            <input
              type="number"
              name="fuelCost"
              value={formData.fuelCost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="150.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Misc Cost ($)
            </label>
            <input
              type="number"
              name="miscCost"
              value={formData.miscCost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25.00"
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-semibold">Total Cost: </span>
            ${((Number(formData.fuelCost) || 0) + (Number(formData.miscCost) || 0)).toFixed(2)}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Log Expense'}
          </button>
          <Link
            href="/dashboard/expenses"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
