# Visual Mockup Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 visual mockup — a Next.js app that renders the system-level architecture diagram from `sample_agent_output_frontend_input.json`, with layer transitions, static/dynamic modes, and dark/light theming.

**Architecture:** A Next.js app with a single page. React Flow renders pre-positioned nodes and edges from the transformation pipeline output. A layer state machine controls which nodes/edges are visible. Nodes use CSS opacity transitions for fade-in on layer advance. Motion handles explanation text mount/unmount animations. next-themes provides dark/light mode via Tailwind CSS class toggle.

**Tech Stack:** Next.js, React, React Flow (`@xyflow/react`), Motion (`motion/react`), next-themes, Tailwind CSS

---

## Scope: Phase 1 Only

Per `info/modular_thinking.md`, this is Phase 1: "Visual Mockup Architecture." The LOOK for the architecture diagram with mock data. Components are **un-clickable** — no code-level view, no two-pane layout, no Shiki, no typewriter animations.

**In scope:**
- Three-zone viewport: top controls, middle diagram, bottom explanation
- React Flow rendering of nodes (translucent colored rectangles) and edges (dashed, animated)
- Custom `ArchitectureNode` component matching aesthetic specs
- Layer visibility (cumulative show/hide from pre-computed positions)
- Static mode: layer jump buttons to browse freely
- Dynamic mode: clean slate start, play/pause/step/rewind controls
- Fade-in animation when nodes/edges appear on layer advance
- Dark/light theme toggle
- Loads `sample_agent_output_frontend_input.json` as static import

**Out of scope:**
- Code-level 2-pane view (Phase 2)
- Clicking components to open code (Phase 2)
- Agent engine / Claude Agent SDK (Phase 3)
- Shiki syntax highlighting, typewriter animations (Phase 2)
- API routes, dynamic data loading (Phase 3)

---

## Data Contract

The app consumes `FrontendInput` JSON (produced by the transformation pipeline). Key fields:

```typescript
interface FrontendInput {
  codebase: { name: string; source: string };
  layers: LayerMeta[];           // cumulative nodeIds/edgeIds per layer
  reactFlow: {
    nodes: RFNode[];             // positions, colors, dimensions pre-computed
    edges: RFEdge[];             // animated: true, dashed style pre-set
  };
}
```

The React Flow nodes/edges are ALREADY formatted — positions computed by ELK, colors resolved, dimensions set. The frontend's job is to:
1. Filter `reactFlow.nodes` and `reactFlow.edges` based on the current layer's `nodeIds`/`edgeIds`
2. Render them with the correct visual style
3. Show the current layer's `explanation` text below the diagram

---

## File Structure

```
frontend/
  app/
    layout.tsx              — Root layout: ThemeProvider, global styles, font
    page.tsx                — Single page: loads JSON, renders SystemView
    globals.css             — Tailwind directives, CSS variables for dark/light
  components/
    SystemView.tsx          — Main orchestrator: three-zone layout, layer state
    DiagramCanvas.tsx       — React Flow canvas: renders filtered nodes/edges
    ArchitectureNode.tsx    — Custom React Flow node: translucent colored rect
    ControlBar.tsx          — Top strip: mode toggle, layer nav, theme toggle
    ExplanationPanel.tsx    — Bottom area: layer title + explanation text
    ThemeToggle.tsx         — Dark/light toggle button
  hooks/
    useLayerState.ts        — Layer state machine: current layer, mode, controls
  lib/
    data.ts                 — Static import + re-export of the sample JSON
    types.ts                — FrontendInput, LayerMeta, RFNode, RFEdge types
  package.json
  next.config.ts
  postcss.config.mjs
  tsconfig.json
```

All files live inside `frontend/` at the project root — same pattern as `transformation/`. A standalone piece of software that reads sample data from `example/` via a relative import. We refine it with sample data now, then route real agent output through it later.

---

## Chunk 1: Project Scaffolding

