import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for maintenance creation
const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  issueDescription: z.string().min(1, 'Issue description is required'),
  serviceDate: z.string().min(1, 'Service date is required'), // ISO date string
  cost: z.number().min(0, 'Cost cannot be negative'),
});

// POST /api/maintenance/create
export async function POST(request) {
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

    // Only FLEET_MANAGER and SAFETY_OFFICER can create maintenance logs
    if (!['FLEET_MANAGER', 'SAFETY_OFFICER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER or SAFETY_OFFICER can create maintenance logs' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createMaintenanceSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { vehicleId, issueDescription, serviceDate, cost } = validationResult.data;

    // Validate vehicle exists and belongs to organization
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: vehicleId,
        organizationId,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Cannot create maintenance if vehicle is ON_TRIP
    if (vehicle.status === 'ON_TRIP') {
      return NextResponse.json(
        { error: 'Cannot create maintenance log for vehicle that is ON_TRIP' },
        { status: 400 }
      );
    }

    // Create maintenance log and update vehicle status in transaction
    const result = await db.$transaction(async (tx) => {
      // Create maintenance log with OPEN status
      const maintenanceLog = await tx.maintenanceLog.create({
        data: {
          organizationId,
          vehicleId,
          issueDescription,
          serviceDate: new Date(serviceDate),
          cost,
          status: 'OPEN',
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

      // Update vehicle status to IN_SHOP
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: 'IN_SHOP',
        },
      });

      return maintenanceLog;
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: result,
        message: 'Maintenance log created and vehicle marked as IN_SHOP' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Maintenance creation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
