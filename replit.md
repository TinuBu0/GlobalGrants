# OIMF Grant Management Platform

## Overview
This is a full-stack web application for the Oldies International Monetary Foundation (OIMF), providing a comprehensive grant management system. The platform allows users to discover, apply for, and manage grants across multiple countries and categories. Built with modern technologies including React, Express, and PostgreSQL, the system features authentication through Replit's OIDC system and provides a responsive user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom OIMF brand colors and theming
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with OpenID Connect strategy for Replit integration
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Tables**:
  - `users`: User profiles and authentication data
  - `countries`: Supported countries for grant programs
  - `grants`: Grant opportunities with categories and amounts
  - `applications`: User grant applications with status tracking
  - `sessions`: Session storage for authentication
  - `contact_messages`: User inquiries and support requests

### Authentication & Authorization
- **Provider**: Replit OIDC (OpenID Connect) for seamless integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTPS-only cookies, CSRF protection, and secure session handling
- **User Management**: Automatic user creation/updates from OIDC claims

### Data Flow & API Structure
- **Public Routes**: Country listings, grant browsing, contact forms
- **Protected Routes**: User dashboard, grant applications, profile management
- **Data Validation**: Shared Zod schemas between frontend and backend
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Request/response logging for API endpoints

### Development & Deployment
- **Development**: Hot module replacement with Vite dev server
- **Build Process**: Separate client and server builds with esbuild
- **Environment**: Replit-optimized with cartographer and error overlay plugins
- **Database**: Automatic provisioning with environment variable configuration

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL for serverless database hosting
- **Authentication**: Replit OIDC service for user authentication
- **Session Store**: PostgreSQL session storage via connect-pg-simple

### Frontend Libraries
- **UI Framework**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Hookform Resolvers for validation
- **Date Handling**: date-fns for date manipulation and formatting

### Backend Services
- **Database Driver**: @neondatabase/serverless for PostgreSQL connections
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with openid-client for OIDC integration
- **Session Management**: express-session with connect-pg-simple store
- **Validation**: Zod for runtime type checking and schema validation

### Development Tools
- **Build Tool**: Vite for frontend development and building
- **TypeScript**: Full TypeScript support across frontend and backend
- **Replit Integration**: Custom plugins for development environment
- **Database Tools**: Drizzle Kit for schema management and migrations