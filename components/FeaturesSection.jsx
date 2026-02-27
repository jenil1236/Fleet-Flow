'use client';

import { Truck, BarChart3, Shield, Zap, Users, DollarSign } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Vehicle Records',
    description: 'Maintain complete digital records of all your vehicles, maintenance history, and service schedules.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Visualize your fleet data with charts and reports. Track costs, revenue, and performance metrics.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Driver Management',
    description: 'Store driver information, licenses, and track their trip history and performance.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Trip Logging',
    description: 'Record all trips digitally with start/end locations, odometer readings, and trip details.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Users,
    title: 'Multi-User Access',
    description: 'Role-based access for managers, dispatchers, drivers, and analysts with appropriate permissions.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: DollarSign,
    title: 'Expense Tracking',
    description: 'Keep track of all fleet expenses - fuel, maintenance, repairs, and other costs in one place.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for Digital Fleet Records
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A complete cloud-based system to store, manage, and analyze all your fleet data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
