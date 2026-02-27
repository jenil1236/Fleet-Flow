import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// PATCH /api/maintenance/:id/close
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

    // Only FLEET_MANAGER and SAFETY_OFFICER can close maintenance logs
    if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER or SAFETY_OFFICER can close maintenance logs' },
        { status: 403 }
      );
    }

    // Get maintenance log ID from params
    const { id } = params;

    // Find maintenance log with multi-tenant isolation
    const existingLog = await db.maintenanceLog.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        vehicle: true,
      },
    });

    // Return 404 if maintenance log not found
    if (!existingLog) {
      return NextResponse.json(
        { error: 'Maintenance log not found' },
        { status: 404 }
      );
    }

    // Cannot close already closed maintenance log
    if (existingLog.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Maintenance log is already closed' },
        { status: 400 }
      );
    }

    // Close maintenance log and update vehicle status in transaction
    const result = await db.$transaction(async (tx) => {
      // Update maintenance log to CLOSED
      const closedLog = await tx.maintenanceLog.update({
        where: { id },
        data: {
          status: 'CLOSED',
        },
        include: {
          vehicle: {
            select: {
              licensePlate: true,
              model: true,
            },
          },
        },
      });

      // Update vehicle status to AVAILABLE (only if it was IN_SHOP)
      if (existingLog.vehicle.status === 'IN_SHOP') {
        await tx.vehicle.update({
          where: { id: existingLog.vehicleId },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      return closedLog;
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: result,
        message: 'Maintenance log closed and vehicle marked as AVAILABLE' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Maintenance close error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
