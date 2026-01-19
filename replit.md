# Spark - Dating App

## Overview

Spark is a mobile-first dating application built with a modern TypeScript full-stack architecture. The app features Tinder-style swipe mechanics for discovering potential matches, real-time messaging between matched users, and user profile management. The application uses a React frontend with Framer Motion for gesture-based interactions, an Express backend with PostgreSQL for data persistence, and supports both Replit Auth and Supabase authentication mechanisms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (pink/orange gradient brand colors)
- **Animations**: Framer Motion for swipe gestures and transitions
- **Build Tool**: Vite with path aliases (`@/` for client, `@shared/` for shared code)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod with drizzle-zod integration
- **Session Management**: express-session with connect-pg-simple for PostgreSQL-backed sessions
- **API Design**: REST endpoints defined in `shared/routes.ts` with typed request/response schemas

### Authentication
- **Primary**: Replit Auth integration using OpenID Connect (OIDC)
  - Passport.js with custom OIDC strategy
  - Session-based authentication stored in PostgreSQL
- **Secondary**: Supabase Auth (client-side hooks present for magic link/OTP login)
- **Protected Routes**: `isAuthenticated` middleware guards API endpoints

### Data Models
- **Users**: Core identity with email, name, profile image
- **Profiles**: Dating-specific info (age, gender, city, bio, photos array)
- **Swipes**: Records user interactions (LIKE/PASS) with targets
- **Matches**: Created when two users mutually LIKE each other
- **Messages**: Chat messages between matched users
- **Sessions**: PostgreSQL-backed session storage

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route pages (Home, Matches, Chat, Profile, etc.)
    hooks/        # Custom React hooks
    lib/          # Utilities, API client, Supabase client
server/           # Express backend
  replit_integrations/auth/  # Replit Auth setup
shared/           # Shared code between frontend/backend
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
  models/         # Shared TypeScript models
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Database schema management and queries
- **Drizzle Kit**: Database migrations (`db:push` command for schema sync)

### Authentication Services
- **Replit Auth**: OIDC-based authentication (requires `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`)
- **Supabase**: Optional auth backend (requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation and gesture handling
- `wouter`: Client-side routing
- `passport` + `openid-client`: Authentication
- `express-session` + `connect-pg-simple`: Session management
- `zod`: Runtime type validation
- `drizzle-orm` + `drizzle-zod`: Database ORM with schema validation

### Development Tools
- `tsx`: TypeScript execution for development
- `esbuild`: Production server bundling
- `vite`: Frontend development server and build