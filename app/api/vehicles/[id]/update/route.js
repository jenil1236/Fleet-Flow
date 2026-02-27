import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for vehicle update
const updateVehicleSchema = z.object({
  model: z.string().min(1, 'Model is required').optional(),
  type: z.string().min(1, 'Type is required').optional(),
  maxCapacityKg: z.number().positive('Max capacity must be greater than 0').optional(),
  odometerKm: z.number().min(0, 'Odometer cannot be negative').optional(),
  acquisitionCost: z.number().min(0, 'Acquisition cost cannot be negative').optional(),
});

// PATCH /api/vehicles/:id/update
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

    // Only FLEET_MANAGER can update vehicles
    if (role !== 'FLEET_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER can update vehicles' },
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

    // Cannot update if vehicle is ON_TRIP
    if (existingVehicle.status === 'ON_TRIP') {
      return NextResponse.json(
        { error: 'Cannot update vehicle while ON_TRIP' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateVehicleSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Validate odometer cannot be reduced
    if (updateData.odometerKm !== undefined && updateData.odometerKm < existingVehicle.odometerKm) {
      return NextResponse.json(
        { error: 'Cannot reduce odometer below previous value' },
        { status: 400 }
      );
    }

    // Update vehicle
    const updatedVehicle = await db.vehicle.update({
      where: { id },
      data: updateData,
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: updatedVehicle 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Vehicle update error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
