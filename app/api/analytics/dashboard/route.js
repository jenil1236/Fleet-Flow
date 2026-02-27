import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/analytics/dashboard
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

    // Calculate activeFleet: Count vehicles where status = ON_TRIP
    const activeFleet = await db.vehicle.count({
      where: {
        organizationId,
        status: 'ON_TRIP',
      },
    });

    // Calculate maintenanceAlerts: Count vehicles where status = IN_SHOP
    const maintenanceAlerts = await db.vehicle.count({
      where: {
        organizationId,
        status: 'IN_SHOP',
      },
    });

    // Calculate pendingCargo: Trips where status = DRAFT
    const pendingCargo = await db.trip.count({
      where: {
        organizationId,
        status: 'DRAFT',
      },
    });

    // Calculate utilizationRate: (vehicles ON_TRIP / vehicles not OUT_OF_SERVICE) * 100
    const totalOperationalVehicles = await db.vehicle.count({
      where: {
        organizationId,
        status: {
          not: 'OUT_OF_SERVICE',
        },
      },
    });

    const utilizationRate = totalOperationalVehicles > 0 
      ? parseFloat(((activeFleet / totalOperationalVehicles) * 100).toFixed(2))
      : 0;

    // Calculate totalFuelCost: Sum of Expense.fuelCost
    const fuelCostAggregate = await db.expense.aggregate({
      where: {
        organizationId,
      },
      _sum: {
        fuelCost: true,
      },
    });

    const totalFuelCost = fuelCostAggregate._sum.fuelCost || 0;

    // Calculate fleetROI: (totalRevenue - totalExpenses) / totalAcquisitionCost
    // totalRevenue = sum Trip.revenue (COMPLETED)
    const revenueAggregate = await db.trip.aggregate({
      where: {
        organizationId,
        status: 'COMPLETED',
      },
      _sum: {
        revenue: true,
      },
    });

    const totalRevenue = revenueAggregate._sum.revenue || 0;

    // totalExpenses = sum Expense.totalCost + sum MaintenanceLog.cost
    const expenseAggregate = await db.expense.aggregate({
      where: {
        organizationId,
      },
      _sum: {
        totalCost: true,
      },
    });

    const maintenanceAggregate = await db.maintenanceLog.aggregate({
      where: {
        organizationId,
      },
      _sum: {
        cost: true,
      },
    });

    const totalExpenses = (expenseAggregate._sum.totalCost || 0) + (maintenanceAggregate._sum.cost || 0);

    // totalAcquisitionCost = sum Vehicle.acquisitionCost
    const acquisitionAggregate = await db.vehicle.aggregate({
      where: {
        organizationId,
      },
      _sum: {
        acquisitionCost: true,
      },
    });

    const totalAcquisitionCost = acquisitionAggregate._sum.acquisitionCost || 0;

    // Calculate ROI
    const fleetROI = totalAcquisitionCost > 0
      ? parseFloat((((totalRevenue - totalExpenses) / totalAcquisitionCost) * 100).toFixed(2))
      : 0;

    // Return dashboard analytics
    return NextResponse.json(
      { 
        success: true, 
        data: {
          activeFleet,
          maintenanceAlerts,
          pendingCargo,
          utilizationRate,
          totalFuelCost: parseFloat(totalFuelCost.toString()),
          fleetROI,
          totalRevenue: parseFloat(totalRevenue.toString()),
          totalExpenses: parseFloat(totalExpenses.toString()),
          totalAcquisitionCost: parseFloat(totalAcquisitionCost.toString()),
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Dashboard analytics error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
