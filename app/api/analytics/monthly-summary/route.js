import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/analytics/monthly-summary
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

    // Get all completed trips grouped by month
    const trips = await db.trip.findMany({
      where: {
        organizationId,
        status: 'COMPLETED',
        completedAt: {
          not: null,
        },
      },
      select: {
        revenue: true,
        completedAt: true,
      },
    });

    // Get all expenses grouped by month
    const expenses = await db.expense.findMany({
      where: {
        organizationId,
      },
      select: {
        fuelCost: true,
        expenseDate: true,
      },
    });

    // Get all maintenance logs grouped by month
    const maintenanceLogs = await db.maintenanceLog.findMany({
      where: {
        organizationId,
      },
      select: {
        cost: true,
        serviceDate: true,
      },
    });

    // Group data by month
    const monthlyData = {};

    // Process trips (revenue)
    trips.forEach((trip) => {
      const date = new Date(trip.completedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          netProfit: 0,
        };
      }
      
      monthlyData[monthKey].revenue += parseFloat(trip.revenue.toString());
    });

    // Process expenses (fuel cost)
    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          netProfit: 0,
        };
      }
      
      monthlyData[monthKey].fuelCost += parseFloat(expense.fuelCost.toString());
    });

    // Process maintenance logs (maintenance cost)
    maintenanceLogs.forEach((log) => {
      const date = new Date(log.serviceDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          fuelCost: 0,
          maintenanceCost: 0,
          netProfit: 0,
        };
      }
      
      monthlyData[monthKey].maintenanceCost += parseFloat(log.cost.toString());
    });

    // Calculate net profit for each month
    Object.keys(monthlyData).forEach((monthKey) => {
      const data = monthlyData[monthKey];
      data.netProfit = data.revenue - (data.fuelCost + data.maintenanceCost);
      
      // Round all values to 2 decimal places
      data.revenue = parseFloat(data.revenue.toFixed(2));
      data.fuelCost = parseFloat(data.fuelCost.toFixed(2));
      data.maintenanceCost = parseFloat(data.maintenanceCost.toFixed(2));
      data.netProfit = parseFloat(data.netProfit.toFixed(2));
    });

    // Convert to array and sort by month
    const monthlySummary = Object.values(monthlyData).sort((a, b) => 
      a.month.localeCompare(b.month)
    );

    // Return monthly summary
    return NextResponse.json(
      { 
        success: true, 
        data: monthlySummary 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Monthly summary analytics error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
