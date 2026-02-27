import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/trips/list
export async function GET(request) {
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

    // Build where clause based on role
    let where = {
      organizationId, // Always filter by organization
    };

    // DRIVER can only see their own trips
    if (role === 'DRIVER') {
      // Find driver profile for current user
      const driverProfile = await db.driverProfile.findUnique({
        where: { userId },
      });

      if (!driverProfile) {
        return NextResponse.json(
          { error: 'Driver profile not found' },
          { status: 404 }
        );
      }

      // Filter trips by driver ID
      where.driverId = driverProfile.id;
    } 
    // DISPATCHER and FLEET_MANAGER can see all org trips
    else if (['DISPATCHER', 'FLEET_MANAGER'].includes(role)) {
      // No additional filter needed, already filtered by organizationId
    } 
    // Other roles have no access
    else {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view trips' },
        { status: 403 }
      );
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Add optional status filter
    if (status) {
      where.status = status;
    }

    // Query trips with related data
    const trips = await db.trip.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            model: true,
            type: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      status: trip.status,
      cargoWeightKg: trip.cargoWeightKg,
      originAddress: trip.originAddress,
      destinationAddress: trip.destinationAddress,
      estimatedFuelCost: trip.estimatedFuelCost,
      startOdometerKm: trip.startOdometerKm,
      endOdometerKm: trip.endOdometerKm,
      distanceKm: trip.distanceKm,
      revenue: trip.revenue,
      createdAt: trip.createdAt,
      completedAt: trip.completedAt,
      vehicle: {
        id: trip.vehicle.id,
        licensePlate: trip.vehicle.licensePlate,
        model: trip.vehicle.model,
        type: trip.vehicle.type,
      },
      driver: {
        id: trip.driver.id,
        name: trip.driver.user.name,
        email: trip.driver.user.email,
        licenseNumber: trip.driver.licenseNumber,
      },
    }));

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: formattedTrips 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Trip list error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
