'use client';

import Link from 'next/link';
import { 
  LayoutDashboard, 
  Truck, 
  DollarSign, 
  Wrench, 
  BarChart3, 
  Users, 
  Settings, 
  User,
  X,
  Activity,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Truck,
  DollarSign,
  Wrench,
  BarChart3,
  Users,
  Settings,
  User,
  Activity,
  AlertTriangle,
  TrendingUp,
};

const defaultMenuItems = [
  { icon: 'LayoutDashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'Truck', label: 'Vehicles', href: '/dashboard/vehicles' },
  { icon: 'DollarSign', label: 'Expenses', href: '/dashboard/expenses' },
  { icon: 'Wrench', label: 'Maintenance', href: '/dashboard/maintenance' },
  { icon: 'BarChart3', label: 'Analytics', href: '/dashboard/analytics' },
  { icon: 'AlertTriangle', label: 'Driver Issues', href: '/dashboard/complaints' },
  { icon: 'Users', label: 'Users', href: '/dashboard/users' },
  { icon: 'Settings', label: 'Settings', href: '/dashboard/settings' },
  { icon: 'User', label: 'Profile', href: '/dashboard/profile' },
];

export default function Sidebar({ isOpen, onClose, currentPath, menuItems }) {
  const items = menuItems || defaultMenuItems;
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const Icon = typeof item.icon === 'string' ? iconMap[item.icon] : item.icon;
            const isActive = currentPath === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
