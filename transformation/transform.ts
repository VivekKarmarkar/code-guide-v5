import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename, extname, join } from "node:path";
import ELK from "elkjs/lib/elk.bundled.js";
import type {
  AgentOutput,
  FrontendInput,
  LayerMeta,
  RFNode,
  RFEdge,
  GraphEdge,
} from "./types.js";
import { COLOR_MAP, FALLBACK_COLOR } from "./types.js";

// ── CLI argument parsing ───────────────────────────────────────────

function parseArgs(): { inputPath: string } {
  const args = process.argv.slice(2);
  let inputPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--input" && args[i + 1]) {
      inputPath = args[i + 1];
      i++;
    }
  }

  if (!inputPath) {
    inputPath = resolve(
      import.meta.dirname,
      "../example/visual mockup architecture/data/sample_agent_output.json"
    );
  }

  return { inputPath: resolve(inputPath) };
}

// ── Step 1: Read input JSON ────────────────────────────────────────

function readInput(path: string): AgentOutput {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as AgentOutput;
}

// ── Step 2: Build layer index maps ─────────────────────────────────

function buildLayerMaps(input: AgentOutput) {
  const nodeLayerMap = new Map<string, number>();
  const edgeLayerMap = new Map<string, number>();

  for (let i = 0; i < input.layers.length; i++) {
    for (const nodeId of input.layers[i].addNodes) {
      nodeLayerMap.set(nodeId, i);
    }
    for (const edgeId of input.layers[i].addEdges) {
      edgeLayerMap.set(edgeId, i);
    }
  }

  return { nodeLayerMap, edgeLayerMap };
}

// ── Step 3: Resolve color ──────────────────────────────────────────

function resolveColor(type: string): string {
  return COLOR_MAP[type] ?? FALLBACK_COLOR;
}

// ── Step 4: Count edges per node ───────────────────────────────────

function countEdgesPerNode(edges: GraphEdge[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of edges) {
    counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
    counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
  }
  return counts;
}

// ── Step 5: Compute node dimensions ────────────────────────────────

interface NodeDimensions {
  width: number;
  height: number;
  fontSize: number;
}

function computeNodeDimensions(
  nodes: AgentOutput["graph"]["nodes"],
  viewportWidth: number,
  viewportHeight: number
): { dimensions: Map<string, NodeDimensions>; globalFontSize: number } {
  const diagramArea = viewportWidth * viewportHeight;
  const margin = 40;
  const upperBound = Math.sqrt(diagramArea / nodes.length) - margin;
  const maxWidth = viewportWidth * 0.35;
  const minWidth = 120;
  const minHeight = 60;
  const charWidthRatio = 0.6; // approximate char width as fraction of font size
  const paddingX = 32; // horizontal padding inside node
  const paddingY = 24; // vertical padding inside node
  const lineSpacing = 1.4; // line height multiplier

  // Find the largest global font size that fits all nodes within upperBound
  let globalFontSize = 18;

  for (let fontSize = 18; fontSize >= 8; fontSize--) {
    const charWidth = fontSize * charWidthRatio;
    let allFit = true;

    for (const node of nodes) {
      const labelWidth = node.label.length * charWidth + paddingX;
      const descWidth = node.description.length * charWidth + paddingX;
      const textWidth = Math.max(labelWidth, descWidth);

      if (textWidth > upperBound && textWidth > maxWidth) {
        allFit = false;
        break;
      }
    }

    if (allFit) {
      globalFontSize = fontSize;
      break;
    }
  }

  // Compute dimensions for each node at the chosen font size
  const charWidth = globalFontSize * charWidthRatio;
  const dimensions = new Map<string, NodeDimensions>();

  for (const node of nodes) {
    const labelWidth = node.label.length * charWidth + paddingX;
    const descWidth = node.description.length * charWidth + paddingX;
    let rawWidth = Math.max(labelWidth, descWidth);

    // Clamp width
    let width = Math.max(minWidth, Math.min(rawWidth, maxWidth));

    // Handle text wrapping for description
    const maxTextWidth = width - paddingX;
    const descCharsPerLine = Math.floor(maxTextWidth / charWidth);
    const descLines =
      descCharsPerLine > 0
        ? Math.ceil(node.description.length / descCharsPerLine)
        : 1;

    // Height: label line + description lines + padding
    const labelHeight = globalFontSize * lineSpacing;
    const descHeight = descLines * globalFontSize * lineSpacing;
    let height = Math.max(minHeight, labelHeight + descHeight + paddingY);

    dimensions.set(node.id, {
      width: Math.round(width),
      height: Math.round(height),
      fontSize: globalFontSize,
    });
  }

  return { dimensions, globalFontSize };
}

