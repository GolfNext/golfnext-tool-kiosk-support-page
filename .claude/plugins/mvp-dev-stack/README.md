# MVP Dev Stack Plugin

A Claude Code / Cowork plugin for building MVPs with **React + Tailwind CSS + Node.js**.

## Skills Included

| Skill | Description |
|-------|-------------|
| **react-best-practices** | Component architecture, hooks, state management, performance patterns |
| **tailwind-css** | Tailwind v4 setup, responsive patterns, component recipes, dark mode |
| **nodejs-backend** | Express setup, routing, controllers, error handling, validation with Zod |
| **react-flow** | @xyflow/react patterns: custom nodes, custom edges, handles, viewport control, graph persistence |
| **ai-integration** | Vercel AI SDK with OpenAI & Anthropic: streaming chat, tool calling, structured output, provider switching |
| **project-structure** | Monorepo/Next.js structure, naming conventions, config templates |
| **testing-basics** | Vitest + React Testing Library patterns, API testing, MVP testing strategy |

## Slash Commands

| Command | Description |
|---------|-------------|
| `/scaffold-mvp` | Set up a new project with full stack |
| `/add-component` | Generate a React component with TypeScript + tests |
| `/add-api-route` | Generate API route with controller, service, and validation |

## Installation

### Claude Code
```bash
# Upload as plugin
claude plugin add /path/to/mvp-dev-plugin
```

### Cowork
1. Zip this folder
2. Open Cowork → Plugins → Upload plugin
3. Or drag the ZIP into Cowork

## Customization

Edit any `SKILL.md` file to match your specific preferences:
- Update Tailwind theme colors to match your brand (GolfNext)
- Add project-specific naming conventions
- Adjust backend patterns for your database choice
