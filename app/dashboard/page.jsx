'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Truck, DollarSign, Wrench, TrendingUp, Activity } from 'lucide-react';

export default function DashboardPage() {
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
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening with your fleet today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          title="Pending Cargo"
          value={stats.pendingCargo}
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Utilization Rate"
          value={`${stats.utilizationRate}%`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Fuel Cost"
          value={`$${stats.totalFuelCost.toLocaleString()}%`}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="Fleet ROI"
          value={`${stats.fleetROI}%`}
          icon={TrendingUp}
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            ${stats.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acquisition Cost</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${stats.totalAcquisitionCost.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
