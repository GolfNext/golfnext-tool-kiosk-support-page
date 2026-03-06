---
name: react-best-practices
description: React and Next.js best practices for MVP development. Use when writing, reviewing, or refactoring React components, pages, hooks, or state management. Triggers on any React/JSX work.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# React Best Practices for MVP Development

Apply these patterns when writing or reviewing React code.

## Component Architecture

### Functional Components Only
Always use functional components with hooks. Never class components.

```tsx
// ✅ Good
export function ProductCard({ name, price }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-gray-600">{price} DKK</p>
    </div>
  );
}

// ❌ Bad - class component
class ProductCard extends React.Component { ... }
```

### Component File Structure
One component per file. Co-locate related files.

```
components/
  ProductCard/
    ProductCard.tsx        # Component
    ProductCard.test.tsx   # Tests
    index.ts              # Re-export
  ui/                     # Shared UI primitives
    Button.tsx
    Input.tsx
    Modal.tsx
```

### Props Interface Pattern
Always define TypeScript interfaces for props. Use descriptive names.

```tsx
interface ProductCardProps {
  name: string;
  price: number;
  imageUrl?: string;
  onAddToCart: (productId: string) => void;
}
```

## State Management

### Local State First
Start with `useState` and `useReducer`. Only add global state when actually needed.

```tsx
// ✅ Start simple
const [isOpen, setIsOpen] = useState(false);
const [items, setItems] = useState<Item[]>([]);

// ✅ useReducer for complex state
const [state, dispatch] = useReducer(cartReducer, initialState);
```

### Data Fetching
Use React Query (TanStack Query) or SWR for server state. Never store server data in useState manually.

```tsx
// ✅ Good - React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: () => fetch('/api/products').then(r => r.json()),
});

// ❌ Bad - manual fetching
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setData);
}, []);
```

## Performance Rules (Priority Order)

### CRITICAL: Avoid Barrel File Imports
```tsx
// ❌ Bad - imports entire library
import { Button } from '@/components';
import { Search } from 'lucide-react';

// ✅ Good - direct imports
import { Button } from '@/components/ui/Button';
import Search from 'lucide-react/dist/esm/icons/search';
```

### CRITICAL: Minimize Client Components
Keep components server-side by default. Only add 'use client' when you need interactivity.

```tsx
// ✅ Server Component (default) - no directive needed
export default function ProductList({ products }) {
  return products.map(p => <ProductCard key={p.id} {...p} />);
}

// ✅ Client Component - only when needed
'use client';
export function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false);
  // ... interactive logic
}
```

### HIGH: Avoid Cascading useEffect
Never chain useEffect calls. Compute derived state inline.

```tsx
// ❌ Bad - cascading effects
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
useEffect(() => { setTotal(items.reduce((s, i) => s + i.price, 0)); }, [items]);

// ✅ Good - derived state
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0);
```

## MVP-Specific Guidelines

1. **Ship fast, refactor later** - Don't over-engineer. Use simple patterns first.
2. **TypeScript strict mode** - Always. Catches bugs before they ship.
3. **Error boundaries** - Add at page level minimum.
4. **Loading states** - Always show loading indicators. Never leave blank screens.
5. **Mobile-first** - Design for mobile, then scale up.
