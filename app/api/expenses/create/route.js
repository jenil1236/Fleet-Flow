import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Zod validation schema for expense creation
const createExpenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  driverId: z.string().min(1, 'Driver ID is required'),
  tripId: z.string().optional(),
  fuelLiters: z.number().min(0, 'Fuel liters cannot be negative'),
  fuelCost: z.number().min(0, 'Fuel cost cannot be negative'),
  miscCost: z.number().min(0, 'Misc cost cannot be negative'),
  expenseDate: z.string().min(1, 'Expense date is required'), // ISO date string
});

// POST /api/expenses/create
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

    // Check if user has permission to create expenses
    const allowedRoles = ['FINANCIAL_ANALYST', 'FLEET_MANAGER', 'DISPATCHER'];
    
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to create expenses' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createExpenseSchema.safeParse(body);

    // Return 400 if validation fails
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { vehicleId, driverId, tripId, fuelLiters, fuelCost, miscCost, expenseDate } = validationResult.data;

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

    // Validate driver exists and belongs to organization
    const driver = await db.driverProfile.findFirst({
      where: {
        id: driverId,
        organizationId,
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // If tripId provided, validate it belongs to organization
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

    // Calculate total cost
    const totalCost = fuelCost + miscCost;

    // Create expense
    const expense = await db.expense.create({
      data: {
        organizationId,
        vehicleId,
        driverId,
        tripId: tripId || null,
        fuelLiters,
        fuelCost,
        miscCost,
        totalCost,
        expenseDate: new Date(expenseDate),
        status: 'RECORDED',
      },
      include: {
        vehicle: {
          select: {
            licensePlate: true,
            model: true,
          },
        },
        driver: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
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
        data: expense 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Expense creation error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
