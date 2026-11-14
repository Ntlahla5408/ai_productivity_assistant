# AI Productivity Assistant

An AI-assisted productivity workspace built with React, TypeScript, TanStack Start and Supabase. The authenticated application is organised around chat, tasks, meetings, email and research workflows.

> **Project status:** This README documents the current repository structure and local setup. It does not claim that every integration or workflow is production-ready; verify the connected Supabase project, authentication, AI provider configuration and external services in the intended environment.

## Technology stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Supabase JavaScript client for authentication and data access
- AI SDK and an OpenAI-compatible provider integration
- Tailwind CSS and Radix UI components

## Current application areas

The authenticated route tree includes chat and individual chat threads, tasks, meetings, email, research and settings. The exact availability of each workflow depends on the connected services and environment configuration.

## Requirements

- Node.js compatible with the installed Vite and TanStack dependencies
- Bun (recommended; the repository includes bun.lock) or npm
- A Supabase project with the required schema and authentication configuration
- Required AI provider credentials configured securely for the server environment

## Local development

1. Clone the repository: git clone https://github.com/Ntlahla5408/ai_productivity_assistant.git
2. Enter the repository directory.
3. Install dependencies with bun install (or npm install).
4. Copy .env.example to .env and set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY. The browser client also reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
5. Start the development server with bun run dev (or npm run dev).
6. Open the local URL printed by the development server.

## Available scripts

| Command | Purpose |
| --- | --- |
| bun run dev | Start the Vite development server |
| bun run build | Build the application |
| bun run build:dev | Build using development mode |
| bun run preview | Preview a production build |
| bun run lint | Run ESLint |

Use the npm run equivalents when installing with npm.

## Environment and security

- Keep local .env files out of Git.
- .env.example contains placeholders only and must not contain real credentials.
- Supabase publishable keys are intended for client-side use, but access must still be protected by correct Row Level Security policies.
- Never commit Supabase service_role keys, sb_secret_* keys, AI provider API keys, database passwords or other server secrets.
- Configure server-only credentials in the deployment platform's secret/environment settings.

## Repository structure

- src/integrations/supabase/ — Supabase client and authentication integration
- src/routes/_authenticated/ — authenticated application routes
- src/components/, src/hooks/ and src/lib/ — reusable application code
- supabase/ — Supabase project assets

TanStack Start uses file-based routing. See src/routes/README.md for route conventions. Do not edit the generated src/routeTree.gen.ts manually.

## Before deployment

- Confirm required Supabase tables, policies and migrations are present.
- Verify Row Level Security for every user-owned data table.
- Configure server-side AI provider credentials securely.
- Test sign-in, session refresh, sign-out and protected routes.
- Test each productivity workflow against the intended Supabase project.
- Run the production build and lint checks.
- Configure production environment variables and HTTPS.

## Contributing

Use a feature branch for changes, keep generated route files generated, and review environment files and Supabase policies before opening a pull request.
