'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [fuelEfficiency, setFuelEfficiency] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [monthlyRes, fuelRes] = await Promise.all([
        fetch('/api/analytics/monthly-summary'),
        fetch('/api/analytics/fuel-efficiency'),
      ]);

      const monthlyData = await monthlyRes.json();
      const fuelData = await fuelRes.json();

      if (monthlyData.success) setMonthlySummary(monthlyData.data);
      if (fuelData.success) setFuelEfficiency(fuelData.data);

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
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalRevenue = monthlySummary.reduce((sum, m) => sum + m.revenue, 0);
  const avgRevenue = monthlySummary.length > 0 ? totalRevenue / monthlySummary.length : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Revenue Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze revenue trends and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-lg font-medium">Total Revenue</h2>
          </div>
          <p className="text-4xl font-bold">${totalRevenue.toLocaleString()}</p>
          <p className="text-green-100 mt-2">Across all periods</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-lg font-medium">Average Monthly Revenue</h2>
          </div>
          <p className="text-4xl font-bold">${avgRevenue.toFixed(0).toLocaleString()}</p>
          <p className="text-blue-100 mt-2">Per month average</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Monthly Revenue Trend
        </h2>
        {monthlySummary.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlySummary}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Revenue by Vehicle
        </h2>
        {fuelEfficiency.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No vehicle data available
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
                dataKey="totalDistance" 
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Distance (km)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Monthly Revenue Breakdown
        </h2>
        {monthlySummary.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Fuel Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Maintenance</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((month) => (
                  <tr key={month.month} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {month.month}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400 font-semibold">
                      ${month.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      ${month.fuelCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      ${month.maintenanceCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      ${month.netProfit.toLocaleString()}
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
