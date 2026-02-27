import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for resolving complaint
const resolveComplaintSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
  resolutionNotes: z.string().optional(),
});

// PATCH /api/complaints/:id/resolve
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

    const { role, organizationId, id: userId } = session.user;
    const { id } = params;

    // Only FLEET_MANAGER and DISPATCHER can resolve complaints
    if (!['FLEET_MANAGER', 'DISPATCHER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only fleet managers and dispatchers can resolve complaints' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = resolveComplaintSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, resolutionNotes } = validationResult.data;

    // Find complaint
    const complaint = await db.complaint.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    // Return 404 if complaint not found
    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      status,
      resolutionNotes,
      resolvedBy: userId,
    };

    // Set resolvedAt timestamp if status is RESOLVED or DISMISSED
    if (status === 'RESOLVED' || status === 'DISMISSED') {
      updateData.resolvedAt = new Date();
    }

    // Update complaint
    const updatedComplaint = await db.complaint.update({
      where: { id },
      data: updateData,
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
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: updatedComplaint,
        message: 'Complaint updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Complaint resolve error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
