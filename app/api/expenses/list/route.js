import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/expenses/list
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

    // Check if user has permission to view expenses
    const allowedRoles = ['FINANCIAL_ANALYST', 'FLEET_MANAGER'];
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view expenses' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const tripId = searchParams.get('tripId');
    const status = searchParams.get('status');

    // Build where clause with multi-tenant isolation
    const where = {
      organizationId,
    };

    // Add optional filters
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (tripId) {
      where.tripId = tripId;
    }

    if (status) {
      where.status = status;
    }

    // Query expenses with related data
    const expenses = await db.expense.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
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
        trip: {
          select: {
            id: true,
            originAddress: true,
            destinationAddress: true,
            status: true,
          },
        },
      },
      orderBy: {
        expenseDate: 'desc',
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: expenses 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Expense list error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
