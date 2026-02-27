import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for trip creation
const createTripSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  cargoWeightKg: z.number().positive('Cargo weight must be greater than 0'),
  originAddress: z.string().min(1, 'Origin address is required'),
  destinationAddress: z.string().min(1, 'Destination address is required'),
  estimatedFuelCost: z.number().min(0, 'Estimated fuel cost cannot be negative'),
  startOdometerKm: z.number().min(0, 'Start odometer cannot be negative'),
  revenue: z.number().min(0, 'Revenue cannot be negative'),
});

// POST /api/trips/create
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

    // Only DISPATCHER and FLEET_MANAGER can create trips
    if (!['DISPATCHER', 'FLEET_MANAGER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only DISPATCHER or FLEET_MANAGER can create trips' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createTripSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { 
      vehicleId, 
      driverId, 
      cargoWeightKg, 
      originAddress, 
      destinationAddress, 
      estimatedFuelCost, 
      startOdometerKm, 
      revenue 
    } = validationResult.data;

    // Validate vehicle exists and belongs to organization
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        organizationId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Validate driver exists and belongs to organization
    const driver = await db.driverProfile.findFirst({
      where: {
        id: driverId,
        organizationId,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // BUSINESS VALIDATION 1: Vehicle must be AVAILABLE
    if (vehicle.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: `Vehicle is ${vehicle.status} and cannot be assigned` },
        { status: 400 }
      );
    }

    // BUSINESS VALIDATION 2: Driver must be ON_DUTY
    if (driver.dutyStatus !== 'ON_DUTY') {
      return NextResponse.json(
        { error: `Driver is ${driver.dutyStatus} and cannot be assigned` },
        { status: 400 }
      );
    }

    // BUSINESS VALIDATION 3: Driver license must not be expired
    const today = new Date();
    const licenseExpiry = new Date(driver.licenseExpiry);
    
    if (licenseExpiry < today) {
      return NextResponse.json(
        { error: 'Driver license has expired' },
        { status: 400 }
      );
    }

    // BUSINESS VALIDATION 4: Cargo weight must not exceed vehicle capacity
    if (cargoWeightKg > vehicle.maxCapacityKg) {
      return NextResponse.json(
        { error: `Cargo weight (${cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.maxCapacityKg}kg)` },
        { status: 400 }
      );
    }

    // BUSINESS VALIDATION 5: Start odometer must match vehicle odometer
    if (startOdometerKm < vehicle.odometerKm) {
      return NextResponse.json(
        { error: `Start odometer (${startOdometerKm}km) cannot be less than vehicle odometer (${vehicle.odometerKm}km)` },
        { status: 400 }
      );
    }

    // Create trip and update statuses in transaction
    const result = await db.$transaction(async (tx) => {
      // Create trip with DISPATCHED status
      const trip = await tx.trip.create({
        data: {
          organizationId,
          vehicleId,
          driverId,
          cargoWeightKg,
          originAddress,
          destinationAddress,
          estimatedFuelCost,
          startOdometerKm,
          revenue,
          status: 'DISPATCHED',
        },
        include: {
          vehicle: {
            select: {
              licensePlate: true,
              model: true,
            },
          },
          driver: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Update vehicle status to ON_TRIP
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'ON_TRIP' },
      });

      // Ensure driver is ON_DUTY (should already be, but enforce)
      await tx.driverProfile.update({
        where: { id: driverId },
        data: { dutyStatus: 'ON_DUTY' },
      });

      return trip;
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: result,
        message: 'Trip dispatched successfully' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Trip creation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
