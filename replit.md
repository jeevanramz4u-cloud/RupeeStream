# Overview

EarnPay is a video monetization platform where users earn money by watching videos. The application implements a comprehensive system with user authentication, video management, earnings tracking, referral programs, and administrative controls. Users must watch videos completely (no skipping/fast-forwarding) and meet daily targets to maintain account status. The platform includes verification processes, payout management, and real-time chat support.

## Recent Changes (January 2025)
- Fixed all TypeScript import path issues in App.tsx and admin components
- Resolved admin page accessibility and functionality issues  
- Updated database schema with proper type definitions and pushed changes
- Admin panel now fully functional with user verification, video management, payouts, and analytics
- Object storage integration working for file uploads and document management
- All major components and pages are operational and error-free
- Implemented YouTube video support with automatic thumbnail extraction
- Enhanced video player to handle ad blocker restrictions with alternative viewing options
- Fixed authentication issues by switching video progress APIs to traditional auth
- Video completion system working with manual completion for YouTube videos
- **Added comprehensive KYC verification system with ₹99 processing fee**
- Created 6-step KYC process: ID info → Front upload → Back upload → Selfie → Submit → Payment
- Integrated ObjectUploader component for secure document uploads via object storage
- Added KYC navigation to header and prominent alerts on dashboard for incomplete users
- Database includes KYC fields: status, fee payment tracking, and document URLs
- KYC routes and storage methods implemented for document management
- **Implemented professional KYC workflow with status-based UI**
- Upload options hidden after submission until admin decline (professional workflow)
- "Waiting for approval" status shown after payment completion
- "KYC completed" message with payout access after admin approval
- Dashboard shows contextual alerts based on KYC status (pending, submitted, approved, rejected)
- Clean card-based design matching videos page layout
- **Enhanced admin panel with comprehensive KYC fee payment visibility**
- Added dedicated "KYC Status" tab in admin panel showing fee payment statistics and detailed user status
- Fee payment indicators throughout admin interface (user lists, detailed views, profile management)
- Real-time tracking of KYC processing fee revenue with clear visual indicators for paid/unpaid users
- Enhanced user verification workflow with fee status integration across all admin views
- **Implemented automatic KYC approval upon payment completion**
- KYC verification now automatically approved when user completes ₹99 processing fee
- Eliminated manual admin approval step for streamlined user experience
- Payment success immediately updates both kycStatus to 'approved' and verificationStatus to 'verified'
- KYC page shows instant approval confirmation and enables payout access
- **Added comprehensive user profile deletion functionality for administrators**
- Admin panel now includes "Delete Profile" button for complete user account removal
- Deletion process removes all associated data: earnings, video progress, referrals, payouts, and chat messages
- Confirmation dialog warns administrators about permanent data deletion
- Maintains database referential integrity during deletion process
- **Fixed signup bonus duplication issue (August 2025)**
- Corrected signup process that was awarding ₹2000 instead of ₹1000
- Set initial user balance to ₹0.00 with ₹1000 added via earning record to prevent double bonus
- Signup bonus now correctly awards exactly ₹1000 as intended
- **Removed verification step from user signup (August 2025)**
- Users are now automatically verified upon signup without admin approval
- Default verification status changed from 'pending' to 'verified' 
- Default KYC status changed from 'pending' to 'approved'
- Users can immediately access all platform features after creating account

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Uploads**: Uppy integration for file management with AWS S3 support

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: OpenID Connect (OIDC) with Replit Auth integration
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket support for chat functionality
- **File Storage**: Google Cloud Storage with custom ACL (Access Control List) system
- **API Design**: RESTful endpoints with comprehensive error handling

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Structure**:
  - Users table with verification status, bank details, and referral codes
  - Videos table with metadata, earnings, and categories
  - Video progress tracking for watch time validation
  - Earnings and payout request management
  - Chat messages for support system
  - Session storage for authentication

## Authentication & Authorization
- **Provider**: Replit OIDC integration
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Role-based access control (user/admin roles)
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

## Key Business Logic
- **Video Watching Rules**: Complete viewing required, no skipping/fast-forwarding allowed
- **Daily Targets**: 8-hour minimum daily watch time requirement
- **Earnings System**: Per-video earnings with automatic credit after completion
- **Referral Program**: Fixed ₹49 bonus for successful referrals
- **Verification Process**: Manual admin review of government ID documents
- **Payout System**: Weekly batch processing on Tuesdays

## File Management
- **Storage Backend**: Google Cloud Storage
- **Upload Strategy**: Direct-to-cloud uploads with presigned URLs
- **Access Control**: Custom ACL system with group-based permissions
- **Supported Operations**: Object upload, download, and access management

# External Dependencies

## Cloud Services
- **Neon Database**: PostgreSQL serverless hosting for primary data storage
- **Google Cloud Storage**: Object storage for video files and user documents
- **Replit Infrastructure**: Development environment and deployment platform

## Authentication
- **Replit OIDC**: OpenID Connect provider for user authentication
- **Replit Sidecar**: Token exchange service for Google Cloud Storage credentials

## Third-party Libraries
- **Radix UI**: Accessible component primitives for UI elements
- **TanStack Query**: Server state management and caching
- **Uppy**: File upload handling with dashboard interface
- **Drizzle ORM**: Type-safe database operations and migrations
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form state management and validation

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production builds