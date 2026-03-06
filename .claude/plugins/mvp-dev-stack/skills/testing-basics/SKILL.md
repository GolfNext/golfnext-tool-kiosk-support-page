---
name: testing-basics
description: Essential testing patterns for MVP development with Vitest and React Testing Library. Use when writing tests, setting up test infrastructure, or reviewing test coverage. Triggers on any testing-related work.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# Testing Basics for MVP

Minimal but effective testing to ship with confidence.

## What to Test in an MVP

Focus testing effort where it matters most:

1. **API endpoints** — Ensure your backend returns correct data and handles errors
2. **Business logic** — Pure functions in services/utils
3. **Critical user flows** — Login, core feature, payment (if applicable)
4. **Skip for now** — Snapshot tests, visual regression, E2E (add later)

## Setup: Vitest + React Testing Library

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

## Component Test Pattern

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const defaultProps = {
    name: 'Golf Driver',
    price: 2999,
    onAddToCart: vi.fn(),
  };

  it('renders product info', () => {
    render(<ProductCard {...defaultProps} />);
    expect(screen.getByText('Golf Driver')).toBeInTheDocument();
    expect(screen.getByText('2999 DKK')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', async () => {
    const user = userEvent.setup();
    render(<ProductCard {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(defaultProps.onAddToCart).toHaveBeenCalledOnce();
  });
});
```

## API Test Pattern

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('GET /api/products', () => {
  it('returns list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).get('/api/products/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
```

## Utility Test Pattern

```typescript
import { formatPrice, calculateDiscount } from './utils';

describe('formatPrice', () => {
  it('formats with DKK suffix', () => {
    expect(formatPrice(2999)).toBe('2.999 DKK');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0 DKK');
  });
});
```

## MVP Testing Rules

1. **Test behavior, not implementation** — Test what the user sees, not internal state
2. **One assertion per concept** — Keep tests focused
3. **Use `screen.getByRole`** — Most accessible way to query elements
4. **Mock external services** — Never call real APIs in unit tests
5. **Run tests in CI** — Even for MVP, broken tests should block deploys
