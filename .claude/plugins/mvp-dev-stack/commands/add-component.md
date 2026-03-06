---
name: add-component
description: Generate a new React component with TypeScript, Tailwind styling, and optional test file
---

# /add-component

Create a new React component following project conventions.

## Steps

1. Ask user for:
   - Component name (e.g., `ProductCard`)
   - Location: `components/ui/`, `components/layout/`, or a feature folder
   - Whether to include a test file

2. Generate the component file:

```tsx
// components/{location}/{Name}.tsx
interface {Name}Props {
  // TODO: define props
}

export function {Name}({ }: {Name}Props) {
  return (
    <div className="">
      {/* TODO: implement */}
    </div>
  );
}
```

3. Generate index re-export:
```tsx
// components/{location}/index.ts
export { {Name} } from './{Name}';
```

4. If tests requested, generate test file:
```tsx
// components/{location}/{Name}.test.tsx
import { render, screen } from '@testing-library/react';
import { {Name} } from './{Name}';

describe('{Name}', () => {
  it('renders', () => {
    render(<{Name} />);
    // TODO: add assertions
  });
});
```
