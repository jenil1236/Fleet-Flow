import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/complaints/:id
export async function GET(request, { params }) {
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

    // Check role permissions
    if (!['DRIVER', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view complaints' },
        { status: 403 }
      );
    }

    // Find complaint
    const complaint = await db.complaint.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
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
            type: true,
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
    });

    // Return 404 if complaint not found
    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // DRIVER can only view their own complaints
    if (role === 'DRIVER' && complaint.reportedBy !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own complaints' },
        { status: 403 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: complaint 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Complaint fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/complaints/:id (Soft delete)
export async function DELETE(request, { params }) {
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
    const { id } = params;

    // Only FLEET_MANAGER can delete complaints
    if (role !== 'FLEET_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Only fleet managers can delete complaints' },
        { status: 403 }
      );
    }

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

    // Soft delete complaint
    await db.complaint.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Complaint deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Complaint delete error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
