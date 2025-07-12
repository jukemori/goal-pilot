# Goal Pilot - AI-Powered Goal Achievement & Learning Management

Transform your long-term goals into manageable daily actions through intelligent roadmap generation, smart scheduling, and comprehensive progress tracking.

## Tech Stack

**Frontend**

- Next.js 15 with App Router & Turbopack
- TypeScript + Tailwind CSS + shadcn/ui
- Jotai + React Query for state management

**Backend & Database**

- Supabase (PostgreSQL) with Row Level Security
- Supabase Auth for authentication

**AI & Tools**

- OpenAI gpt-4o-mini for roadmap generation
- Bun for package management

## Key Features

- **AI-Powered Goal Planning**: Intelligent roadmap generation with personalized learning paths
- **Smart Scheduling**: Adaptive time management with calendar integration
- **Progress Tracking**: Visual dashboard with completion analytics and milestone tracking
- **Responsive Design**: Mobile-first approach with performance optimization

## Project Structure

```
goal-pilot/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication pages (login, register, reset)
│   ├── (app)/             # Protected app pages
│   ├── actions/            # Server Actions for data mutations
│   ├── api/                # API routes for external integrations
│   └── auth/               # Auth callback and error handlers
├── components/             # React Components (Atomic Design)
│   ├── atoms/              # Basic UI building blocks
│   ├── molecules/          # Composite components
│   ├── organisms/          # Complex feature components
│   ├── ui/                 # shadcn/ui component library
│   └── providers/          # React Context providers
├── lib/                    # Utilities and configurations
│   ├── ai/                 # OpenAI integration and prompts
│   ├── hooks/              # Custom React hooks
│   ├── supabase/           # Database client configuration
│   ├── utils/              # Utility functions and helpers
│   └── validations/        # Zod validation schemas
├── store/                  # Jotai state management atoms
├── types/                  # TypeScript type definitions
├── supabase/              # Database schema and migrations
│   ├── migrations/         # Database migration files
│   └── config.toml        # Supabase local configuration
└── docs/                  # Project documentation
```

## Database Schema

### Core Tables

- **users**: User profiles and preferences
- **goals**: User goals with scheduling preferences and AI parameters
- **roadmaps**: AI-generated learning roadmaps linked to goals
- **progress_stages**: Structured stages within roadmaps
- **tasks**: Daily tasks derived from progress stages
- **milestones**: Progress tracking milestones

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.local.example .env.local

# Start development server
bun run dev
```

## Development Commands

```bash
# Development
bun run dev              # Start development server
bun run build           # Build for production
bun run start           # Start production server

# Code Quality
bun run lint            # Run ESLint
bun run format          # Format with Prettier
bun run type-check      # TypeScript checking

# Database (with Supabase CLI)
bun run supabase:start  # Start local Supabase
bun run supabase:reset  # Reset local database
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
