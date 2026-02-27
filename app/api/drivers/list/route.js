import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/drivers/list
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

    // Check if user has permission to view drivers
    const allowedRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'];
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view drivers' },
        { status: 403 }
      );
    }

    // Query driver profiles with user data (exclude password)
    const drivers = await db.driverProfile.findMany({
      where: {
        organizationId, // Multi-tenant isolation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            // Exclude password and other sensitive fields
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response to flatten user data
    const formattedDrivers = drivers.map((driver) => ({
      id: driver.id,
      userId: driver.userId,
      name: driver.user.name,
      email: driver.user.email,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      dutyStatus: driver.dutyStatus,
      safetyScore: driver.safetyScore,
      completionRate: driver.completionRate,
      complaintCount: driver.complaintCount,
      createdAt: driver.createdAt,
    }));

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        data: formattedDrivers 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Driver list error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
