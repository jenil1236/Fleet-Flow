'use client';

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';

export default function SafetyMaintenancePage() {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const response = await fetch('/api/maintenance/list');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch maintenance logs');
      
      if (data.success) {
        setMaintenanceLogs(data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredLogs = maintenanceLogs.filter(log => 
    statusFilter === 'all' || log.status === statusFilter
  );

  const stats = {
    open: maintenanceLogs.filter(l => l.status === 'OPEN').length,
    inProgress: maintenanceLogs.filter(l => l.status === 'IN_PROGRESS').length,
    closed: maintenanceLogs.filter(l => l.status === 'CLOSED').length,
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
          onClick={fetchMaintenance}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Maintenance Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor vehicle maintenance and safety compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Open" value={stats.open} color="red" />
        <StatCard label="In Progress" value={stats.inProgress} color="orange" />
        <StatCard label="Closed" value={stats.closed} color="green" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No maintenance logs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map(log => (
              <MaintenanceCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function MaintenanceCard({ log }) {
  const statusColors = {
    OPEN: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    IN_PROGRESS: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    CLOSED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {log.vehicle?.licensePlate || 'N/A'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {log.vehicle?.model} - {log.vehicle?.type}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
          {log.status.replace(/_/g, ' ')}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{log.issueDescription}</p>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-500">Service Date:</span>
          <span className="text-gray-900 dark:text-white ml-2">
            {new Date(log.serviceDate).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-500">Cost:</span>
          <span className="text-gray-900 dark:text-white font-semibold ml-2">
            ${Number(log.cost).toFixed(2)}
          </span>
        </div>
      </div>
      {log.resolutionNotes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">Resolution:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{log.resolutionNotes}</p>
        </div>
      )}
    </div>
  );
}