### Task 1: Initialize Next.js project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/postcss.config.mjs`
- Create: `frontend/app/globals.css`
- Create: `frontend/app/layout.tsx`
- Create: `frontend/app/page.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "visual-mockup-architecture",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@xyflow/react": "^12.4.0",
    "motion": "^12.0.0",
    "next-themes": "^0.4.4"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

- [ ] **Step 2: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create postcss.config.mjs**

Tailwind v4 uses CSS-based config (no tailwind.config.ts needed):

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 5: Create globals.css**

```css
@import "tailwindcss";

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --edge-stroke: #9ca3af;
}

.dark {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #27272a;
  --edge-stroke: #6b7280;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

- [ ] **Step 6: Create app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Guide — Visual Mockup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create app/page.tsx (placeholder)**

```tsx
export default function Home() {
  return <div className="h-screen flex items-center justify-center text-[var(--text-secondary)]">Loading...</div>;
}
```

- [ ] **Step 8: Install dependencies and verify dev server starts**

```bash
cd frontend && npm install && npm run dev
```

Expected: Dev server starts on localhost:3000, shows "Loading..." text.

- [ ] **Step 9: Commit**

```bash
git add "frontend/"
git commit -m "scaffold: Next.js project for visual mockup architecture"
```

---

### Task 2: Types and data loading

**Files:**
- Create: `frontend/lib/types.ts`
- Create: `frontend/lib/data.ts`

- [ ] **Step 1: Create lib/types.ts**

Copy the frontend-facing types from the transformation pipeline. These are the types the React components consume:

```typescript
export interface FrontendInput {
  codebase: { name: string; source: string };
  layers: LayerMeta[];
  reactFlow: {
    nodes: RFNode[];
    edges: RFEdge[];
  };
}

export interface LayerMeta {
  title: string;
  explanation: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface RFNode {
  id: string;
  type: "architectureNode";
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    semanticType: string;
    color: string;
    layerIndex: number;
    edgeCount: number;
    width: number;
    height: number;
  };
  style: { width: number; height: number };
}

export interface RFEdge {
  id: string;
  source: string;
  target: string;
  type: "default";
  animated: true;
  style: { strokeDasharray: string; stroke: string; strokeWidth: number };
  data: {
    layerIndex: number;
    originalEdgeId: string;
    direction: "fwd" | "rev";
  };
}
```

- [ ] **Step 2: Create lib/data.ts**

```typescript
import type { FrontendInput } from "./types";
import sampleData from "../example/visual mockup architecture/data/sample_agent_output_frontend_input.json";

export const frontendInput: FrontendInput = sampleData as FrontendInput;
```

Note: The path has spaces — this is fine for JSON imports with `resolveJsonModule: true` in tsconfig. If it causes issues, we can symlink or copy the data file.

- [ ] **Step 3: Verify import works**

Update `app/page.tsx` temporarily to log node count:

```tsx
import { frontendInput } from "@/lib/data";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center text-[var(--text-secondary)]">
      {frontendInput.reactFlow.nodes.length} nodes, {frontendInput.reactFlow.edges.length} edges
    </div>
  );
}
```

Expected: Page shows "4 nodes, 5 edges".

- [ ] **Step 4: Commit**

```bash
git add "frontend/lib/"
git commit -m "feat: add types and static data loader"
```

---

## Chunk 2: Core Components

### Task 3: Layer state machine hook

**Files:**
- Create: `frontend/hooks/useLayerState.ts`

This hook manages ALL layer navigation logic. Components call it to get the current visible nodes/edges and control playback.

- [ ] **Step 1: Create hooks/useLayerState.ts**

```typescript
"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { LayerMeta } from "@/lib/types";

export type Mode = "static" | "dynamic";

interface LayerState {
  mode: Mode;
  currentLayer: number;          // -1 in dynamic mode = clean slate (nothing shown)
  totalLayers: number;
  layerMeta: LayerMeta | null;   // null when clean slate
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
  // Controls
  setMode: (mode: Mode) => void;
  jumpToLayer: (index: number) => void;  // static mode only
  step: () => void;
  rewind: () => void;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
}

export function useLayerState(layers: LayerMeta[]): LayerState {
  const [mode, setModeRaw] = useState<Mode>("static");
  const [currentLayer, setCurrentLayer] = useState(layers.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    clearPlayback();
    if (newMode === "dynamic") {
      setCurrentLayer(-1);  // clean slate
    } else {
      setCurrentLayer(layers.length - 1);  // show all in static
    }
    setModeRaw(newMode);
  }, [layers.length, clearPlayback]);

  const step = useCallback(() => {
    setCurrentLayer((prev) => Math.min(prev + 1, layers.length - 1));
  }, [layers.length]);

  const rewind = useCallback(() => {
    clearPlayback();
    setCurrentLayer((prev) => Math.max(prev - 1, mode === "dynamic" ? -1 : 0));
  }, [mode, clearPlayback]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    clearPlayback();
  }, [clearPlayback]);

  // Playback interval
  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setCurrentLayer((prev) => {
        if (prev >= layers.length - 1) {
          clearPlayback();
          return prev;
        }
        return prev + 1;
      });
    }, 1500);  // 1.5s per layer — slow enough to read explanations

    return () => clearPlayback();
  }, [isPlaying, layers.length, clearPlayback]);

  const jumpToLayer = useCallback((index: number) => {
    if (mode === "static") {
      setCurrentLayer(Math.max(0, Math.min(index, layers.length - 1)));
    }
  }, [mode, layers.length]);

  // Compute visible sets (memoized on currentLayer to preserve referential equality)
  const layerMeta = currentLayer >= 0 ? layers[currentLayer] : null;
  const visibleNodeIds = useMemo(
    () => new Set(currentLayer >= 0 ? layers[currentLayer].nodeIds : []),
    [currentLayer, layers]
  );
  const visibleEdgeIds = useMemo(
    () => new Set(currentLayer >= 0 ? layers[currentLayer].edgeIds : []),
    [currentLayer, layers]
  );

  return {
    mode,
    currentLayer,
    totalLayers: layers.length,
    layerMeta,
    visibleNodeIds,
    visibleEdgeIds,
    setMode,
    jumpToLayer,
    step,
    rewind,
    play,
    pause,
    isPlaying,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add "frontend/hooks/"
git commit -m "feat: add useLayerState hook for layer navigation"
```

---

### Task 4: ArchitectureNode component

**Files:**
- Create: `frontend/components/ArchitectureNode.tsx`

This is the custom React Flow node. Must match aesthetic specs exactly:
- Translucent, flat, colored rectangle
- Thin border, subtle fill, NO shadows, NO gloss
- Text fully housed inside with margins
- Label (bold, larger) + description (smaller) centered

- [ ] **Step 1: Create components/ArchitectureNode.tsx**

```tsx
"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface ArchitectureNodeData {
  label: string;
  description: string;
  semanticType: string;
  color: string;
  layerIndex: number;
  edgeCount: number;
  width: number;
  height: number;
}

function ArchitectureNodeComponent({ data }: { data: ArchitectureNodeData }) {
  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: `${data.color}18`,    // ~10% opacity fill
        borderColor: `${data.color}60`,         // ~38% opacity border
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        cursor: "default",                       // un-clickable in Phase 1
        animation: "fadeIn 0.4s ease-out",
      }}
      className="flex flex-col items-center justify-center px-4 py-3"
    >
      <div
        className="font-semibold leading-tight"
        style={{ color: data.color, fontSize: 16 }}
      >
        {data.label}
      </div>
      <div
        className="mt-1 text-center leading-snug"
        style={{ color: "var(--text-secondary)", fontSize: 13 }}
      >
        {data.description}
      </div>

      {/* Invisible handles for edge connections — all 4 sides */}
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent);
```

Key aesthetic decisions:
- Fill: node color at 10% opacity (`${color}18`) → translucent
- Border: node color at 38% opacity (`${color}60`) → thin, subtle
- No `box-shadow`, no gradients → flat
- Border radius 8px → gentle rounding, not pill-shaped
- Description uses `--text-secondary` CSS variable → works in both themes
- `cursor: "default"` signals un-clickable in Phase 1
- `animation: "fadeIn 0.4s"` — nodes fade in when they first appear on layer advance (CSS keyframe defined in globals.css)
- Handles on all 4 sides — React Flow picks the nearest pair, preventing edge paths from looping around nodes unnecessarily

- [ ] **Step 2: Commit**

```bash
git add "frontend/components/ArchitectureNode.tsx"
git commit -m "feat: add ArchitectureNode custom React Flow node"
```

---

### Task 5: DiagramCanvas component

**Files:**
- Create: `frontend/components/DiagramCanvas.tsx`

Wraps React Flow. Filters nodes/edges by the current layer's visible sets. Registers the custom node type.

- [ ] **Step 1: Create components/DiagramCanvas.tsx**

```tsx
"use client";

import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArchitectureNode } from "./ArchitectureNode";
import type { RFNode, RFEdge } from "@/lib/types";

const nodeTypes = { architectureNode: ArchitectureNode };

interface DiagramCanvasProps {
  allNodes: RFNode[];
  allEdges: RFEdge[];
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
}

function DiagramCanvasInner({
  allNodes,
  allEdges,
  visibleNodeIds,
  visibleEdgeIds,
}: DiagramCanvasProps) {
  const { fitView } = useReactFlow();

  const nodes = useMemo(
    () => allNodes.filter((n) => visibleNodeIds.has(n.id)) as Node[],
    [allNodes, visibleNodeIds]
  );

  const edges = useMemo(
    () =>
      allEdges.filter((e) => visibleEdgeIds.has(e.id)).map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: "var(--edge-stroke)",
        },
      })) as Edge[],
    [allEdges, visibleEdgeIds]
  );

  // Re-fit view when visible node set changes
  useEffect(() => {
    // Small delay to let React Flow measure new nodes before fitting
    const timer = setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 50);
    return () => clearTimeout(timer);
  }, [nodes.length, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag
      zoomOnScroll
      minZoom={0.3}
      maxZoom={2}
    >
      <Background gap={0} size={0} />
    </ReactFlow>
  );
}

export function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
```

Notes:
- `ReactFlowProvider` wrapper required for `useReactFlow()` hook
- `fitView` with padding ensures the diagram centers nicely regardless of node count
- `useEffect` on `nodes.length` re-triggers `fitView` with smooth 300ms animation when nodes appear/disappear on layer change
- Nodes are NOT draggable (positions are pre-computed, must stay fixed)
- Edge stroke uses CSS variable so it adapts to dark/light theme
- Background is invisible (gap=0, size=0) — no grid dots or lines. Whitespace is a feature.
- No `proOptions: hideAttribution` — React Flow attribution is kept (requires Pro license to remove). Can be hidden with CSS in globals.css if needed: `.react-flow__attribution { display: none; }`

- [ ] **Step 2: Commit**

```bash
git add "frontend/components/DiagramCanvas.tsx"
git commit -m "feat: add DiagramCanvas with React Flow rendering"
```

---

### Task 6: ControlBar component

**Files:**
- Create: `frontend/components/ControlBar.tsx`
- Create: `frontend/components/ThemeToggle.tsx`

The top strip with mode toggle, layer navigation, and theme toggle.

- [ ] **Step 1: Create components/ThemeToggle.tsx**

```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;  // placeholder to prevent layout shift

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 flex items-center justify-center rounded-md
                 border border-[var(--border-color)]
                 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
```

- [ ] **Step 2: Create components/ControlBar.tsx**

```tsx
"use client";

import type { Mode } from "@/hooks/useLayerState";
import { ThemeToggle } from "./ThemeToggle";

interface ControlBarProps {
  mode: Mode;
  currentLayer: number;
  totalLayers: number;
  isPlaying: boolean;
  onSetMode: (mode: Mode) => void;
  onJumpToLayer: (index: number) => void;
  onStep: () => void;
  onRewind: () => void;
  onPlay: () => void;
  onPause: () => void;
}

export function ControlBar({
  mode,
  currentLayer,
  totalLayers,
  isPlaying,
  onSetMode,
  onJumpToLayer,
  onStep,
  onRewind,
  onPlay,
  onPause,
}: ControlBarProps) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
      {/* Left: Mode toggle */}
      <div className="flex items-center gap-1">
        <ModeButton active={mode === "static"} onClick={() => onSetMode("static")}>
          Static
        </ModeButton>
        <ModeButton active={mode === "dynamic"} onClick={() => onSetMode("dynamic")}>
          Dynamic
        </ModeButton>
      </div>

      {/* Center: Layer navigation */}
      <div className="flex items-center gap-2">
        {mode === "static" ? (
          // Static: layer jump buttons
          Array.from({ length: totalLayers }, (_, i) => (
            <button
              key={i}
              onClick={() => onJumpToLayer(i)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors
                ${currentLayer === i
                  ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                }`}
            >
              {i + 1}
            </button>
          ))
        ) : (
          // Dynamic: playback controls
          <>
            <ControlButton onClick={onRewind} disabled={currentLayer <= -1}>
              ⏪
            </ControlButton>
            {isPlaying ? (
              <ControlButton onClick={onPause}>⏸</ControlButton>
            ) : (
              <ControlButton onClick={onPlay} disabled={currentLayer >= totalLayers - 1}>
                ▶
              </ControlButton>
            )}
            <ControlButton onClick={onStep} disabled={currentLayer >= totalLayers - 1}>
              ⏭
            </ControlButton>
            <span className="text-xs text-[var(--text-secondary)] ml-2 tabular-nums">
              {currentLayer < 0 ? "—" : `${currentLayer + 1} / ${totalLayers}`}
            </span>
          </>
        )}
      </div>

      {/* Right: Theme toggle */}
      <ThemeToggle />
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-md transition-colors
        ${active
          ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
    >
      {children}
    </button>
  );
}

function ControlButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-md
                 border border-[var(--border-color)]
                 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-colors"
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "frontend/components/ControlBar.tsx" "frontend/components/ThemeToggle.tsx"
git commit -m "feat: add ControlBar with mode toggle, layer nav, theme toggle"
```

---

### Task 7: ExplanationPanel component

**Files:**
- Create: `frontend/components/ExplanationPanel.tsx`

The bottom area showing the current layer's explanation. Per `layout_solution.md`: "Centered text, large and legible. No borders or background changes separating it from the diagram — it's part of the same visual composition."

- [ ] **Step 1: Create components/ExplanationPanel.tsx**

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import type { LayerMeta } from "@/lib/types";

interface ExplanationPanelProps {
  layerMeta: LayerMeta | null;
}

export function ExplanationPanel({ layerMeta }: ExplanationPanelProps) {
  return (
    <div className="h-28 flex flex-col items-center justify-center px-8">
      <AnimatePresence mode="wait">
        {layerMeta && (
          <motion.div
            key={layerMeta.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-2xl"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {layerMeta.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {layerMeta.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

Notes:
- `AnimatePresence mode="wait"` ensures the old explanation fades out before the new one fades in
- Keyed on `layerMeta.title` so Motion detects the change
- No borders, no background changes — just centered text floating below the diagram
- `max-w-2xl` prevents the text from stretching too wide on large screens

- [ ] **Step 2: Commit**

```bash
git add "frontend/components/ExplanationPanel.tsx"
git commit -m "feat: add ExplanationPanel with animated transitions"
```

---

## Chunk 3: Assembly and Polish

### Task 8: SystemView orchestrator

**Files:**
- Create: `frontend/components/SystemView.tsx`
- Modify: `frontend/app/page.tsx`

Assembles the three zones: ControlBar (top), DiagramCanvas (middle), ExplanationPanel (bottom). Connects the layer state hook to all children.

- [ ] **Step 1: Create components/SystemView.tsx**

```tsx
"use client";

