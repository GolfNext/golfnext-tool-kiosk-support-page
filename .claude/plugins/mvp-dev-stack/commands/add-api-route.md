---
name: add-api-route
description: Generate a new API route with controller, service, validation schema, and route definition
---

# /add-api-route

Create a complete API route following the controller-service pattern.

## Steps

1. Ask user for:
   - Resource name (e.g., `products`, `users`, `orders`)
   - Which CRUD operations to include (GET all, GET by id, POST, PUT, DELETE)
   - Any specific fields for the Zod validation schema

2. Generate these files:

### Route definition
```typescript
// src/routes/{resource}.ts
import { Router } from 'express';
import { {Resource}Controller } from '../controllers/{resource}.controller';

const router = Router();
const controller = new {Resource}Controller();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as {resource}Router };
```

### Controller
```typescript
// src/controllers/{resource}.controller.ts
// Following the pattern from nodejs-backend skill
```

### Service
```typescript
// src/services/{resource}.service.ts
// Business logic layer
```

### Validation schema
```typescript
// src/schemas/{resource}.ts
import { z } from 'zod';

export const create{Resource}Schema = z.object({
  // Fields based on user input
});
```

3. Register the route in `src/routes/index.ts`

4. Remind user to create the database model/migration if needed
