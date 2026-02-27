/**
 * Vehicle Registry Test File
 * 
 * This file contains manual test cases for vehicle CRUD operations.
 * Run these tests using tools like Postman, Thunder Client, or curl.
 * 
 * Base URL: http://localhost:3000
 */

// ============================================
// SETUP: Login as FLEET_MANAGER
// ============================================
const setup_login_fleet_manager = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/signin',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    email: 'john@example.com', // FLEET_MANAGER
    password: 'password123',
  },
  note: 'Save the session cookie for subsequent requests',
};

// ============================================
// TEST 1: Create Vehicle (FLEET_MANAGER - Success)
// ============================================
const test1_create_vehicle_success = {
  method: 'POST',
  url: 'http://localhost:3000/api/vehicles/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    licensePlate: 'ABC-1234',
    model: 'Toyota Hilux',
    type: 'Truck',
    maxCapacityKg: 1500,
    odometerKm: 50000,
    acquisitionCost: 25000.00,
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    data: {
      id: 'vehicle_id',
      licensePlate: 'ABC-1234',
      model: 'Toyota Hilux',
      type: 'Truck',
      status: 'AVAILABLE',
      // ... other fields
    },
  },
};

// ============================================
// TEST 2: Create Vehicle with Duplicate License Plate (Conflict)
// ============================================
const test2_create_vehicle_duplicate = {
  method: 'POST',
  url: 'http://localhost:3000/api/vehicles/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    licensePlate: 'ABC-1234', // Already exists
    model: 'Ford Ranger',
    type: 'Truck',
    maxCapacityKg: 1200,
    odometerKm: 30000,
    acquisitionCost: 22000.00,
  },
  expectedStatus: 409,
  expectedResponse: {
    error: 'License plate already exists',
  },
};

// ============================================
// TEST 3: Create Vehicle with Invalid Data (Validation Error)
// ============================================
const test3_create_vehicle_invalid_capacity = {
  method: 'POST',
  url: 'http://localhost:3000/api/vehicles/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    licensePlate: 'XYZ-5678',
    model: 'Isuzu D-Max',
    type: 'Truck',
    maxCapacityKg: -100, // Invalid: negative
    odometerKm: 10000,
    acquisitionCost: 20000.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Max capacity must be greater than 0',
  },
};

// ============================================
// TEST 4: Create Vehicle with Negative Odometer (Validation Error)
// ============================================
const test4_create_vehicle_negative_odometer = {
  method: 'POST',
  url: 'http://localhost:3000/api/vehicles/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    licensePlate: 'DEF-9012',
    model: 'Nissan Navara',
    type: 'Truck',
    maxCapacityKg: 1300,
    odometerKm: -5000, // Invalid: negative
    acquisitionCost: 23000.00,
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Odometer cannot be negative',
  },
};

// ============================================
// TEST 5: Create Vehicle as DISPATCHER (Forbidden)
// ============================================
const test5_create_vehicle_dispatcher_forbidden = {
  method: 'POST',
  url: 'http://localhost:3000/api/vehicles/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    licensePlate: 'GHI-3456',
    model: 'Mitsubishi Triton',
    type: 'Truck',
    maxCapacityKg: 1400,
    odometerKm: 20000,
    acquisitionCost: 24000.00,
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: Only FLEET_MANAGER can create vehicles',
  },
};

// ============================================
// TEST 6: List All Vehicles (FLEET_MANAGER)
// ============================================
const test6_list_vehicles_all = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/list',
  headers: {
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: [
      // Array of vehicles
    ],
  },
};

// ============================================
// TEST 7: List Vehicles with Status Filter
// ============================================
const test7_list_vehicles_by_status = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/list?status=AVAILABLE',
  headers: {
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  expectedStatus: 200,
  note: 'Returns only AVAILABLE vehicles',
};

// ============================================
// TEST 8: List Vehicles with Type Filter
// ============================================
const test8_list_vehicles_by_type = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/list?type=Truck',
  headers: {
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  expectedStatus: 200,
  note: 'Returns only Truck type vehicles',
};

// ============================================
// TEST 9: List Vehicles with Search
// ============================================
const test9_list_vehicles_search = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/list?search=Toyota',
  headers: {
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  expectedStatus: 200,
  note: 'Searches in licensePlate and model fields',
};

// ============================================
// TEST 10: List Vehicles as DISPATCHER (Success)
// ============================================
const test10_list_vehicles_dispatcher = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/list',
  headers: {
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  expectedStatus: 200,
  note: 'DISPATCHER can view vehicles',
};

// ============================================
// TEST 11: List Vehicles as DRIVER (Forbidden)
// ============================================
const test11_list_vehicles_driver_forbidden = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/list',
  headers: {
    Cookie: 'authjs.session-token=DRIVER_TOKEN',
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: You do not have permission to view vehicles',
  },
};

// ============================================
// TEST 12: Get Vehicle by ID (Success)
// ============================================
const test12_get_vehicle_by_id = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID',
  headers: {
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: {
      id: 'VEHICLE_ID',
      // ... vehicle data
    },
  },
  note: 'Replace VEHICLE_ID with actual vehicle ID',
};

