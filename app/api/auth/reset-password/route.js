import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/password';

// Zod validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

// POST /api/auth/reset-password
export async function POST(request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, newPassword } = validationResult.data;

    // Hash the incoming token to match stored hash
    const hashedToken = hashToken(token);

    // Find user with matching token and valid expiry
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    // Return error if token is invalid or expired
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user password and clear reset fields
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustResetPassword: false, // Clear first login flag
        passwordResetToken: null, // Clear reset token
        passwordResetExpires: null, // Clear expiry
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Password updated successfully.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
