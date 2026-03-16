# Layout Solution

## The Problem

Given an arbitrary graph produced by the agent (any number of nodes, any topology, any edge directionality), render it as a clean, aesthetic, interactive layered diagram inside a web viewport.

## The Pipeline

### Step 1: Area Division

The viewport is divided into three zones:

- **Top strip** — interactive controls: mode toggle (static/dynamic), layer navigation (step/rewind or layer jump buttons). Fixed height (48px), always visible.
- **Middle area** — the core diagram. This is where nodes and edges are drawn. Takes the remaining space after the top strip and bottom area are subtracted from the viewport height.
- **Bottom area** — the English explanation for the current layer. Centered text, large and legible. No borders or background changes separating it from the diagram — it's part of the same visual composition. Height is determined by content (not hardcoded) — it grows or shrinks based on the explanation text length.

The diagram area's pixel dimensions are the viewport height minus the fixed top strip minus the content-sized bottom area. This is only fully known at render time, after the explanation text is laid out.

### Step 2: Layout Computation (Pre-Render)

The layout algorithm — a combination of ELK.js and an in-house font-based sizing algorithm — runs in a pre-computation step (the transformation pipeline), not at render time. It uses a fixed reference canvas (e.g. 1920×800) to compute:

1. **Node dimensions** — the in-house font algorithm takes the total reference canvas area, divides by the number of nodes, and uses the square root as an upper bound for node size. It starts at font size 18px and steps down until all nodes fit within the upper bound. One global font size is used for all nodes (visual consistency).

2. **Node positions and edge routes** — ELK.js takes the computed node dimensions and the edge topology, and produces absolute x, y positions for every node and orthogonal edge routing paths (bend points) that avoid nodes. ELK optimizes for: uniform spacing (via `baseValue`), minimal edge crossings, and clean edge routing.

The output is a set of **relative positions on a fixed canvas** — the spatial relationships between nodes (spacing, alignment, non-intersection of edges) are the desirable properties. The absolute pixel values are not important because they will be scaled at render time.

### Step 3: Render-Time Scaling

At render time, the actual diagram area is known (viewport height − 48px control bar − explanation panel height). React Flow's `fitView` scales the pre-computed layout to fit this area while preserving all relative spatial relationships. The layout is computed once and never recomputed — `fitView` only adjusts the zoom and pan to map the fixed canvas into the actual available space.

This means:
- The layout algorithm produces clean, uniformly-spaced positions on a reference canvas
- `fitView` scales that canvas into whatever space the diagram area actually occupies
- Relative proportions, spacing uniformity, and edge non-intersection are preserved through scaling

### Step 4: Graph Description

The data model for the graph:

- **Nodes** have:
  - A unique ID
  - A label (short name)
  - A description (longer text)
  - A color
  - A layer number (which layer this node first appears in)
  - Width and height (computed from the text content by the font algorithm)
  - Number of edges (derived from the edge list)

- **Edges** have:
  - A unique ID
  - A source node ID
  - A target node ID
  - Directionality: uni-directional (A → B) or bi-directional (A ↔ B, rendered as two separate directed edges)
  - A layer number (which layer this edge first appears in)
  - An SVG path (computed by ELK's orthogonal edge router, routing around nodes)

No text labels on edges. Ever. Text exists only inside node rectangles.

### Step 5: Graph Creation

The agent scans a codebase and produces the **complete graph** — this is the final layer. It contains every node and every edge that will ever appear in the diagram. The agent also determines how many layers there are and assigns each node and edge to the layer where it first appears.

### Step 6: Subgraph Creation

Earlier layers are **subgraphs** of the final layer graph. A subgraph for layer N includes all nodes and edges with layer number ≤ N.

- Layer 1 is the smallest subgraph (simplest mental model)
- Layer 2 adds nodes and edges to layer 1
- Layer N (the last layer) is the complete graph

This is a slicing operation on the complete graph, not a separate graph construction. No nodes or edges are created that don't exist in the final layer.

### Step 7: Rendering (React Flow)

React Flow draws the current layer's subgraph using the scaled positions from Steps 2–3:

- **Nodes** are translucent, flat colored rectangles with text centered inside them. They appear with a fade-in animation when their layer becomes active.
- **Edges** are static dashed lines with animated particles traveling along the ELK-computed paths to show direction of flow. No text labels on edges. Edge paths follow ELK's orthogonal routing (90-degree bends) and never cross through nodes.
- **Showing/hiding** — when the user is on layer N, React Flow renders all nodes and edges with layer ≤ N. Nodes and edges from higher layers are simply not rendered. When the user advances a layer, new nodes and edges appear at their pre-computed positions.

**The layout is computed once and never recomputed.** When the user switches between layers, nodes appear or disappear at their already-computed positions. They don't move. This makes layer transitions stable and predictable.

## Key Constraints

- Node boxes are sized to fit their text with margins on all sides. Text never overflows or clips.
- Edges never have text labels. Text only exists inside node rectangles.
- Edge paths are computed by ELK and never cross through node rectangles.
- Whitespace is a feature. No clutter.
- Layout is computed once from the complete graph on a reference canvas. Render-time scaling preserves all spatial relationships. Layer transitions only show/hide elements — they never change positions.
