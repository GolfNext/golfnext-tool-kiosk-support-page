---
name: url-parsing
description: URL input handling and remote API specification fetching for React applications. Covers URL validation, fetching Swagger/OpenAPI specs from URLs, extracting API endpoints from remote documentation, and CORS-safe fetching patterns. Use when building URL input fields that load remote API specs, fetching and parsing API documentation from URLs, or crawling public API docs. Triggers on URL input, fetch API spec, load from URL, API documentation URL, remote Swagger, CORS proxy, URL validation.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# URL Input & Remote API Spec Fetching

Apply these patterns when building URL input features that fetch and parse remote API documentation.

## Installation

```bash
# OpenAPI/Swagger parsing (same as file-handling)
pnpm add @apidevtools/swagger-parser

# URL validation
pnpm add zod
```

## Pattern 1: URL Input Component with Validation

A URL input with real-time validation and fetch trigger.

```tsx
'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';

const urlSchema = z.string().url('Please enter a valid URL').refine(
  (url) => url.startsWith('http://') || url.startsWith('https://'),
  'URL must start with http:// or https://',
);

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function UrlInput({
  onSubmit,
  isLoading = false,
  placeholder = 'https://api.example.com/swagger.json',
}: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const result = urlSchema.safeParse(url.trim());
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    onSubmit(result.data);
  }, [url, onSubmit]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        API Documentation URL
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className={`flex-1 rounded-md border px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary
            ${error ? 'border-error' : 'border-border'}
          `}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Load'}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
```

## Pattern 2: Backend API Route for Remote Fetching

Always fetch remote URLs from the backend to avoid CORS issues. Never fetch third-party URLs directly from the browser.

```typescript
// app/api/fetch-spec/route.ts
import { NextResponse } from 'next/server';
import SwaggerParser from '@apidevtools/swagger-parser';

const FETCH_TIMEOUT = 15_000; // 15 seconds
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json, application/yaml, text/yaml, */*',
        'User-Agent': 'GolfNext-Integrator/1.0',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Remote server returned ${response.status}: ${response.statusText}` },
        { status: 502 },
      );
    }

    // Check content size
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      return NextResponse.json(
        { error: 'Response too large (max 5 MB)' },
        { status: 413 },
      );
    }

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';

    // Attempt to parse as OpenAPI/Swagger
    let parsed: unknown;
    if (contentType.includes('yaml') || url.endsWith('.yaml') || url.endsWith('.yml')) {
      const yaml = await import('yaml');
      parsed = yaml.parse(text);
    } else {
      parsed = JSON.parse(text);
    }

    // Validate as OpenAPI spec
    const spec = await SwaggerParser.validate(parsed as any);

    return NextResponse.json({
      spec,
      format: (spec as any).openapi ? 'openapi3' : 'swagger2',
      title: (spec as any).info?.title,
      version: (spec as any).info?.version,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch or parse URL';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
```

## Pattern 3: Client-Side Hook for URL Fetching

```typescript
// hooks/useUrlFetch.ts
import { useState, useCallback } from 'react';
import type { ApiEndpoint } from '@/lib/parsers/openapi-parser';

type FetchState =
  | { status: 'idle' }
  | { status: 'fetching'; url: string }
  | { status: 'done'; url: string; endpoints: ApiEndpoint[]; title?: string; version?: string }
  | { status: 'error'; url: string; message: string };

export function useUrlFetch() {
  const [state, setState] = useState<FetchState>({ status: 'idle' });

  const fetchSpec = useCallback(async (url: string) => {
    setState({ status: 'fetching', url });

    try {
      const res = await fetch('/api/fetch-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ status: 'error', url, message: data.error || 'Failed to load' });
        return null;
      }

      // Extract endpoints from the validated spec
      const endpoints = extractEndpointsFromSpec(data.spec);

      setState({
        status: 'done',
        url,
        endpoints,
        title: data.title,
        version: data.version,
      });

      return { endpoints, title: data.title, version: data.version };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error';
      setState({ status: 'error', url, message });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, fetchSpec, reset };
}

function extractEndpointsFromSpec(spec: any): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods as any)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const op = operation as any;
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: op.operationId,
          summary: op.summary || op.description,
          parameters: (op.parameters || []).map((p: any) => ({
            name: p.name,
            in: p.in,
            type: p.schema?.type || 'string',
            required: p.required || false,
            description: p.description,
          })),
          responses: Object.fromEntries(
            Object.entries(op.responses || {}).map(([code, r]: [string, any]) => [code, r.description || '']),
          ),
        });
      }
    }
  }

  return endpoints;
}
```

## Pattern 4: Combined Source Input (File OR URL)

A component that lets users choose between uploading a file or entering a URL. This is the pattern used in the GolfNext Integrator left column.

```tsx
'use client';

