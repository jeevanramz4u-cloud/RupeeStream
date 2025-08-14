# Overview

Innovative Task Earn is a comprehensive task completion platform designed to reward users for completing simple online tasks. It integrates user authentication, task management, earnings tracking, a referral program, and administrative controls. The platform's core vision is to provide a sustainable income stream for users by completing tasks like app downloads, business reviews, product reviews, channel subscriptions, and social media activities. Key capabilities include comprehensive user verification (KYC), efficient payout management, real-time support, admin task management, and complete company pages structure with professional corporate presence.

## Recent Status Update (August 14, 2025)
**Status:** Complete platform transformation and legal compliance implementation
- ✅ Built comprehensive task management system with 5 categories (App Downloads, Business Reviews, Product Reviews, Channel Subscribe, Comments & Likes)
- ✅ Implemented admin task creation and approval workflow
- ✅ Updated dashboard from video-focused to task-focused metrics
- ✅ Transformed landing page content and How to Earn guide for task completion
- ✅ Updated FAQ section to reflect task-based earning system
- ✅ Maintained all existing features (KYC, payments, referrals, admin panel)
- ✅ Sample tasks available for demo with earnings ₹10-40 per task
- ✅ Complete legal compliance implementation with proper business entity
- ✅ Updated all policies with INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED details
- ✅ Added Shipping & Delivery Policy and Refund & Cancellation Policy
- ✅ Updated About Us, Contact Us, Privacy Policy, and Terms & Conditions
- ✅ All pages reflect GST number (06AAGCI9044P1ZZ) and business address
- ✅ Enhanced button system with responsive design and mobile-friendly interactions
- ✅ Fixed user profile authentication flow with demo credentials (demo@innovativetaskearn.online / demo123)
- ✅ Standardized button alignment and device optimization across all pages
- Platform fully operational as task completion website with complete legal framework
- Database endpoint disabled - using memory-based sessions with sample data for demonstration

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
- **Task Completion**: 5 categories - App Downloads (₹15-25), Business Reviews (₹30-35), Product Reviews (₹25-40), Channel Subscribe (₹15-20), Comments & Likes (₹10-15).
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