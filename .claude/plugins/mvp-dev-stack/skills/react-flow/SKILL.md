---
name: react-flow
description: React Flow (@xyflow/react) patterns for building node-based UIs, workflow editors, and interactive diagrams. Use when working with ReactFlow, custom nodes, custom edges, handles, viewport control, or graph visualization. Triggers on ReactFlow, @xyflow/react, nodes, edges, Handle, NodeProps, useReactFlow, fitView.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# React Flow (@xyflow/react) Patterns

Apply these patterns when building node-based UIs with React Flow.

## Installation & Setup

```bash
pnpm add @xyflow/react
```

```tsx
// IMPORTANT: Always import the styles
import '@xyflow/react/dist/style.css';
```

## Basic Flow Setup

```tsx
'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'Start' } },
  { id: '2', position: { x: 0, y: 150 }, data: { label: 'Process' } },
  { id: '3', type: 'output', position: { x: 0, y: 300 }, data: { label: 'End' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
];

export default function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
```

## Custom Nodes

Custom nodes are React components. Always type them with `NodeProps<T>`.

```tsx
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

// Define your node data type
type AINodeData = {
  label: string;
  model: string;
  status: 'idle' | 'processing' | 'done' | 'error';
};

type AINode = Node<AINodeData, 'aiNode'>;

export function AINode({ data, selected }: NodeProps<AINode>) {
  return (
    <div className={`rounded-lg border-2 bg-surface-raised px-4 py-3 shadow-sm
      ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
      ${data.status === 'processing' ? 'animate-pulse' : ''}
    `}>
      {/* Input handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !border-2 !border-white !bg-muted-foreground"
      />

      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${
          data.status === 'done' ? 'bg-success' :
          data.status === 'error' ? 'bg-error' :
          data.status === 'processing' ? 'bg-warning' : 'bg-border-strong'
        }`} />
        <span className="text-sm font-medium text-foreground">{data.label}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{data.model}</p>

      {/* Output handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !border-2 !border-white !bg-primary"
      />
    </div>
  );
}
```

### Register Custom Node Types

```tsx
import { useMemo } from 'react';

// IMPORTANT: Define nodeTypes outside component or memoize it
// Otherwise React Flow re-renders every node on every render
const nodeTypes = { aiNode: AINode };

// Or inside component with useMemo:
const nodeTypes = useMemo(() => ({ aiNode: AINode }), []);
```

## Custom Edges

```tsx
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

export function LabeledEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          className="pointer-events-auto absolute rounded bg-white px-2 py-1 text-xs shadow-sm"
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
```

## Programmatic Control with useReactFlow

```tsx
import { useReactFlow } from '@xyflow/react';

function FlowToolbar() {
  const {
    getNodes, getEdges,
    setNodes, setEdges,
    addNodes, addEdges,
    deleteElements,
    fitView, zoomIn, zoomOut,
    getNode, updateNode,
  } = useReactFlow();

  const addNewNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    addNodes({
      id,
      type: 'aiNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: 'New Node', model: 'claude-4-sonnet', status: 'idle' },
    });
  }, [addNodes]);

  return (
    <div className="absolute left-4 top-4 z-10 flex gap-2">
      <button onClick={addNewNode} className="rounded bg-primary px-3 py-1 text-sm text-white">
        Add Node
      </button>
      <button onClick={() => fitView({ padding: 0.2 })} className="rounded border px-3 py-1 text-sm">
        Fit View
      </button>
    </div>
  );
}
```

## Persisting Flow State

```tsx
// Save to backend
const onSave = useCallback(() => {
  const flow = {
    nodes: getNodes(),
    edges: getEdges(),
    viewport: getViewport(),
  };
  saveToAPI(flow);
}, [getNodes, getEdges, getViewport]);

// Restore from backend
const onRestore = useCallback(async () => {
  const flow = await loadFromAPI();
  if (flow) {
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setViewport(flow.viewport);
  }
}, [setNodes, setEdges, setViewport]);
```

## Critical Rules

1. **Always wrap ReactFlow in a parent with explicit dimensions** — `h-screen w-full` or fixed height
2. **Always import the CSS** — `import '@xyflow/react/dist/style.css'`
3. **Define nodeTypes/edgeTypes outside component or memoize** — prevents infinite re-renders
4. **Use `useNodesState` and `useEdgesState`** for controlled flows — handles immutable updates correctly
5. **ReactFlow must be inside `<ReactFlowProvider>`** if using `useReactFlow()` hook in child components
6. **Handle styling** — use `!` prefix in Tailwind to override React Flow defaults (e.g., `!bg-primary`)
7. **Always add `'use client'`** directive in Next.js — React Flow requires browser APIs

## Common Patterns for AI Workflow Builders

- **Input Node** → User prompt, file upload, API trigger
- **AI Processing Node** → LLM call with model selection, temperature, system prompt
- **Conditional Node** → Branch based on AI output (classification, routing)
- **Output Node** → Display result, save to DB, trigger webhook
- **Transform Node** → Parse JSON, extract fields, format text
