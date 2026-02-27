import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/complaints/list
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

    // Check role permissions
    if (!['DRIVER', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view complaints' },
        { status: 403 }
      );
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const vehicleId = searchParams.get('vehicleId');
    const tripId = searchParams.get('tripId');

    // Build where clause
    let where = {
      organizationId,
      deletedAt: null, // Exclude soft-deleted complaints
    };

    // DRIVER can only see their own complaints
    if (role === 'DRIVER') {
      where.reportedBy = userId;
    }

    // Add optional filters
    if (status) {
      where.status = status;
    }

    if (severity) {
      where.severity = severity;
    }

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (tripId) {
      where.tripId = tripId;
    }

    // Query complaints with related data
    const complaints = await db.complaint.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            licensePlate: true,
            model: true,
          },
        },
        trip: {
          select: {
            id: true,
            originAddress: true,
            destinationAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: complaints 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Complaint list error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
