'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/dashboard/StatsCard';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Activity } from 'lucide-react';

export default function FinancialDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch dashboard');
      
      if (data.success) {
        setStats(data.data);
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
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const netProfit = (stats?.totalRevenue || 0) - (stats?.totalExpenses || 0);
  const profitMargin = stats?.totalRevenue > 0 
    ? ((netProfit / stats.totalRevenue) * 100).toFixed(2) 
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor revenue, expenses, and profitability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Total Expenses"
          value={`$${(stats?.totalExpenses || 0).toLocaleString()}`}
          icon={TrendingDown}
          color="red"
        />
        <StatsCard
          title="Net Profit"
          value={`$${netProfit.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Fleet ROI"
          value={`${stats?.fleetROI || 0}%`}
          icon={Activity}
          color="purple"
        />
        <StatsCard
          title="Total Fuel Cost"
          value={`$${(stats?.totalFuelCost || 0).toLocaleString()}`}
          icon={AlertCircle}
          color="orange"
        />
        <StatsCard
          title="Profit Margin"
          value={`${profitMargin}%`}
          icon={CheckCircle}
          color="cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Revenue</h3>
          <p className="text-4xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-green-100 mt-2">Total income from completed trips</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Expenses</h3>
          <p className="text-4xl font-bold">${(stats?.totalExpenses || 0).toLocaleString()}</p>
          <p className="text-red-100 mt-2">Total operational costs</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-medium mb-2">Net Profit</h3>
          <p className="text-4xl font-bold">${netProfit.toLocaleString()}</p>
          <p className="text-blue-100 mt-2">Revenue minus expenses</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Financial Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fleet Acquisition Cost</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(stats?.totalAcquisitionCost || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fuel Expenses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${(stats?.totalFuelCost || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Return on Investment</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.fleetROI || 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Profit Margin</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profitMargin}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
