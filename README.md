# Goal Pilot - AI-Powered Goal Achievement & Learning Management

Transform your long-term goals into manageable daily actions through intelligent roadmap generation, smart scheduling, and comprehensive progress tracking.

## 🚀 Core Features

### AI-Powered Goal Planning

- **Intelligent Roadmap Generation**: Uses OpenAI GPT-3.5 to create comprehensive, multi-phase learning roadmaps
- **Personalized Learning Paths**: Tailored to your skill level, available time, and learning preferences
- **Structured Learning Approach**: Hierarchical breakdown from Goals → Roadmaps → Learning Phases → Daily Tasks

### Smart Scheduling System

- **Adaptive Time Management**: Respects your time constraints and daily availability
- **Calendar Integration**: Visual task scheduling with progress indicators
- **Realistic Timeline Calculation**: Based on actual time commitments and learning pace

### Comprehensive Progress Tracking

- **Visual Dashboard Analytics**: Real-time insights into goal completion and learning progress
- **Performance Monitoring**: Track completion rates, time estimates, and learning velocity
- **Milestone Tracking**: Monitor progress through structured learning phases

### Advanced User Experience

- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Performance Optimized**: React Query caching, component memoization, and code splitting
- **Error Boundaries**: Resilient UX with comprehensive error handling
- **Loading States**: Sophisticated skeletons and loading indicators

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: Jotai + React Query for optimal caching
- **Animations**: Framer Motion for smooth interactions
- **Forms**: React Hook Form + Zod validation

### Backend & Database

- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with email/password and OAuth providers
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage for file management

### AI & Performance

- **AI Integration**: OpenAI GPT-3.5 for roadmap generation
- **Performance**: Bundle analyzer, performance monitoring, memoization
- **Testing**: Vitest for unit and integration tests
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

### Development Tools

- **Package Manager**: Bun for fast dependency management
- **Development**: Hot reload with Turbopack
- **Type Safety**: Generated Supabase types with TypeScript

## 📋 Prerequisites

- **Node.js**: 18+ or Bun runtime
- **Supabase Account**: For database and authentication
- **OpenAI API Key**: For AI roadmap generation
- **Git**: For version control

## 🔧 Installation & Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/goal-pilot.git
cd goal-pilot
bun install
```

### 2. Environment Configuration

```bash
cp .env.local.example .env.local
```

Configure your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Integration
OPENAI_API_KEY=your_openai_api_key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Supabase Cloud Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations from `supabase/migrations/` in chronological order

#### Option B: Local Development with Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
bun run supabase:start

# Reset database (if needed)
bun run supabase:reset
```

### 4. Development Server

```bash
# Standard development
bun run dev

# With local Supabase
bun run supabase:dev

# With production environment
bun run dev:production
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🗄️ Database Architecture

### Core Tables

- **users**: User profiles and preferences
- **goals**: User goals with scheduling preferences and AI parameters
- **roadmaps**: AI-generated learning roadmaps linked to goals
- **progress_stages**: Structured stages within roadmaps
- **tasks**: Daily tasks derived from progress stages
- **milestones**: Progress tracking milestones

### Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **User Isolation**: Users can only access their own data
- **Secure Authentication**: Supabase Auth with email confirmation
- **API Security**: Service role keys for server-side operations

## 📁 Project Structure

```
goal-pilot/
├── .claude/                 # Claude Code configuration
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication pages (login, register, reset)
│   ├── (dashboard)/        # Protected dashboard pages
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

## 🚀 Development Commands

### Core Development

```bash
bun run dev              # Start development server with Turbopack
bun run dev:local        # Start with local environment config
bun run dev:production   # Start with production environment config
bun run build           # Build for production
bun run start           # Start production server
```

### Code Quality

```bash
bun run lint            # Run ESLint
bun run lint:fix        # Fix linting issues automatically
bun run format          # Format code with Prettier
bun run type-check      # Run TypeScript type checking
```

### Testing & Analysis

```bash
bun run test            # Run tests with Vitest
bun run test:ui         # Run tests with UI
bun run build:analyze   # Build with bundle analyzer
bun run analyze         # Analyze bundle sizes
```

### Database Management

```bash
bun run supabase:start  # Start local Supabase
bun run supabase:stop   # Stop local Supabase
bun run supabase:reset  # Reset local database
bun run supabase:dev    # Start Supabase + development server
```

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Performance Features

- **Bundle Optimization**: Code splitting and tree shaking
- **Caching Strategy**: React Query with optimized stale times
- **Image Optimization**: Next.js automatic image optimization
- **Static Generation**: Pre-rendered pages where possible

## 🔐 Authentication Flow

### Supported Methods

- **Email/Password**: With email confirmation
- **Password Reset**: Secure reset flow with tokens
- **Account Management**: Profile updates and preferences

### Security Features

- **Email Verification**: Required for account activation
- **Secure Password Reset**: Token-based reset flow
- **Session Management**: Automatic token refresh
- **Protected Routes**: Middleware-based route protection

## 🎯 Key Application Features

### Goal Management

- **Goal Creation**: Structured goal setup with time preferences
- **Template System**: Pre-built goal templates for common objectives
- **Progress Tracking**: Visual progress indicators and completion metrics

### AI Roadmap Generation

- **Intelligent Planning**: AI analyzes goals and generates comprehensive learning paths
- **Adaptive Timelines**: Adjusts to user availability and learning pace
- **Phase-based Learning**: Breaks complex goals into manageable phases

### Calendar Integration

- **Task Scheduling**: Visual calendar with task assignment
- **Progress Visualization**: Color-coded progress indicators
- **Responsive Design**: Optimized for mobile and desktop viewing

### Performance Monitoring

- **Real-time Metrics**: FPS, memory usage, and render performance
- **Bundle Analysis**: Automatic bundle size monitoring
- **Error Tracking**: Comprehensive error boundaries and logging

## 🧪 Testing & Quality Assurance

### Code Quality Standards

- **TypeScript Strict Mode**: Full type safety enforcement
- **ESLint Configuration**: Comprehensive linting rules
- **Prettier Integration**: Consistent code formatting
- **Pre-commit Hooks**: Automatic quality checks

### Performance Standards

- **Core Web Vitals**: Optimized for Google's performance metrics
- **Bundle Size Monitoring**: Automatic bundle analysis
- **Memory Management**: Optimized component lifecycle
- **Caching Strategy**: Intelligent data caching with React Query

## 📝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the code quality standards
4. Run tests and type checking
5. Commit changes with conventional commits
6. Push to your branch
7. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow existing component patterns
- Write tests for new features
- Update documentation as needed
- Ensure responsive design implementation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework for production
- **[Supabase](https://supabase.com/)** - Backend as a Service platform
- **[OpenAI](https://openai.com/)** - AI-powered roadmap generation
- **[shadcn/ui](https://ui.shadcn.com/)** - Modern component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Query](https://tanstack.com/query/)** - Data synchronization library

---

Built with ❤️ for goal achievement and continuous learning
