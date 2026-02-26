import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { generateSecurePassword } from '@/lib/password';

// Zod validation schema for user creation
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['DISPATCHER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER', 'DRIVER']),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
});

// Role-based access control matrix
const rolePermissions = {
  FLEET_MANAGER: ['DISPATCHER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER', 'DRIVER'],
  DISPATCHER: ['DRIVER'],
};

// POST /api/users/create
export async function POST(request) {
  try {
    // Get authenticated user session
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { role: userRole, organizationId } = session.user;

    // Validate user has permission to create users
    if (!rolePermissions[userRole]) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create users' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, role, licenseNumber, licenseExpiry } = validationResult.data;

    // Check if user can create this role
    if (!rolePermissions[userRole].includes(role)) {
      return NextResponse.json(
        { error: `Forbidden: ${userRole} cannot create ${role}` },
        { status: 403 }
      );
    }

    // Validate DRIVER-specific fields
    if (role === 'DRIVER') {
      if (!licenseNumber || !licenseExpiry) {
        return NextResponse.json(
          { error: 'DRIVER role requires licenseNumber and licenseExpiry' },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword(10);
    const hashedPassword = await hash(temporaryPassword, 10);

    // Create user and driver profile in transaction
    const result = await db.$transaction(async (tx) => {
      // Create user with mustResetPassword flag
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          organizationId,
          mustResetPassword: true,
        },
      });

      // Create DriverProfile if role is DRIVER
      if (role === 'DRIVER') {
        await tx.driverProfile.create({
          data: {
            userId: newUser.id,
            organizationId,
            licenseNumber,
            licenseExpiry: new Date(licenseExpiry),
          },
        });
      }

      return newUser;
    });

    // Send email with temporary credentials
    const loginUrl = `${process.env.APP_URL || 'http://localhost:3000'}/login`;
    
    await sendEmail({
      to: email,
      subject: 'Welcome to FleetFlow - Your Account Credentials',
      html: `
        <h2>Welcome to FleetFlow!</h2>
        <p>Hello ${name},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          <p><strong>Role:</strong> ${role}</p>
        </div>
        <p><strong>Important:</strong> You must reset your password immediately after your first login.</p>
        <p><a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a></p>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>FleetFlow Team</p>
      `,
    });

    // Return success response (without password)
    return NextResponse.json(
      { 
        success: true, 
        message: 'User created and credentials emailed.' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('User creation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
