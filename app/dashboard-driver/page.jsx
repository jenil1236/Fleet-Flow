'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Activity, CheckCircle, Clock, Truck } from 'lucide-react';

export default function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips/list');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch trips');
      
      if (data.success) {
        setTrips(data.data);
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
          onClick={fetchTrips}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = {
    total: trips.length,
    active: trips.filter(t => t.status === 'DISPATCHED').length,
    completed: trips.filter(t => t.status === 'COMPLETED').length,
  };

  const activeTrip = trips.find(t => t.status === 'DISPATCHED');
  const recentTrips = trips.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Driver Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s your trip overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Trips"
          value={stats.total}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="Active Trip"
          value={stats.active}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Assigned Vehicle"
          value={activeTrip ? activeTrip.vehicle.licensePlate : 'None'}
          icon={Truck}
          color="purple"
        />
      </div>

      {activeTrip && (
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Active Trip</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Origin</p>
              <p className="font-semibold">{activeTrip.originAddress}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Destination</p>
              <p className="font-semibold">{activeTrip.destinationAddress}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Vehicle</p>
              <p className="font-semibold">{activeTrip.vehicle.licensePlate} - {activeTrip.vehicle.model}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Cargo Weight</p>
              <p className="font-semibold">{activeTrip.cargoWeightKg} kg</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Trips
        </h2>

        {recentTrips.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No trips assigned yet
          </div>
        ) : (
          <div className="space-y-3">
            {recentTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip }) {
  const statusColors = {
    DISPATCHED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
            {trip.status}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {trip.vehicle.licensePlate}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {trip.originAddress} → {trip.destinationAddress}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {new Date(trip.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
