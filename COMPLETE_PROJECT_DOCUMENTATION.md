# EarnPay - Complete Project Documentation

## Project Overview
EarnPay is a comprehensive video monetization platform that allows users to earn money by watching videos. The platform features user authentication, KYC verification, payment processing, referral programs, and administrative controls.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom animations
- **State Management**: TanStack Query (React Query v5)
- **Routing**: Wouter (lightweight router)
- **Form Handling**: React Hook Form with Zod validation
- **File Uploads**: Uppy.js integration
- **Icons**: Lucide React icons

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM with Zod integration
- **Authentication**: OpenID Connect (OIDC) with Replit Auth
- **Sessions**: Express sessions with PostgreSQL store
- **Real-time**: WebSockets for chat functionality
- **File Storage**: Google Cloud Storage with custom ACL
- **Payment Gateway**: Cashfree Payment Gateway

## Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  profile_image_url TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  referral_code VARCHAR(20) UNIQUE,
  referred_by_code VARCHAR(20),
  kyc_status VARCHAR(20) DEFAULT 'pending',
  kyc_submitted_at TIMESTAMP,
  kyc_approved_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  suspension_reason TEXT,
  suspended_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL, -- in seconds
  earnings_per_view DECIMAL(5,2) NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video Progress table
CREATE TABLE video_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  watch_time INTEGER DEFAULT 0, -- in seconds
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  earnings_credited DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Earnings table
CREATE TABLE earnings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'video_watch', 'referral_bonus', 'login_bonus'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payouts table
CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  bank_details JSONB,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  notes TEXT
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (for express-session)
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
```

## API Endpoints

### Authentication Routes
```
POST /api/auth/login - User login
POST /api/auth/logout - User logout  
GET /api/auth/check - Check authentication status
POST /api/auth/signup - User registration
GET /api/auth/replit/callback - OIDC callback
```

### User Management
```
GET /api/user/profile - Get user profile
PUT /api/user/profile - Update user profile
POST /api/user/upload-avatar - Upload profile picture
GET /api/user/earnings - Get user earnings history
GET /api/user/payouts - Get payout history
POST /api/user/request-payout - Request payout
```

### KYC Routes
```
GET /api/kyc/status - Get KYC status
POST /api/kyc/submit - Submit KYC documents
POST /api/kyc/payment - Process KYC fee (₹99)
GET /api/admin/kyc/pending - Get pending KYC submissions
POST /api/admin/kyc/approve/:userId - Approve KYC
POST /api/admin/kyc/reject/:userId - Reject KYC
```

### Video Management
```
GET /api/videos - Get available videos
GET /api/videos/:id - Get specific video
POST /api/videos/:id/progress - Update watch progress
POST /api/videos/:id/complete - Mark video as completed
POST /api/admin/videos - Create new video
PUT /api/admin/videos/:id - Update video
DELETE /api/admin/videos/:id - Delete video
```

### Referral System
```
GET /api/referrals - Get user referrals
POST /api/referrals/apply-code - Apply referral code
GET /api/referrals/stats - Get referral statistics
```

### Payment Processing
```
POST /api/payments/cashfree/create-order - Create Cashfree order
POST /api/payments/cashfree/verify - Verify payment
POST /api/payments/reactivation - Process reactivation fee (₹49)
```

### Admin Routes
```
GET /api/admin/users - Get all users
GET /api/admin/users/:id - Get specific user
PUT /api/admin/users/:id - Update user
POST /api/admin/users/:id/suspend - Suspend user
POST /api/admin/users/:id/reactivate - Reactivate user
GET /api/admin/analytics - Get platform analytics
GET /api/admin/payments - Get payment history
```

## Key Features Implementation

### 1. Video Watching System
- Complete video viewing required (no skipping)
- Progress tracking in real-time
- Earnings credited only on completion
- 8-hour daily watch time requirement
- Automatic suspension after 3 consecutive days of missed targets

### 2. KYC Verification System
- Document upload (ID proof, address proof, bank details)
- ₹99 processing fee via Cashfree
- Admin approval workflow
- Required for payout access

### 3. Referral Program
- Unique referral codes for each user
- ₹49 bonus when referred user completes KYC
- Tracking and analytics

### 4. Suspension & Reactivation
- Automatic suspension for missing daily targets
- ₹49 reactivation fee
- Suspended users redirected to /suspended page

### 5. Payment Integration
- Cashfree Payment Gateway
- Support for UPI, cards, net banking
- Secure payment verification

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
OIDC_CLIENT_ID=your_replit_client_id
OIDC_CLIENT_SECRET=your_replit_client_secret
SESSION_SECRET=your_secure_session_secret

# Cashfree Payment Gateway
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_BUCKET_NAME=your_bucket_name

# Frontend (Vite env vars)
VITE_API_BASE_URL=http://localhost:5000
VITE_CASHFREE_ENV=SANDBOX # or PRODUCTION
```

