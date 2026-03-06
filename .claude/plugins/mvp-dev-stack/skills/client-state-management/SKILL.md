---
name: client-state-management
description: Client-side state persistence and management patterns for React MVPs. Covers localStorage persistence with custom hooks, saved schema management (save/load/list), complex state with useReducer, undo/redo history, and state hydration patterns. Use when building features that need to persist data across browser sessions, manage saved items in localStorage, or handle complex multi-step application state. Triggers on localStorage, sessionStorage, persist state, save/load data, useReducer, undo redo, state management, saved schemas, client storage, hydration.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# Client-Side State Management & Persistence

Apply these patterns when building features that need to persist data in the browser and manage complex application state for MVP development.

## Pattern 1: useLocalStorage Hook

A type-safe hook that syncs React state with localStorage, with SSR safety built in.

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize from localStorage (SSR-safe)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage whenever value changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const remove = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, remove];
}
```

## Pattern 2: Saved Schema Manager

This is the core pattern for the GolfNext Integrator's "Reuse Existing Schema" feature. It manages a list of saved database schemas in localStorage.

```typescript
// lib/schema-storage.ts

export interface SavedSchema {
  id: string;
  friendlyName: string;
  timestamp: string; // ISO string
  fileName: string;
  tableCount: number;
  data: ParsedStructure[]; // The actual parsed schema
}

const STORAGE_KEY = 'golfnext-saved-schemas';
const MAX_SCHEMAS = 20; // Prevent localStorage from growing too large

