import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for status toggle
const toggleServiceSchema = z.object({
  status: z.enum(['OUT_OF_SERVICE', 'AVAILABLE'], {
    errorMap: () => ({ message: 'Status must be OUT_OF_SERVICE or AVAILABLE' }),
  }),
});

// PATCH /api/vehicles/:id/toggle-service
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

    // Only FLEET_MANAGER can toggle service status
    if (role !== 'FLEET_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER can toggle service status' },
        { status: 403 }
      );
    }

    // Get vehicle ID from params
    const { id } = params;

    // Find vehicle with multi-tenant isolation
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId, // Ensure vehicle belongs to user's organization
      },
    });

    // Return 404 if vehicle not found
    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Cannot change status if vehicle is ON_TRIP
    if (existingVehicle.status === 'ON_TRIP') {
      return NextResponse.json(
        { error: 'Cannot change status while vehicle is ON_TRIP' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = toggleServiceSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Update vehicle status
    const updatedVehicle = await db.vehicle.update({
      where: { id },
      data: { status },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: updatedVehicle,
        message: `Vehicle marked as ${status}` 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Vehicle toggle service error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
