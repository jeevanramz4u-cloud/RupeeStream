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
- **Established clear KYC verification flow with payment requirement (August 2025)**
- Users can sign up normally and access basic features immediately
- All new users start with 'pending' KYC status requiring document upload + ₹99 fee payment
- Users must complete KYC verification process (documents + payment) to access payout features
- KYC completion flow: Upload documents → Submit → Pay ₹99 processing fee → Admin approval
- Payment of ₹99 fee is mandatory for KYC completion and payout access
- **Fixed KYC completion UI and workflow (August 2025)**
- Added prominent Quick Actions section showing clear "Upload Documents" and "Pay ₹99 Fee" steps
- Fixed KYC status detection to properly recognize completed users (fee paid + verified status)
- Document upload functionality confirmed working with proper error handling and debugging
- Processing fee prominently displayed in multiple locations throughout KYC page
- Completed users now see green "KYC Completed!" message with 100% progress bar
- Hidden action buttons for users who have already completed verification process
- **Implemented Real Cashfree Payment Integration and Enhanced Mobile UI (August 2025)**
- Replaced simulated payment system with authentic Cashfree API calls to prevent payment bypass
- Added proper HTTP-based Cashfree integration with real order creation and payment verification
- Enhanced mobile responsiveness across KYC forms, admin panel, and user interfaces
- Improved touch-friendly UI elements with better spacing and tap targets for mobile devices
- Added payment success/failure handling with proper URL redirects and user notifications
- Secured payment flow now requires actual Cashfree gateway completion for KYC verification
- **Fixed KYC Status Display Logic and Mobile Button Design (August 2025)**
- Corrected "Under Review" status to only show for users who have completed verification (verified status)
- Changed KYC button text from "Pay ₹99 via Cashfree & Complete KYC" to mobile-friendly "Complete KYC"
- Enhanced mobile responsiveness with better text scaling, padding, and touch-friendly interactions
- Fixed admin panel re-verification buttons to show for all users regardless of status
- Improved KYC form conditional display logic to prevent showing form when documents are under review
- **Optimized database for 200k+ users with permanent earnings history (August 2025)**
- Added comprehensive database indexes for performance at scale (earnings, video progress, payouts, users)
- Implemented permanent data retention policy - earnings history never deleted
- Fixed daily watch time calculation to track incremental progress instead of total time repeatedly
- Database schema now supports millions of earnings records with efficient query performance
- Created data retention policy ensuring compliance and permanent user history preservation
- **Implemented account suspension system with ₹49 reactivation fee (August 2025)**
- Suspension system only applies to KYC-completed users (approved + verified status)
- Users who fail to meet 8-hour daily watch targets for 3 consecutive days get suspended
- Suspended accounts require ₹49 reactivation fee payment to restore access
- Progressive warning system alerts users at risk (1-2 missed days)
- Admin panel includes suspension management tools and compliance checking
- Automatic daily compliance monitoring for all eligible users
- **Fixed referral system with automatic payment processing (August 2025)**
- Referral signup process working correctly with proper code tracking
- Admin verification now automatically pays ₹49 to referrers when users get verified
- Referral history displays actual user names instead of generic IDs
- Enhanced status tracking: "Earned ₹49", "Verified", "KYC Pending", "Pending Verification"
- Referral links format corrected to `/signup?ref=CODE` for proper code application
- Complete end-to-end referral flow tested and operational
- **Fixed persistent notification spam issues (August 2025)**
- Removed repetitive hourly login bonus notifications that showed repeatedly
- Disabled automatic KYC completion success alerts for verified users
- Fixed infinite API call issue from SuspensionAlert component
- Bonus earnings still credited automatically without persistent UI notifications
- **Fixed KYC payment bypass issue (August 2025)**
- Disabled legacy direct payment endpoint that was allowing KYC completion without actual payment
- Enforced Cashfree payment gateway integration for all KYC fee processing
- Replaced instant payment completion with proper payment session creation and verification flow
- Updated KYC form to use createPaymentMutation and verifyPaymentMutation for secure payments
- **Enhanced admin panel professionalism for KYC completed users (August 2025)**
- Fixed admin panel showing KYC-completed users as "pending" with unnecessary approve options
- Added professional "KYC Completed" badge for users who paid ₹99 fee and completed verification
- Removed approve/reject buttons for users who already completed KYC verification process
- Enhanced status detection to properly recognize completed users (kycFeePaid + kycStatus approved)
- Added informational message explaining KYC completion status in user detail views
- Filtered pending verification lists to exclude already-completed KYC users
- **Fixed payment history display in admin panel with complete transaction tracking (August 2025)**
- Resolved payment history visibility issues with improved user data joins and error handling
- Enhanced payment transaction display with detailed user information, timestamps, and order IDs  
- Added comprehensive payment records for both KYC (₹99) and reactivation (₹49) fees
- Universal API authentication support for all payment processing endpoints
- Suspended page access control: only suspended users can access /suspended, others redirected
- Automatic account reactivation after ₹49 payment with real-time admin panel status updates
- **Fixed suspension fee payment reactivation issue (August 2025)**
- Added missing verification endpoint `/api/account/verify-reactivation-payment` for automatic account reactivation
- Implemented `getPaymentByOrderId` storage method for payment verification and fallback handling
- Fixed bug where users remained suspended despite successful ₹49 reactivation fee payment
- Account status now properly updates from 'suspended' to 'active' after payment completion
- Enhanced payment verification with both Cashfree API and local payment history fallback checks

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
- **KYC Verification Process**: 
  - Upload government ID documents (front, back, selfie)
  - Submit documents for review
  - Pay mandatory ₹99 processing fee
  - Admin approval required for payout access
- **Payout System**: Weekly batch processing on Tuesdays (requires completed KYC)

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