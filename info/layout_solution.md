# Layout Solution

## The Problem

Given an arbitrary graph produced by the agent (any number of nodes, any topology, any edge directionality), render it as a clean, aesthetic, interactive layered diagram inside a web viewport.

## The Pipeline

### Step 1: Area Division

The viewport is divided into three zones:

- **Top strip** — interactive controls: mode toggle (static/dynamic), layer navigation (step/rewind or layer jump buttons), theme toggle. Fixed height, always visible.
- **Middle area** — the core diagram. This is where nodes and edges are drawn. Takes the majority of the viewport.
- **Bottom area** — the English explanation for the current layer. Centered text, large and legible. No borders or background changes separating it from the diagram — it's part of the same visual composition.

The diagram area's pixel dimensions are known at render time. This is the bounding box that ELK must fit the layout into.

### Step 2: Graph Description

The data model for the graph:

- **Nodes** have:
  - A unique ID
  - A label (short name)
  - A description (longer text)
  - A color
  - A layer number (which layer this node first appears in)
  - Width and height (computed from the text content — label + description determine the box size)
  - Number of edges (derived from the edge list)

- **Edges** have:
  - A unique ID
  - A source node ID
  - A target node ID
  - Directionality: uni-directional (A → B) or bi-directional (A ↔ B, rendered as two separate directed edges)
  - A layer number (which layer this edge first appears in)

No text labels on edges. Ever. Text exists only inside node rectangles.

### Step 3: Graph Creation

The agent scans a codebase and produces the **complete graph** — this is the final layer. It contains every node and every edge that will ever appear in the diagram. The agent also determines how many layers there are and assigns each node and edge to the layer where it first appears.

### Step 4: Subgraph Creation

Earlier layers are **subgraphs** of the final layer graph. A subgraph for layer N includes all nodes and edges with layer number ≤ N.

- Layer 1 is the smallest subgraph (simplest mental model)
- Layer 2 adds nodes and edges to layer 1
- Layer N (the last layer) is the complete graph

This is a slicing operation on the complete graph, not a separate graph construction. No nodes or edges are created that don't exist in the final layer.

### Step 5: Layout Computation (ELK.js)

ELK.js computes the layout **once**, for the **complete final-layer graph**. It takes:

- All nodes with their widths and heights
- All edges with their source and target connections

It returns:

- x, y position for every node
- Edge routing paths

These positions are computed to fit within the diagram area from Step 1. ELK's `layered` algorithm handles:

- Assigning nodes to ranks (horizontal or vertical layers)
- Minimizing edge crossings
- Spacing nodes and edges apart (controlled by `elk.spacing.nodeNode`, `elk.spacing.edgeNode`, etc.)
- Routing edges between non-neighboring nodes

**The layout is computed once and never recomputed.** When the user switches between layers, nodes appear or disappear at their already-computed positions. They don't move. This makes layer transitions stable and predictable.

### Step 6: Rendering (React Flow)

React Flow draws the current layer's subgraph using the positions from Step 5:

- **Nodes** are translucent, flat colored rectangles with text centered inside them. They appear with a fade-in animation when their layer becomes active.
- **Edges** are dashed lines with animated particles showing direction of flow. No text labels on edges.
- **Showing/hiding** — when the user is on layer N, React Flow renders all nodes and edges with layer ≤ N. Nodes and edges from higher layers are simply not rendered. When the user advances a layer, new nodes and edges appear at their pre-computed positions.

## Key Constraints

- Node boxes are sized to fit their text with margins on all sides. Text never overflows or clips.
- Edges never have text labels. Text only exists inside node rectangles.
- Whitespace is a feature. No clutter.
- Layout is computed once from the complete graph. Layer transitions only show/hide elements — they never change positions.
- Dark and light mode must both produce clean, legible results.
