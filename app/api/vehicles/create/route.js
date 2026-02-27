import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for vehicle creation
const createVehicleSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.string().min(1, 'Type is required'),
  maxCapacityKg: z.number().positive('Max capacity must be greater than 0'),
  odometerKm: z.number().min(0, 'Odometer cannot be negative'),
  acquisitionCost: z.number().min(0, 'Acquisition cost cannot be negative'),
});

// POST /api/vehicles/create
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

    const { role, organizationId } = session.user;

    // Only FLEET_MANAGER can create vehicles
    if (role !== 'FLEET_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER can create vehicles' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createVehicleSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { licensePlate, model, type, maxCapacityKg, odometerKm, acquisitionCost } = validationResult.data;

    // Check if license plate already exists (globally unique)
    const existingVehicle = await db.vehicle.findUnique({
      where: { licensePlate },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'License plate already exists' },
        { status: 409 }
      );
    }

    // Create vehicle with organizationId from session
    const vehicle = await db.vehicle.create({
      data: {
        licensePlate,
        model,
        type,
        maxCapacityKg,
        odometerKm,
        acquisitionCost,
        organizationId, // Multi-tenant isolation
        status: 'AVAILABLE', // Default status
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: vehicle 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Vehicle creation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
