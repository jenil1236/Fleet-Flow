/**
 * User Management & Password Reset Test File
 * 
 * This file contains manual test cases for user provisioning and password management.
 * Run these tests using tools like Postman, Thunder Client, or curl.
 * 
 * Base URL: http://localhost:3000
 */

// ============================================
// SETUP: First login as FLEET_MANAGER to get session token
// ============================================
const setup_login_fleet_manager = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/signin',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    email: 'john@example.com', // FLEET_MANAGER from registration
    password: 'password123',
  },
  note: 'Save the session cookie for subsequent requests',
};

// ============================================
// TEST 1: Create DISPATCHER (FLEET_MANAGER)
// ============================================
const test1_create_dispatcher = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Alice Dispatcher',
    email: 'alice@example.com',
    role: 'DISPATCHER',
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    message: 'User created and credentials emailed.',
  },
};

// ============================================
// TEST 2: Create DRIVER (FLEET_MANAGER)
// ============================================
const test2_create_driver = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Bob Driver',
    email: 'bob@example.com',
    role: 'DRIVER',
    licenseNumber: 'DL123456789',
    licenseExpiry: '2026-12-31',
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    message: 'User created and credentials emailed.',
  },
};

// ============================================
// TEST 3: Create DRIVER without license (Validation Error)
// ============================================
const test3_create_driver_no_license = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Charlie Driver',
    email: 'charlie@example.com',
    role: 'DRIVER',
    // Missing licenseNumber and licenseExpiry
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'DRIVER role requires licenseNumber and licenseExpiry',
  },
};

// ============================================
// TEST 4: Create FINANCIAL_ANALYST (FLEET_MANAGER)
// ============================================
const test4_create_financial_analyst = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Diana Analyst',
    email: 'diana@example.com',
    role: 'FINANCIAL_ANALYST',
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    message: 'User created and credentials emailed.',
  },
};

// ============================================
// TEST 5: Create SAFETY_OFFICER (FLEET_MANAGER)
// ============================================
const test5_create_safety_officer = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Eve Safety',
    email: 'eve@example.com',
    role: 'SAFETY_OFFICER',
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    message: 'User created and credentials emailed.',
  },
};

// ============================================
// TEST 6: Try to create SUPER_ADMIN (Forbidden)
// ============================================
const test6_create_superadmin_forbidden = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'SUPER_ADMIN',
  },
  expectedStatus: 400,
  note: 'SUPER_ADMIN is not in the allowed enum values',
};

// ============================================
// TEST 7: DISPATCHER creates DRIVER (Success)
// ============================================
const test7_dispatcher_create_driver = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_DISPATCHER_TOKEN',
  },
  body: {
    name: 'Frank Driver',
    email: 'frank@example.com',
    role: 'DRIVER',
    licenseNumber: 'DL987654321',
    licenseExpiry: '2027-06-30',
  },
  expectedStatus: 201,
  expectedResponse: {
    success: true,
    message: 'User created and credentials emailed.',
  },
};

// ============================================
// TEST 8: DISPATCHER tries to create FINANCIAL_ANALYST (Forbidden)
// ============================================
const test8_dispatcher_create_analyst_forbidden = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_DISPATCHER_TOKEN',
  },
  body: {
    name: 'George Analyst',
    email: 'george@example.com',
    role: 'FINANCIAL_ANALYST',
  },
  expectedStatus: 403,
  expectedResponse: {
    error: 'Forbidden: DISPATCHER cannot create FINANCIAL_ANALYST',
  },
};

// ============================================
// TEST 9: Create user with duplicate email (Conflict)
// ============================================
const test9_create_duplicate_email = {
  method: 'POST',
  url: 'http://localhost:3000/api/users/create',
  headers: {
    'Content-Type': 'application/json',
    Cookie: 'authjs.session-token=YOUR_FLEET_MANAGER_TOKEN',
  },
  body: {
    name: 'Duplicate User',
    email: 'alice@example.com', // Already exists
    role: 'DISPATCHER',
  },
  expectedStatus: 409,
  expectedResponse: {
    error: 'Email already registered',
  },
};