// ── Step 6: Split bi-directional edges ─────────────────────────────

interface SplitEdge {
  id: string;
  source: string;
  target: string;
  originalEdgeId: string;
  direction: "fwd" | "rev";
  layerIndex: number;
}

function splitEdges(
  edges: GraphEdge[],
  edgeLayerMap: Map<string, number>
): SplitEdge[] {
  const result: SplitEdge[] = [];

  for (const edge of edges) {
    const layerIndex = edgeLayerMap.get(edge.id) ?? 0;

    if (edge.direction === "bi") {
      result.push({
        id: `${edge.id}-fwd`,
        source: edge.source,
        target: edge.target,
        originalEdgeId: edge.id,
        direction: "fwd",
        layerIndex,
      });
      result.push({
        id: `${edge.id}-rev`,
        source: edge.target,
        target: edge.source,
        originalEdgeId: edge.id,
        direction: "rev",
        layerIndex,
      });
    } else {
      result.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        originalEdgeId: edge.id,
        direction: "fwd",
        layerIndex,
      });
    }
  }

  return result;
}

// ── Step 7: Build cumulative layer metadata ────────────────────────

function buildCumulativeLayers(
  layers: AgentOutput["layers"],
  splitEdgesList: SplitEdge[],
  edgeLayerMap: Map<string, number>
): LayerMeta[] {
  // Build a map from original edge ID to split edge IDs
  const originalToSplit = new Map<string, string[]>();
  for (const se of splitEdgesList) {
    const existing = originalToSplit.get(se.originalEdgeId) ?? [];
    existing.push(se.id);
    originalToSplit.set(se.originalEdgeId, existing);
  }

  const cumulativeNodes: string[] = [];
  const cumulativeEdges: string[] = [];
  const result: LayerMeta[] = [];

  for (const layer of layers) {
    cumulativeNodes.push(...layer.addNodes);

    for (const edgeId of layer.addEdges) {
      const splitIds = originalToSplit.get(edgeId) ?? [edgeId];
      cumulativeEdges.push(...splitIds);
    }

    result.push({
      title: layer.title,
      explanation: layer.explanation,
      nodeIds: [...cumulativeNodes],
      edgeIds: [...cumulativeEdges],
    });
  }

  return result;
}

// ── Steps 8–9: ELK layout ──────────────────────────────────────────

interface ElkLayoutResult {
  positions: Map<string, { x: number; y: number }>;
  edgePaths: Map<string, string>;
}

function elkPointsToSvgPath(
  sections: Array<{
    startPoint: { x: number; y: number };
    bendPoints?: Array<{ x: number; y: number }>;
    endPoint: { x: number; y: number };
  }>
): string {
  const parts: string[] = [];
  for (const section of sections) {
    parts.push(`M ${section.startPoint.x} ${section.startPoint.y}`);
    for (const bp of section.bendPoints ?? []) {
      parts.push(`L ${bp.x} ${bp.y}`);
    }
    parts.push(`L ${section.endPoint.x} ${section.endPoint.y}`);
  }
  return parts.join(" ");
}

async function runElkLayout(
  nodes: AgentOutput["graph"]["nodes"],
  splitEdgesList: SplitEdge[],
  dimensions: Map<string, NodeDimensions>
): Promise<ElkLayoutResult> {
  const elk = new ELK();

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.layered.spacing.baseValue": "100",
      "elk.padding": "[left=50, top=50, right=50, bottom=50]",
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    },
    children: nodes.map((node) => {
      const dim = dimensions.get(node.id)!;
      return { id: node.id, width: dim.width, height: dim.height };
    }),
    edges: splitEdgesList.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const result = await elk.layout(elkGraph);

  const positions = new Map<string, { x: number; y: number }>();
  for (const child of result.children ?? []) {
    positions.set(child.id, { x: child.x ?? 0, y: child.y ?? 0 });
  }

  const edgePaths = new Map<string, string>();
  for (const edge of result.edges ?? []) {
    if (edge.sections && edge.sections.length > 0) {
      edgePaths.set(edge.id, elkPointsToSvgPath(edge.sections as any));
    }
  }

  return { positions, edgePaths };
}

