'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  'No credit card required',
  'Full feature access',
  'Cancel anytime',
  '24/7 support included',
];

export function CTASection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Digitize Your Fleet Records?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join fleet operators who have moved from paper logbooks to modern cloud-based record management
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/20 text-white rounded-xl font-semibold hover:bg-blue-500/30 transition-all duration-300 border-2 border-white/20"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-blue-100">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
