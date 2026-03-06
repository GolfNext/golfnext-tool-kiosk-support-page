---
name: file-handling
description: File upload and parsing patterns for React applications. Covers drag-and-drop upload UI, file type validation, parsing PDF documents, JSON/YAML files, and OpenAPI/Swagger specifications. Use when building file upload components, drag-and-drop zones, processing uploaded files, or extracting structured data from documents. Triggers on file upload, drag-and-drop, dropzone, file input, PDF parsing, Swagger parser, OpenAPI spec, file reader, multipart form data, MIME type.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# File Handling & Upload Patterns

Apply these patterns when building file upload, drag-and-drop, and document parsing features in React.

## Installation

```bash
# Drag-and-drop file uploads
pnpm add react-dropzone

# PDF text extraction
pnpm add pdfjs-dist

# OpenAPI/Swagger parsing
pnpm add @apidevtools/swagger-parser

# YAML support (for OpenAPI specs)
pnpm add yaml
```

## Pattern 1: Drag-and-Drop Upload Zone

A reusable dropzone component that accepts specific file types and provides visual feedback.

```tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  accept?: Accept;
  maxSize?: number; // bytes
  label?: string;
  sublabel?: string;
}

const DEFAULT_ACCEPT: Accept = {
  'application/json': ['.json'],
  'application/pdf': ['.pdf'],
  'application/x-yaml': ['.yaml', '.yml'],
  'text/plain': ['.txt'],
};

export function FileDropzone({
  onFileAccepted,
  accept = DEFAULT_ACCEPT,
  maxSize = 10 * 1024 * 1024, // 10 MB
  label = 'Drop file here, or click to browse',
  sublabel = 'Supports PDF, JSON, YAML',
}: FileDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        const reason = rejected[0].errors[0]?.message || 'File not accepted';
        setError(reason);
        return;
      }
      if (accepted.length > 0) {
        onFileAccepted(accepted[0]);
      }
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors
        ${isDragActive && !isDragReject ? 'border-primary bg-primary/5' : ''}
        ${isDragReject ? 'border-error bg-error/5' : ''}
        ${!isDragActive ? 'border-border hover:border-primary/50' : ''}
      `}
    >
      <input {...getInputProps()} />
      <svg className="mb-3 h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
```

## Pattern 2: File Type Detection & Validation

Reliably detect file types before processing. Never trust file extensions alone.

```typescript
// lib/file-utils.ts

export type SupportedFileType = 'json' | 'pdf' | 'yaml' | 'openapi' | 'text' | 'unknown';

interface FileTypeResult {
  type: SupportedFileType;
  mimeType: string;
  extension: string;
}

export function detectFileType(file: File): FileTypeResult {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type;

  // JSON files
  if (mimeType === 'application/json' || extension === 'json') {
    return { type: 'json', mimeType, extension };
  }

  // PDF files
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return { type: 'pdf', mimeType, extension };
  }

  // YAML files (often used for OpenAPI specs)
  if (['yaml', 'yml'].includes(extension) || mimeType === 'application/x-yaml') {
    return { type: 'yaml', mimeType, extension };
  }

  // Plain text
  if (mimeType === 'text/plain' || extension === 'txt') {
    return { type: 'text', mimeType, extension };
  }

  return { type: 'unknown', mimeType, extension };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
```

## Pattern 3: JSON File Parsing

Parse and validate uploaded JSON files, including database schema exports.

```typescript
// lib/parsers/json-parser.ts

export interface ParsedField {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  children?: ParsedField[];
}

export interface ParsedStructure {
  name: string;
  fields: ParsedField[];
  metadata?: Record<string, unknown>;
}

export async function parseJsonFile(file: File): Promise<ParsedStructure[]> {
  const text = await readFileAsText(file);

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON: Could not parse file contents');
  }

  // Handle MySQL schema export format
  if (isSchemaExport(data)) {
    return parseSchemaExport(data);
  }

  // Handle generic JSON structure
  return [{ name: file.name, fields: extractFields(data), metadata: {} }];
}

function isSchemaExport(data: unknown): data is Record<string, unknown> {
  if (typeof data !== 'object' || data === null) return false;
  // Check for common schema export patterns: tables array, or object with table names
  return 'tables' in data || Object.values(data).some(
    (v) => typeof v === 'object' && v !== null && 'columns' in v,
  );
}

