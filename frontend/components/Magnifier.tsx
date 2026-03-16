"use client";

import { useState, useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import type { RFNode, RFEdge } from "@/lib/types";

const LENS_SIZE = 200;
const ZOOM_FACTOR = 2.5;
const VIEW_RADIUS = LENS_SIZE / ZOOM_FACTOR / 2;

interface MagnifierProps {
  allNodes: RFNode[];
  allEdges: RFEdge[];
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
  active: boolean;
}

export function Magnifier({
  allNodes,
  allEdges,
  visibleNodeIds,
  visibleEdgeIds,
  active,
}: MagnifierProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [flowPos, setFlowPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!active) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setFlowPos(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [active, screenToFlowPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setCursorPos(null);
    setFlowPos(null);
  }, []);

  const visibleNodes = allNodes.filter((n) => visibleNodeIds.has(n.id));
  const visibleEdges = allEdges.filter((e) => visibleEdgeIds.has(e.id));

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 z-10"
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
      {active && cursorPos && flowPos && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: cursorPos.x - LENS_SIZE / 2,
            top: cursorPos.y - LENS_SIZE / 2,
            width: LENS_SIZE,
            height: LENS_SIZE,
            borderRadius: "50%",
            border: "2px solid var(--border-color)",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            background: "var(--bg-primary)",
          }}
        >
          <svg
            width={LENS_SIZE}
            height={LENS_SIZE}
            viewBox={`${flowPos.x - VIEW_RADIUS} ${flowPos.y - VIEW_RADIUS} ${VIEW_RADIUS * 2} ${VIEW_RADIUS * 2}`}
          >
            {/* Render edges */}
            {visibleEdges.map((edge) => (
              <path
                key={edge.id}
                d={edge.data.elkPath}
                fill="none"
                stroke="var(--edge-stroke)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
            ))}

            {/* Render nodes */}
            {visibleNodes.map((node) => {
              const { x, y } = node.position;
              const { width, height, color, label, description } = node.data;
              return (
                <g key={node.id}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx={8}
                    fill={`${color}18`}
                    stroke={`${color}60`}
                    strokeWidth={1}
                  />
                  <text
                    x={x + width / 2}
                    y={y + height / 2 - 8}
                    textAnchor="middle"
                    fill={color}
                    fontSize={14}
                    fontWeight={600}
                  >
                    {label}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 10}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize={11}
                  >
                    {description}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}
