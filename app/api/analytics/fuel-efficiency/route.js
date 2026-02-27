import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/analytics/fuel-efficiency
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

    const { role, organizationId } = session.user;

    // Only FINANCIAL_ANALYST and FLEET_MANAGER can view analytics
    if (!['FINANCIAL_ANALYST', 'FLEET_MANAGER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only FINANCIAL_ANALYST or FLEET_MANAGER can view analytics' },
        { status: 403 }
      );
    }

    // Get all vehicles for the organization
    const vehicles = await db.vehicle.findMany({
      where: {
        organizationId,
      },
      select: {
        id: true,
        licensePlate: true,
        model: true,
      },
    });

    // Calculate fuel efficiency for each vehicle
    const fuelEfficiencyData = await Promise.all(
      vehicles.map(async (vehicle) => {
        // Get total distance from completed trips
        const tripAggregate = await db.trip.aggregate({
          where: {
            organizationId,
            vehicleId: vehicle.id,
            status: 'COMPLETED',
          },
          _sum: {
            distanceKm: true,
          },
        });

        const totalDistance = tripAggregate._sum.distanceKm || 0;

        // Get total fuel liters from expenses
        const expenseAggregate = await db.expense.aggregate({
          where: {
            organizationId,
            vehicleId: vehicle.id,
          },
          _sum: {
            fuelLiters: true,
          },
        });

        const totalFuelLiters = expenseAggregate._sum.fuelLiters || 0;

        // Calculate km per liter
        const kmPerLiter = totalFuelLiters > 0
          ? parseFloat((totalDistance / totalFuelLiters).toFixed(2))
          : 0;

        return {
          vehicleId: vehicle.id,
          licensePlate: vehicle.licensePlate,
          model: vehicle.model,
          totalDistance: parseFloat(totalDistance.toString()),
          totalFuelLiters: parseFloat(totalFuelLiters.toString()),
          kmPerLiter,
        };
      })
    );

    // Return fuel efficiency data
    return NextResponse.json(
      { 
        success: true, 
        data: fuelEfficiencyData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Fuel efficiency analytics error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
