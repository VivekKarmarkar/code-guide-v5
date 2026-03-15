# Visualization Library Research

Research conducted by a swarm of 5 agents on 2026-03-14, sourcing from official documentation.

---

## The Recommended Visualization Stack

| Layer | Winner | Why |
|-------|--------|-----|
| **Graph/Diagram** | **React Flow** | Native React, custom CSS nodes for glassmorphism, built-in animated edges, dark mode prop |
| **Layout Engine** | **ELK.js** | Only engine with built-in label-aware layout, prevents text-line intersections, layered algorithm perfect for architecture diagrams |
| **Animation** | **GSAP** (+ Motion for React transitions) | Best timeline controls (play/pause/step/scrub), path particles via MotionPath, typewriter via SplitText, now fully free |
| **Syntax Highlighting** | **Shiki + react-shiki** | SSR, zero client JS, dual dark/light themes via CSS variables |
| **Typewriter Effect** | **Custom CSS reveal over pre-highlighted Shiki** | Pre-render with Shiki, reveal progressively — avoids expensive re-highlighting |
| **Split Pane** | **allotment** | Based on VS Code's split view, programmatic resize, draggable divider |
| **Dark/Light Mode** | **next-themes + Tailwind** | Zero-flicker, single class toggle, works with Shiki CSS var themes |

---

## What Got Eliminated and Why

- **D3.js standalone** — fights React's DOM, too low-level, 3-5x more code for equivalent features
- **Three.js** — massive overkill for 2D diagrams, WebGL overhead for a fundamentally 2D task
- **Cytoscape.js** — canvas-based rendering, can't do CSS glassmorphism effects
- **vis.js** — poor React integration, limited animation, community-maintained
- **dagre** — deprecated per React Flow docs, no label overlap prevention, no compound nodes
- **d3-force** — organic/network layouts, not suited for structured architecture diagrams
- **Rive** — requires pre-designed animations in visual editor, can't do dynamic data-driven diagrams
- **Monaco/CodeMirror** — overkill for read-only code display
- **prism-react-renderer** — decent but Shiki's SSR + CSS var themes are superior for Next.js

---

## Detailed Findings by Category

### 1. Graph/Diagram Libraries

**React Flow (@xyflow/react)** — RECOMMENDED
- Custom nodes are React components with full CSS control (glassmorphism via `backdrop-filter`)
- Built-in `animated: true` prop for dashed edges + `AnimatedSVGEdge` for particles
- Dynamic node addition via React state
- Full event system: `onNodeClick`, `onNodesChange`, etc.
- Built-in `colorMode` prop for dark/light/system theming
- First-class TypeScript support
- ~31K GitHub stars, actively maintained
- Sources: https://reactflow.dev/learn/customization/custom-nodes, https://reactflow.dev/examples/edges/animating-edges, https://reactflow.dev/learn/advanced-use/typescript

**Cytoscape.js** — Runner-up (best for graph algorithms or 10K+ nodes)
- Canvas-based: no CSS glassmorphism (limited to flat translucent fills)
- Rich layout extension ecosystem (CoSE, fcose, klay, cola)
- Third-party React wrapper (`react-cytoscapejs`)
- Manual dark/light theming
- Sources: https://js.cytoscape.org/#style, https://github.com/plotly/react-cytoscapejs

**vis-network** — Not recommended
- Poor React integration, community-maintained
- Limited animation capabilities, no particle effects
- Sources: https://visjs.github.io/vis-network/docs/network/

### 2. Layout Engines

**ELK.js** — RECOMMENDED
- Built-in label-edge overlap prevention (`spacing.edgeLabel`, `spacing.labelNode`)
- `elk.layered` algorithm purpose-built for directed architectural flows
- Compound/nested node support
- Port support for precise connection points
- Web Worker support for non-blocking layout
- Official React Flow integration example
- Built-in TypeScript types
- Tradeoff: ~1.5MB bundle size, steep learning curve
- Sources: https://github.com/kieler/elkjs, https://eclipse.dev/elk/, https://reactflow.dev/examples/layout/elkjs

**dagre** — Fallback option (simpler, lighter)
- ~40KB bundle, synchronous API
- Good for simple DAGs but no compound nodes, no label overlap prevention
- React Flow docs note it's deprecated in favor of ELK
- Sources: https://github.com/dagrejs/dagre, https://reactflow.dev/examples/layout/dagre

