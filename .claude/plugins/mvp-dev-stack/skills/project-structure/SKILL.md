---
name: project-structure
description: Full-stack MVP project structure and conventions. Use when scaffolding new projects, organizing files, or setting up monorepo structure. Triggers on project setup, scaffolding, or architecture decisions.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# MVP Project Structure

Apply these conventions when setting up or organizing the project.

## Monorepo Structure (Recommended for MVP)

```
my-mvp/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   │   ├── ui/            # Primitives (Button, Input, Modal)
│   │   │   └── layout/        # Layout components (Header, Footer, Sidebar)
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types.ts
│   │   │   └── products/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── types.ts
│   │   ├── hooks/             # Shared hooks
│   │   ├── lib/               # Utilities and helpers
│   │   │   ├── api.ts         # API client
│   │   │   └── utils.ts
│   │   ├── pages/             # Page components / routes
│   │   ├── styles/            # Global styles
│   │   │   └── globals.css
│   │   ├── types/             # Shared TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── config/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                    # Shared types and utilities
│   ├── types/
│   │   └── api.ts             # API request/response types
│   └── constants/
│       └── index.ts
│
├── .env.example               # Environment template
├── .gitignore
├── package.json               # Root workspace config
├── README.md
└── docker-compose.yml         # Local dev services (DB etc.)
```

## Alternative: Next.js Full-Stack

If using Next.js as both frontend and API:

```
my-mvp/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── globals.css
│   ├── (auth)/                # Auth route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/                   # API routes
│       ├── products/route.ts
│       └── auth/route.ts
├── components/
│   ├── ui/
│   └── layout/
├── lib/
│   ├── db.ts
│   └── auth.ts
├── types/
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase, use-prefix | `useProducts.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Types/Interfaces | PascalCase | `Product`, `ApiResponse` |
| API routes | kebab-case | `/api/product-categories` |
| CSS files | kebab-case | `globals.css` |
| Env vars | SCREAMING_SNAKE | `DATABASE_URL` |
| Folders | kebab-case | `product-card/` |

## Key Config Files

### TypeScript (strict mode)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Essential .gitignore
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
```

### Essential .env.example
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
CLIENT_URL=http://localhost:3000
JWT_SECRET=change-me-to-a-random-32-char-string
```

## MVP Decisions

1. **Vite + React** for frontend (fastest DX) — or Next.js if you need SSR
2. **Express** for backend (simplest, most documented)
3. **PostgreSQL** for database (reliable, scales well)
4. **Zod** for validation (shared between client and server)
5. **TypeScript everywhere** — no exceptions
6. **pnpm** as package manager (fast, efficient)