// ============================================
// TEST 10: Forgot Password (Success)
// ============================================
const test10_forgot_password = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/forgot-password',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    email: 'alice@example.com',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    message: 'If email exists, reset link sent.',
  },
  note: 'Check email for reset link',
};

// ============================================
// TEST 11: Forgot Password with non-existent email (Still Success)
// ============================================
const test11_forgot_password_nonexistent = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/forgot-password',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    email: 'nonexistent@example.com',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    message: 'If email exists, reset link sent.',
  },
  note: 'Security: Always return success to prevent email enumeration',
};

// ============================================
// TEST 12: Forgot Password with invalid email format
// ============================================
const test12_forgot_password_invalid_email = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/forgot-password',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    email: 'not-an-email',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Invalid email address',
  },
};

// ============================================
// TEST 13: Reset Password with valid token (Success)
// ============================================
const test13_reset_password_success = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/reset-password',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    token: 'RESET_TOKEN_FROM_EMAIL',
    newPassword: 'newpassword123',
  },
  expectedStatus: 200,
  expectedResponse: {
    success: true,
    message: 'Password updated successfully.',
  },
  note: 'Replace RESET_TOKEN_FROM_EMAIL with actual token from email',
};

// ============================================
// TEST 14: Reset Password with invalid token
// ============================================
const test14_reset_password_invalid_token = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/reset-password',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    token: 'invalid-token-12345',
    newPassword: 'newpassword123',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Invalid or expired reset token',
  },
};

// ============================================
// TEST 15: Reset Password with short password
// ============================================
const test15_reset_password_short = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/reset-password',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    token: 'RESET_TOKEN_FROM_EMAIL',
    newPassword: '123',
  },
  expectedStatus: 400,
  expectedResponse: {
    error: 'Password must be at least 6 characters',
  },
};

// ============================================
// TEST 16: Login with temporary password (First Login)
// ============================================
const test16_first_login_temp_password = {
  method: 'POST',
  url: 'http://localhost:3000/api/auth/signin',
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    email: 'alice@example.com',
    password: 'TEMP_PASSWORD_FROM_EMAIL',
  },
  expectedStatus: 200,
  note: 'User will be redirected to /reset-password-required by middleware',
};

// ============================================
// TEST 17: Access dashboard with mustResetPassword=true
// ============================================
const test17_access_dashboard_must_reset = {
  method: 'GET',
  url: 'http://localhost:3000/dashboard',
  headers: {
    Cookie: 'authjs.session-token=NEW_USER_TOKEN_WITH_MUST_RESET',
  },
  expectedStatus: 307,
  note: 'Should redirect to /reset-password-required',
};

// ============================================
// CURL COMMANDS FOR QUICK TESTING
// ============================================

/*
# Test 1: Create DISPATCHER
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"name":"Alice Dispatcher","email":"alice@example.com","role":"DISPATCHER"}'

# Test 2: Create DRIVER
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"name":"Bob Driver","email":"bob@example.com","role":"DRIVER","licenseNumber":"DL123456789","licenseExpiry":"2026-12-31"}'

# Test 10: Forgot Password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'

# Test 13: Reset Password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"RESET_TOKEN_FROM_EMAIL","newPassword":"newpassword123"}'
*/

// Export all tests for reference
export const userManagementTests = {
  setup_login_fleet_manager,
  test1_create_dispatcher,
  test2_create_driver,
  test3_create_driver_no_license,
  test4_create_financial_analyst,
  test5_create_safety_officer,
  test6_create_superadmin_forbidden,
  test7_dispatcher_create_driver,
  test8_dispatcher_create_analyst_forbidden,
  test9_create_duplicate_email,
  test10_forgot_password,
  test11_forgot_password_nonexistent,
  test12_forgot_password_invalid_email,
  test13_reset_password_success,
  test14_reset_password_invalid_token,
  test15_reset_password_short,
  test16_first_login_temp_password,
  test17_access_dashboard_must_reset,
};