## File Structure

```
project/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── landing.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── videos.tsx
│   │   │   ├── kyc.tsx
│   │   │   ├── earnings.tsx
│   │   │   ├── referrals.tsx
│   │   │   ├── suspended.tsx
│   │   │   └── admin/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── use-toast.ts
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   └── App.tsx
├── server/
│   ├── routes.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── replitAuth.ts
│   ├── cashfree.ts
│   ├── objectStorage.ts
│   ├── suspensionSystem.ts
│   └── index.ts
├── shared/
│   └── schema.ts
└── package.json
```

## Key Package Dependencies

### Frontend
```json
{
  "@radix-ui/react-*": "latest",
  "@tanstack/react-query": "^5.0.0",
  "@hookform/resolvers": "latest",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "react-hook-form": "latest",
  "wouter": "latest",
  "tailwindcss": "latest",
  "lucide-react": "latest",
  "zod": "latest",
  "@uppy/core": "latest",
  "@uppy/dashboard": "latest",
  "@uppy/aws-s3": "latest"
}
```

### Backend
```json
{
  "express": "latest",
  "drizzle-orm": "latest",
  "drizzle-kit": "latest",
  "@neondatabase/serverless": "latest",
  "express-session": "latest",
  "connect-pg-simple": "latest",
  "bcryptjs": "latest",
  "ws": "latest",
  "cashfree-pg": "latest",
  "@google-cloud/storage": "latest",
  "openid-client": "latest",
  "zod": "latest",
  "typescript": "latest",
  "tsx": "latest"
}
```

## Business Logic Rules

### Daily Watch Time Requirements
- KYC-completed users must watch 8 hours of videos daily
- Consecutive failures for 3 days result in automatic suspension
- Suspended users can reactivate by paying ₹49

### Earnings Structure
- Per-video earnings: ₹5-15 based on video length and category
- Login bonus: ₹10 per day
- Referral bonus: ₹49 when referred user completes KYC
- Minimum payout: ₹100

### KYC Process
1. User uploads required documents
2. Pays ₹99 processing fee via Cashfree
3. Admin reviews and approves/rejects
4. Approved users can request payouts

### Payout Schedule
- Weekly payouts every Tuesday
- Processed via bank transfer
- Requires completed KYC verification

## Security Considerations

1. **Authentication**: OIDC with secure session management
2. **Data Validation**: Zod schemas for all inputs
3. **File Uploads**: Secure cloud storage with ACL
4. **Payment Security**: Cashfree's secure payment processing
5. **SQL Injection**: Prevented by Drizzle ORM
6. **CORS**: Properly configured for frontend-backend communication

## Mobile-First Design

- Responsive design with Tailwind CSS
- Touch-friendly interface elements
- Mobile navigation with hamburger menu
- Optimized for mobile video watching experience
- Bottom navigation for easy thumb access

## Admin Panel Features

1. **User Management**: View, suspend, reactivate users
2. **KYC Approval**: Review and approve KYC submissions
3. **Video Management**: Add, edit, remove videos
4. **Payment Tracking**: Monitor all transactions
5. **Analytics Dashboard**: User engagement metrics
6. **Support System**: Real-time chat with users

This documentation provides everything needed to recreate the EarnPay platform with any AI provider. The architecture is scalable, secure, and follows modern web development best practices.