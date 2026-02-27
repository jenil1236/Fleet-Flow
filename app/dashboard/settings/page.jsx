'use client';

import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and organization settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 border border-gray-200 dark:border-gray-800 text-center">
        <SettingsIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Settings Panel
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Settings configuration coming soon
        </p>
      </div>
    </div>
  );
}
