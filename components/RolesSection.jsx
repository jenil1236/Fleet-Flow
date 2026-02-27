'use client';

import { Crown, Radio, Shield, TrendingUp, Truck } from 'lucide-react';

const roles = [
  {
    icon: Crown,
    title: 'Fleet Manager',
    description: 'Full access to all records, user management, and comprehensive analytics.',
    features: ['Manage All Records', 'User Administration', 'View All Analytics', 'Approve Expenses'],
    color: 'blue',
  },
  {
    icon: Radio,
    title: 'Dispatcher',
    description: 'Create and manage trips, assign drivers, and monitor ongoing operations.',
    features: ['Create Trips', 'Assign Drivers', 'View Trip Records', 'Manage Driver Issues'],
    color: 'purple',
  },
  {
    icon: Truck,
    title: 'Driver',
    description: 'Log trips, report issues, and view assigned vehicle information.',
    features: ['Complete Trips', 'Report Issues', 'View Vehicle Info', 'Track Performance'],
    color: 'green',
  },
  {
    icon: Shield,
    title: 'Safety Officer',
    description: 'Monitor safety records, review driver issues, and track maintenance.',
    features: ['View Safety Records', 'Review Issues', 'Monitor Maintenance', 'Access Reports'],
    color: 'orange',
  },
  {
    icon: TrendingUp,
    title: 'Financial Analyst',
    description: 'Access financial data, analyze costs and revenue, generate reports.',
    features: ['View Financial Data', 'Analyze Expenses', 'Revenue Reports', 'Cost Analysis'],
    color: 'cyan',
  },
];

const colorClasses = {
  blue: 'from-blue-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  green: 'from-green-500 to-emerald-500',
  orange: 'from-orange-500 to-red-500',
  cyan: 'from-cyan-500 to-blue-500',
};

export function RolesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for Every Role in Your Organization
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Tailored dashboards and permissions for each team member
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[role.color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <role.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {role.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {role.description}
              </p>

              <ul className="space-y-2">
                {role.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <div className={`w-1.5 h-1.5 bg-gradient-to-br ${colorClasses[role.color]} rounded-full mr-3`}></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
