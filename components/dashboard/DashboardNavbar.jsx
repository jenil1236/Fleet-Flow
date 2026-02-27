'use client';

import Link from 'next/link';
import { Menu, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardNavbar({ user, onMenuClick }) {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                FleetFlow
              </span>
            </Link>
          </div>

          {/* Right: User Info + Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>

            <ThemeToggle />

            <Link
              href="/dashboard/profile"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
