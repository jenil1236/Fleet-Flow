'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Briefcase, Building, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 py-12">
        No profile data available
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {user.name}
            </h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            icon={Mail}
            label="Email Address"
            value={user.email}
          />
          <InfoItem
            icon={Briefcase}
            label="Role"
            value={user.role?.replace('_', ' ')}
          />
          <InfoItem
            icon={Building}
            label="Organization ID"
            value={user.organizationId}
          />
          <InfoItem
            icon={Calendar}
            label="Member Since"
            value={new Date().toLocaleDateString()}
          />
        </div>
      </div>

      {/* Account Status - mock*/}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Status
        </h3>
        <div className="space-y-3">
          <StatusItem
            label="Account Status"
            value="Active"
            status="success"
          />
          <StatusItem
            label="Email Verified"
            value="Verified"
            status="success"
          />
          {user.mustResetPassword && (
            <StatusItem
              label="Password Reset Required"
              value="Action Needed"
              status="warning"
            />
          )}
        </div>
      </div>

      {/* Actions
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors text-left">
            Change Password
          </button>
          <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-colors text-left">
            Update Email Preferences
          </button>
        </div>
      </div> */}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-base font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusItem({ label, value, status }) {
  const statusColors = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  );
}
