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

#### Pure Local Development

Run the entire Supabase stack locally via a docker container. You can [setup supabase with Docker Desktop](https://docs.docker.com/desktop) or use a tool like [`colima`](https://github.com/abiosoft/colima). I recommend `colima` for Mac users!

If you choose to use `colima`, follow the below instructions:
1. Setup `colima` as per the [README.md](https://github.com/abiosoft/colima)
2. Run `colima start` to run the container runtime in the background. If you have issues here, make sure you resolve before proceeding
3. Confirm with `colima status` that you see a message like `colima is running using macOS Virtualization.Framework`
4. Run `supabase start`. NOTE: This command will take a bit of time on the first run due to downloading the needed assets. 
5. Run `supabase stop` to stop the containers
6. After supabase starts, run `yarn supabase:functions` to have a local runtime of the supabase edge functions.

##### General Troubleshooting
* Check that `colima` is running via `colima status`
* Point Supabase to the correct socket via the following ([source](https://github.com/supabase/cli/issues/153#issuecomment-3644335387))
```bash
sudo ln -sf "$HOME/.colima/default/docker.sock" /var/run/docker.sock
export DOCKER_HOST="unix:///var/run/docker.sock"
```
* Make sure your supabase CLI is updated via `brew upgrade supabase`

NOTE: This command will take a bit of time on the first run due to downloading the needed assets. 

* **If the fixes above don't work and you're on colima**, you can run `yarn supabase:restart` to restart your local supabase container if you're making changes there

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
