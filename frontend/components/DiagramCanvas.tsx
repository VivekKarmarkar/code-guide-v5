"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  useReactFlow,
  useViewport,
  ReactFlowProvider,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { ArchitectureNode } from "./ArchitectureNode";
import { ElkRoutedEdge } from "./ElkRoutedEdge";
import { Magnifier } from "./Magnifier";
import { ZoomControls } from "./ZoomControls";
import { ScrollBars } from "./ScrollBars";
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
  const viewport = useViewport();
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Disable pan-drag when zoomed in (scrollbars take over navigation)
  const isZoomedIn = (() => {
    const cW = containerRef.current?.clientWidth ?? 1;
    const cH = containerRef.current?.clientHeight ?? 1;
    const visible = allNodes.filter((n) => visibleNodeIds.has(n.id));
    if (visible.length === 0) return false;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of visible) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + n.data.width);
      maxY = Math.max(maxY, n.position.y + n.data.height);
    }
    const gW = (maxX - minX) * 1.2;
    const gH = (maxY - minY) * 1.2;
    const viewW = cW / viewport.zoom;
    const viewH = cH / viewport.zoom;
    return viewW < gW * 0.95 || viewH < gH * 0.95;
  })();

  return (
    <div ref={containerRef} className="relative w-full h-full">
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
        panOnDrag={!isZoomedIn}
        zoomOnScroll
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={3}
      >
        <Background gap={0} size={0} />
      </ReactFlow>
      <ScrollBars
        allNodes={allNodes}
        visibleNodeIds={visibleNodeIds}
        containerRef={containerRef}
      />
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
