'use client';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          {trend && (
            <p className={`text-sm ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
