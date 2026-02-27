# Driver Management & Trip Dispatcher Module

## Overview
Complete implementation of driver management and trip dispatcher core logic for FleetFlow SaaS with real-world business validations, automatic status transitions, and multi-tenant isolation.

## Features Implemented

### Driver Management Module

#### 1. List Drivers
- **Endpoint**: `GET /api/drivers/list`
- **File**: `/app/api/drivers/list/route.js`
- **Access**: FLEET_MANAGER, SAFETY_OFFICER, DISPATCHER

**Features:**
- Returns driver profiles with user data
- Excludes password and sensitive auth fields
- Multi-tenant isolation (organizationId filter)
- Ordered by creation date

**Response Fields:**
- id, userId, name, email
- licenseNumber, licenseExpiry
- dutyStatus, safetyScore
- completionRate, complaintCount

#### 2. Update Driver
- **Endpoint**: `PATCH /api/drivers/:id/update`
- **File**: `/app/api/drivers/[id]/update/route.js`
- **Access**: FLEET_MANAGER, SAFETY_OFFICER

**Updatable Fields:**
- licenseNumber
- licenseExpiry
- dutyStatus
- safetyScore
- complaintCount

**Business Rules:**
- If licenseExpiry < today → automatically set dutyStatus = SUSPENDED
- Cannot update drivers from other organizations
- Multi-tenant isolation enforced

### Trip Dispatcher Module

#### 3. Create Trip
- **Endpoint**: `POST /api/trips/create`
- **File**: `/app/api/trips/create/route.js`
- **Access**: DISPATCHER, FLEET_MANAGER

**Required Input:**
- vehicleId
- driverId
- cargoWeightKg
- originAddress
- destinationAddress
- estimatedFuelCost
- startOdometerKm
- revenue

**Critical Business Validations:**
1. ✅ Vehicle status must be AVAILABLE
2. ✅ Driver dutyStatus must be ON_DUTY
3. ✅ Driver license must not be expired
4. ✅ Cargo weight must not exceed vehicle capacity
5. ✅ Vehicle must belong to same organization
6. ✅ Driver must belong to same organization
7. ✅ Start odometer must be >= vehicle odometer

**Automatic Status Transitions:**
- Trip status → DISPATCHED
- Vehicle status → ON_TRIP
- Driver dutyStatus → ON_DUTY (enforced)

#### 4. List Trips
- **Endpoint**: `GET /api/trips/list`
- **File**: `/app/api/trips/list/route.js`
- **Access**: DISPATCHER, FLEET_MANAGER, DRIVER (own trips only)

**Features:**
- DRIVER sees only their assigned trips
- DISPATCHER/FLEET_MANAGER see all organization trips
- Optional status filter via query parameter
- Includes vehicle and driver details
- Multi-tenant isolation

#### 5. Complete Trip
- **Endpoint**: `PATCH /api/trips/:id/complete`
- **File**: `/app/api/trips/[id]/complete/route.js`
- **Access**: DRIVER (assigned driver only), DISPATCHER, FLEET_MANAGER

**Required Input:**
- endOdometerKm

**Validations:**
- Trip must be in DISPATCHED status
- endOdometerKm must be > startOdometerKm
- DRIVER can only complete their own trips

**Automatic Actions (Transaction):**
1. Calculate distanceKm
2. Update trip: status = COMPLETED, completedAt = now
3. Update vehicle: status = AVAILABLE, odometerKm = endOdometerKm
4. Update driver: dutyStatus = OFF_DUTY
5. Recalculate driver completionRate

#### 6. Cancel Trip
- **Endpoint**: `PATCH /api/trips/:id/cancel`
- **File**: `/app/api/trips/[id]/cancel/route.js`
- **Access**: DISPATCHER, FLEET_MANAGER

**Business Rules:**
- Cannot cancel COMPLETED trips
- Cannot cancel already CANCELLED trips

**Automatic Actions (Transaction):**
1. Update trip: status = CANCELLED
2. Reset vehicle: status = AVAILABLE
3. Reset driver: dutyStatus = OFF_DUTY

## Role-Based Access Control (RBAC)

### Driver Management

| Role | List Drivers | Update Driver |
|------|--------------|---------------|
| FLEET_MANAGER | ✅ | ✅ |
| SAFETY_OFFICER | ✅ | ✅ |
| DISPATCHER | ✅ | ❌ |
| DRIVER | ❌ | ❌ |
| FINANCIAL_ANALYST | ❌ | ❌ |

### Trip Management

| Role | Create Trip | List Trips | Complete Trip | Cancel Trip |
|------|-------------|------------|---------------|-------------|
| FLEET_MANAGER | ✅ | ✅ (all) | ✅ | ✅ |
| DISPATCHER | ✅ | ✅ (all) | ✅ | ✅ |
| DRIVER | ❌ | ✅ (own) | ✅ (own) | ❌ |
| SAFETY_OFFICER | ❌ | ❌ | ❌ | ❌ |
| FINANCIAL_ANALYST | ❌ | ❌ | ❌ | ❌ |

