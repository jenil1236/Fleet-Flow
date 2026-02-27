import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for trip completion
const completeTripSchema = z.object({
  endOdometerKm: z.number().positive('End odometer must be greater than 0'),
});

// PATCH /api/trips/:id/complete
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

    const { role, organizationId, id: userId } = session.user;

    // Get trip ID from params
    const { id } = params;

    // Find trip with multi-tenant isolation
    const existingTrip = await db.trip.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
        vehicle: true,
      },
    });

    // Return 404 if trip not found
    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Authorization check based on role
    if (role === 'DRIVER') {
      // Driver can only complete their own trips
      if (existingTrip.driver.userId !== userId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only complete your own trips' },
          { status: 403 }
        );
      }
    } else if (!['DISPATCHER', 'FLEET_MANAGER'].includes(role)) {
      // Only DRIVER, DISPATCHER, and FLEET_MANAGER can complete trips
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to complete trips' },
        { status: 403 }
      );
    }

    // Validate trip is in DISPATCHED status
    if (existingTrip.status !== 'DISPATCHED') {
      return NextResponse.json(
        { error: `Trip is ${existingTrip.status} and cannot be completed` },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = completeTripSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { endOdometerKm } = validationResult.data;

    // Validate end odometer is greater than start odometer
    if (endOdometerKm <= existingTrip.startOdometerKm) {
      return NextResponse.json(
        { error: `End odometer (${endOdometerKm}km) must be greater than start odometer (${existingTrip.startOdometerKm}km)` },
        { status: 400 }
      );
    }

    // Calculate distance
    const distanceKm = endOdometerKm - existingTrip.startOdometerKm;

    // Complete trip and update statuses in transaction
    const result = await db.$transaction(async (tx) => {
      // Update trip to COMPLETED
      const completedTrip = await tx.trip.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          endOdometerKm,
          distanceKm,
          completedAt: new Date(),
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

      // Update vehicle status to AVAILABLE and odometer
      await tx.vehicle.update({
        where: { id: existingTrip.vehicleId },
        data: {
          status: 'AVAILABLE',
          odometerKm: endOdometerKm,
        },
      });

      // Update driver status to OFF_DUTY
      await tx.driverProfile.update({
        where: { id: existingTrip.driverId },
        data: {
          dutyStatus: 'OFF_DUTY',
        },
      });

      // Recalculate driver completion rate
      const driverTrips = await tx.trip.findMany({
        where: {
          driverId: existingTrip.driverId,
        },
      });

      const totalTrips = driverTrips.length;
      const completedTrips = driverTrips.filter(t => t.status === 'COMPLETED').length;
      const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

      // Update driver completion rate
      await tx.driverProfile.update({
        where: { id: existingTrip.driverId },
        data: {
          completionRate: parseFloat(completionRate.toFixed(2)),
        },
      });

      // AUTOMATIC EXPENSE CREATION
      // Create base expense entry for completed trip
      await tx.expense.create({
        data: {
          organizationId,
          vehicleId: existingTrip.vehicleId,
          driverId: existingTrip.driverId,
          tripId: id,
          fuelLiters: 0, // Placeholder - can be updated later
          fuelCost: existingTrip.estimatedFuelCost,
          miscCost: 0,
          totalCost: existingTrip.estimatedFuelCost,
          expenseDate: new Date(),
          status: 'RECORDED',
        },
      });

      return completedTrip;
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: result,
        message: 'Trip completed successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Trip completion error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
