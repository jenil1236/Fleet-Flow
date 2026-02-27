'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Truck, DollarSign } from 'lucide-react';

export default function FleetSummaryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, expensesRes, tripsRes, maintenanceRes] = await Promise.all([
        fetch('/api/vehicles/list'),
        fetch('/api/expenses/list'),
        fetch('/api/trips/list?status=COMPLETED'),
        fetch('/api/maintenance/list'),
      ]);

      const vehiclesData = await vehiclesRes.json();
      const expensesData = await expensesRes.json();
      const tripsData = await tripsRes.json();
      const maintenanceData = await maintenanceRes.json();

      if (vehiclesData.success) setVehicles(vehiclesData.data);
      if (expensesData.success) setExpenses(expensesData.data);
      if (tripsData.success) setTrips(tripsData.data);
      if (maintenanceData.success) setMaintenance(maintenanceData.data);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Calculate fleet-level metrics
  const fleetSummary = vehicles.map(vehicle => {
    // Revenue from trips
    const vehicleTrips = trips.filter(t => t.vehicle.id === vehicle.id);
    const revenue = vehicleTrips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);

    // Expenses
    const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
    const expenseCost = vehicleExpenses.reduce((sum, e) => sum + Number(e.totalCost || 0), 0);

    // Maintenance
    const vehicleMaintenance = maintenance.filter(m => m.vehicleId === vehicle.id);
    const maintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0);

    const totalCost = expenseCost + maintenanceCost;
    const profit = revenue - totalCost;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      type: vehicle.type,
      status: vehicle.status,
      tripCount: vehicleTrips.length,
      revenue,
      expenseCost,
      maintenanceCost,
      totalCost,
      profit,
      profitMargin,
    };
  });

  const totalRevenue = fleetSummary.reduce((sum, v) => sum + v.revenue, 0);
  const totalExpenses = fleetSummary.reduce((sum, v) => sum + v.totalCost, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;

  // Prepare pie chart data for cost breakdown
  const costBreakdown = [
    { name: 'Fuel & Expenses', value: expenses.reduce((sum, e) => sum + Number(e.totalCost || 0), 0) },
    { name: 'Maintenance', value: maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0) },
  ];

  const COLORS = ['#ef4444', '#f59e0b'];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Fleet Cost Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of fleet-level financial performance
        </p>
      </div>
      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{vehicles.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            ${totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {avgProfitMargin}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Cost Breakdown
          </h2>
          {costBreakdown.every(item => item.value === 0) ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No cost data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-6">Fleet Financial Health</h2>
          <div className="space-y-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Expenses</p>
              <p className="text-2xl font-semibold">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="pt-4 border-t border-blue-400">
              <p className="text-blue-100 text-sm mb-1">Net Profit</p>
              <p className="text-3xl font-bold">${totalProfit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Average Profit Margin</p>
              <p className="text-2xl font-semibold">{avgProfitMargin}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Vehicle Performance Summary
        </h2>
        {fleetSummary.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No vehicles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Vehicle</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Trips</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Expenses</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Maintenance</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Profit</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {fleetSummary.map(vehicle => (
                  <tr key={vehicle.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.licensePlate}
                      </div>
                      <div className="text-xs text-gray-500">{vehicle.model}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-gray-900 dark:text-white">
                      {vehicle.tripCount}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                      ${vehicle.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      ${vehicle.expenseCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                      ${vehicle.maintenanceCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      ${vehicle.profit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`font-medium ${
                        vehicle.profitMargin > 30 
                          ? 'text-green-600 dark:text-green-400'
                          : vehicle.profitMargin > 15
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {vehicle.profitMargin}%
                      </span>
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