function parseSchemaExport(data: Record<string, unknown>): ParsedStructure[] {
  // If it has a "tables" array
  if (Array.isArray(data.tables)) {
    return data.tables.map((table: any) => ({
      name: table.name || table.table_name,
      fields: (table.columns || []).map((col: any) => ({
        name: col.name || col.column_name,
        type: col.type || col.data_type,
        required: col.nullable === false || col.is_nullable === 'NO',
        description: col.comment || col.description,
      })),
      metadata: { engine: table.engine, collation: table.collation },
    }));
  }

  // Object keys are table names
  return Object.entries(data).map(([tableName, tableDef]: [string, any]) => ({
    name: tableName,
    fields: (tableDef.columns || Object.entries(tableDef)).map(
      (col: any) => ({
        name: Array.isArray(col) ? col[0] : col.name,
        type: Array.isArray(col) ? col[1]?.type : col.type,
        required: Array.isArray(col) ? !col[1]?.nullable : !col.nullable,
      }),
    ),
  }));
}

function extractFields(data: unknown, prefix = ''): ParsedField[] {
  if (typeof data !== 'object' || data === null) return [];

  return Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
    name: prefix ? `${prefix}.${key}` : key,
    type: Array.isArray(value) ? 'array' : typeof value,
    children: typeof value === 'object' && value !== null
      ? extractFields(value)
      : undefined,
  }));
}
```

## Pattern 4: PDF Text Extraction

Extract text from uploaded PDF documents (e.g., API documentation).

```typescript
// lib/parsers/pdf-parser.ts
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source — adjust path for your bundler
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface PdfPage {
  pageNumber: number;
  text: string;
}

export async function parsePdfFile(file: File): Promise<PdfPage[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: PdfPage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    pages.push({ pageNumber: i, text });
  }

  return pages;
}

export function extractEndpointsFromText(text: string): string[] {
  // Common API endpoint patterns
  const patterns = [
    /(?:GET|POST|PUT|PATCH|DELETE)\s+(\/[\w\-\/\{\}]+)/gi,
    /endpoint[:\s]+"?(\/[\w\-\/\{\}]+)"?/gi,
    /url[:\s]+"?(https?:\/\/[^\s"]+)"?/gi,
  ];

  const endpoints = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      endpoints.add(match[1]);
    }
  }

  return [...endpoints];
}
```

## Pattern 5: OpenAPI/Swagger Specification Parsing

Parse OpenAPI specs to extract endpoints, parameters, and schemas.

```typescript
// lib/parsers/openapi-parser.ts
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI, OpenAPIV3 } from 'openapi-types';

export interface ApiEndpoint {
  path: string;
  method: string;
  operationId?: string;
  summary?: string;
  parameters: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: Record<string, string>;
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  type: string;
  required: boolean;
  description?: string;
}

export interface ApiRequestBody {
  contentType: string;
  fields: ParsedField[];
}

export async function parseOpenApiSpec(input: string | File): Promise<ApiEndpoint[]> {
  let spec: OpenAPI.Document;

  if (typeof input === 'string') {
    // Input is a URL or raw spec text
    spec = await SwaggerParser.parse(input);
  } else {
    // Input is a File
    const text = await readFileAsText(input);
    const parsed = text.trim().startsWith('{') ? JSON.parse(text) : (await import('yaml')).parse(text);
    spec = await SwaggerParser.validate(parsed);
  }

  return extractEndpoints(spec as OpenAPIV3.Document);
}

function extractEndpoints(spec: OpenAPIV3.Document): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    if (!pathItem) continue;

    for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
      const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined;
      if (!operation) continue;

      endpoints.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId,
        summary: operation.summary,
        parameters: extractParameters(operation, pathItem),
        requestBody: extractRequestBody(operation),
        responses: extractResponses(operation),
      });
    }
  }

  return endpoints;
}

function extractParameters(
  operation: OpenAPIV3.OperationObject,
  pathItem: OpenAPIV3.PathItemObject,
): ApiParameter[] {
  const params = [
    ...(pathItem.parameters || []),
    ...(operation.parameters || []),
  ] as OpenAPIV3.ParameterObject[];

  return params.map((p) => ({
    name: p.name,
    in: p.in as ApiParameter['in'],
    type: (p.schema as OpenAPIV3.SchemaObject)?.type || 'string',
    required: p.required || false,
    description: p.description,
  }));
}

