# Technology Stack

## Framework & Runtime
- **Next.js 15.2.0** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5.8.3** - Type safety and development experience
- **Node.js** - Runtime environment

## Database & Backend
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and user management
- **Server Actions** - Next.js server-side data mutations

## State Management
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management and caching
- **React Hook Form** - Form state and validation

## UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Shadcn/ui** - Pre-built component library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## Development Tools
- **Turbopack** - Fast bundler for development
- **ESLint** - Code linting with Antfu config
- **Vitest** - Testing framework
- **TypeScript** - Static type checking

## Build & Deployment
- **Standalone output** - Optimized for containerization
- **Security headers** - XSS protection, frame options, content type sniffing prevention

## Common Commands

### Development
```bash
bun run dev          # Start development server with Turbopack
bun run build        # Build for production
bun run start        # Start production server
```

### Code Quality
```bash
bun run typecheck    # TypeScript type checking
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues automatically
```

### Testing
```bash
bun run test         # Run tests
bun run test:ui      # Run tests with UI
```

## Package Manager
- **bun** - Primary package manager (bun.lock suggests Bun compatibility)
