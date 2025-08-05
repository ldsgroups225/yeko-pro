# Project Structure

## Root Directory Organization

### Core Application
- **`app/`** - Next.js App Router pages and layouts
- **`components/`** - Reusable UI components and shared logic
- **`lib/`** - Utility functions and external service configurations
- **`services/`** - Server-side business logic and data access layer
- **`hooks/`** - Custom React hooks for state and side effects
- **`store/`** - Zustand state management stores
- **`types/`** - TypeScript type definitions
- **`validations/`** - Zod schemas for data validation

### Configuration & Assets
- **`public/`** - Static assets (images, fonts, icons)
- **`providers/`** - React context providers
- **`constants/`** - Application constants and configuration

## App Directory Structure

The app follows Next.js App Router conventions with route groups:

### Authentication Routes
- **`app/(auth)/`** - Authentication pages (sign-in, registration)

### Main Application Routes
- **`app/t/(schools)/`** - School management interface
  - **`(navigations)/`** - Main dashboard with sidebar navigation
    - **`dashboard/`** - Analytics and overview
    - **`classes/`** - Class management and student lists
    - **`students/`** - Student profiles and enrollment
    - **`teachers/`** - Teacher management and assignments
    - **`accounting/`** - Financial management and payments
    - **`schedules/`** - Timetable and course scheduling
    - **`notes/`** - Academic notes and communications
    - **`progress-reports/`** - Academic progress tracking
    - **`settings/`** - School configuration and preferences

### API Routes
- **`app/api/`** - Server-side API endpoints
  - **`health/`** - Health check endpoint
  - **`generate-report-pdf/`** - PDF generation service

## Component Architecture

### UI Components (`components/ui/`)
- Follows Shadcn/ui patterns with Radix UI primitives
- Consistent styling with Tailwind CSS and CVA (Class Variance Authority)
- Reusable components: buttons, forms, dialogs, tables, charts

### Feature Components
- Co-located with their respective routes in `_components/` folders
- Domain-specific components for classes, students, teachers, etc.
- Separation of presentation and logic components

## Data Layer Architecture

### Services (`services/`)
- Server-side functions using Supabase client
- Authentication checks and authorization
- Database queries and mutations
- Business logic implementation

### Stores (`store/`)
- Zustand stores for client-side state management
- Domain-specific stores (classStore, studentStore, etc.)
- Pagination, filtering, and caching logic

### Hooks (`hooks/`)
- Custom hooks that bridge stores and components
- Encapsulate complex state logic and side effects
- Provide clean APIs for components

## File Naming Conventions

- **Components**: PascalCase (e.g., `StudentTable.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useClasses.ts`)
- **Services**: camelCase with domain suffix (e.g., `classService.ts`)
- **Stores**: camelCase with domain + Store suffix (e.g., `classStore.ts`)
- **Types**: camelCase for files, PascalCase for interfaces (e.g., `IClass`)
- **Pages**: lowercase with Next.js conventions (`page.tsx`, `layout.tsx`)

## Import Patterns

- Use absolute imports with `@/` alias
- Group imports: external libraries, internal modules, relative imports
- Barrel exports in index files for clean imports

## Key Architectural Patterns

1. **Server Actions**: Direct database operations from components
2. **Optimistic Updates**: Immediate UI updates with rollback on error
3. **Pagination**: Consistent pagination across all data tables
4. **Error Boundaries**: Graceful error handling at route level
5. **Type Safety**: Comprehensive TypeScript coverage with strict mode