## Business Rules (Critical)

### Vehicle Assignment Rules
- ✅ Vehicle status must be AVAILABLE
- ❌ Vehicle ON_TRIP cannot be reused
- ❌ Vehicle IN_SHOP cannot be assigned
- ❌ Vehicle OUT_OF_SERVICE cannot be assigned

### Driver Assignment Rules
- ✅ Driver dutyStatus must be ON_DUTY
- ❌ Driver with expired license cannot be assigned
- ❌ Driver SUSPENDED cannot be assigned
- ❌ Driver OFF_DUTY cannot be assigned

### Capacity Rules
- ✅ Cargo weight must not exceed vehicle maxCapacityKg
- ✅ Start odometer must be >= vehicle current odometer
- ✅ End odometer must be > start odometer

### Status Transition Rules

**Trip Status Flow:**
```
DRAFT → DISPATCHED → COMPLETED
              ↓
          CANCELLED
```

**Vehicle Status (Trip-Related):**
```
AVAILABLE → ON_TRIP → AVAILABLE (on complete/cancel)
```

**Driver Duty Status (Trip-Related):**
```
ON_DUTY → ON_DUTY (during trip) → OFF_DUTY (on complete/cancel)
```

## API Endpoints

### List Drivers
```bash
GET /api/drivers/list
Authorization: Session Cookie

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "driver_profile_id",
      "userId": "user_id",
      "name": "Bob Driver",
      "email": "bob@example.com",
      "licenseNumber": "DL123456789",
      "licenseExpiry": "2026-12-31",
      "dutyStatus": "ON_DUTY",
      "safetyScore": 85.5,
      "completionRate": 92.3,
      "complaintCount": 2
    }
  ]
}
```

### Update Driver
```bash
PATCH /api/drivers/:id/update
Authorization: Session Cookie (FLEET_MANAGER or SAFETY_OFFICER)
Content-Type: application/json

{
  "licenseNumber": "DL987654321",
  "licenseExpiry": "2027-06-30",
  "dutyStatus": "ON_DUTY",
  "safetyScore": 90.0,
  "complaintCount": 1
}

Response: 200
{
  "success": true,
  "data": {
    // Updated driver data
  }
}
```

### Create Trip
```bash
POST /api/trips/create
Authorization: Session Cookie (DISPATCHER or FLEET_MANAGER)
Content-Type: application/json

{
  "vehicleId": "vehicle_id",
  "driverId": "driver_profile_id",
  "cargoWeightKg": 1200,
  "originAddress": "123 Main St, City A",
  "destinationAddress": "456 Oak Ave, City B",
  "estimatedFuelCost": 150.00,
  "startOdometerKm": 50000,
  "revenue": 500.00
}

Response: 201
{
  "success": true,
  "data": {
    "id": "trip_id",
    "status": "DISPATCHED",
    "cargoWeightKg": 1200,
    "originAddress": "123 Main St, City A",
    "destinationAddress": "456 Oak Ave, City B",
    "startOdometerKm": 50000,
    "revenue": "500.00",
    // ... other fields
  },
  "message": "Trip dispatched successfully"
}
```

### List Trips
```bash
GET /api/trips/list
Authorization: Session Cookie

# With status filter
GET /api/trips/list?status=DISPATCHED

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "trip_id",
      "status": "DISPATCHED",
      "vehicle": {
        "id": "vehicle_id",
        "licensePlate": "ABC-1234",
        "model": "Toyota Hilux"
      },
      "driver": {
        "id": "driver_id",
        "name": "Bob Driver",
        "email": "bob@example.com"
      },
      // ... other fields
    }
  ]
}
```

### Complete Trip
```bash
PATCH /api/trips/:id/complete
Authorization: Session Cookie (DRIVER, DISPATCHER, or FLEET_MANAGER)
Content-Type: application/json

{
  "endOdometerKm": 50250
}

Response: 200
{
  "success": true,
  "data": {
    "id": "trip_id",
    "status": "COMPLETED",
    "startOdometerKm": 50000,
    "endOdometerKm": 50250,
    "distanceKm": 250,
    "completedAt": "2026-02-26T15:30:00.000Z"
  },
  "message": "Trip completed successfully"
}
```

### Cancel Trip
```bash
PATCH /api/trips/:id/cancel
Authorization: Session Cookie (DISPATCHER or FLEET_MANAGER)

Response: 200
{
  "success": true,
  "data": {
    "id": "trip_id",
    "status": "CANCELLED"
  },
  "message": "Trip cancelled successfully"
}
```

## Automatic Calculations

### Distance Calculation
```javascript
distanceKm = endOdometerKm - startOdometerKm
```

### Driver Completion Rate
```javascript
completionRate = (completedTrips / totalTrips) * 100
```

Recalculated automatically when trip is completed.

## Security Features

### Multi-Tenant Isolation
- All queries filter by organizationId from session
- Vehicle and driver must belong to same organization
- Cross-organization access returns 404
- Never trust organizationId from request body

