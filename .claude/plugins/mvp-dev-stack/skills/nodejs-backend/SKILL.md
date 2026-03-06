---
name: nodejs-backend
description: Node.js and Express backend patterns for MVP development. Use when building APIs, server routes, middleware, database connections, or authentication. Triggers on any backend/server-side work.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# Node.js Backend Patterns

Apply these patterns when building the backend API.

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── routes/               # Route definitions
│   │   ├── index.ts          # Route registry
│   │   ├── products.ts       
│   │   └── auth.ts           
│   ├── controllers/          # Request handlers
│   │   ├── products.controller.ts
│   │   └── auth.controller.ts
│   ├── services/             # Business logic
│   │   ├── products.service.ts
│   │   └── auth.service.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── models/               # Data models / schemas
│   ├── utils/                # Helper functions
│   ├── config/               # Configuration
│   │   └── env.ts
│   └── types/                # TypeScript types
├── package.json
├── tsconfig.json
└── .env
```

## Express App Setup

```typescript
// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';

const app = express();

// Security
app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true 
}));

// Performance
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

export { app };
```

## Route Pattern

```typescript
// src/routes/products.ts
import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema } from '../schemas/product';

const router = Router();
const controller = new ProductsController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', authenticate, validate(createProductSchema), controller.create);
router.put('/:id', authenticate, validate(createProductSchema), controller.update);
router.delete('/:id', authenticate, controller.delete);

export { router as productsRouter };
```

## Controller Pattern

```typescript
// src/controllers/products.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../services/products.service';

export class ProductsController {
  private service = new ProductsService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.service.findAll(req.query);
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.create(req.body);
      res.status(201).json({ data: product });
    } catch (error) {
      next(error);
    }
  };
}
```

## Error Handling

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}
```

## Validation with Zod

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

// src/schemas/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  description: z.string().optional(),
  category: z.string().min(1),
});
```

## Environment Config

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);
```

## MVP Rules

1. **Always validate input** with Zod — never trust client data
2. **Centralized error handling** — never let errors leak to the client
3. **Environment variables** — never hardcode secrets
4. **TypeScript strict** — catch bugs at compile time
5. **Consistent API responses** — always wrap in `{ data }` or `{ error }`
6. **Health check endpoint** — always include `/health`
7. **CORS configured** — whitelist your frontend URL
