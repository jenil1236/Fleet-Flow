'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { Truck, Wrench, AlertTriangle, Activity } from 'lucide-react';

export default function SafetyOfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSafetyData();
  }, []);

  const fetchSafetyData = async () => {
    try {
      const [vehiclesRes, maintenanceRes, complaintsRes] = await Promise.all([
        fetch('/api/vehicles/list'),
        fetch('/api/maintenance/list'),
        fetch('/api/complaints/list'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const maintenanceData = await maintenanceRes.json();
      const complaintsData = await complaintsRes.json();

      if (!vehiclesData.success || !maintenanceData.success || !complaintsData.success) {
        throw new Error('Failed to fetch safety data');
      }

      // Calculate safety-specific stats
      const activeFleet = vehiclesData.data?.filter(v => v.status === 'ON_TRIP').length || 0;
      const maintenanceAlerts = vehiclesData.data?.filter(v => v.status === 'IN_SHOP').length || 0;
      const openComplaints = complaintsData.data?.filter(c => c.status === 'OPEN').length || 0;
      const pendingMaintenance = maintenanceData.data?.filter(m => m.status === 'PENDING').length || 0;

      setStats({
        activeFleet,
        maintenanceAlerts,
        openComplaints,
        pendingMaintenance,
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
          onClick={fetchSafetyData}
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
          title="Open Complaints"
          value={stats.openComplaints}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Pending Maintenance"
          value={stats.pendingMaintenance}
          icon={Activity}
          color="purple"
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Vehicles</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.activeFleet}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Open Complaints</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.openComplaints}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pending Maintenance</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pendingMaintenance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
