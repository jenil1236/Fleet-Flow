import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/vehicles/:id
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

    const { role, organizationId } = session.user;

    // Check if user has permission to view vehicles
    const allowedRoles = ['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'];
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view vehicles' },
        { status: 403 }
      );
    }

    // Get vehicle ID from params
    const { id } = params;

    // Find vehicle with multi-tenant isolation
    const vehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId, // Ensure vehicle belongs to user's organization
      },
    });

    // Return 404 if vehicle not found or doesn't belong to organization
    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: vehicle 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Vehicle fetch error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