function extractRequestBody(operation: OpenAPIV3.OperationObject): ApiRequestBody | undefined {
  const body = operation.requestBody as OpenAPIV3.RequestBodyObject | undefined;
  if (!body?.content) return undefined;

  const contentType = Object.keys(body.content)[0];
  const schema = body.content[contentType]?.schema as OpenAPIV3.SchemaObject;

  return {
    contentType,
    fields: schemaToFields(schema),
  };
}

function schemaToFields(schema: OpenAPIV3.SchemaObject | undefined): ParsedField[] {
  if (!schema?.properties) return [];

  return Object.entries(schema.properties).map(([name, prop]) => {
    const p = prop as OpenAPIV3.SchemaObject;
    return {
      name,
      type: p.type || 'object',
      description: p.description,
      required: schema.required?.includes(name) || false,
      children: p.type === 'object' ? schemaToFields(p) : undefined,
    };
  });
}

function extractResponses(operation: OpenAPIV3.OperationObject): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [status, response] of Object.entries(operation.responses || {})) {
    result[status] = (response as OpenAPIV3.ResponseObject).description || '';
  }
  return result;
}
```

## Pattern 6: Unified File Processor

A single function that routes files to the correct parser based on type.

```typescript
// lib/parsers/index.ts

export interface ProcessedFile {
  fileName: string;
  fileType: SupportedFileType;
  structures: ParsedStructure[];
  endpoints?: ApiEndpoint[];
  rawText?: string;
}

export async function processUploadedFile(file: File): Promise<ProcessedFile> {
  const { type } = detectFileType(file);

  switch (type) {
    case 'json': {
      const text = await readFileAsText(file);
      const parsed = JSON.parse(text);

      // Check if it's an OpenAPI spec
      if (parsed.openapi || parsed.swagger) {
        const endpoints = await parseOpenApiSpec(file);
        return { fileName: file.name, fileType: 'openapi', structures: [], endpoints };
      }

      const structures = await parseJsonFile(file);
      return { fileName: file.name, fileType: 'json', structures };
    }

    case 'yaml': {
      // YAML files are likely OpenAPI specs
      const endpoints = await parseOpenApiSpec(file);
      return { fileName: file.name, fileType: 'openapi', structures: [], endpoints };
    }

    case 'pdf': {
      const pages = await parsePdfFile(file);
      const rawText = pages.map((p) => p.text).join('\n\n');
      const endpoints = extractEndpointsFromText(rawText);
      return {
        fileName: file.name,
        fileType: 'pdf',
        structures: [],
        endpoints: endpoints.map((path) => ({
          path,
          method: 'GET',
          parameters: [],
          responses: {},
        })),
        rawText,
      };
    }

    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}
```

## Pattern 7: Upload Progress & State Management

Track upload and processing state in the parent component.

```tsx
type UploadState =
  | { status: 'idle' }
  | { status: 'reading'; fileName: string }
  | { status: 'parsing'; fileName: string; progress: number }
  | { status: 'done'; result: ProcessedFile }
  | { status: 'error'; message: string };

function useFileProcessor() {
  const [state, setState] = useState<UploadState>({ status: 'idle' });

  const processFile = useCallback(async (file: File) => {
    setState({ status: 'reading', fileName: file.name });

    try {
      setState({ status: 'parsing', fileName: file.name, progress: 0 });
      const result = await processUploadedFile(file);
      setState({ status: 'done', result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ status: 'error', message });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle' }), []);

  return { state, processFile, reset };
}
```

## Critical Rules

1. **Always validate file type before parsing** — Never trust file extensions alone, check MIME type too
2. **Set max file size** — Prevent memory issues with large uploads (10 MB default for MVP)
3. **Run PDF.js in a web worker** — Set `workerSrc` to avoid blocking the main thread
4. **Handle parsing errors gracefully** — Show user-friendly messages, not stack traces
5. **Use `FileReader` API** for client-side reading — Never send files to the server unnecessarily for MVP
6. **One file at a time** — For the MVP, process files sequentially to keep state simple
7. **Validate OpenAPI specs** — Use `SwaggerParser.validate()` not just `parse()` to catch invalid specs
8. **Clean extracted text** — PDF text extraction is messy, always normalize whitespace
