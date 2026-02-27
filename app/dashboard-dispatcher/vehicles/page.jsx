'use client';

import { useEffect, useState } from 'react';
import { Search, Truck } from 'lucide-react';

export default function DispatcherVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles/list');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch vehicles');
      
      if (data.success) {
        setVehicles(data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const onTripCount = vehicles.filter(v => v.status === 'ON_TRIP').length;

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
          onClick={fetchVehicles}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Fleet Vehicles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View vehicle availability for trip assignment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{availableCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">On Trip</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{onTripCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by license plate or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No vehicles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const statusColors = {
    AVAILABLE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    ON_TRIP: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    IN_SHOP: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    OUT_OF_SERVICE: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{vehicle.licensePlate}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status]}`}>
          {vehicle.status.replace(/_/g, ' ')}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{vehicle.model}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-500">Type:</span>
          <p className="text-gray-900 dark:text-white font-medium">{vehicle.type}</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-500">Capacity:</span>
          <p className="text-gray-900 dark:text-white font-medium">{vehicle.maxCapacityKg} kg</p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-500">Odometer:</span>
          <p className="text-gray-900 dark:text-white font-medium">{vehicle.odometerKm.toLocaleString()} km</p>
        </div>
      </div>
    </div>
  );
}
