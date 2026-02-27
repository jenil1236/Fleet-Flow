import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH /api/trips/:id/cancel
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

    // Only DISPATCHER and FLEET_MANAGER can cancel trips
    if (!['DISPATCHER', 'FLEET_MANAGER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only DISPATCHER or FLEET_MANAGER can cancel trips' },
        { status: 403 }
      );
    }

    // Get trip ID from params
    const { id } = params;

    // Find trip with multi-tenant isolation
    const existingTrip = await db.trip.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    // Return 404 if trip not found
    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Cannot cancel completed trips
    if (existingTrip.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed trip' },
        { status: 400 }
      );
    }

    // Cannot cancel already cancelled trips
    if (existingTrip.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Trip is already cancelled' },
        { status: 400 }
      );
    }

    // Cancel trip and reset statuses in transaction
    const result = await db.$transaction(async (tx) => {
      // Update trip to CANCELLED
      const cancelledTrip = await tx.trip.update({
        where: { id },
        data: {
          status: 'CANCELLED',
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

      // Reset vehicle status to AVAILABLE (only if it was ON_TRIP)
      if (existingTrip.vehicle.status === 'ON_TRIP') {
        await tx.vehicle.update({
          where: { id: existingTrip.vehicleId },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      // Reset driver status to OFF_DUTY
      await tx.driverProfile.update({
        where: { id: existingTrip.driverId },
        data: {
          dutyStatus: 'OFF_DUTY',
        },
      });

      return cancelledTrip;
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: result,
        message: 'Trip cancelled successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Trip cancellation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