import { useLayerState } from "@/hooks/useLayerState";
import { ControlBar } from "./ControlBar";
import { DiagramCanvas } from "./DiagramCanvas";
import { ExplanationPanel } from "./ExplanationPanel";
import type { FrontendInput } from "@/lib/types";

interface SystemViewProps {
  data: FrontendInput;
}

export function SystemView({ data }: SystemViewProps) {
  const layer = useLayerState(data.layers);

  return (
    <div className="h-screen flex flex-col">
      <ControlBar
        mode={layer.mode}
        currentLayer={layer.currentLayer}
        totalLayers={layer.totalLayers}
        isPlaying={layer.isPlaying}
        onSetMode={layer.setMode}
        onJumpToLayer={layer.jumpToLayer}
        onStep={layer.step}
        onRewind={layer.rewind}
        onPlay={layer.play}
        onPause={layer.pause}
      />

      <div className="flex-1 min-h-0">
        <DiagramCanvas
          allNodes={data.reactFlow.nodes}
          allEdges={data.reactFlow.edges}
          visibleNodeIds={layer.visibleNodeIds}
          visibleEdgeIds={layer.visibleEdgeIds}
        />
      </div>

      <ExplanationPanel layerMeta={layer.layerMeta} />
    </div>
  );
}
```

Notes:
- `h-screen flex flex-col` → full viewport height, three zones stack vertically
- `flex-1 min-h-0` on the diagram → takes all remaining space between control bar and explanation
- `min-h-0` is critical — without it, flex children with overflow content won't shrink below their content size

- [ ] **Step 2: Update app/page.tsx**

```tsx
import { frontendInput } from "@/lib/data";
import { SystemView } from "@/components/SystemView";

