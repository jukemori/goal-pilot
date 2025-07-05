# Goal Pilot - AI-Powered Goal Roadmap & Calendar App

Turn your goals into daily actions with AI-generated personalized roadmaps and smart scheduling.

## 🚀 Features

- **AI-Powered Planning**: Get personalized roadmaps tailored to your skill level and schedule
- **Smart Scheduling**: Daily tasks that fit your available time and energy levels
- **Progress Tracking**: Visual insights to keep you motivated and on track
- **Adaptive Learning**: Plans that evolve based on your progress and feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Jotai + React Query
- **Forms**: React Hook Form + Zod
- **AI Integration**: OpenAI API (GPT-3.5)
- **Package Manager**: Bun

## 📋 Prerequisites

- Node.js 18+ or Bun
- Supabase account
- OpenAI API key

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/goal-pilot.git
cd goal-pilot
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your Supabase and OpenAI credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and run the contents of `supabase/schema.sql`

5. Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Database Schema

The app uses four main tables:

- **users**: User profiles
- **goals**: User goals with schedule preferences
- **roadmaps**: AI-generated roadmaps for goals
- **tasks**: Daily tasks derived from roadmaps

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## 📁 Project Structure

```
goal-pilot/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── actions/             # Server Actions
│   └── api/                 # API routes
├── components/              # React components (Atomic Design)
│   ├── atoms/              # Basic UI elements
│   ├── molecules/          # Composite components
│   ├── organisms/          # Complex components
│   └── ui/                 # Shadcn/ui components
├── lib/                     # Utilities and configurations
│   ├── ai/                 # OpenAI integration
│   ├── supabase/           # Database client
│   └── validations/        # Zod schemas
├── store/                   # Jotai atoms
├── types/                   # TypeScript definitions
└── supabase/               # Database schema
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## 🧪 Development

### Running Tests
```bash
bun test
```

### Type Checking
```bash
bun run type-check
```

### Linting
```bash
bun run lint
```

### Formatting
```bash
bun run format
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [OpenAI](https://openai.com/)

---

Built with ❤️ using Goal Pilot