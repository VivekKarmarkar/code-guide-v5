# Tech Stack Decision: TypeScript All The Way

## The Choice

Unified TypeScript stack — one language for the agent engine, orchestration, AND the visual frontend.

## Why TypeScript Over Python

- The Claude Agent SDK is TypeScript-native (`@anthropic-ai/claude-agent-sdk`)
- The product is fundamentally a **visual web application** with an agent engine behind it — the center of gravity is the frontend
- One language means no glue layer between backend and frontend, no API serialization between two worlds
- Rich, interactive, hierarchical visual systems live in the browser — that's JavaScript/TypeScript territory

## Why Not Python

- Python is great for the backend (Agent SDK, orchestration) but its UI options are limited:
  - Streamlit/Gradio — quick to prototype, but you hit a wall with custom interactive visuals
  - Dash/Panel — better for data viz, but not flexible enough for bespoke visual hierarchy systems
  - Desktop (Tkinter, PyQt) — not web-based, clunky for rich visuals
- Python backend + JS frontend = two languages, a connecting API layer, and a lot of plumbing
- That's overhead for a tool that's ultimately about **visual understanding**

## The Stack

- **Agent Engine:** `@anthropic-ai/claude-agent-sdk` (TypeScript)
- **Frontend:** React via Next.js (hierarchical, interactive, drill-down visuals)
- **Deployment:** Vercel (Next.js is built by Vercel — natural fit)
- **Single language** across the entire pipeline

## Deployment & Integration

- Next.js + Vercel is a seamless pairing — deploy and it's live
- Agent SDK calls run in Next.js API routes (server-side)
- Visual frontend is just React (client-side)
- Plugs directly into existing personal website already hosted on Vercel
- No extra infrastructure needed — the existing Vercel setup already supports this