// ── Step 10: Map to React Flow format ──────────────────────────────

function buildRFNodes(
  nodes: AgentOutput["graph"]["nodes"],
  positions: Map<string, { x: number; y: number }>,
  dimensions: Map<string, NodeDimensions>,
  nodeLayerMap: Map<string, number>,
  edgeCounts: Map<string, number>
): RFNode[] {
  return nodes.map((node) => {
    const pos = positions.get(node.id)!;
    const dim = dimensions.get(node.id)!;
    return {
      id: node.id,
      type: "architectureNode" as const,
      position: { x: pos.x, y: pos.y },
      data: {
        label: node.label,
        description: node.description,
        semanticType: node.type,
        color: resolveColor(node.type),
        layerIndex: nodeLayerMap.get(node.id) ?? 0,
        edgeCount: edgeCounts.get(node.id) ?? 0,
        width: dim.width,
        height: dim.height,
      },
      style: { width: dim.width, height: dim.height },
    };
  });
}

function buildRFEdges(
  splitEdgesList: SplitEdge[],
  edgePaths: Map<string, string>
): RFEdge[] {
  return splitEdgesList.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "elkRouted" as const,
    animated: false as const,
    style: {
      strokeDasharray: "6 4",
      stroke: "#6B7280",
      strokeWidth: 1.5,
    },
    data: {
      layerIndex: edge.layerIndex,
      originalEdgeId: edge.originalEdgeId,
      direction: edge.direction,
      elkPath: edgePaths.get(edge.id) ?? "",
    },
  }));
}

// ── Step 11: Determine output path and write ───────────────────────

function resolveOutputPath(inputPath: string): string {
  const dir = dirname(inputPath);
  const stem = basename(inputPath, extname(inputPath));
  const outputName = `${stem}_frontend_input.json`;

  if (inputPath.includes("example/") || inputPath.includes("example\\")) {
    return join(dir, outputName);
  }

  const projectRoot = resolve(import.meta.dirname, "..");
  const outputDir = join(projectRoot, "frontend_inputs");
  mkdirSync(outputDir, { recursive: true });
  return join(outputDir, outputName);
}

// ── Main pipeline ──────────────────────────────────────────────────

async function main() {
  const { inputPath } = parseArgs();
  console.log(`Reading: ${inputPath}`);

  // Step 1
  const input = readInput(inputPath);

  // Step 2
  const { nodeLayerMap, edgeLayerMap } = buildLayerMaps(input);

  // Step 4
  const edgeCounts = countEdgesPerNode(input.graph.edges);

  // Step 5
  const viewportWidth = 1920;
  const viewportHeight = 800;
  const { dimensions } = computeNodeDimensions(
    input.graph.nodes,
    viewportWidth,
    viewportHeight
  );

  // Step 6
  const splitEdgesList = splitEdges(input.graph.edges, edgeLayerMap);

  // Step 7
  const layerMetas = buildCumulativeLayers(
    input.layers,
    splitEdgesList,
    edgeLayerMap
  );

  // Steps 8–9
  const { positions, edgePaths } = await runElkLayout(
    input.graph.nodes,
    splitEdgesList,
    dimensions
  );

  // Step 10
  const rfNodes = buildRFNodes(
    input.graph.nodes,
    positions,
    dimensions,
    nodeLayerMap,
    edgeCounts
  );
  const rfEdges = buildRFEdges(splitEdgesList, edgePaths);

  // Step 11
  const output: FrontendInput = {
    codebase: input.codebase,
    layers: layerMetas,
    reactFlow: { nodes: rfNodes, edges: rfEdges },
  };

  const outputPath = resolveOutputPath(inputPath);
  writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
  console.log(`Written: ${outputPath}`);

  // Verification summary
  console.log(`\nVerification:`);
  console.log(`  Nodes: ${rfNodes.length}`);
  console.log(`  Edges: ${rfEdges.length} (from ${input.graph.edges.length} original)`);
  console.log(`  Layers: ${layerMetas.length}`);
  for (let i = 0; i < layerMetas.length; i++) {
    console.log(
      `    Layer ${i}: ${layerMetas[i].nodeIds.length} nodes, ${layerMetas[i].edgeIds.length} edges — "${layerMetas[i].title}"`
    );
  }
}

main().catch((err) => {
  console.error("Transform failed:", err);
  process.exit(1);
});
