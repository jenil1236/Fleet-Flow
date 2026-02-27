'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/Toast';
import { AuthLayout } from '@/components/AuthLayout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

export default function LoginPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast(result.error || 'Invalid credentials', 'error');
        setErrors({ general: result.error || 'Invalid email or password' });
        return;
      }

      toast('Login successful! Welcome back.', 'success');
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Login error:', error);
      toast('Login failed. Please try again.', 'error');
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Sign in to your account">
      <div className="mb-4">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Landing
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                error={formErrors.email}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {formErrors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {formErrors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={formErrors.password}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {formErrors.password && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {formErrors.password.message}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-blue-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
