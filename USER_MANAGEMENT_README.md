# User Management & Password Reset Implementation

## Overview
Complete user provisioning and password management system for FleetFlow SaaS with role-based access control, email notifications, and secure password reset functionality.

## Features Implemented

### 1. Email Configuration
- **File**: `/lib/email.js`
- SMTP-based email sending using Nodemailer
- Configurable via environment variables
- Reusable `sendEmail()` function

### 2. User Creation (Internal Provisioning)
- **Endpoint**: `POST /api/users/create`
- **File**: `/app/api/users/create/route.js`

**Access Control:**
- FLEET_MANAGER can create: DISPATCHER, FINANCIAL_ANALYST, SAFETY_OFFICER, DRIVER
- DISPATCHER can create: DRIVER only
- Nobody can create SUPER_ADMIN

**Features:**
- Generates secure 10-character temporary password
- Automatically creates DriverProfile for DRIVER role
- Sends welcome email with credentials
- Sets `mustResetPassword = true` for first login
- Multi-tenant isolation (organizationId from session)

### 3. Forgot Password (Self-Service)
- **Endpoint**: `POST /api/auth/forgot-password`
- **File**: `/app/api/auth/forgot-password/route.js`

**Features:**
- Generates secure reset token using crypto.randomBytes
- Hashes token before database storage
- Sets 10 min expiration
- Sends email with reset link
- Always returns success (prevents email enumeration)

### 4. Reset Password
- **Endpoint**: `POST /api/auth/reset-password`
- **File**: `/app/api/auth/reset-password/route.js`

**Features:**
- Validates token and expiration
- Hashes new password with bcrypt
- Clears `mustResetPassword` flag
- Clears reset token and expiration
- Secure token comparison

### 5. Force Password Reset on First Login
- **File**: `/middleware.js`

**Features:**
- Checks `mustResetPassword` flag in session
- Redirects to `/reset-password-required` page
- Blocks dashboard access until password is reset
- Allows access to reset password endpoints

### 6. Database Schema Updates
- **File**: `/prisma/schema.prisma`

**New User fields:**
```prisma
mustResetPassword    Boolean   @default(false)
passwordResetToken   String?
passwordResetExpires DateTime?
```

## Environment Variables Required

Add to your `.env` file:

```env
# Email Configuration (SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="FleetFlow <noreply@fleetflow.com>"

# App URL
APP_URL="http://localhost:3000"
```

### Gmail Setup (Example)
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password as `EMAIL_PASS`

## Database Migration

Run migration to add new fields:

```bash
npx prisma migrate dev --name add_password_reset_fields
```

Or push schema changes:

```bash
npx prisma db push
```

## API Endpoints

### Create User
```bash
POST /api/users/create
Authorization: Session Cookie (FLEET_MANAGER or DISPATCHER)
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "DRIVER",
  "licenseNumber": "DL123456789",  // Required for DRIVER
  "licenseExpiry": "2026-12-31"    // Required for DRIVER
}

Response: 201
{
  "success": true,
  "message": "User created and credentials emailed."
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: 200
{
  "success": true,
  "message": "If email exists, reset link sent."
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}

Response: 200
{
  "success": true,
  "message": "Password updated successfully."
}
```

## Security Features

### Password Security
- Bcrypt hashing with 10 salt rounds
- Minimum 6 characters validation
- Secure random password generation (10 chars)

### Token Security
- Reset tokens generated with crypto.randomBytes (32 bytes)
- Tokens hashed with SHA-256 before storage
- Never expose raw tokens in API responses
- 1-hour expiration on reset tokens

### Access Control
- Role-based user creation permissions
- Multi-tenant isolation via organizationId
- Session-based authentication required
- Cross-organization access prevention

### Email Enumeration Prevention
- Forgot password always returns success
- No indication if email exists or not

## Testing

Test files located in `/tests/`:
- `auth-endpoints.test.js` - Authentication tests
- `user-management.test.js` - User provisioning and password reset tests

Run tests manually using:
- Postman
- Thunder Client (VS Code extension)
- curl commands (provided in test files)

## User Flow Examples

### New User Creation Flow
1. FLEET_MANAGER creates new DRIVER via `/api/users/create`
2. System generates temporary password
3. Email sent to driver with credentials
4. Driver logs in with temporary password
5. Middleware redirects to `/reset-password-required`
6. Driver must reset password before accessing dashboard

### Password Reset Flow
1. User clicks "Forgot Password" on login page
2. Submits email via `/api/auth/forgot-password`
3. Receives email with reset link (valid 1 hour)
4. Clicks link, redirected to `/reset-password?token=xxx`
5. Submits new password via `/api/auth/reset-password`
6. Password updated, can login with new password

## Files Created/Modified

### New Files
- `/lib/email.js` - Email utility
- `/lib/password.js` - Password and token utilities
- `/app/api/users/create/route.js` - User creation endpoint
- `/app/api/auth/forgot-password/route.js` - Forgot password endpoint
- `/app/api/auth/reset-password/route.js` - Reset password endpoint
- `/tests/user-management.test.js` - Test cases

### Modified Files
- `/prisma/schema.prisma` - Added password reset fields
- `/lib/auth.js` - Added mustResetPassword to session
- `/middleware.js` - Added first login redirect logic
- `/.env.example` - Added email configuration

## Next Steps

1. Run database migration
2. Configure email environment variables
3. Test user creation flow
4. Test password reset flow
5. Create frontend pages:
   - `/reset-password` - Password reset form
   - `/reset-password-required` - First login password change
6. Add email templates for better branding

## Troubleshooting

### Email not sending
- Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
- Verify SMTP credentials
- Check firewall/network settings
- Enable "Less secure app access" (Gmail) or use App Password

### Token expired
- Reset tokens expire after 1 hour
- Request new reset link via forgot password

### mustResetPassword not clearing
- Ensure `/api/auth/reset-password` is called successfully
- Check database for `mustResetPassword` field value
- Verify session is refreshed after password reset
