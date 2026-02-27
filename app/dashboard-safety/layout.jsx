'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import Sidebar from '@/components/dashboard/Sidebar';

const safetyOfficerMenu = [
  { icon: 'LayoutDashboard', label: 'Dashboard', href: '/dashboard-safety' },
  { icon: 'Truck', label: 'Vehicles', href: '/dashboard-safety/vehicles' },
  { icon: 'Wrench', label: 'Maintenance', href: '/dashboard-safety/maintenance' },
  { icon: 'DollarSign', label: 'Expenses', href: '/dashboard-safety/expenses' },
  { icon: 'BarChart3', label: 'Analytics', href: '/dashboard-safety/analytics' },
  { icon: 'AlertTriangle', label: 'Driver Issues', href: '/dashboard-safety/complaints' },
  { icon: 'User', label: 'Profile', href: '/dashboard/profile' },
];

export default function SafetyOfficerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (!data?.user) {
          router.push('/login');
          return;
        }
        
        if (data.user.role !== 'SAFETY_OFFICER') {
          router.push('/dashboard');
          return;
        }
        
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19]">
      <DashboardNavbar 
        user={session.user} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          currentPath={pathname}
          menuItems={safetyOfficerMenu}
        />
        
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
