# Claude Development Guidelines

## Application Purpose
Goal Pilot is an AI-powered goal achievement and learning management application that transforms long-term goals into manageable daily actions through intelligent roadmap generation and smart scheduling.

### Core Features:
- **AI-Powered Goal Planning**: Uses OpenAI GPT-3.5 to generate comprehensive, multi-phase learning roadmaps
- **Smart Scheduling System**: Adaptive scheduling that respects user time constraints and availability
- **Comprehensive Learning Structure**: Hierarchical approach with Goals → Roadmaps → Learning Phases → Daily Tasks
- **Progress Tracking**: Visual insights and completion tracking with dashboard analytics
- **Calendar Integration**: Task scheduling and management with visual progress indicators

The app solves goal abandonment by providing structured learning paths, personalized roadmaps, and realistic timelines calculated based on actual time commitments.

## Project Overview
This is a Next.js application that uses:
- Next.js 15 with Turbo
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase for backend (PostgreSQL)
- React Query + Jotai for state management
- OpenAI GPT-3.5 for roadmap generation
- Vitest for testing
- Bun as package manager

## Development Commands
- `bun run dev` - Start development server with turbo
- `bun run dev:local` - Start with local environment
- `bun run dev:production` - Start with production environment
- `bun run build` - Build for production
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix linting issues
- `bun run format` - Format code with Prettier
- `bun run test` - Run tests
- `bun run type-check` - Run TypeScript checks

## Code Quality Standards
- Always run `bun run lint` and `bun run type-check` after making changes
- Use Prettier for consistent formatting
- Follow TypeScript strict mode practices
- Write tests for new features using Vitest

## Architecture Guidelines
- Use React Server Components where appropriate
- Implement proper error boundaries
- Use shadcn/ui components for consistent UI patterns
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling with responsive design
- All components must be responsive (mobile-first approach)

## Styling Guidelines
- Use Tailwind CSS utility classes
- Implement shadcn/ui components for UI elements
- Ensure all layouts are responsive
- Use consistent spacing and typography scales
- Follow mobile-first responsive design principles

## Database & Backend
- Use Supabase for database operations
- Test database changes with `bun run supabase:reset`
- Use React Query for data fetching and caching
- Implement proper Row-Level Security (RLS) policies

## Git Workflow
- Use conventional commits (feat:, fix:, refactor:, etc.)
- Commit frequently with descriptive messages
- No co-author tags - single committer only
- Run type-check and lint before each commit

## File Structure
- Components in appropriate directories
- Use TypeScript for all new files
- Follow existing naming conventions
- Keep components focused and reusable