**d3-force** — Not recommended for architecture diagrams
- Organic/network layouts, non-deterministic results
- No concept of edge geometry, no label awareness
- Best for dynamic updates but wrong paradigm for structured diagrams
- Sources: https://d3js.org/d3-force

### 3. Animation Frameworks

**GSAP** — RECOMMENDED (best overall for this use case)
- `DrawSVGPlugin` for animated dashed line drawing
- `MotionPathPlugin` for particles moving along paths
- `SplitText` for typewriter effects (character splitting)
- `gsap.timeline()` with `play()`, `pause()`, `resume()`, `seek()`, `progress()` — full scrubbing
- `@gsap/react` package with `useGSAP()` hook
- Excellent performance, runs outside React's render cycle
- Now fully free for commercial use (Webflow acquired GreenSock)
- Sources: https://gsap.com/, https://www.npmjs.com/package/@gsap/react, https://webflow.com/blog/gsap-becomes-free

**Motion (Framer Motion)** — Best React integration (complement to GSAP)
- `<motion.div>` with `animate`, `initial`, `exit` props
- `AnimatePresence` for mount/unmount animations
- `useAnimate()` with `play()`, `pause()`, `stop()` controls
- MIT license, built for React
- Weaker on path particles and text splitting (manual work needed)
- Sources: https://motion.dev/docs/react-animation, https://motion.dev/docs/react-use-animate

**Hybrid approach:** Use Motion for React component-level transitions (node appear/disappear) and GSAP for complex path animations and timeline orchestration.

**Rive** — NOT recommended
- Requires pre-designed animations in Rive editor
- Cannot generate dynamic data-driven diagrams at runtime
- Sources: https://rive.app/docs/runtimes/react/react

**D3 Transitions** — Not recommended standalone
- Capable but verbose, awkward with React, no built-in play/pause
- Sources: https://d3js.org/d3-transition

### 4. Code Display Libraries

**Shiki + react-shiki** — RECOMMENDED for syntax highlighting
- SSR support, zero client-side JS for highlighting in Next.js
- Built-in dual theme via CSS variables: `themes: { light: 'github-light', dark: 'github-dark' }`
- Fine-grained bundles for importing only needed languages/themes
- Streaming support for live code arrival
- Sources: https://shiki.matsu.io/guide/dual-themes, https://github.com/AVGVSTVS96/react-shiki, https://shiki.style/guide/bundles

**Typewriter effect strategy:**
1. Pre-render full code block with Shiki (get complete highlighted HTML)
2. Use CSS `clip-path` or `max-height` animation to progressively reveal characters
3. Overlay blinking cursor `<span>` at reveal boundary
4. Avoids expensive re-highlighting on every character

**allotment** — RECOMMENDED for split pane
- Based on VS Code's split view implementation
- `preferredSize` prop for initial divider positioning (px or %)
- Programmatic resize via `ref.current.resize([leftPx, rightPx])`
- Double-click sash to reset, snap-to behavior for collapsing
- Sources: https://github.com/johnwalley/allotment

### 5. Theming

**next-themes + Tailwind CSS dark mode + Shiki CSS var themes** — RECOMMENDED
- `next-themes`: zero-flicker SSR, system preference detection, localStorage persistence
- Tailwind v4: `@custom-variant dark` for `dark:` utility classes
- Shiki: CSS variables auto-respond to `.dark` class — no re-rendering needed
- Single class toggle switches entire app including syntax highlighting
- Sources: https://tailwindcss.com/docs/dark-mode, https://www.sujalvanjare.com/blog/dark-mode-nextjs15-tailwind-v4

### 6. D3.js and Three.js (Full-Stack Options) — NOT RECOMMENDED

**D3.js standalone:**
- Too low-level, requires 3-5x more code than purpose-built tools
- DOM conflict with React (both want control)
- No built-in node/edge abstractions
- Sources: https://d3js.org/

**Three.js / React Three Fiber:**
- Massive overkill — 3D engine for a 2D diagram task
- Excellent for glassmorphism (shaders) but CSS `backdrop-filter` achieves 90% of the effect
- Text in WebGL is notoriously difficult
- No accessibility (screen readers can't read canvas)
- Sources: https://r3f.docs.pmnd.rs/, https://threejs.org/
