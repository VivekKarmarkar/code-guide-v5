# Visual System

## Top Level: Layered System Reconstruction

The top level is NOT a static architecture diagram. It is a layered reconstruction of the system — like watching a building being constructed floor by floor.

### The Concept

The agent scans a codebase and reconstructs its architecture from scratch, layer by layer, going from coarse to fine. Each layer adds complexity, building up the full system incrementally so the user understands not just WHAT the architecture is, but WHY it's shaped that way.

### Layers

- **Layer 1** might be: "At its core, this is a system that takes X and produces Y." One or two components. The simplest possible mental model.
- **Layer 2** adds complexity: "But to do that, it needs to handle authentication." New components appear, data flows animate between them.
- **Layer 3** adds more: "And the data doesn't go straight through — there's a caching layer here because..."
- **Layer N** is the full architectural diagram — all components, all data flows, the complete picture.

The number of layers is >= 1. For some systems, only 1 layer might make sense. The agent determines how many layers are appropriate for the codebase.

### Visual Representation at Each Layer

- **Components** are clean, minimal flat, translucent colored rectangles with description text at their center (thin border, subtle fill, no shadows or gloss — per brainstorming decision)
- **Data flows** are animated lines/particles between components showing how information travels through the system
- **Clicking a component** opens the Code Level view (see below)

### Two Modes: Static and Dynamic

**Static mode:**
- Buttons to jump to any layer freely
- Browse and explore at your own pace

**Dynamic mode:**
- Starts from a CLEAN SLATE — empty diagram, nothing shown until the user presses Step or Play
- Rewind/play/pause/step controls
- **Rewind** goes back one layer
- **Play** builds the system up at normal speed, layer by layer
- **Pause** freezes the current state
- **Step** builds one layer at a time, manually advancing
- Watch the system literally construct itself in front of you

### Explanation at Each Layer

Each layer comes with a Feynman / 3Blue1Brown style explanation:

- What is this layer?
- Why do we have it?
- How did the system evolve from the previous layer to this one?
- Written to avoid technical jargon
- Designed to create the "aha! moment" of self-discovery
- The goal is understanding through progressive construction, not information dumping

---

## Code Level: 2-Pane Live Code Walkthrough

Clicking a component in the top-level diagram opens a 2-pane window that bridges the gap from architecture to raw code.

### Layout

- **Left pane:** The actual source code for that component
- **Right pane:** Plain English explanation of the code
- **Divider:** Auto-positioned by default a small margin to the right of the longest line of code. User can adjust by click-and-drag.

### Two Modes: Static and Dynamic

**Static mode:**
- All code displayed on the left
- ONE coherent, flowing explanation of the entire code on the right — not fragmented line-by-line labels, but a single readable explanation
- Browse and read freely

**Dynamic mode (two submodes):**

- Starts from a CLEAN SLATE — empty panes, nothing shown until the user presses Step or Play
- Cursor typing speed must be SLOW — realistic live coding pace, not instant

**Line-by-line:**
- Step through the code one line at a time
- Each step: a live cursor writes out the code character by character (left to right) on the left pane at a realistic pace
- Once the code line is written, the corresponding English explanation renders character by character on the right pane
- ONLY the current line/chunk's explanation is shown on the right — previous explanations CLEAR when the next step begins
- As code accumulates on the left, it scrolls up gradually to maintain alignment between the current code and its explanation on the right

**Chunk-by-chunk:**
- Same live-writing mechanism but grouped by semantically meaningful code chunks (a function, a class, a logical block)
- Chunks are determined by the agent based on what forms a coherent unit of meaning
- Same clearing and alignment behavior as line-by-line

**Controls (consistent with system view):**
- **Rewind** — go back one line or chunk
- **Step** — advance one line or chunk manually
- **Play** — continuous loop through all steps, creating a live coding moment (essentially a looped step-by-step mode)
- **Pause** — freeze wherever you are

### Explanations at This Level

At the code level, explanations are fully granular:
- What is this code?
- Why is it there?
- All nitty-gritty details of the raw code — no more high-level abstractions
- Simple, plain English — still accessible, still aiming for the "aha! moment"

---

## The Full Journey

The visual system creates a continuous path from understanding to code:

**System Level (Top Level)** → Layered reconstruction of the architecture, coarse to fine, with Feynman-style explanations at each layer

↓ *click a component*

**Code Level** → 2-pane live code walkthrough with line-by-line or chunk-by-chunk exploration, plain English explanations for every piece of code

The experience flows from "what does this system do?" all the way down to "what does this line of code do and why is it here?"
