// ── Agent Output (input to this pipeline) ──────────────────────────

export interface AgentOutput {
  codebase: { name: string; source: string };
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  layers: Layer[];
}

export interface GraphNode {
  id: string;
  label: string;
  description: string;
  type: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  direction: "uni" | "bi";
}

export interface Layer {
  title: string;
  explanation: string;
  addNodes: string[];
  addEdges: string[];
}

// ── Frontend Input (output of this pipeline) ───────────────────────

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
  type: "elkRouted";
  animated: false;
  style: { strokeDasharray: string; stroke: string; strokeWidth: number };
  data: {
    layerIndex: number;
    originalEdgeId: string;
    direction: "fwd" | "rev";
    elkPath: string;
  };
}

// ── Color Map ──────────────────────────────────────────────────────

export const COLOR_MAP: Record<string, string> = {
  client: "#3B82F6",
  server: "#14B8A6",
  storage: "#22C55E",
  gateway: "#A855F7",
  auth: "#F97316",
  cache: "#F59E0B",
  messaging: "#6366F1",
  service: "#EC4899",
};

export const FALLBACK_COLOR = "#6B7280";
