'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/users');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            User Created Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Credentials have been sent to the user's email address.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to users list...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New User
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Add a new team member to your organization
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Full Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Role
            </label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              <option value="DRIVER">Driver</option>
              <option value="DISPATCHER">Dispatcher</option>
              <option value="FINANCIAL_ANALYST">Financial Analyst</option>
              <option value="SAFETY_OFFICER">Safety Officer</option>
            </select>
            {errors.role && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Driver-specific fields */}
          {selectedRole === 'DRIVER' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  {...register('licenseNumber', { required: selectedRole === 'DRIVER' ? 'License number is required for drivers' : false })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DL123456"
                />
                {errors.licenseNumber && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.licenseNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  {...register('licenseExpiry', { required: selectedRole === 'DRIVER' ? 'License expiry is required for drivers' : false })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.licenseExpiry && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.licenseExpiry.message}</p>
                )}
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Note:</strong> A secure password will be automatically generated and sent to the user&apos;s email address along with login instructions.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating User...
              </>
            ) : (
              'Create User'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