// ============================================
// TEST 13: Get Vehicle from Different Organization (Not Found)
// ============================================
const test13_get_vehicle_cross_tenant = {
  method: 'GET',
  url: 'http://localhost:3000/api/vehicles/OTHER_ORG_VEHICLE_ID',
  headers: {
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  expectedStatus: 404,
  expectedResponse: {
    error: 'Vehicle not found',
  },
  note: 'Multi-tenant isolation prevents cross-organization access',
};

// ============================================
// TEST 14: Update Vehicle (FLEET_MANAGER - Success)
// ============================================
const test14_update_vehicle_success = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID/update',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    model: 'Toyota Hilux 2024',
    odometerKm: 55000,
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: {
      // Updated vehicle data
    },
  },
};

// ============================================
// TEST 15: Update Vehicle - Reduce Odometer (Validation Error)
// ============================================
const test15_update_vehicle_reduce_odometer = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID/update',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    odometerKm: 40000, // Less than current 55000
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Cannot reduce odometer below previous value',
  },
};

// ============================================
// TEST 16: Update Vehicle While ON_TRIP (Forbidden)
// ============================================
const test16_update_vehicle_on_trip = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/ON_TRIP_VEHICLE_ID/update',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    model: 'Updated Model',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Cannot update vehicle while ON_TRIP',
  },
  note: 'First set vehicle status to ON_TRIP to test this',
};

// ============================================
// TEST 17: Update Vehicle as DISPATCHER (Forbidden)
// ============================================
const test17_update_vehicle_dispatcher_forbidden = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID/update',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    model: 'Updated Model',
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: Only FLEET_MANAGER can update vehicles',
  },
};

// ============================================
// TEST 18: Toggle Service Status to OUT_OF_SERVICE (Success)
// ============================================
const test18_toggle_service_out = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID/toggle-service',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    status: 'OUT_OF_SERVICE',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: {
      status: 'OUT_OF_SERVICE',
    },
    message: 'Vehicle marked as OUT_OF_SERVICE',
  },
};

// ============================================
// TEST 19: Toggle Service Status to AVAILABLE (Success)
// ============================================
const test19_toggle_service_available = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID/toggle-service',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    status: 'AVAILABLE',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    data: {
      status: 'AVAILABLE',
    },
    message: 'Vehicle marked as AVAILABLE',
  },
};

// ============================================
// TEST 20: Toggle Service While ON_TRIP (Forbidden)
// ============================================
const test20_toggle_service_on_trip = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/ON_TRIP_VEHICLE_ID/toggle-service',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=FLEET_MANAGER_TOKEN',
  },
  body: {
    status: 'OUT_OF_SERVICE',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Cannot change status while vehicle is ON_TRIP',
  },
};

// ============================================
// TEST 21: Toggle Service as DISPATCHER (Forbidden)
// ============================================
const test21_toggle_service_dispatcher_forbidden = {
  method: 'PATCH',
  url: 'http://localhost:3000/api/vehicles/VEHICLE_ID/toggle-service',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=DISPATCHER_TOKEN',
  },
  body: {
    status: 'OUT_OF_SERVICE',
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: Only FLEET_MANAGER can toggle service status',
  },
};

// ============================================
// CURL COMMANDS FOR QUICK TESTING
// ============================================

/*
# Test 1: Create Vehicle
curl -X POST http://localhost:3000/api/vehicles/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"licensePlate":"ABC-1234","model":"Toyota Hilux","type":"Truck","maxCapacityKg":1500,"odometerKm":50000,"acquisitionCost":25000.00}'

# Test 6: List All Vehicles
curl -X GET http://localhost:3000/api/vehicles/list \
  -H "Cookie: authjs.session-token=YOUR_TOKEN"

# Test 7: List Vehicles by Status
curl -X GET "http://localhost:3000/api/vehicles/list?status=AVAILABLE" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN"

# Test 9: Search Vehicles
curl -X GET "http://localhost:3000/api/vehicles/list?search=Toyota" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN"

# Test 12: Get Vehicle by ID
curl -X GET http://localhost:3000/api/vehicles/VEHICLE_ID \
  -H "Cookie: authjs.session-token=YOUR_TOKEN"

# Test 14: Update Vehicle
curl -X PATCH http://localhost:3000/api/vehicles/VEHICLE_ID/update \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"model":"Toyota Hilux 2024","odometerKm":55000}'

# Test 18: Toggle Service Status
curl -X PATCH http://localhost:3000/api/vehicles/VEHICLE_ID/toggle-service \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"status":"OUT_OF_SERVICE"}'
*/

// Export all tests for reference
export const vehicleRegistryTests = {
  setup_login_fleet_manager,
  test1_create_vehicle_success,
  test2_create_vehicle_duplicate,
  test3_create_vehicle_invalid_capacity,
  test4_create_vehicle_negative_odometer,
  test5_create_vehicle_dispatcher_forbidden,
  test6_list_vehicles_all,
  test7_list_vehicles_by_status,
  test8_list_vehicles_by_type,
  test9_list_vehicles_search,
  test10_list_vehicles_dispatcher,
  test11_list_vehicles_driver_forbidden,
  test12_get_vehicle_by_id,
  test13_get_vehicle_cross_tenant,
  test14_update_vehicle_success,
  test15_update_vehicle_reduce_odometer,
  test16_update_vehicle_on_trip,
  test17_update_vehicle_dispatcher_forbidden,
  test18_toggle_service_out,
  test19_toggle_service_available,
  test20_toggle_service_on_trip,
  test21_toggle_service_dispatcher_forbidden,
};
