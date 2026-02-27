/**
 * Trip Dispatcher Test File
 * 
 * This file contains manual test cases for trip management operations.
 * Run these tests using tools like Postman, Thunder Client, or curl.
 * 
 * Base URL: http://localhost:3000
 */

// ============================================
// PREREQUISITES
// ============================================
/*
Before testing trips, ensure you have:
1. Created a vehicle (status: AVAILABLE)
2. Created a driver (dutyStatus: ON_DUTY, license not expired)
3. Logged in as DISPATCHER or FLEET_MANAGER
*/

// ============================================
// TEST 1: Create Trip (DISPATCHER - Success)
// ============================================
const test1_create_trip_success = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    vehicleId: 'VEHICLE_ID',
    driverId: 'DRIVER_PROFILE_ID',
    cargoWeightKg: 1200,
    originAddress: '123 Main St, City A',
    destinationAddress: '456 Oak Ave, City B',
    estimatedFuelCost: 150.00,
    startOdometerKm: 50000,
    revenue: 500.00,
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    data: {
      id: 'trip_id',
      status: 'DISPATCHED',
      // ... other fields
    },
    message: 'Trip dispatched successfully',
  },
  note: 'Vehicle status changes to ON_TRIP, driver remains ON_DUTY',
};

// ============================================
// TEST 2: Create Trip with Unavailable Vehicle (Validation Error)
// ============================================
const test2_create_trip_vehicle_unavailable = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    vehicleId: 'ON_TRIP_VEHICLE_ID', // Vehicle already ON_TRIP
    driverId: 'DRIVER_PROFILE_ID',
    cargoWeightKg: 1000,
    originAddress: '123 Main St',
    destinationAddress: '456 Oak Ave',
    estimatedFuelCost: 100.00,
    startOdometerKm: 50000,
    revenue: 400.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Vehicle is ON_TRIP and cannot be assigned',
  },
};

// ============================================
// TEST 3: Create Trip with OFF_DUTY Driver (Validation Error)
// ============================================
const test3_create_trip_driver_off_duty = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    vehicleId: 'VEHICLE_ID',
    driverId: 'OFF_DUTY_DRIVER_ID',
    cargoWeightKg: 1000,
    originAddress: '123 Main St',
    destinationAddress: '456 Oak Ave',
    estimatedFuelCost: 100.00,
    startOdometerKm: 50000,
    revenue: 400.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Driver is OFF_DUTY and cannot be assigned',
  },
};

// ============================================
// TEST 4: Create Trip with Expired License (Validation Error)
// ============================================
const test4_create_trip_expired_license = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    vehicleId: 'VEHICLE_ID',
    driverId: 'EXPIRED_LICENSE_DRIVER_ID',
    cargoWeightKg: 1000,
    originAddress: '123 Main St',
    destinationAddress: '456 Oak Ave',
    estimatedFuelCost: 100.00,
    startOdometerKm: 50000,
    revenue: 400.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Driver license has expired',
  },
};

// ============================================
// TEST 5: Create Trip Exceeding Vehicle Capacity (Validation Error)
// ============================================
const test5_create_trip_exceeds_capacity = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    vehicleId: 'VEHICLE_ID', // maxCapacityKg: 1500
    driverId: 'DRIVER_PROFILE_ID',
    cargoWeightKg: 2000, // Exceeds capacity
    originAddress: '123 Main St',
    destinationAddress: '456 Oak Ave',
    estimatedFuelCost: 100.00,
    startOdometerKm: 50000,
    revenue: 400.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Cargo weight (2000kg) exceeds vehicle capacity (1500kg)',
  },
};

// ============================================
// TEST 6: Create Trip with Invalid Start Odometer (Validation Error)
// ============================================
const test6_create_trip_invalid_odometer = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    vehicleId: 'VEHICLE_ID', // odometerKm: 50000
    driverId: 'DRIVER_PROFILE_ID',
    cargoWeightKg: 1000,
    originAddress: '123 Main St',
    destinationAddress: '456 Oak Ave',
    estimatedFuelCost: 100.00,
    startOdometerKm: 40000, // Less than vehicle odometer
    revenue: 400.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Start odometer (40000km) cannot be less than vehicle odometer (50000km)',
  },
};

// ============================================
// TEST 7: Create Trip as DRIVER (Forbidden)
// ============================================
const test7_create_trip_driver_forbidden = {
  method: 'POST',
  url: 'http://localhost:3000/api/trips/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  body: {
    vehicleId: 'VEHICLE_ID',
    driverId: 'DRIVER_PROFILE_ID',
    cargoWeightKg: 1000,
    originAddress: '123 Main St',
    destinationAddress: '456 Oak Ave',
    estimatedFuelCost: 100.00,
    startOdometerKm: 50000,
    revenue: 400.00,
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: Only DISPATCHER or FLEET_MANAGER can create trips',
  },
};

// ============================================
// TEST 8: List All Trips (DISPATCHER)
// ============================================
const test8_list_trips_dispatcher = {
  method: 'GET',
  url: 'http://localhost:3000/api/trips/list',
  headers: {
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: [
      // Array of trips
    ],
  },
};

