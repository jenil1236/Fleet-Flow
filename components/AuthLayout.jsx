'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] px-4 py-12 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              FleetFlow
            </h1>
          </Link>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
