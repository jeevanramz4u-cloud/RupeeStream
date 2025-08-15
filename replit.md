# Overview

Innovative Task Earn is a comprehensive task completion platform designed to reward users for completing simple online tasks. It integrates user authentication, task management, earnings tracking, a referral program, and administrative controls. The platform's core vision is to provide a sustainable income stream for users by completing tasks like app downloads, business reviews, product reviews, channel subscriptions, and social media activities. Key capabilities include comprehensive user verification (KYC), efficient payout management, real-time support, admin task management, and complete company pages structure with professional corporate presence.

## Recent Status Update (August 15, 2025)  
**Status:** Complete advertiser inquiry and contact form systems implemented, platform fully operational with comprehensive business inquiry management
- ✅ Built comprehensive task management system with 6 categories (App Downloads, Business Reviews, Product Reviews, Channel Subscribe, Comments & Likes, YouTube Video View)
- ✅ Implemented admin task creation and approval workflow
- ✅ Updated dashboard from video-focused to task-focused metrics
- ✅ Transformed landing page content and How to Earn guide for task completion
- ✅ Updated FAQ section to reflect task-based earning system
- ✅ Maintained all existing features (KYC, payments, referrals, admin panel)
- ✅ Complete legal compliance implementation with proper business entity
- ✅ Updated all policies with INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED details
- ✅ Added Shipping & Delivery Policy and Refund & Cancellation Policy
- ✅ Updated About Us, Contact Us, Privacy Policy, and Terms & Conditions
- ✅ All pages reflect GST number (06AAGCI9044P1ZZ) and business address
- ✅ Enhanced button system with responsive design and mobile-friendly interactions
- ✅ Configured KYC payment system to use Cashfree PRODUCTION API for real ₹99 transactions
- ✅ Added secure webhook support for production payment notifications
- ✅ **MODE TOGGLE SYSTEM**: Development mode with sample data fallbacks, production mode with real database
- ✅ **DEVELOPMENT MODE**: Memory sessions, sample tasks, simulated operations when database unavailable
- ✅ **PRODUCTION MODE**: PostgreSQL sessions, real database required, no fallbacks
- ✅ **EASY SWITCHING**: Use APP_MODE=production environment variable or switch-to-production.sh script
- ✅ **SMART FALLBACKS**: Development mode gracefully handles database connection issues
- ✅ **COMPREHENSIVE TESTING**: All user flows, admin panel, payment systems, and API endpoints tested
- ✅ **TEST USERS CREATED**: John Doe (fully verified), Alex Kumar (suspended), plus 4 additional test accounts
- ✅ **PAYMENT INTEGRATION**: Cashfree production API working for both KYC (₹99) and reactivation (₹49) payments
- ✅ **LIVE CHAT SYSTEM**: Complete implementation with FAQ system, real-time messaging, admin management
- ✅ **FAQ SYSTEM**: 7 comprehensive questions across 4 categories with rating and analytics
- ✅ **ADMIN LIVE CHAT**: Full management panel at /admin/live-chat with team member invitations
- ✅ **FLOATING CHAT WIDGET**: Accessible from all authenticated pages with FAQ browsing and live support
- ✅ **ADVERTISER INQUIRY SYSTEM**: Complete business inquiry form with campaign details, budget, and contact information
- ✅ **CONTACT FORM SYSTEM**: Fully functional contact page with category selection, validation, and success confirmation
- ✅ **ADMIN INQUIRY MANAGEMENT**: Comprehensive admin page at /admin/inquiries for managing advertiser and contact inquiries
- ✅ **BACKEND API INTEGRATION**: All CRUD operations for inquiries with development mode fallbacks and error handling
- Platform supports both development testing and production deployment with single codebase

# User Preferences

Preferred communication style: Simple, everyday language.
Platform focus: Optimized for laptop/desktop users with comprehensive workflow documentation.
Domain preference: innovativetaskearn.online

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **UI/Styling**: Radix UI components, shadcn/ui, and Tailwind CSS
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **File Uploads**: Uppy integration

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **Authentication**: OpenID Connect (OIDC) with Replit Auth
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSockets for chat
- **File Storage**: Google Cloud Storage with custom ACL
- **API Design**: RESTful

## Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Schema**: Users, Videos, Video Progress, Earnings, Payouts, Chat Messages, Sessions.

## Authentication & Authorization
- **Provider**: Replit OIDC
- **Session Storage**: PostgreSQL-backed sessions (7-day TTL)
- **Authorization**: Role-based access control (user/admin)
- **Security**: HTTP-only cookies, CSRF protection

## Key Business Logic
- **Task Completion**: 6 categories - App Downloads (₹5-25), Business Reviews (₹5-35), Product Reviews (₹5-40), Channel Subscribe (₹5-20), Comments & Likes (₹5-15), YouTube Video View (₹5-30).
- **Proof Submission**: Users submit screenshots/proof for admin approval.
- **Earnings**: Per-task earnings credited upon admin approval (5-20 minutes per task).
- **Referral Program**: ₹49 bonus per verified referral.
- **KYC Verification**: Document upload, submission, mandatory ₹99 processing fee, and admin approval for payout access.
- **Payout System**: Weekly batch processing on Tuesdays (requires completed KYC).
- **Account Management**: Professional task-based earning system with comprehensive admin oversight.

## File Management
- **Storage Backend**: Google Cloud Storage
- **Upload Strategy**: Direct-to-cloud with presigned URLs
- **Access Control**: Custom ACL with group-based permissions

# External Dependencies

## Cloud Services
- **Neon Database**: PostgreSQL hosting.
- **Google Cloud Storage**: Object storage for video files and user documents.
- **Replit Infrastructure**: Development and deployment platform.

## Authentication
- **Replit OIDC**: OpenID Connect provider.
- **Replit Sidecar**: Token exchange for Google Cloud Storage credentials.

## Third-party Integrations
- **Cashfree**: Payment gateway for KYC and reactivation fees.

## Libraries & Tools
- **Radix UI**: UI component primitives.
- **TanStack Query**: Server state management.
- **Uppy**: File upload handling.
- **Drizzle ORM**: Type-safe database operations.
- **Wouter**: Client-side routing.
- **React Hook Form**: Form management and validation.
- **Vite**: Frontend build tool.
- **TypeScript**: Language.
- **Tailwind CSS**: CSS framework.
- **ESBuild**: Backend bundling.