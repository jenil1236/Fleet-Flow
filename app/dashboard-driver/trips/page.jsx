'use client';

import { useEffect, useState } from 'react';
import { Activity, CheckCircle } from 'lucide-react';

export default function DriverTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips/list');
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

  const handleComplete = async (tripId, endOdometer) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endOdometerKm: endOdometer }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete trip');
      }

      fetchTrips();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTrips = trips.filter(trip => 
    statusFilter === 'all' || trip.status === statusFilter
  );

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Trips
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your assigned trips
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="DISPATCHED">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No trips found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map(trip => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onComplete={handleComplete}
                onRefresh={fetchTrips}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onComplete, onRefresh }) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [endOdometer, setEndOdometer] = useState('');

  const statusColors = {
    DISPATCHED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    COMPLETED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  const handleCompleteSubmit = () => {
    const odometer = parseFloat(endOdometer);
    if (!odometer || odometer <= trip.startOdometerKm) {
      alert(`End odometer must be greater than ${trip.startOdometerKm} km`);
      return;
    }
    onComplete(trip.id, odometer);
    setShowCompleteModal(false);
    setEndOdometer('');
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[trip.status]}`}>
                {trip.status}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(trip.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {trip.originAddress} → {trip.destinationAddress}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div>
                <span className="text-gray-500 dark:text-gray-500">Vehicle:</span>
                <p className="text-gray-900 dark:text-white">{trip.vehicle.licensePlate}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-500">Cargo:</span>
                <p className="text-gray-900 dark:text-white">{trip.cargoWeightKg} kg</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-500">Start Odometer:</span>
                <p className="text-gray-900 dark:text-white">{trip.startOdometerKm} km</p>
              </div>
              {trip.endOdometerKm && (
                <div>
                  <span className="text-gray-500 dark:text-gray-500">End Odometer:</span>
                  <p className="text-gray-900 dark:text-white">{trip.endOdometerKm} km</p>
                </div>
              )}
              {trip.distanceKm && (
                <div>
                  <span className="text-gray-500 dark:text-gray-500">Distance:</span>
                  <p className="text-gray-900 dark:text-white">{trip.distanceKm} km</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {trip.status === 'DISPATCHED' && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowCompleteModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Trip
            </button>
          </div>
        )}
      </div>

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Trip
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to mark this trip as completed?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Odometer (km)
              </label>
              <input
                type="number"
                value={endOdometer}
                onChange={(e) => setEndOdometer(e.target.value)}
                min={trip.startOdometerKm + 1}
                step="0.01"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Must be > ${trip.startOdometerKm}`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCompleteSubmit}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
              >
                Complete Trip
              </button>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setEndOdometer('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
