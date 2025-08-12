# Overview

Innovative Task Earn is a video monetization platform designed to reward users for watching videos. It integrates user authentication, video management, earnings tracking, a referral program, and administrative controls. The platform's core vision is to provide a sustainable income stream for users by engaging with video content, while ensuring content consumption is genuine through strict viewing rules. Key capabilities include comprehensive user verification (KYC), efficient payout management, real-time support, and complete company pages structure with professional corporate presence.

## Recent Status Update (August 11, 2025)
**Status:** Demo mode disabled, restored full database functionality
- Removed all demo mode fallback systems and sample data
- Restored original database architecture with PostgreSQL integration
- All APIs now connect directly to database without fallbacks
- Session system restored to PostgreSQL-based storage
- All core features now use authentic database data

# User Preferences

Preferred communication style: Simple, everyday language.
Platform focus: Optimized for laptop/desktop users with comprehensive workflow documentation.

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
- **Video Watching**: Complete, non-skippable viewing required.
- **Daily Targets**: 8-hour minimum watch time.
- **Earnings**: Per-video earnings credited upon completion.
- **Referral Program**: ₹49 bonus per verified referral.
- **KYC Verification**: Document upload, submission, mandatory ₹99 processing fee, and admin approval for payout access.
- **Payout System**: Weekly batch processing on Tuesdays (requires completed KYC).
- **Account Suspension**: For KYC-completed users failing 8-hour daily watch targets for 3 consecutive days, requiring a ₹49 reactivation fee.

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