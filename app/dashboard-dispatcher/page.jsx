'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Activity, Truck, Users, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DispatcherDashboard() {
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/trips/list'),
        fetch('/api/vehicles/list'),
        fetch('/api/drivers/list'),
      ]);

      const tripsData = await tripsRes.json();
      const vehiclesData = await vehiclesRes.json();
      const driversData = await driversRes.json();

      if (tripsData.success) setTrips(tripsData.data);
      if (vehiclesData.success) setVehicles(vehiclesData.data);
      if (driversData.success) setDrivers(driversData.data);

      // Calculate stats
      const activeTrips = tripsData.data?.filter(t => t.status === 'DISPATCHED').length || 0;
      const completedToday = tripsData.data?.filter(t => {
        if (t.status === 'COMPLETED' && t.completedAt) {
          const today = new Date().toDateString();
          const completedDate = new Date(t.completedAt).toDateString();
          return today === completedDate;
        }
        return false;
      }).length || 0;
      const availableVehicles = vehiclesData.data?.filter(v => v.status === 'AVAILABLE').length || 0;
      const availableDrivers = driversData.data?.filter(d => d.dutyStatus === 'OFF_DUTY').length || 0;

      setStats({
        activeTrips,
        completedToday,
        availableVehicles,
        availableDrivers,
      });

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
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const recentTrips = trips.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dispatcher Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage trips and monitor fleet operations
          </p>
        </div>
        <Link
          href="/dashboard-dispatcher/trips/create"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          Create Trip
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Trips"
          value={stats?.activeTrips || 0}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Available Vehicles"
          value={stats?.availableVehicles || 0}
          icon={Truck}
          color="purple"
        />
        <StatsCard
          title="Available Drivers"
          value={stats?.availableDrivers || 0}
          icon={Users}
          color="orange"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Trips
          </h2>
          <Link
            href="/dashboard-dispatcher/trips"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View All
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No trips yet
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
          Driver: {trip.driver.name}
        </p>
      </div>
      <Link
        href={`/dashboard-dispatcher/trips`}
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
      >
        View
      </Link>
    </div>
  );
}
