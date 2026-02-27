import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/maintenance/list
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

    // Check if user has permission to view maintenance logs
    const allowedRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'];
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view maintenance logs' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vehicleId = searchParams.get('vehicleId');

    // Build where clause with multi-tenant isolation
    const where = {
      organizationId,
    };

    // Add optional filters
    if (status) {
      where.status = status;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    // Query maintenance logs with vehicle data
    const maintenanceLogs = await db.maintenanceLog.findMany({
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
      },
      orderBy: {
        serviceDate: 'desc',
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: maintenanceLogs 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Maintenance list error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
