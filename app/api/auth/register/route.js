import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';

// Zod validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export async function POST(request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, organizationName } = validationResult.data;

    // Check if user with email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    // Return 409 if email already exists
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await hash(password, 10);

    // Create Organization and User in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the organization first
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      // Create user with FLEET_MANAGER role linked to organization
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'FLEET_MANAGER',
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });

    // Return 201 success response
    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    // Log error for debugging
    console.error('Registration error:', error);

    // Return 500 for any unexpected errors
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
