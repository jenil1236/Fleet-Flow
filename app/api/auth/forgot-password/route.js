import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { generateResetToken, hashToken } from '@/lib/password';

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST /api/auth/forgot-password
export async function POST(request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = forgotPasswordSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success message (security: don't reveal if email exists)
    // But only send email if user exists
    if (user) {
      // Generate secure reset token (raw token)
      const resetToken = generateResetToken();
      
      // Hash token before saving to database
      const hashedToken = hashToken(resetToken);
      
      // Set expiry to 10 min from now
      const expiresAt = new Date(Date.now() + 5 * 1000); // 10 min

      // Save hashed token and expiry to database
      await db.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: expiresAt,
        },
      });

      // Create reset link with raw token (not hashed)
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      // Send email with reset link
      await sendEmail({
        to: email,
        subject: 'FleetFlow - Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <p><a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
          <p><strong>This link will expire in 10 min.</strong></p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br>FleetFlow Team</p>
        `,
      });
    }

    // Always return success (security best practice)
    return NextResponse.json(
      { 
        success: true, 
        message: 'If email exists, reset link sent.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
