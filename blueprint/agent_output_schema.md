# Agent Output Schema

This defines the exact structure that the Claude Agent SDK produces after scanning a codebase. The frontend consumes this schema directly — no transformation layer.

## TypeScript Definition

```typescript
interface AgentOutput {
  codebase: {
    name: string;         // Human-readable name of the project
    source: string;       // GitHub URL or local path that was scanned
  };

  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };

  layers: Layer[];
}

interface GraphNode {
  id: string;             // Unique identifier
  label: string;          // Short display name (determines box width)
  description: string;    // One-line description (rendered below label inside the box)
  type: string;           // Semantic category — mapped to a color on the frontend
}

interface GraphEdge {
  id: string;             // Unique identifier
  source: string;         // Source node ID
  target: string;         // Target node ID
  direction: "uni" | "bi"; // Uni-directional (A → B) or bi-directional (A ↔ B)
}

interface Layer {
  title: string;          // Short title for this layer
  explanation: string;    // Feynman-style explanation — what, why, how it evolved
  addNodes: string[];     // Node IDs that first appear in this layer
  addEdges: string[];     // Edge IDs that first appear in this layer
}
```

## Schema Rules

### Graph

- `graph` defines the **complete** system — every node and edge that will ever appear.
- The graph is defined once. Layers only reference elements from this graph.
- Every node ID and edge ID must be unique.
- Every edge's `source` and `target` must reference valid node IDs.
- Bi-directional edges (`direction: "bi"`) are stored as a single edge in the schema. The frontend renders them as two directed paths.

### Layers

- Layers are ordered. Layer 0 is the simplest mental model, the last layer is the complete graph.
- Each layer's `addNodes` and `addEdges` list ONLY the NEW elements introduced in that layer — not cumulative.
- The frontend computes the cumulative view: layer N shows all elements from layers 0 through N.
- Every node and edge in the graph must appear in exactly one layer's `addNodes` or `addEdges`.
- An edge should only be added in a layer where both its source and target nodes are already visible (added in the same or an earlier layer).

### Node Types

The `type` field is a semantic category chosen by the agent based on the node's role in the architecture. The frontend maps types to colors. Standard types:

| Type | Role | Color |
|------|------|-------|
| `client` | User-facing entry point | blue |
| `server` | Core application logic | teal |
| `storage` | Database, file system, persistent store | green |
| `gateway` | Routing, middleware, proxy | purple |
| `auth` | Authentication, authorization | orange |
| `cache` | In-memory cache, optimization layer | amber |
| `messaging` | Queue, event bus, pub/sub | indigo |
| `service` | Background worker, microservice, external service | pink |

The agent picks the most appropriate type. If none fit, it picks the closest. The set can be extended as needed.

### Explanations

Each layer's explanation follows the Feynman standard:
- WHAT is this layer (one direct sentence)
- WHY does it exist / how did the system evolve from the previous layer
- No jargon, no filler, no listing benefits before saying what something IS
- Designed to create the "aha! moment" of self-discovery

### No Edge Labels

Edges are never labeled. Text only exists inside node rectangles. Direction of flow is communicated through animated particles on the dashed edge lines.
