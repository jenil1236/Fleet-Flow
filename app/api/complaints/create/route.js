import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for complaint creation
const createComplaintSchema = z.object({
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

// POST /api/complaints/create
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

    const { role, organizationId, id: userId } = session.user;

    // Only DRIVER can create complaints
    if (role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Forbidden: Only drivers can report issues' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createComplaintSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { vehicleId, tripId, severity, description } = validationResult.data;

    // Verify vehicle belongs to organization if provided
    if (vehicleId) {
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
    }

    // Verify trip belongs to organization if provided
    if (tripId) {
      const trip = await db.trip.findFirst({
        where: {
          id: tripId,
          organizationId,
        },
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Trip not found or does not belong to your organization' },
          { status: 404 }
        );
      }
    }

    // Create complaint
    const complaint = await db.complaint.create({
      data: {
        organizationId,
        reportedBy: userId,
        vehicleId,
        tripId,
        severity,
        description,
        status: 'OPEN',
      },
      include: {
        reporter: {
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
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: complaint,
        message: 'Issue reported successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Complaint creation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