// ============================================
// TEST 9: List Trips with Status Filter
// ============================================
const test9_list_trips_by_status = {
  method: 'GET',
  url: 'http://localhost:3000/api/trips/list?status=DISPATCHED',
  headers: {
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  expectedStatus: 200,
  note: 'Returns only DISPATCHED trips',
};

// ============================================
// TEST 10: List Trips as DRIVER (Own Trips Only)
// ============================================
const test10_list_trips_driver_own = {
  method: 'GET',
  url: 'http://localhost:3000/api/trips/list',
  headers: {
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  expectedStatus: 200,
  note: 'Driver sees only their assigned trips',
};

// ============================================
// TEST 11: List Trips as FINANCIAL_ANALYST (Forbidden)
// ============================================
const test11_list_trips_analyst_forbidden = {
  method: 'GET',
  url: 'http://localhost:3000/api/trips/list',
  headers: {
    Cookie: 'authjs.session-token=FINANCIAL_ANALYST_TOKEN',
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: You do not have permission to view trips',
  },
};

// ============================================
// TEST 12: Complete Trip (DRIVER - Success)
// ============================================
const test12_complete_trip_driver = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/TRIP_ID/complete',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  body: {
    endOdometerKm: 50250,
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: {
      status: 'COMPLETED',
      endOdometerKm: 50250,
      distanceKm: 250,
      completedAt: '2026-02-26T...',
    },
    message: 'Trip completed successfully',
  },
  note: 'Vehicle status → AVAILABLE, driver → OFF_DUTY, completion rate recalculated',
};

// ============================================
// TEST 13: Complete Trip with Invalid End Odometer (Validation Error)
// ============================================
const test13_complete_trip_invalid_odometer = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/TRIP_ID/complete',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  body: {
    endOdometerKm: 49000, // Less than startOdometerKm (50000)
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'End odometer (49000km) must be greater than start odometer (50000km)',
  },
};

// ============================================
// TEST 14: Complete Trip (DISPATCHER - Success)
// ============================================
const test14_complete_trip_dispatcher = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/TRIP_ID/complete',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    endOdometerKm: 50300,
  },
  expectedStatus: 200,
  note: 'DISPATCHER can also complete trips',
};

// ============================================
// TEST 15: Complete Trip (Wrong Driver - Forbidden)
// ============================================
const test15_complete_trip_wrong_driver = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/OTHER_DRIVER_TRIP_ID/complete',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  body: {
    endOdometerKm: 50300,
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: You can only complete your own trips',
  },
};

// ============================================
// TEST 16: Complete Already Completed Trip (Validation Error)
// ============================================
const test16_complete_trip_already_completed = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/COMPLETED_TRIP_ID/complete',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    endOdometerKm: 50400,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Trip is COMPLETED and cannot be completed',
  },
};

// ============================================
// TEST 17: Cancel Trip (DISPATCHER - Success)
// ============================================
const test17_cancel_trip_dispatcher = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/TRIP_ID/cancel',
  headers: {
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: {
      status: 'CANCELLED',
    },
    message: 'Trip cancelled successfully',
  },
  note: 'Vehicle status → AVAILABLE, driver → OFF_DUTY',
};

// ============================================
// TEST 18: Cancel Completed Trip (Validation Error)
// ============================================
const test18_cancel_completed_trip = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/COMPLETED_TRIP_ID/cancel',
  headers: {
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Cannot cancel a completed trip',
  },
};

// ============================================
// TEST 19: Cancel Already Cancelled Trip (Validation Error)
// ============================================
const test19_cancel_already_cancelled = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/CANCELLED_TRIP_ID/cancel',
  headers: {
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Trip is already cancelled',
  },
};

// ============================================
// TEST 20: Cancel Trip as DRIVER (Forbidden)
// ============================================
const test20_cancel_trip_driver_forbidden = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/trips/TRIP_ID/cancel',
  headers: {
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: Only DISPATCHER or FLEET_MANAGER can cancel trips',
  },
};

// ============================================
// CURL COMMANDS FOR QUICK TESTING
// ============================================

/*
# Test 1: Create Trip
curl -X POST http://localhost:3000/api/trips/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"vehicleId":"VEHICLE_ID","driverId":"DRIVER_PROFILE_ID","cargoWeightKg":1200,"originAddress":"123 Main St","destinationAddress":"456 Oak Ave","estimatedFuelCost":150.00,"startOdometerKm":50000,"revenue":500.00}'

# Test 8: List All Trips
curl -X GET http://localhost:3000/api/trips/list \
  -H "Cookie: authjs.session-token=YOUR_TOKEN"

# Test 9: List Trips by Status
curl -X GET "http://localhost:3000/api/trips/list?status=DISPATCHED" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN"

# Test 12: Complete Trip
curl -X PATCH http://localhost:3000/api/trips/TRIP_ID/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=DRIVER_TOKEN" \
  -d '{"endOdometerKm":50250}'

# Test 17: Cancel Trip
curl -X PATCH http://localhost:3000/api/trips/TRIP_ID/cancel \
  -H "Cookie: authjs.session-token=DISPATCHER_TOKEN"
*/

// Export all tests for reference
export const tripDispatcherTests = {
  test1_create_trip_success,
  test2_create_trip_vehicle_unavailable,
  test3_create_trip_driver_off_duty,
  test4_create_trip_expired_license,
  test5_create_trip_exceeds_capacity,
  test6_create_trip_invalid_odometer,
  test7_create_trip_driver_forbidden,
  test8_list_trips_dispatcher,
  test9_list_trips_by_status,
  test10_list_trips_driver_own,
  test11_list_trips_analyst_forbidden,
  test12_complete_trip_driver,
  test13_complete_trip_invalid_odometer,
  test14_complete_trip_dispatcher,
  test15_complete_trip_wrong_driver,
  test16_complete_trip_already_completed,
  test17_cancel_trip_dispatcher,
  test18_cancel_completed_trip,
  test19_cancel_already_cancelled,
  test20_cancel_trip_driver_forbidden,
};
