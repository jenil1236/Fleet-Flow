'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';

export default function TripAnalysisPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('COMPLETED');

  useEffect(() => {
    fetchTrips();
  }, [statusFilter]);

  const fetchTrips = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/trips/list' 
        : `/api/trips/list?status=${statusFilter}`;
      
      const response = await fetch(url);
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

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.vehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.originAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destinationAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate metrics
  const totalRevenue = filteredTrips.reduce((sum, trip) => sum + Number(trip.revenue || 0), 0);
  const totalFuelCost = filteredTrips.reduce((sum, trip) => sum + Number(trip.estimatedFuelCost || 0), 0);
  const totalProfit = totalRevenue - totalFuelCost;
  const avgProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

  // Prepare chart data - top 10 trips by revenue
  const chartData = filteredTrips
    .filter(trip => trip.revenue > 0)
    .sort((a, b) => Number(b.revenue) - Number(a.revenue))
    .slice(0, 10)
    .map(trip => ({
      id: `Trip ${trip.id.slice(0, 8)}`,
      revenue: Number(trip.revenue),
      fuelCost: Number(trip.estimatedFuelCost || 0),
      profit: Number(trip.revenue) - Number(trip.estimatedFuelCost || 0),
    }));

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trip Cost Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze trip-level profitability and costs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-sm font-medium">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-rose-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-6 h-6" />
            <h3 className="text-sm font-medium">Total Fuel Cost</h3>
          </div>
          <p className="text-3xl font-bold">${totalFuelCost.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-sm font-medium">Net Profit</h3>
          </div>
          <p className="text-3xl font-bold">${totalProfit.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-sm font-medium">Profit Margin</h3>
          </div>
          <p className="text-3xl font-bold">{avgProfitMargin}%</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Top 10 Trips by Revenue
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="id" 
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
              <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} name="Revenue" />
              <Bar dataKey="fuelCost" fill="url(#colorFuel)" radius={[8, 8, 0, 0]} name="Fuel Cost" />
              <Bar dataKey="profit" fill="url(#colorProfit)" radius={[8, 8, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle, driver, or location..."
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
            <option value="COMPLETED">Completed</option>
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No trips found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Trip ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Driver</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Route</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Distance</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Fuel Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Profit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map(trip => {
                  const revenue = Number(trip.revenue || 0);
                  const fuelCost = Number(trip.estimatedFuelCost || 0);
                  const profit = revenue - fuelCost;
                  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

                  return (
                    <tr key={trip.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-mono">
                        {trip.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {trip.vehicle?.licensePlate}
                        <div className="text-xs text-gray-500">{trip.vehicle?.model}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {trip.driver?.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="max-w-xs truncate">{trip.originAddress}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">→ {trip.destinationAddress}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                        {trip.distanceKm ? `${trip.distanceKm} km` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                        ${revenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-red-600 dark:text-red-400">
                        ${fuelCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                        ${profit.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`font-medium ${
                          margin > 30 
                            ? 'text-green-600 dark:text-green-400'
                            : margin > 15
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