import { useState } from 'react';
import { FileDropzone } from '@/components/FileDropzone';
import { UrlInput } from '@/components/UrlInput';

type InputMode = 'file' | 'url';

interface SourceInputProps {
  onDataLoaded: (result: ProcessedFile) => void;
}

export function SourceInput({ onDataLoaded }: SourceInputProps) {
  const [mode, setMode] = useState<InputMode>('file');
  const { state: fileState, processFile } = useFileProcessor();
  const { state: urlState, fetchSpec } = useUrlFetch();

  const isLoading = fileState.status === 'reading' || fileState.status === 'parsing'
    || urlState.status === 'fetching';

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border p-1">
        <button
          onClick={() => setMode('file')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
            ${mode === 'file' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors
            ${mode === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          From URL
        </button>
      </div>

      {/* Input Area */}
      {mode === 'file' ? (
        <FileDropzone
          onFileAccepted={async (file) => {
            const result = await processFile(file);
            if (result) onDataLoaded(result);
          }}
        />
      ) : (
        <UrlInput
          onSubmit={async (url) => {
            const result = await fetchSpec(url);
            if (result) {
              onDataLoaded({
                fileName: url,
                fileType: 'openapi',
                structures: [],
                endpoints: result.endpoints,
              });
            }
          }}
          isLoading={urlState.status === 'fetching'}
        />
      )}

      {/* Status Messages */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Processing...
        </div>
      )}
    </div>
  );
}
```

## Pattern 5: Common API Documentation URL Patterns

When building URL auto-detection or suggestions, these are common URL patterns for golf system APIs and other REST APIs:

```typescript
// lib/url-patterns.ts

export const COMMON_SPEC_PATHS = [
  '/swagger.json',
  '/swagger/v1/swagger.json',
  '/api-docs',
  '/api-docs.json',
  '/openapi.json',
  '/openapi.yaml',
  '/v2/api-docs',
  '/v3/api-docs',
  '/docs/api.json',
] as const;

/**
 * Given a base URL, try common paths to find an API spec.
 * Useful when the user provides a base URL like "https://api.golfprovider.com"
 */
export async function probeForApiSpec(baseUrl: string): Promise<string | null> {
  const base = baseUrl.replace(/\/$/, '');

  for (const path of COMMON_SPEC_PATHS) {
    try {
      const res = await fetch(`/api/fetch-spec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${base}${path}` }),
      });
      if (res.ok) return `${base}${path}`;
    } catch {
      continue;
    }
  }

  return null;
}
```

## Critical Rules

1. **Always fetch remote URLs from the backend** — Browser CORS restrictions will block most third-party API requests
2. **Set timeouts on remote fetches** — Third-party servers may be slow or unresponsive (15s max)
3. **Limit response size** — Prevent memory issues from unexpectedly large responses (5 MB max)
4. **Validate URLs server-side** — Never trust client-side URL validation alone
5. **Handle non-JSON responses gracefully** — Some API docs URLs return HTML, YAML, or other formats
6. **Cache fetched specs** — Avoid re-fetching the same URL within a session
7. **Show clear error messages** — Distinguish between network errors, invalid URLs, and invalid spec formats
