import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/users/list
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, organizationId } = session.user;

    if (role !== 'FLEET_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Only FLEET_MANAGER can view users' },
        { status: 403 }
      );
    }

    // Query all users except DRIVERS (drivers fetched from /api/drivers/list)
    const users = await db.user.findMany({
      where: {
        organizationId,
        role: {
          not: 'DRIVER',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        mustResetPassword: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error('User list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
