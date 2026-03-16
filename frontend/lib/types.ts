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
