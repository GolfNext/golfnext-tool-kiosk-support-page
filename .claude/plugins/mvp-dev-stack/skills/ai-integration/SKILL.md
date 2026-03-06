---
name: ai-integration
description: AI API integration patterns using Vercel AI SDK with OpenAI and Anthropic providers. Use when implementing AI chat, streaming responses, tool calling, text generation, or connecting to LLM APIs. Triggers on AI SDK, useChat, generateText, streamText, OpenAI, Anthropic, Claude API, GPT API, LLM integration.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# AI Integration with Vercel AI SDK

Use the Vercel AI SDK as a unified abstraction layer over OpenAI and Anthropic APIs. This gives you provider-switching with zero code changes.

## Installation

```bash
# Core SDK
pnpm add ai

# Provider(s) — install one or both
pnpm add @ai-sdk/openai
pnpm add @ai-sdk/anthropic

# For tool schemas
pnpm add zod
```

## Provider Setup

```typescript
// lib/ai.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// String format (simplest)
const model = 'openai/gpt-4o';
const model = 'anthropic/claude-4-sonnet';

// Provider instance (more control)
const model = openai('gpt-4o');
const model = anthropic('claude-4-sonnet');

// Environment variables needed:
// OPENAI_API_KEY=sk-...
// ANTHROPIC_API_KEY=sk-ant-...
```

## Pattern 1: Text Generation (Server-Side)

```typescript
// app/api/generate/route.ts
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: anthropic('claude-4-sonnet'),
    system: 'You are a helpful golf equipment advisor.',
    prompt,
    maxTokens: 1000,
  });

  return Response.json({ text: result.text });
}
```

## Pattern 2: Streaming Chat (Most Common for MVPs)

### API Route
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-4-sonnet'),
    system: `You are an AI assistant for GolfNext. 
      Help users with golf equipment, workflows, and product questions.
      Be friendly, concise, and knowledgeable.`,
    messages,
    maxTokens: 2000,
  });

  return result.toDataStreamResponse();
}
```

### Client Component
```tsx
// components/Chat.tsx
'use client';

import { useChat } from 'ai/react';

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
              m.role === 'user'
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-surface-raised border border-border'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-surface-raised border border-border px-4 py-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask something..."
            className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

## Pattern 3: Tool Calling (AI with Actions)

```typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-4-sonnet'),
    system: 'You help users find golf equipment. Use tools to search products and get pricing.',
    messages,
    maxSteps: 5, // Allow multi-step tool calling
    tools: {
      searchProducts: tool({
        description: 'Search for golf products by name or category',
        parameters: z.object({
          query: z.string().describe('Search query'),
          category: z.enum(['drivers', 'irons', 'putters', 'balls', 'accessories']).optional(),
          maxPrice: z.number().optional(),
        }),
        execute: async ({ query, category, maxPrice }) => {
          // Call your API or database
          const products = await db.products.search({ query, category, maxPrice });
          return products;
        },
      }),
      getProductDetails: tool({
        description: 'Get detailed information about a specific product',
        parameters: z.object({
          productId: z.string(),
        }),
        execute: async ({ productId }) => {
          const product = await db.products.findById(productId);
          return product;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
```

## Pattern 4: Structured Output (JSON from AI)

```typescript
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const productAnalysis = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  topics: z.array(z.string()),
  summary: z.string(),
  suggestedActions: z.array(z.string()),
});

const result = await generateObject({
  model: anthropic('claude-4-sonnet'),
  schema: productAnalysis,
  prompt: `Analyze this customer review: "${review}"`,
});

// result.object is fully typed as { sentiment, topics, summary, suggestedActions }
```

## Pattern 5: Provider Switching

```typescript
// lib/ai.ts — Switch provider via environment variable
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export function getModel() {
  const provider = process.env.AI_PROVIDER || 'anthropic';
  
  switch (provider) {
    case 'openai':
      return openai(process.env.OPENAI_MODEL || 'gpt-4o');
    case 'anthropic':
      return anthropic(process.env.ANTHROPIC_MODEL || 'claude-4-sonnet');
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

// Usage in any route:
import { getModel } from '@/lib/ai';

const result = streamText({
  model: getModel(),
  // ... rest of config
});
```

## Environment Variables

```env
# .env.local
AI_PROVIDER=anthropic

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-4-sonnet

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

## Critical Rules

1. **Never expose API keys client-side** — All AI calls go through API routes
2. **Always stream for chat** — Use `streamText` + `useChat`, never `generateText` for chat UIs
3. **Set maxTokens** — Prevent runaway costs
4. **Use Zod schemas for tools** — Type-safe tool parameters
5. **Handle errors gracefully** — Show user-friendly messages, log details server-side
6. **Rate limit your API routes** — Prevent abuse (use middleware or Vercel's rate limiting)
7. **Use `maxSteps`** for tool calling — Allows the AI to call multiple tools in sequence
8. **Prefer Vercel AI SDK** over raw API calls — Unified interface, streaming, tool calling built-in

## Cost Optimization Tips

- Use `claude-4-haiku` or `gpt-4o-mini` for simple tasks (classification, extraction)
- Use `claude-4-sonnet` or `gpt-4o` for complex reasoning and generation
- Cache common prompts/responses where appropriate
- Set appropriate `maxTokens` per use case
- Monitor usage via provider dashboards
