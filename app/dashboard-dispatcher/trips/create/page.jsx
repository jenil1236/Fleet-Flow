'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    originAddress: '',
    destinationAddress: '',
    estimatedFuelCost: '',
    startOdometerKm: '',
    revenue: '',
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

      if (vehiclesData.success) {
        // Filter only AVAILABLE vehicles
        setVehicles(vehiclesData.data.filter(v => v.status === 'AVAILABLE'));
      }
      if (driversData.success) {
        // Filter only OFF_DUTY drivers (available for assignment)
        setDrivers(driversData.data.filter(d => d.dutyStatus === 'OFF_DUTY'));
      }

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
      [name]: ['cargoWeightKg', 'estimatedFuelCost', 'startOdometerKm', 'revenue'].includes(name)
        ? parseFloat(value) || ''
        : value
    }));

    // Auto-fill start odometer when vehicle is selected
    if (name === 'vehicleId' && value) {
      const selectedVehicle = vehicles.find(v => v.id === value);
      if (selectedVehicle) {
        setFormData(prev => ({
          ...prev,
          startOdometerKm: selectedVehicle.odometerKm
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: formData.vehicleId,
          driverId: formData.driverId,
          cargoWeightKg: Number(formData.cargoWeightKg),
          originAddress: formData.originAddress,
          destinationAddress: formData.destinationAddress,
          estimatedFuelCost: Number(formData.estimatedFuelCost),
          startOdometerKm: Number(formData.startOdometerKm),
          revenue: Number(formData.revenue),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trip');
      }

      router.push('/dashboard-dispatcher/trips');
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
          href="/dashboard-dispatcher/trips"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Trip</h1>
          <p className="text-gray-600 dark:text-gray-400">Dispatch a new trip</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {vehicle.licensePlate} - {vehicle.model} ({vehicle.maxCapacityKg}kg)
                </option>
              ))}
            </select>
            {vehicles.length === 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                No available vehicles
              </p>
            )}
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
                  {driver.user?.name || 'Unknown'} - {driver.licenseNumber}
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                No available drivers
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Origin Address
          </label>
          <input
            type="text"
            name="originAddress"
            value={formData.originAddress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St, City A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destination Address
          </label>
          <input
            type="text"
            name="destinationAddress"
            value={formData.destinationAddress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="456 Oak Ave, City B"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cargo Weight (kg)
            </label>
            <input
              type="number"
              name="cargoWeightKg"
              value={formData.cargoWeightKg}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Odometer (km)
            </label>
            <input
              type="number"
              name="startOdometerKm"
              value={formData.startOdometerKm}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Auto-filled from vehicle"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Fuel Cost ($)
            </label>
            <input
              type="number"
              name="estimatedFuelCost"
              value={formData.estimatedFuelCost}
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
              Revenue ($)
            </label>
            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500.00"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || vehicles.length === 0 || drivers.length === 0}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Dispatch Trip'}
          </button>
          <Link
            href="/dashboard-dispatcher/trips"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