export function getSavedSchemas(): SavedSchema[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchema(schema: Omit<SavedSchema, 'id' | 'timestamp'>): SavedSchema {
  const schemas = getSavedSchemas();

  const newSchema: SavedSchema = {
    ...schema,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  // Add to front, enforce max limit
  const updated = [newSchema, ...schemas].slice(0, MAX_SCHEMAS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newSchema;
}

export function deleteSchema(id: string): void {
  const schemas = getSavedSchemas().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schemas));
}

export function getSchemaById(id: string): SavedSchema | undefined {
  return getSavedSchemas().find((s) => s.id === id);
}
```

### React Hook for Schema Management

```typescript
// hooks/useSavedSchemas.ts
import { useState, useCallback, useEffect } from 'react';
import { getSavedSchemas, saveSchema, deleteSchema, type SavedSchema } from '@/lib/schema-storage';

export function useSavedSchemas() {
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Load on mount
  useEffect(() => {
    setSchemas(getSavedSchemas());
  }, []);

  const save = useCallback((schema: Omit<SavedSchema, 'id' | 'timestamp'>) => {
    const saved = saveSchema(schema);
    setSchemas(getSavedSchemas());
    setSelectedId(saved.id);
    return saved;
  }, []);

  const remove = useCallback((id: string) => {
    deleteSchema(id);
    setSchemas(getSavedSchemas());
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const selected = schemas.find((s) => s.id === selectedId) || null;

  return { schemas, selected, selectedId, setSelectedId, save, remove };
}
```

### Schema Selector Dropdown

```tsx
// components/SchemaSelector.tsx
'use client';

import { useSavedSchemas } from '@/hooks/useSavedSchemas';

interface SchemaSelectorProps {
  onSchemaSelected: (schema: SavedSchema) => void;
  onUploadNew: () => void;
}

export function SchemaSelector({ onSchemaSelected, onUploadNew }: SchemaSelectorProps) {
  const { schemas, selectedId, setSelectedId, remove } = useSavedSchemas();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Database Schema
        </label>
        <button
          onClick={onUploadNew}
          className="text-xs font-medium text-primary hover:text-primary/80"
        >
          + Upload New
        </button>
      </div>

      {schemas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved schemas. Upload one to get started.
        </p>
      ) : (
        <select
          value={selectedId || ''}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedId(id);
            const schema = schemas.find((s) => s.id === id);
            if (schema) onSchemaSelected(schema);
          }}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a saved schema...</option>
          {schemas.map((s) => (
            <option key={s.id} value={s.id}>
              {s.friendlyName} — {new Date(s.timestamp).toLocaleDateString()}
            </option>
          ))}
        </select>
      )}

      {/* Metadata display */}
      {selectedId && schemas.find((s) => s.id === selectedId) && (
        <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs text-muted-foreground">
          <p><strong>File:</strong> {schemas.find((s) => s.id === selectedId)!.fileName}</p>
          <p><strong>Tables:</strong> {schemas.find((s) => s.id === selectedId)!.tableCount}</p>
          <p><strong>Saved:</strong> {new Date(schemas.find((s) => s.id === selectedId)!.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
```

## Pattern 3: Complex State with useReducer

For multi-step workflows like the mapping interface, useReducer provides clear state transitions.

```typescript
// hooks/useMappingState.ts
import { useReducer, useCallback } from 'react';

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  confidence: number; // 0-1 from AI, 1.0 for manual
  isManual: boolean;
}

interface MappingState {
  mappings: FieldMapping[];
  selectedMappingId: string | null;
  isDirty: boolean;
  lastSaved: string | null;
}

type MappingAction =
  | { type: 'SET_MAPPINGS'; mappings: FieldMapping[] }
  | { type: 'ADD_MAPPING'; mapping: FieldMapping }
  | { type: 'UPDATE_MAPPING'; id: string; changes: Partial<FieldMapping> }
  | { type: 'REMOVE_MAPPING'; id: string }
  | { type: 'SELECT_MAPPING'; id: string | null }
  | { type: 'MARK_SAVED' }
  | { type: 'RESET' };

function mappingReducer(state: MappingState, action: MappingAction): MappingState {
  switch (action.type) {
    case 'SET_MAPPINGS':
      return { ...state, mappings: action.mappings, isDirty: true };

    case 'ADD_MAPPING':
      return {
        ...state,
        mappings: [...state.mappings, action.mapping],
        isDirty: true,
      };

    case 'UPDATE_MAPPING':
      return {
        ...state,
        mappings: state.mappings.map((m) =>
          m.id === action.id ? { ...m, ...action.changes, isManual: true } : m,
        ),
        isDirty: true,
      };

    case 'REMOVE_MAPPING':
      return {
        ...state,
        mappings: state.mappings.filter((m) => m.id !== action.id),
        selectedMappingId:
          state.selectedMappingId === action.id ? null : state.selectedMappingId,
        isDirty: true,
      };

    case 'SELECT_MAPPING':
      return { ...state, selectedMappingId: action.id };

    case 'MARK_SAVED':
      return { ...state, isDirty: false, lastSaved: new Date().toISOString() };

    case 'RESET':
      return { mappings: [], selectedMappingId: null, isDirty: false, lastSaved: null };

    default:
      return state;
  }
}

const initialState: MappingState = {
  mappings: [],
  selectedMappingId: null,
  isDirty: false,
  lastSaved: null,
};

export function useMappingState() {
  const [state, dispatch] = useReducer(mappingReducer, initialState);

  const setMappings = useCallback((mappings: FieldMapping[]) =>
    dispatch({ type: 'SET_MAPPINGS', mappings }), []);

  const addMapping = useCallback((mapping: FieldMapping) =>
    dispatch({ type: 'ADD_MAPPING', mapping }), []);

  const updateMapping = useCallback((id: string, changes: Partial<FieldMapping>) =>
    dispatch({ type: 'UPDATE_MAPPING', id, changes }), []);

  const removeMapping = useCallback((id: string) =>
    dispatch({ type: 'REMOVE_MAPPING', id }), []);

  const selectMapping = useCallback((id: string | null) =>
    dispatch({ type: 'SELECT_MAPPING', id }), []);

  const markSaved = useCallback(() =>
    dispatch({ type: 'MARK_SAVED' }), []);

  return {
    ...state,
    setMappings,
    addMapping,
    updateMapping,
    removeMapping,
    selectMapping,
    markSaved,
  };
}
```

## Pattern 4: Undo/Redo History

Essential for the mapping interface where users correct AI suggestions.

```typescript
// hooks/useHistory.ts
import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialPresent: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setState((prev) => {
      const resolved = typeof newPresent === 'function'
        ? (newPresent as (prev: T) => T)(prev.present)
        : newPresent;

      return {
        past: [...prev.past, prev.present].slice(-50), // Keep last 50 states
        present: resolved,
        future: [], // Clear future on new action
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;
      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({ past: [], present: newPresent, future: [] });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    historyLength: state.past.length,
  };
}
```

### Using Undo/Redo with Keyboard Shortcuts

```tsx
// In your mapping component
import { useEffect } from 'react';
import { useHistory } from '@/hooks/useHistory';

function MappingEditor() {
  const { state: mappings, set, undo, redo, canUndo, canRedo } = useHistory<FieldMapping[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div>
      <div className="flex gap-2">
        <button onClick={undo} disabled={!canUndo} className="text-sm disabled:opacity-30">
          ↩ Undo
        </button>
        <button onClick={redo} disabled={!canRedo} className="text-sm disabled:opacity-30">
          ↪ Redo
        </button>
      </div>
      {/* ... mapping UI */}
    </div>
  );
}
```

## Pattern 5: JSON Export Generation

The final output of the mapping process — a configuration file for the backend engine.

```typescript
// lib/export.ts

interface MappingConfig {
  version: '1.0';
  generatedAt: string;
  source: {
    name: string;
    type: 'file' | 'url';
    origin: string; // filename or URL
  };
  target: {
    schemaName: string;
    schemaId: string;
  };
  mappings: MappingEntry[];
}

interface MappingEntry {
  sourceField: string;
  targetField: string;
  transformation: string | null;
  confidence: number;
  origin: 'ai' | 'manual';
}

export function generateMappingConfig(
  mappings: FieldMapping[],
  source: { name: string; type: 'file' | 'url'; origin: string },
  target: { schemaName: string; schemaId: string },
): MappingConfig {
  return {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    source,
    target,
    mappings: mappings.map((m) => ({
      sourceField: m.sourceField,
      targetField: m.targetField,
      transformation: m.transformation || null,
      confidence: m.confidence,
      origin: m.isManual ? 'manual' : 'ai',
    })),
  };
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

## Critical Rules

1. **Always handle SSR** — Check `typeof window !== 'undefined'` before accessing localStorage
2. **Set storage limits** — Cap saved items (20 schemas max) to prevent localStorage from filling up (typically 5-10 MB)
3. **Use `crypto.randomUUID()`** for IDs — Available in all modern browsers, no library needed
4. **JSON.stringify/parse safely** — Always wrap in try/catch; corrupted data should fall back to defaults
5. **Limit undo history** — Keep last 50 states max to prevent memory issues
6. **Mark state as dirty** — Track unsaved changes to warn users before navigating away
7. **Use useReducer for complex state** — When state has more than 3 related fields or complex transitions, useReducer is clearer than multiple useState calls
8. **Never store sensitive data** — localStorage is not encrypted; never store API keys, tokens, or PII
