# 🚛 FleetFlow - Digital Fleet Management System

<div align="center">

![FleetFlow Logo](public/logo.png)

**A modern SaaS platform for digital fleet record management and analytics**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [Authentication Flow](#-authentication-flow)
- [RBAC System](#-rbac-system)
- [Email System](#-email-system)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Endpoints](#-api-endpoints)
- [Role-Based Dashboards](#-role-based-dashboards)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

Fleet operators face significant challenges in managing their operations:

### Traditional Pain Points:
- **Paper-Based Records**: Logbooks, maintenance records, and trip logs stored in physical files
- **Data Inaccessibility**: Records locked in filing cabinets, unavailable when needed
- **Manual Calculations**: Time-consuming expense tracking and profitability analysis
- **Lack of Insights**: No visibility into fleet performance, costs, or trends
- **Scattered Information**: Vehicle data, driver records, and trip logs in different places
- **Compliance Issues**: Difficulty maintaining and retrieving historical records
- **Collaboration Barriers**: Multiple stakeholders unable to access relevant information
- **Error-Prone**: Manual data entry leading to mistakes and inconsistencies

### Business Impact:
- ⏱️ Hours wasted searching for records
- 💰 Hidden costs and inefficiencies
- 📉 Poor decision-making due to lack of data
- 🔒 Security risks with physical documents
- 🚫 Limited scalability as fleet grows

---

## ✅ Solution

**FleetFlow** is a comprehensive cloud-based SaaS platform that digitizes fleet management operations, providing:

### Core Value Propositions:
1. **Digital Record Keeping**: Replace paper logbooks with secure cloud storage
2. **Centralized Database**: All fleet data in one accessible location
3. **Real-Time Analytics**: Instant insights into costs, revenue, and performance
4. **Multi-User Access**: Role-based dashboards for different stakeholders
5. **Anywhere Access**: Cloud-based system accessible 24/7 from any device
6. **Automated Calculations**: Automatic expense tracking and profitability analysis
7. **Data Security**: Encrypted storage with regular backups
8. **Scalable Solution**: Grows with your fleet from 5 to 500+ vehicles

### What FleetFlow Does:
- ✅ Stores vehicle information and maintenance history
- ✅ Logs all trips with odometer readings and details
- ✅ Manages driver records and performance tracking
- ✅ Tracks expenses (fuel, maintenance, repairs)
- ✅ Calculates revenue and profitability per trip
- ✅ Generates analytics and reports
- ✅ Handles driver issue reporting
- ✅ Provides role-specific dashboards

---

## 🌟 Key Features

### 1. Vehicle Management
- Complete vehicle registry with specifications
- Maintenance scheduling and history
- Service status tracking (Available/In Service/Under Maintenance)
- Odometer tracking

### 2. Trip Management
- Digital trip logging with start/end locations
- Automatic odometer validation
- Trip status tracking (Scheduled/In Progress/Completed/Cancelled)
- Revenue and expense recording per trip

### 3. Driver Management
- Driver profiles with license information
- Duty status tracking (On Duty/Off Duty/On Leave/Suspended)
- Safety score monitoring
- Trip history and performance metrics

### 4. Expense Tracking
- Categorized expense recording (Fuel, Maintenance, Repair, Insurance, etc.)
- Expense approval workflow
- Cost analysis and reporting

### 5. Analytics & Reporting
- Dashboard with key metrics
- Fuel efficiency analysis
- Revenue vs. expense trends
- Trip profitability analysis
- Fleet-wide cost summaries
- Monthly financial reports

### 6. Issue Management
- Driver issue reporting system
- Severity classification (Low/Medium/High/Critical)
- Issue resolution workflow
- Status tracking (Open/In Progress/Resolved/Closed)

### 7. Multi-Tenant Architecture
- Organization-based data isolation
- Secure multi-user access
- Role-based permissions

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS v3
- **UI Components**: Custom components with Lucide Icons
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: Native HTML5 with client-side validation

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js v5
- **Email**: Nodemailer

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: .env configuration
- **Database Migrations**: Prisma Migrate

### Security
- **Password Hashing**: bcryptjs
- **Session Management**: NextAuth JWT
- **CSRF Protection**: Built-in Next.js
- **SQL Injection Prevention**: Prisma ORM
- **XSS Protection**: React's built-in escaping

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Landing Page]
        B[Authentication Pages]
        C[Role-Based Dashboards]
    end
    
    subgraph "Application Layer"
        D[Next.js App Router]
        E[API Routes]
        F[Middleware]
    end
    
    subgraph "Business Logic"
        G[Authentication Service]
        H[RBAC Service]
        I[Email Service]
        J[Data Services]
    end
    
    subgraph "Data Layer"
        K[Prisma ORM]
        L[(PostgreSQL Database)]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
    E --> G
    E --> H
    E --> I
    E --> J
    G --> K
    H --> K
    J --> K
    K --> L
    I -.->|SMTP| M[Email Server]
```

---

## 📁 Folder Structure

```
fleetflow/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── [...nextauth]/   # NextAuth handler
│   │   ├── vehicles/             # Vehicle CRUD
│   │   ├── drivers/              # Driver management
│   │   ├── trips/                # Trip management
│   │   ├── expenses/             # Expense tracking
│   │   ├── maintenance/          # Maintenance records
│   │   ├── complaints/           # Issue reporting
│   │   ├── users/                # User management
│   │   └── analytics/            # Analytics endpoints
│   ├── dashboard/                # Fleet Manager Dashboard
│   ├── dashboard-dispatcher/     # Dispatcher Dashboard
│   ├── dashboard-driver/         # Driver Dashboard
│   ├── dashboard-safety/         # Safety Officer Dashboard
│   ├── dashboard-financial/      # Financial Analyst Dashboard
│   ├── landing/                  # Landing page
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── forgot-password/          # Password recovery
│   └── reset-password/           # Password reset
├── components/                   # Reusable components
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── Sidebar.jsx
│   │   ├── DashboardNavbar.jsx
│   │   └── StatsCard.jsx
│   ├── HeroSection.jsx
│   ├── FeaturesSection.jsx
│   ├── LogisticsSection.jsx
│   ├── RolesSection.jsx
│   ├── StatsSection.jsx
│   ├── CTASection.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ThemeProvider.jsx
│   └── ThemeToggle.jsx
├── lib/                          # Utility libraries
│   ├── auth.js                   # NextAuth configuration
│   ├── email.js                  # Email service
│   └── prisma.js                 # Prisma client
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema definition
├── public/                       # Static assets
│   ├── logo.png
│   ├── fleet.jpg
│   └── logistic.jpg
├── middleware.js                 # Route protection & RBAC
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
├── jsconfig.json                 # JavaScript configuration
└── package.json                  # Dependencies
```

### Important Files

| File | Purpose |
|------|---------|
| `middleware.js` | Route protection, authentication checks, role-based redirects |
| `lib/auth.js` | NextAuth configuration, session management, JWT handling |
| `lib/email.js` | Email service for password reset and notifications |
| `prisma/schema.prisma` | Database schema with all models and relationships |
| `app/api/auth/login/route.js` | Custom login endpoint with credential validation |
| `components/dashboard/Sidebar.jsx` | Dynamic sidebar with role-based menu items |

---

## 🔐 Authentication & Email Flow

```mermaid
graph TB
    subgraph "User Actions"
        A[Login Request]
        B[Password Reset Request]
    end
    
    subgraph "API Layer"
        C["POST /api/auth/login"]
        D["POST /api/auth/forgot-password"]
        E["POST /api/auth/reset-password"]
    end
    
    subgraph "Services"
        F[NextAuth v5]
        G[Email Service]
        H[bcrypt]
    end
    
    subgraph "Data Layer"
        I[PostgreSQL Database]
    end
    
    subgraph "Access Control"
        J[Middleware]
        K[RBAC Check]
    end
    
    L[Dashboard]
    M[User Inbox]
    
    A --> C
    C --> H
    H --> I
    C --> F
    F --> J
    J --> K
    K --> L
    
    B --> D
    D --> I
    D --> G
    G -.->|Email| M
    M --> E
    E --> I
```

### Key Features:
- ✅ Email/Password authentication with bcrypt hashing
- ✅ JWT-based sessions via NextAuth v5
- ✅ Password reset via email (1-hour token expiry)
- ✅ Force password change on first login
- ✅ Role-based access control (RBAC)
- ✅ Session persistence & auto-refresh

---

## 🛡️ RBAC System

```mermaid
graph TD
    A[User Login] --> B{Check Role}
    
    B -->|FLEET_MANAGER| C[Fleet Manager Dashboard]
    B -->|DISPATCHER| D[Dispatcher Dashboard]
    B -->|DRIVER| E[Driver Dashboard]
    B -->|SAFETY_OFFICER| F[Safety Officer Dashboard]
    B -->|FINANCIAL_ANALYST| G[Financial Analyst Dashboard]
    
    C --> C1[Full Access]
    C1 --> C2[Vehicles CRUD]
    C1 --> C3[Users CRUD]
    C1 --> C4[All Analytics]
    C1 --> C5[Expenses Management]
    C1 --> C6[Settings]
    
    D --> D1[Limited Access]
    D1 --> D2[Trips CRUD]
    D1 --> D3[Drivers CRUD]
    D1 --> D4[Vehicles Read-Only]
    D1 --> D5[Resolve Issues]
    
    E --> E1[Minimal Access]
    E1 --> E2[My Trips]
    E1 --> E3[Report Issues]
    E1 --> E4[View Vehicle]
    E1 --> E5[Profile Only]
    
    F --> F1[Read-Only Access]
    F1 --> F2[View Vehicles]
    F1 --> F3[View Maintenance]
    F1 --> F4[View Issues]
    F1 --> F5[Safety Analytics]
    
    G --> G1[Financial Access]
    G1 --> G2[View Expenses]
    G1 --> G3[Revenue Reports]
    G1 --> G4[Trip Analysis]
    G1 --> G5[Fleet Summary]
```

### Role Permissions Matrix

| Feature | Fleet Manager | Dispatcher | Driver | Safety Officer | Financial Analyst |
|---------|--------------|------------|--------|----------------|-------------------|
| Vehicles CRUD | ✅ | ❌ (Read) | ❌ (Assigned) | ❌ (Read) | ❌ |
| Trips CRUD | ✅ | ✅ | ❌ (Complete) | ❌ (Read) | ❌ (Read) |
| Drivers CRUD | ✅ | ✅ | ❌ | ❌ (Read) | ❌ |
| Expenses CRUD | ✅ | ❌ | ❌ | ❌ (Read) | ❌ (Read) |
| Maintenance | ✅ | ❌ (Read) | ❌ | ❌ (Read) | ❌ |
| Users CRUD | ✅ | ❌ | ❌ | ❌ | ❌ |
| Issues | ✅ (Delete) | ✅ (Resolve) | ✅ (Create) | ❌ (Read) | ❌ |
| Analytics | ✅ (All) | ❌ | ❌ | ✅ (Safety) | ✅ (Financial) |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |



## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jenil1236/Fleet-Flow.git
cd Fleet-Flow/fleetflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

4. **Set up the database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=disable"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="FleetFlow <noreply@fleetflow.com>"

# App
NODE_ENV="development"
```

### Environment Variable Details

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/fleetflow` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Generate with `openssl rand -base64 32` |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `EMAIL_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | SMTP password/app password | `your-app-specific-password` |
| `EMAIL_FROM` | Sender email address | `FleetFlow <noreply@fleetflow.com>` |

---

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Update `DATABASE_URL` in `.env`
5. Run migrations: `npx prisma migrate dev`

### Using Local PostgreSQL

1. Install PostgreSQL
2. Create a database: `createdb fleetflow`
3. Update `DATABASE_URL` in `.env`
4. Run migrations: `npx prisma migrate dev`

### Database Schema

The database includes the following main models:
- `User` - User accounts with authentication
- `Organization` - Multi-tenant organizations
- `Vehicle` - Fleet vehicles
- `DriverProfile` - Driver information
- `Trip` - Trip records
- `Expense` - Expense tracking
- `Maintenance` - Maintenance records
- `Complaint` - Driver issue reports

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### Vehicles
```
GET    /api/vehicles/list          # List all vehicles
POST   /api/vehicles/create        # Create vehicle
GET    /api/vehicles/[id]          # Get vehicle details
PUT    /api/vehicles/[id]/update   # Update vehicle
POST   /api/vehicles/[id]/toggle-service  # Toggle service status
```

### Drivers
```
GET    /api/drivers/list           # List all drivers
PUT    /api/drivers/[id]/update    # Update driver
```

### Trips
```
GET    /api/trips/list             # List all trips
POST   /api/trips/create           # Create trip
POST   /api/trips/[id]/complete    # Complete trip
POST   /api/trips/[id]/cancel      # Cancel trip
```

### Expenses
```
GET    /api/expenses/list          # List all expenses
POST   /api/expenses/create        # Create expense
```

### Maintenance
```
GET    /api/maintenance/list       # List maintenance records
POST   /api/maintenance/create     # Create maintenance record
POST   /api/maintenance/[id]/close # Close maintenance
```

### Complaints (Issues)
```
GET    /api/complaints/list        # List all issues
POST   /api/complaints/create      # Create issue
GET    /api/complaints/[id]        # Get issue details
POST   /api/complaints/[id]/resolve # Resolve issue
DELETE /api/complaints/[id]        # Delete issue (soft delete)
```

### Analytics
```
GET    /api/analytics/dashboard    # Dashboard metrics
GET    /api/analytics/fuel-efficiency  # Fuel efficiency data
GET    /api/analytics/monthly-summary  # Monthly summary
```

### Users
```
GET    /api/users/list             # List all users
POST   /api/users/create           # Create user
```

---

## 👥 Role-Based Dashboards

### 1. Fleet Manager Dashboard (`/dashboard`)
**Full system access**
- Overview with key metrics
- Vehicle management (CRUD)
- User management (CRUD)
- Expense tracking
- Maintenance scheduling
- Complete analytics
- System settings

### 2. Dispatcher Dashboard (`/dashboard-dispatcher`)
**Trip-centric operations**
- Trip management (Create, Complete, Cancel)
- Driver management (Create, Edit)
- Vehicle viewing (Read-only)
- Issue resolution
- Maintenance viewing

### 3. Driver Dashboard (`/dashboard-driver`)
**Execution-focused**
- My trips (View, Complete)
- Assigned vehicle info
- Issue reporting
- Personal profile

### 4. Safety Officer Dashboard (`/dashboard-safety`)
**Safety monitoring**
- Vehicle status (Read-only)
- Maintenance records (Read-only)
- Driver issues (Read-only)
- Expense viewing
- Safety analytics

### 5. Financial Analyst Dashboard (`/dashboard-financial`)
**Financial oversight**
- Revenue analysis
- Expense tracking
- Trip profitability
- Fleet cost summary
- Financial reports

---

<div align="center">

**Built with ❤️ for fleet operators worldwide**

[GitHub Repository](https://github.com/jenil1236/Fleet-Flow)

</div>
