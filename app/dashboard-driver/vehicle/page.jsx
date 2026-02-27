'use client';

import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';

export default function DriverVehiclePage() {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    try {
      // Get active trip to find assigned vehicle
      const response = await fetch('/api/trips/list');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch trips');
      
      if (data.success) {
        const activeTrip = data.data.find(t => t.status === 'DISPATCHED');
        if (activeTrip) {
          setVehicle(activeTrip.vehicle);
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400 mb-4">Error: {error}</div>
        <button
          onClick={fetchVehicle}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assigned Vehicle
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your currently assigned vehicle
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-200 dark:border-gray-800 text-center">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No vehicle currently assigned
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            You will be assigned a vehicle when you have an active trip
          </p>
        </div>
      </div>
    );
  }

  const statusColors = {
    AVAILABLE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    ON_TRIP: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    IN_SHOP: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    OUT_OF_SERVICE: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  const vehicleStatus = vehicle.status || 'AVAILABLE';
  const statusDisplay = vehicleStatus.replace(/_/g, ' ');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Assigned Vehicle
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your currently assigned vehicle details
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">{vehicle.licensePlate || 'N/A'}</h2>
            <p className="text-blue-100">{vehicle.model || 'N/A'}</p>
          </div>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[vehicleStatus]}`}>
          {statusDisplay}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Vehicle Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">License Plate</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.licensePlate || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Model</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.model || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Type</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.type || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Max Capacity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.maxCapacityKg ? `${vehicle.maxCapacityKg} kg` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Odometer</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{vehicle.odometerKm ? `${vehicle.odometerKm.toLocaleString()} km` : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{statusDisplay}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> This is a read-only view. Contact your dispatcher for any vehicle-related issues or maintenance requests.
        </p>
      </div>
    </div>
  );
}
