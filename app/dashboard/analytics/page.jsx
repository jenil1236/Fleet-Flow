'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, Fuel, Wrench, ArrowRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const [dashboardRes, fuelRes, monthlyRes] = await Promise.all([
        fetch('/api/analytics/dashboard'),
        fetch('/api/analytics/fuel-efficiency'),
        fetch('/api/analytics/monthly-summary'),
      ]);

      const dashboardData = await dashboardRes.json();
      const fuelData = await fuelRes.json();
      const monthlyData = await monthlyRes.json();

      if (!dashboardRes.ok || !fuelRes.ok || !monthlyRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      if (dashboardData.success) setDashboardData(dashboardData.data);
      if (fuelData.success) setFuelEfficiency(fuelData.data);
      if (monthlyData.success) setMonthlySummary(monthlyData.data);

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
          onClick={fetchAllAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive fleet performance metrics and insights
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/dashboard/analytics/trip-analysis"
          className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Trip Analysis</h3>
              <p className="text-blue-100">Detailed trip-level profitability and performance</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link 
          href="/dashboard/analytics/fleet-summary"
          className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Fleet Summary</h3>
              <p className="text-purple-100">Fleet-wide cost analysis and vehicle performance</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Fleet ROI"
          value={`${dashboardData?.fleetROI || 0}%`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(dashboardData?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Total Fuel Cost"
          value={`$${(dashboardData?.totalFuelCost || 0).toLocaleString()}`}
          icon={Fuel}
          color="orange"
        />
        <MetricCard
          title="Utilization Rate"
          value={`${dashboardData?.utilizationRate || 0}%`}
          icon={Wrench}
          color="purple"
        />
      </div>

      {/* Monthly Revenue & Expenses Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Monthly Financial Overview
        </h2>
        {monthlySummary.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No monthly data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlySummary}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="fuelCost" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorFuel)"
                name="Fuel Cost"
              />
              <Area 
                type="monotone" 
                dataKey="maintenanceCost" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorMaintenance)"
                name="Maintenance"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Net Profit Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Net Profit Trend
        </h2>
        {monthlySummary.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No profit data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySummary}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="netProfit" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorProfit)"
                name="Net Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fuel Efficiency by Vehicle */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Fuel Efficiency by Vehicle (km/L)
        </h2>
        {fuelEfficiency.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No fuel efficiency data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="licensePlate" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar 
                dataKey="kmPerLiter" 
                fill="#06b6d4"
                radius={[8, 8, 0, 0]}
                name="km/L"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fuel Efficiency Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Detailed Fuel Efficiency
        </h2>
        {fuelEfficiency.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Model</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Distance (km)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Fuel (L)</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Efficiency (km/L)</th>
                </tr>
              </thead>
              <tbody>
                {fuelEfficiency.map((vehicle) => (
                  <tr key={vehicle.vehicleId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {vehicle.licensePlate}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {vehicle.model}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      {vehicle.totalDistance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      {vehicle.totalFuelLiters.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-cyan-600 dark:text-cyan-400">
                      {vehicle.kmPerLiter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
