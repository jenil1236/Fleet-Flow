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
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      // Always show success for security (don't reveal if email exists)
      setSuccess(true);
      toast('If an account exists, reset link sent.', 'success');
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Always show success message for security
      setSuccess(true);
      toast('If email exists, reset link sent.', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Reset your password">
      <Card>
        <CardHeader>
          <CardTitle>Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!success ? (
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

              {/* Submit Button */}
              <Button type="submit" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  If an account exists with that email, you&apos;ll receive a password reset link shortly.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Back to Login Link */}
          {!success && (
            <div className="mt-6">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
