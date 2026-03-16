"use client";

import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { ArchitectureNode } from "./ArchitectureNode";
import { ElkRoutedEdge } from "./ElkRoutedEdge";
import { Magnifier } from "./Magnifier";
import { ZoomControls } from "./ZoomControls";
import type { RFNode, RFEdge } from "@/lib/types";

const nodeTypes = { architectureNode: ArchitectureNode };
const edgeTypes = { elkRouted: ElkRoutedEdge };

interface DiagramCanvasProps {
  allNodes: RFNode[];
  allEdges: RFEdge[];
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
  magnifierActive: boolean;
}

function DiagramCanvasInner({
  allNodes,
  allEdges,
  visibleNodeIds,
  visibleEdgeIds,
  magnifierActive,
}: DiagramCanvasProps) {
  const { fitView } = useReactFlow();

  const nodes = useMemo(
    () => allNodes.filter((n) => visibleNodeIds.has(n.id)) as Node[],
    [allNodes, visibleNodeIds]
  );

  const edges = useMemo(
    () =>
      allEdges.filter((e) => visibleEdgeIds.has(e.id)).map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: "var(--edge-stroke)",
        },
      })) as Edge[],
    [allEdges, visibleEdgeIds]
  );

  useEffect(() => {
    const timer = setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    return () => clearTimeout(timer);
  }, [nodes.length, fitView]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={3}
      >
        <Background gap={0} size={0} />
      </ReactFlow>
      <ZoomControls />
      <Magnifier
        allNodes={allNodes}
        allEdges={allEdges}
        visibleNodeIds={visibleNodeIds}
        visibleEdgeIds={visibleEdgeIds}
        active={magnifierActive}
      />
    </div>
  );
}

export function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
