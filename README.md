# Promptle

A daily prompt engineering challenge game inspired by Wordle

## What is Promptle?

Promptle is a web-based game where users compete to recreate a "target image" using AI prompts limited to 100 characters. Great game to increase social cohesion amongst your team at work, friend group, broader network etc!

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth & Database**: Supabase
- **UI Components**: Shadcn UI
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- A Supabase account

### 1. Clone and Install

```bash
git clone <repo-url>
cd prompt-engineering-game
yarn install
```

### 2. Configure Environment Variables

Request the supabase keys from a repo collaborator

```bash
cp .env.example .env.local
```

Edit \`.env.local\`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── daily-challenge/    # Protected game page
│   ├── login/              # Auth page
│   └── page.tsx            # Landing page
├── components/
│   ├── common/             # Reusable components for business logic
│   ├── game/               # Game Components
│   └── ui/                 # Reusable UI primitives
├── lib/supabase/           # Auth utilities & client setup
├── actions/                # Server actions (auth, game)
├── constants/              # Constants
└── types/                  # Type definitions
```

## Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