export default function Home() {
  return <SystemView data={frontendInput} />;
}
```

- [ ] **Step 3: Run dev server and verify**

```bash
cd frontend && npm run dev
```

Expected:
- Full-screen app with control bar at top, diagram in middle, explanation at bottom
- Static mode: 3 layer buttons, clicking each shows cumulative nodes/edges
- Dynamic mode: clean slate, step/play/rewind controls build up layers
- Dark/light toggle works
- Nodes are translucent colored rectangles with label + description
- Edges are dashed with animation
- No text on edges, no grid dots, no clutter

- [ ] **Step 4: Commit**

```bash
git add "frontend/components/SystemView.tsx" "frontend/app/page.tsx"
git commit -m "feat: assemble SystemView with three-zone layout"
```

---

### Task 9: Visual polish and spec compliance audit

This is a manual verification pass. Check every aesthetic rule from the spec files.

- [ ] **Step 1: Verify aesthetic specs** (`info/aesthetic_specs.md`)

Check in the browser:
- [ ] Component rectangles are translucent, flat, thin border, subtle fill — no shadows or gloss
- [ ] Text fully housed inside rectangles with margins, never overflows
- [ ] NO text labels on dashed edge lines
- [ ] Dashed flow paths do NOT enter/penetrate component rectangles
- [ ] Text only exists inside component rectangles
- [ ] Dashed lines with animated particles showing direction
- [ ] No clutter — every element earns its place, whitespace is generous

- [ ] **Step 2: Verify layout solution** (`info/layout_solution.md`)

- [ ] Three zones: top controls, middle diagram, bottom explanation
- [ ] Explanation is centered, large, legible, no borders/background separating it from diagram
- [ ] Nodes appear at pre-computed positions (not draggable)
- [ ] Layer transitions show/hide elements — positions never change
- [ ] Dark and light mode both produce clean, legible results

- [ ] **Step 3: Verify visual system** (`info/visual_system.md`)

- [ ] Static mode: buttons to jump to any layer freely
- [ ] Dynamic mode: starts from clean slate, rewind/play/pause/step work correctly
- [ ] Rewind goes back one layer
- [ ] Play builds up layers automatically
- [ ] Pause freezes current state
- [ ] Step advances one layer manually

- [ ] **Step 4: Fix any issues found**

If any spec violations are found, fix them and commit each fix individually.

- [ ] **Step 5: Final commit**

```bash
git commit -m "polish: visual spec compliance audit complete"
```
