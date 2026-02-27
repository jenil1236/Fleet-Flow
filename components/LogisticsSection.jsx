'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Centralized Records',
    description: 'All your fleet data in one place - vehicles, trips, drivers, and expenses',
  },
  {
    icon: Shield,
    title: 'Secure Cloud Storage',
    description: 'Your data is safely stored and backed up in the cloud',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Access your records from anywhere, on any device, 24/7',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Get insights from your data with built-in analytics and reports',
  },
];

export function LogisticsSection() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image (reversed order on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative w-full aspect-[4/3] max-w-2xl mx-auto">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-3xl blur-3xl" />
              
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/logistic.jpg"
                  alt="Logistics Operations"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover dark:opacity-80"
                />
                {/* Overlay gradient for better text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40" />
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-cyan-400">
                    Cloud
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Based
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-1 lg:order-2"
          >
            {/* Section Header */}
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 rounded-full text-sm font-medium">
                Why Choose FleetFlow
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Ditch the Paper,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
                  Go Digital
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Replace your logbooks and spreadsheets with a modern cloud-based system. Keep all your fleet records organized, searchable, and accessible from anywhere.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
