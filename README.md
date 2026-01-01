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

- Node.js Latest Stable Version. Use `nvm` ([docs](https://github.com/nvm-sh/nvm)) to manage node versions
- Yarn

### 1. Clone and Install

```bash
git clone <repo-url>
cd promptle
yarn install
```

### 2. Configure Environment Variables

Request the supabase keys from a repo collaborator

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Database Setup
For the current iteration, we use Supabase to manage the database in an infrastructure as code format. **DO NOT create tables manually in the dashboard**. 

You can install the supabase CLI by running `brew install supabase/tap/supabase` as seen [here](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=macos#installing-the-supabase-cli)

Two cases
#### Case A: Linking to Remote

Use this setup if you are working on frontend but need to link to the dev database. Run from the root directory `~/promptle`

```bash
supabase login
supabase link --project-ref <your-project-id>
```
You should be able to access the project reference id through Settings > General > Project ID

#### Case B: Pure Local Development

Run the entire Supabase stack locally via a docker container. You can [setup supabase with Docker Desktop](https://docs.docker.com/desktop) or use a tool like [`colima`](https://github.com/abiosoft/colima)

```bash
supabase start
```

NOTE: This command will take a bit of time on the first run due to downloading the needed assets. 

You can refer to this [section](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=macos#access-your-projects-services) on how to access the project's services


### 4. Run Development Server

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
- [Vercel](https://vercel.com/docs)