### Role-Based Access Control
- Enforced at endpoint level
- Session role checked before operations
- DRIVER can only see/complete own trips
- Proper 403 Forbidden responses

### Input Validation
- Zod schema validation on all inputs
- Business rule validations before database operations
- Type safety and constraint enforcement

### Transaction Safety
- All status updates use Prisma transactions
- Atomic operations prevent inconsistent states
- Rollback on any failure

## Error Handling

### Common Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Vehicle is ON_TRIP and cannot be assigned | Vehicle already in use |
| 400 | Driver is OFF_DUTY and cannot be assigned | Driver not available |
| 400 | Driver license has expired | License validation failed |
| 400 | Cargo weight exceeds vehicle capacity | Overload prevention |
| 400 | Cannot complete trip while COMPLETED | Invalid state transition |
| 400 | Cannot cancel a completed trip | Business rule violation |
| 403 | Only DISPATCHER can create trips | RBAC enforcement |
| 403 | You can only complete your own trips | Driver authorization |
| 404 | Vehicle not found | Wrong org or doesn't exist |
| 404 | Driver not found | Wrong org or doesn't exist |
| 404 | Trip not found | Wrong org or doesn't exist |

## Testing

Test files located in `/tests/`:
- `driver-management.test.js` - Driver CRUD operations
- `trip-dispatcher.test.js` - Trip lifecycle management

**Test Coverage:**
- ✅ Driver list with RBAC
- ✅ Driver update with compliance rules
- ✅ Expired license auto-suspension
- ✅ Trip creation with all validations
- ✅ Vehicle availability checks
- ✅ Driver eligibility checks
- ✅ Capacity validation
- ✅ Trip completion with calculations
- ✅ Trip cancellation
- ✅ Multi-tenant isolation
- ✅ RBAC enforcement
- ✅ Status transition rules

## Common Use Cases

### 1. Dispatcher Creates Trip
```javascript
// Prerequisites:
// - Vehicle status: AVAILABLE
// - Driver dutyStatus: ON_DUTY
// - Driver license: not expired

POST /api/trips/create
{
  "vehicleId": "vehicle_123",
  "driverId": "driver_456",
  "cargoWeightKg": 1200,
  "originAddress": "Warehouse A",
  "destinationAddress": "Customer B",
  "estimatedFuelCost": 150.00,
  "startOdometerKm": 50000,
  "revenue": 500.00
}

// Result:
// - Trip created with status DISPATCHED
// - Vehicle status → ON_TRIP
// - Driver remains ON_DUTY
```

### 2. Driver Completes Trip
```javascript
PATCH /api/trips/trip_123/complete
{
  "endOdometerKm": 50250
}

// Result:
// - Trip status → COMPLETED
// - Distance calculated: 250km
// - Vehicle status → AVAILABLE
// - Vehicle odometer → 50250km
// - Driver status → OFF_DUTY
// - Driver completion rate recalculated
```

### 3. Dispatcher Cancels Trip
```javascript
PATCH /api/trips/trip_123/cancel

// Result:
// - Trip status → CANCELLED
// - Vehicle status → AVAILABLE
// - Driver status → OFF_DUTY
```

### 4. Safety Officer Updates Driver Compliance
```javascript
PATCH /api/drivers/driver_456/update
{
  "safetyScore": 85.5,
  "complaintCount": 2,
  "licenseExpiry": "2027-12-31"
}

// Result:
// - Driver compliance fields updated
// - If license expired → dutyStatus auto-set to SUSPENDED
```

## Files Created

### API Routes
- `/app/api/drivers/list/route.js` - List drivers
- `/app/api/drivers/[id]/update/route.js` - Update driver
- `/app/api/trips/create/route.js` - Create trip
- `/app/api/trips/list/route.js` - List trips
- `/app/api/trips/[id]/complete/route.js` - Complete trip
- `/app/api/trips/[id]/cancel/route.js` - Cancel trip

### Tests
- `/tests/driver-management.test.js` - Driver management tests
- `/tests/trip-dispatcher.test.js` - Trip dispatcher tests

### Documentation
- `/DRIVER_TRIP_README.md` - This file

## Integration Notes

### Vehicle Module Integration
- Vehicle status managed by Trip module
- ON_TRIP status prevents vehicle updates
- Vehicle odometer updated on trip completion

### Driver Module Integration
- Driver dutyStatus managed by Trip module
- Completion rate auto-calculated
- License expiry enforced at trip creation

### Future Expense Module Integration
- Link expenses to trips via tripId
- Track fuel costs per trip
- Calculate profitability (revenue - expenses)

## Next Steps

1. Test all endpoints with different roles
2. Verify business validations
3. Test status transitions
4. Create frontend pages for:
   - Driver management dashboard
   - Trip dispatcher interface
   - Driver trip view
5. Implement Expense module
6. Add trip analytics and reporting
7. Add real-time trip tracking
8. Implement notifications for trip events
