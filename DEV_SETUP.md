# Development Setup for Goal Pilot

This document explains how to set up the development environment for Goal Pilot with disabled email confirmation for easier testing.

## Options for Disabling Email Confirmation

### Option 1: Hosted Supabase (Production)

If you want to disable email confirmation on your hosted Supabase instance:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. Scroll down to **Email Confirmation** settings
5. Turn off **Enable email confirmations**
6. Save the changes

**Note:** This affects all users on your production instance.

### Option 2: Local Development (Recommended for Testing)

Use a local Supabase instance with email confirmation disabled by default.

#### Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install -g @supabase/cli
   ```

2. Install Docker (required for local Supabase):
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

#### Setup Steps

1. **Initialize Supabase locally** (if not already done):
   ```bash
   supabase init
   ```

2. **Start the local Supabase instance**:
   ```bash
   npm run supabase:start
   ```
   
   This will:
   - Start local Supabase services (Database, Auth, Storage, etc.)
   - The local instance has email confirmation disabled by default
   - Create the necessary database tables from your migrations

3. **Run the development server with local Supabase**:
   ```bash
   npm run dev:local
   ```
   
   This will:
   - Copy the local development environment variables
   - Start the Next.js development server
   - Connect to your local Supabase instance

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Supabase Studio: http://localhost:54323
   - Inbucket (Email testing): http://localhost:54324

#### Useful Commands

- **Start local Supabase and dev server**: `npm run supabase:dev`
- **Stop local Supabase**: `npm run supabase:stop`
- **Reset local database**: `npm run supabase:reset`
- **Switch to production**: `npm run dev:production`
- **Switch to local development**: `npm run dev:local`

#### Configuration Files

- **Local development**: `.env.local.dev` (email confirmation disabled)
- **Production**: `.env.local.prod` (your hosted Supabase instance)
- **Supabase config**: `supabase/config.toml` (local instance settings)

## Testing Email Confirmation Disabled

With the local setup:

1. Register a new user at http://localhost:3000/register
2. The user should be immediately logged in without email confirmation
3. They should be redirected directly to the dashboard
4. Check the Inbucket interface at http://localhost:54324 to see what emails would have been sent

## Environment Variables

### Local Development (.env.local.dev)
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQzOTIzMzUxLCJleHAiOjE5NTk0OTkzNTF9.G0tJJTxkG8rRqO8k1qBEYlkPIEUg8DW4PqIjgzV2r0E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDM5MjMzNTEsImV4cCI6MTk1OTQ5OTM1MX0.8J9UH2-YhOXGejVmXlSjJ6fHPUdBK5vGpHjQF7vQhUE
```

### Production (.env.local.prod)
Your existing hosted Supabase credentials.

## How It Works

The application code in `app/(auth)/register/page.tsx` already handles both scenarios:

1. **Email confirmation enabled**: User is redirected to `/confirm` page
2. **Email confirmation disabled**: User is immediately logged in and redirected to `/dashboard`

The local Supabase configuration (`supabase/config.toml`) has `enable_confirmations = false` under the `[auth.email]` section, which disables email confirmation for the local instance.

## Troubleshooting

1. **Port conflicts**: If you get port conflicts, check if other services are running on ports 54321-54328
2. **Docker issues**: Make sure Docker is running before starting Supabase
3. **Database migration issues**: Run `npm run supabase:reset` to reset the local database
4. **Environment variables**: Make sure you're using the correct `.env.local` file for your target environment

## Switching Between Environments

- **Local development**: `npm run dev:local`
- **Production testing**: `npm run dev:production`
- **Check current environment**: Look at your `.env.local` file to see which Supabase URL is active