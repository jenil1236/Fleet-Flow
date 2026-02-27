import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/vehicles/list
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

    // Check if user has permission to view vehicles
    const allowedRoles = ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'];
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view vehicles' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build where clause with multi-tenant isolation
    const where = {
      organizationId, // Always filter by organization
    };

    // Add optional filters
    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      // Search in licensePlate or model
      where.OR = [
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Query vehicles with filters
    const vehicles = await db.vehicle.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: vehicles 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Vehicle list error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
