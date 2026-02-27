'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/users/list').then(res => res.json()),
      fetch('/api/drivers/list').then(res => res.json())
    ])
      .then(([usersData, driversData]) => {
        if (usersData.success) setUsers(usersData.data);
        if (driversData.success) setDrivers(driversData.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const allUsers = [
    ...users.map(u => ({ ...u, type: 'user' })),
    ...drivers.map(d => ({ 
      id: d.id, 
      name: d.name, 
      email: d.email, 
      role: 'DRIVER',
      createdAt: d.createdAt,
      type: 'driver',
      licenseNumber: d.licenseNumber,
      dutyStatus: d.dutyStatus
    }))
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your team members and their access
          </p>
        </div>
        <Link
          href="/dashboard/users/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="DRIVER">Driver</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="SAFETY_OFFICER">Safety Officer</option>
            <option value="FINANCIAL_ANALYST">Financial Analyst</option>
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{user.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.type === 'driver' ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.dutyStatus === 'ON_DUTY' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}>
                          {user.dutyStatus}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
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
