'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Truck, MapPin, Calendar, User, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id;
  
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveData, setResolveData] = useState({
    status: 'RESOLVED',
    resolutionNotes: '',
  });

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch complaint');
      
      if (data.success) {
        setComplaint(data.data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setResolving(true);

    try {
      const response = await fetch(`/api/complaints/${complaintId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolveData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve complaint');
      }

      setShowResolveModal(false);
      fetchComplaint();
    } catch (err) {
      alert('Error: ' + err.message);
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400 mb-4">Error: {error || 'Complaint not found'}</div>
        <Link
          href="/dashboard/complaints"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Back to Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/complaints"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Issue Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Reported on {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {complaint.status !== 'RESOLVED' && complaint.status !== 'DISMISSED' && (
          <button
            onClick={() => setShowResolveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Resolve Issue
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Severity</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            complaint.severity === 'CRITICAL'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              : complaint.severity === 'HIGH'
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
              : complaint.severity === 'MEDIUM'
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}>
            {complaint.severity}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            complaint.status === 'RESOLVED'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : complaint.status === 'DISMISSED'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
              : complaint.status === 'UNDER_REVIEW'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
          }`}>
            {complaint.status.replace('_', ' ')}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reported By</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.reporter?.name}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Issue Description
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {complaint.vehicle && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Related Vehicle
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {complaint.vehicle.licensePlate}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {complaint.vehicle.model} - {complaint.vehicle.type}
              </p>
            </div>
          </div>
        )}

        {complaint.trip && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Related Trip
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-900 dark:text-white">
                {complaint.trip.originAddress}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 my-1">→</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {complaint.trip.destinationAddress}
              </p>
            </div>
          </div>
        )}

        {complaint.resolutionNotes && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Resolution Notes
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {complaint.resolutionNotes}
              </p>
              {complaint.resolver && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Resolved by {complaint.resolver.name} on {new Date(complaint.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Created: {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
          {complaint.resolvedAt && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Calendar className="w-4 h-4" />
              <span>Resolved: {new Date(complaint.resolvedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Resolve Issue
            </h2>
            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={resolveData.status}
                  onChange={(e) => setResolveData({ ...resolveData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolveData.resolutionNotes}
                  onChange={(e) => setResolveData({ ...resolveData, resolutionNotes: e.target.value })}
                  rows={4}
                  placeholder="Describe how the issue was resolved..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resolving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl transition-colors"
                >
                  {resolving ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
