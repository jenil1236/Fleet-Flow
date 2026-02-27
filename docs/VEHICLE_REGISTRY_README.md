# Vehicle Registry Module

## Overview
Complete CRUD implementation for vehicle management in FleetFlow SaaS with multi-tenant isolation, role-based access control, and production-safe validations.

## Features Implemented

### 1. Create Vehicle
- **Endpoint**: `POST /api/vehicles/create`
- **File**: `/app/api/vehicles/create/route.js`
- **Access**: FLEET_MANAGER only

**Features:**
- Validates all input fields with Zod
- Ensures license plate uniqueness (globally)
- Sets default status to AVAILABLE
- Multi-tenant isolation via organizationId from session
- Production-safe validations (capacity > 0, odometer >= 0, cost >= 0)

### 2. List Vehicles
- **Endpoint**: `GET /api/vehicles/list`
- **File**: `/app/api/vehicles/list/route.js`
- **Access**: FLEET_MANAGER, DISPATCHER, FINANCIAL_ANALYST, SAFETY_OFFICER

**Features:**
- Always filters by organizationId (multi-tenant isolation)
- Optional query parameters:
  - `status` - Filter by vehicle status
  - `type` - Filter by vehicle type
  - `search` - Search in licensePlate or model (case-insensitive)
- Ordered by createdAt descending
- Never exposes vehicles from other organizations

### 3. Get Vehicle by ID
- **Endpoint**: `GET /api/vehicles/:id`
- **File**: `/app/api/vehicles/[id]/route.js`
- **Access**: FLEET_MANAGER, DISPATCHER, FINANCIAL_ANALYST, SAFETY_OFFICER

**Features:**
- Returns full vehicle data
- Multi-tenant isolation enforced
- Returns 404 if vehicle doesn't belong to user's organization

### 4. Update Vehicle
- **Endpoint**: `PATCH /api/vehicles/:id/update`
- **File**: `/app/api/vehicles/[id]/update/route.js`
- **Access**: FLEET_MANAGER only

**Updatable Fields:**
- model
- type
- maxCapacityKg
- odometerKm
- acquisitionCost

**Restrictions:**
- Cannot update if vehicle status is ON_TRIP
- Cannot reduce odometer below previous value
- All validations enforced (capacity > 0, odometer >= 0, cost >= 0)

### 5. Toggle Service Status
- **Endpoint**: `PATCH /api/vehicles/:id/toggle-service`
- **File**: `/app/api/vehicles/[id]/toggle-service/route.js`
- **Access**: FLEET_MANAGER only

**Features:**
- Toggle between OUT_OF_SERVICE and AVAILABLE
- Cannot change status if vehicle is ON_TRIP
- Used to manually retire or reactivate vehicles

## Role-Based Access Control (RBAC)

| Role | Create | View | Update | Toggle Service |
|------|--------|------|--------|----------------|
| FLEET_MANAGER | ✅ | ✅ | ✅ | ✅ |
| DISPATCHER | ❌ | ✅ | ❌ | ❌ |
| FINANCIAL_ANALYST | ❌ | ✅ | ❌ | ❌ |
| SAFETY_OFFICER | ❌ | ✅ | ❌ | ❌ |
| DRIVER | ❌ | ❌ | ❌ | ❌ |
| SUPER_ADMIN | ❌ | ❌ | ❌ | ❌ |

**Note:** SUPER_ADMIN has no access to organization vehicles (platform-level role only)

## Vehicle Status Logic

### Status Enum
```javascript
AVAILABLE      // Ready for dispatch
ON_TRIP        // Currently assigned to a trip
IN_SHOP        // Under maintenance
OUT_OF_SERVICE // Manually retired
```

### Status Management Rules

1. **AVAILABLE**
   - Default status for new vehicles
   - Can be manually set via toggle-service
   - Vehicle is ready for dispatch

2. **ON_TRIP**
   - Managed ONLY by Trip module (future implementation)
   - Cannot be set manually
   - Blocks all updates and status changes
   - Prevents vehicle from being edited or retired

3. **IN_SHOP**
   - Managed ONLY by Maintenance module (future implementation)
   - Cannot be set manually
   - Prevents vehicle from being dispatched

4. **OUT_OF_SERVICE**
   - Can be set manually by FLEET_MANAGER
   - Hides vehicle from dispatch lists
   - Used for retired or permanently unavailable vehicles
   - Can be reverted to AVAILABLE

## API Endpoints

### Create Vehicle
```bash
POST /api/vehicles/create
Authorization: Session Cookie (FLEET_MANAGER)
Content-Type: application/json

{
  "licensePlate": "ABC-1234",
  "model": "Toyota Hilux",
  "type": "Truck",
  "maxCapacityKg": 1500,
  "odometerKm": 50000,
  "acquisitionCost": 25000.00
}

Response: 201
{
  "success": true,
  "data": {
    "id": "vehicle_id",
    "licensePlate": "ABC-1234",
    "model": "Toyota Hilux",
    "type": "Truck",
    "maxCapacityKg": 1500,
    "odometerKm": 50000,
    "acquisitionCost": "25000.00",
    "status": "AVAILABLE",
    "organizationId": "org_id",
    "createdAt": "2026-02-26T..."
  }
}
```

### List Vehicles
```bash
GET /api/vehicles/list
Authorization: Session Cookie

# With filters
GET /api/vehicles/list?status=AVAILABLE
GET /api/vehicles/list?type=Truck
GET /api/vehicles/list?search=Toyota

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "vehicle_id",
      "licensePlate": "ABC-1234",
      // ... vehicle data
    }
  ]
}
```

