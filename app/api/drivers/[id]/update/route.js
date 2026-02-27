import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for driver update
const updateDriverSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required').optional(),
  licenseExpiry: z.string().optional(), // ISO date string
  dutyStatus: z.enum(['ON_DUTY', 'OFF_DUTY', 'SUSPENDED']).optional(),
  safetyScore: z.number().min(0).max(100).optional(),
});

// PATCH /api/drivers/:id/update
export async function PATCH(request, { params }) {
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

    const { role, organizationId } = session.user;

    // Only FLEET_MANAGER and SAFETY_OFFICER can update drivers
    if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER or SAFETY_OFFICER can update drivers' },
        { status: 403 }
      );
    }

    // Get driver ID from params
    const { id } = params;

    // Find driver with multi-tenant isolation
    const existingDriver = await db.driverProfile.findFirst({
      where: {
        id,
        organizationId, // Ensure driver belongs to user's organization
      },
    });

    // Return 404 if driver not found
    if (!existingDriver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateDriverSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Business rule: If license expired, force SUSPENDED status
    if (updateData.licenseExpiry) {
      const expiryDate = new Date(updateData.licenseExpiry);
      const today = new Date();
      
      if (expiryDate < today) {
        updateData.dutyStatus = 'SUSPENDED';
      }
    }

    // Update driver profile
    const updatedDriver = await db.driverProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Format response
    const formattedDriver = {
      id: updatedDriver.id,
      userId: updatedDriver.userId,
      name: updatedDriver.user.name,
      email: updatedDriver.user.email,
      licenseNumber: updatedDriver.licenseNumber,
      licenseExpiry: updatedDriver.licenseExpiry,
      dutyStatus: updatedDriver.dutyStatus,
      safetyScore: updatedDriver.safetyScore,
      completionRate: updatedDriver.completionRate,
      complaintCount: updatedDriver.complaintCount,
    };

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: formattedDriver 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Driver update error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
