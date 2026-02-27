'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Fuel, Wrench } from 'lucide-react';

export default function SafetyAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fuelEfficiency, setFuelEfficiency] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/fuel-efficiency');
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      if (data.success) setFuelEfficiency(data.data);

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
          onClick={fetchAnalytics}
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
          Safety Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor fuel efficiency and vehicle performance
        </p>
      </div>

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