### Get Vehicle by ID
```bash
GET /api/vehicles/:id
Authorization: Session Cookie

Response: 200
{
  "success": true,
  "data": {
    "id": "vehicle_id",
    "licensePlate": "ABC-1234",
    // ... full vehicle data
  }
}
```

### Update Vehicle
```bash
PATCH /api/vehicles/:id/update
Authorization: Session Cookie (FLEET_MANAGER)
Content-Type: application/json

{
  "model": "Toyota Hilux 2024",
  "odometerKm": 55000
}

Response: 200
{
  "success": true,
  "data": {
    // Updated vehicle data
  }
}
```

### Toggle Service Status
```bash
PATCH /api/vehicles/:id/toggle-service
Authorization: Session Cookie (FLEET_MANAGER)
Content-Type: application/json

{
  "status": "OUT_OF_SERVICE"
}

Response: 200
{
  "success": true,
  "data": {
    "id": "vehicle_id",
    "status": "OUT_OF_SERVICE",
    // ... other fields
  },
  "message": "Vehicle marked as OUT_OF_SERVICE"
}
```

## Validation Rules

### Create Vehicle
- `licensePlate`: Required, must be unique globally
- `model`: Required, min 1 character
- `type`: Required, min 1 character
- `maxCapacityKg`: Required, must be > 0
- `odometerKm`: Required, must be >= 0
- `acquisitionCost`: Required, must be >= 0

### Update Vehicle
- All fields optional
- `maxCapacityKg`: If provided, must be > 0
- `odometerKm`: If provided, must be >= 0 and >= current value
- `acquisitionCost`: If provided, must be >= 0
- Cannot update if vehicle status is ON_TRIP

### Toggle Service
- `status`: Must be either "OUT_OF_SERVICE" or "AVAILABLE"
- Cannot change if vehicle status is ON_TRIP

## Security Features

### Multi-Tenant Isolation
- All queries filter by `organizationId` from session
- Never trust `organizationId` from request body
- Prevents cross-organization data access
- Returns 404 for vehicles from other organizations

### Role-Based Access Control
- Enforced at endpoint level
- Session role checked before any operation
- Proper 403 Forbidden responses for unauthorized access

### Input Validation
- Zod schema validation on all inputs
- Type safety and constraint enforcement
- Prevents invalid data from entering database

### Error Handling
- Structured JSON error responses
- Never exposes internal Prisma errors
- Consistent error format across all endpoints
- Proper HTTP status codes

## Testing

Test file located at `/tests/vehicle-registry.test.js`

**Test Coverage:**
- ✅ Create vehicle (success and validation errors)
- ✅ Duplicate license plate detection
- ✅ RBAC enforcement (all roles)
- ✅ List vehicles with filters
- ✅ Get vehicle by ID
- ✅ Multi-tenant isolation
- ✅ Update vehicle (success and restrictions)
- ✅ Odometer reduction prevention
- ✅ ON_TRIP status blocking
- ✅ Toggle service status
- ✅ Cross-organization access prevention

Run tests manually using:
- Postman
- Thunder Client (VS Code extension)
- curl commands (provided in test file)

## Common Use Cases

### 1. Fleet Manager adds new vehicle
```javascript
POST /api/vehicles/create
{
  "licensePlate": "XYZ-5678",
  "model": "Ford Ranger",
  "type": "Truck",
  "maxCapacityKg": 1200,
  "odometerKm": 0,
  "acquisitionCost": 30000.00
}
```

### 2. Dispatcher views available vehicles
```javascript
GET /api/vehicles/list?status=AVAILABLE
```

### 3. Fleet Manager updates odometer after service
```javascript
PATCH /api/vehicles/:id/update
{
  "odometerKm": 55000
}
```

### 4. Fleet Manager retires old vehicle
```javascript
PATCH /api/vehicles/:id/toggle-service
{
  "status": "OUT_OF_SERVICE"
}
```

### 5. Financial Analyst searches for specific vehicle
```javascript
GET /api/vehicles/list?search=ABC-1234
```

## Files Created

### API Routes
- `/app/api/vehicles/create/route.js` - Create vehicle
- `/app/api/vehicles/list/route.js` - List vehicles with filters
- `/app/api/vehicles/[id]/route.js` - Get vehicle by ID
- `/app/api/vehicles/[id]/update/route.js` - Update vehicle
- `/app/api/vehicles/[id]/toggle-service/route.js` - Toggle service status

### Tests
- `/tests/vehicle-registry.test.js` - Comprehensive test cases

### Documentation
- `/VEHICLE_REGISTRY_README.md` - This file

## Integration Notes

### Future Trip Module Integration
When implementing the Trip module:
- Set vehicle status to ON_TRIP when trip is DISPATCHED
- Set vehicle status to AVAILABLE when trip is COMPLETED or CANCELLED
- Update vehicle odometerKm with endOdometerKm from trip

### Future Maintenance Module Integration
When implementing the Maintenance module:
- Set vehicle status to IN_SHOP when maintenance log is OPEN or IN_PROGRESS
- Set vehicle status to AVAILABLE when maintenance log is CLOSED
- Consider updating odometerKm if maintenance includes service

## Error Codes Reference

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | Success | Vehicle retrieved/updated |
| 201 | Created | Vehicle created successfully |
| 400 | Bad Request | Validation error, invalid data |
| 401 | Unauthorized | No session token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Vehicle doesn't exist or wrong org |
| 409 | Conflict | Duplicate license plate |
| 500 | Server Error | Unexpected error |

## Next Steps

1. Test all endpoints with different roles
2. Verify multi-tenant isolation
3. Create frontend pages for vehicle management
4. Implement Trip module (will manage ON_TRIP status)
5. Implement Maintenance module (will manage IN_SHOP status)
6. Add vehicle statistics dashboard
7. Add bulk import functionality
8. Add vehicle history tracking
