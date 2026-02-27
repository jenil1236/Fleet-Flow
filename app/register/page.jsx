'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/Toast';
import { AuthLayout } from '@/components/AuthLayout';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

export default function RegisterPage() {
  const router = useRouter();
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          organizationName: data.organizationName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast(result.error || 'Registration failed', 'error');
        setErrors({ general: result.error || 'Registration failed' });
        return;
      }

      toast('Registration successful! Welcome to FleetFlow.', 'success');
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast('Registration failed. Please try again.', 'error');
      setErrors({ general: 'An error occurred during registration' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Start managing your fleet today">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details to get started with FleetFlow
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                error={formErrors.name}
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
              {formErrors.name && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {formErrors.name.message}
                </p>
              )}
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                error={formErrors.password}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {formErrors.password && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {formErrors.password.message}
                </p>
              )}
            </div>

            {/* Organization Name Field */}
            <div>
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="ABC Logistics"
                error={formErrors.organizationName}
                {...register('organizationName', {
                  required: 'Organization name is required',
                  minLength: {
                    value: 2,
                    message: 'Organization name must be at least 2 characters',
                  },
                })}
              />
              {formErrors.organizationName && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {formErrors.organizationName.message}
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
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
