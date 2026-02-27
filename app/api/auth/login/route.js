import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { signIn } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    console.log('Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        organizationId: true,
        mustResetPassword: true,
      },
    });

    console.log('User found:', user ? 'Yes' : 'No');

    // Check if user exists
    if (!user) {
      console.log('User not found, returning 401');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password, returning 401');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Password valid, creating NextAuth session');

    // Use NextAuth signIn to create proper session
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      accessToken: 'session-managed-by-nextauth',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
