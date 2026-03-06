---
name: scaffold-mvp
description: Scaffold a new MVP project with React + Tailwind + Node.js backend
---

# /scaffold-mvp

Set up a new MVP project with the full stack.

## Steps

1. Ask user for project name and whether they want:
   - **Monorepo** (separate client + server) or **Next.js** (full-stack)
   - Database preference (PostgreSQL, SQLite, or none for now)
   
2. For **Monorepo**:
   ```bash
   mkdir <project-name> && cd <project-name>
   pnpm init
   
   # Frontend
   pnpm create vite client --template react-ts
   cd client && pnpm add -D tailwindcss @tailwindcss/postcss postcss autoprefixer
   cd ..
   
   # Backend
   mkdir -p server/src/{routes,controllers,services,middleware,models,config,types,utils}
   cd server && pnpm init
   pnpm add express cors helmet compression zod dotenv
   pnpm add -D typescript @types/express @types/cors @types/compression tsx
   cd ..
   
   # Shared types
   mkdir -p shared/types
   ```

3. For **Next.js**:
   ```bash
   pnpm create next-app <project-name> --typescript --tailwind --eslint --app --src-dir
   ```

4. Configure TypeScript strict mode in all tsconfig.json files

5. Set up `.env.example`, `.gitignore`, and `README.md`

6. Initialize git: `git init && git add . && git commit -m "Initial MVP scaffold"`
