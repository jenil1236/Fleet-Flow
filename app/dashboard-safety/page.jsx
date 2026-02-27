'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Truck, Wrench, AlertTriangle, Activity } from 'lucide-react';

export default function SafetyOfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to load data');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 py-12">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Safety Officer Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor fleet safety and maintenance compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Fleet"
          value={stats.activeFleet}
          icon={Truck}
          color="blue"
        />
        <StatsCard
          title="Maintenance Alerts"
          value={stats.maintenanceAlerts}
          icon={Wrench}
          color="red"
        />
        <StatsCard
          title="Utilization Rate"
          value={`${stats.utilizationRate}%`}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Pending Cargo"
          value={stats.pendingCargo}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Safety Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Vehicles in Shop</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.maintenanceAlerts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Operational Vehicles</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.activeFleet}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
