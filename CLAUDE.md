# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A visual codebase exploration tool that bridges the gap between systems-level understanding and code-level understanding. It is NOT a documentation tool — it is a **reconnection tool** for developers who ship fast with AI assistance but lose touch with the micro-details of their own code.

The tool takes a codebase (GitHub URL or local path), agentically explores it via the Claude Agent SDK, and produces a layered visual representation that lets you drill from architecture down to individual lines of code.

## Project Status

Pre-implementation design phase. The `info/` directory contains finalized design decisions and research. The `blueprint/` directory contains the agent output schema. The `example/` directory contains sample data for visual mockups. No application code has been written yet.

## Architecture Overview

The system has two decoupled concerns (see `info/modular_thinking.md`):

1. **Agent Engine** — Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) scans a codebase and produces structured JSON output conforming to the schema in `blueprint/agent_output_schema.md`
2. **Visual Frontend** — React/Next.js app that consumes the agent's JSON output and renders the interactive visualization

### The Visual System (Two Levels)

**System Level (Top Level):** A layered reconstruction of the codebase architecture. Not a static diagram — layers build incrementally (Layer 1 = simplest mental model, Layer N = complete graph). Has static mode (browse freely) and dynamic mode (play/pause/step/rewind controls). Uses ELK.js for layout (computed once from the complete graph; layer transitions only show/hide elements, never recompute positions) and React Flow for rendering.

**Code Level:** Opened by clicking a component in the system view. 2-pane layout: source code (left) + plain English explanation (right). Has static mode and dynamic mode with line-by-line or chunk-by-chunk progression with typewriter animation.

### Agent Output Schema

Defined in `blueprint/agent_output_schema.md`. Three top-level fields:
- `codebase` — name and source
- `graph` — complete set of nodes and edges (defined once; layers reference into it)
- `layers` — ordered array; each layer adds new nodes/edges and carries a Feynman-style explanation

Node `type` maps to colors on the frontend (`client`, `server`, `storage`, `gateway`, `auth`, `cache`, `messaging`, `service`). Edges are NEVER labeled — text only exists inside node rectangles.

## Tech Stack

- **Language:** TypeScript (unified across agent engine and frontend)
- **Agent Engine:** `@anthropic-ai/claude-agent-sdk` (Node.js 18+)
- **Frontend:** Next.js + React
- **Graph Rendering:** React Flow (`@xyflow/react`)
- **Layout Engine:** ELK.js
- **Animation:** GSAP (timeline/path/typewriter) + Motion (React component transitions)
- **Syntax Highlighting:** Shiki + react-shiki (SSR, CSS variable dual themes)
- **Split Pane:** allotment
- **Theming:** next-themes + Tailwind CSS dark mode
- **Deployment:** Vercel

## Hard Requirements

- `ANTHROPIC_API_KEY` environment variable must be set and funded
- Node.js 18+

## Sacred Rules

These are non-negotiable and must be respected in all work:

1. **Be honest, not sycophantic** — no lies, manipulation, or patronizing behavior
2. **Do not pollute base Python** — never install packages into the system Python
3. **Use Claude Code programmatically** — the agent engine uses the Claude Agent SDK, not a custom API loop
4. **No rushing** — only ship high-quality work of exceptionally high standards
5. **No clutter** — every element must earn its place; whitespace is a feature

## Explanation Philosophy

All explanations (layer descriptions, code annotations) follow strict rules from `info/explanation_philosophy.md`:

- **WHAT-first:** Always say WHAT something is in one direct line before any context or reasoning
- **WHY-to-HOW progression:** Chunk level = WHAT + WHY (architectural). Line level = WHAT + HOW (mechanical)
- **Feynman standard:** Simple, accessible, built from the ground up, no jargon dumps
- **Never** list benefits before saying what something IS. Never show test/sample data.

## Aesthetic Rules

From `info/aesthetic_specs.md`:

- Component rectangles: translucent, flat, thin border, subtle fill — no shadows or gloss
- Rectangles must fully house their text with margins; text never overflows
- Data flow lines: dashed, with animated particles showing direction
- Edges NEVER have text labels; text ONLY inside node rectangles
- Dashed flow paths NEVER enter/penetrate component rectangles

## Key Design Decisions (and Why)

- **Claude Agent SDK over raw API:** The core intelligence layer IS codebase exploration — Claude Code already has the best implementation of that capability. Rebuilding on the raw API would mean recreating Claude Code with extra steps. (See `info/design_choice.md`)
- **TypeScript over Python:** The product's center of gravity is the visual frontend. One language eliminates the glue layer. (See `info/tech_stack.md`)
- **ELK.js over dagre:** dagre is deprecated per React Flow docs, has no label overlap prevention, and no compound node support. ELK's layered algorithm is purpose-built for directed architecture flows.
- **GSAP + Motion hybrid:** GSAP for complex timeline/path animations; Motion for React component mount/unmount transitions.
- **Shiki over Prism:** SSR support, zero client JS, CSS variable dual themes work with next-themes class toggle.
- **Layout computed once:** ELK runs on the complete final-layer graph. Layer transitions only show/hide elements at pre-computed positions — never recompute layout.

## Directory Structure

```
info/               Design decisions, research, requirements (read-only reference)
blueprint/          Agent output schema and structural contracts
example/            Sample data and visual mockups
  visual mockup/    HTML mockup files and sample agent output JSON
  complete workflow/ End-to-end workflow examples
```
