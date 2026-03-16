"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useReactFlow, useViewport } from "@xyflow/react";
import type { RFNode } from "@/lib/types";

interface ScrollBarsProps {
  allNodes: RFNode[];
  visibleNodeIds: Set<string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function getGraphBounds(nodes: RFNode[], visibleNodeIds: Set<string>) {
  const visible = nodes.filter((n) => visibleNodeIds.has(n.id));
  if (visible.length === 0) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of visible) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + n.data.width);
    maxY = Math.max(maxY, n.position.y + n.data.height);
  }

  const padX = (maxX - minX) * 0.1;
  const padY = (maxY - minY) * 0.1;
  return { minX: minX - padX, minY: minY - padY, maxX: maxX + padX, maxY: maxY + padY };
}

const TRACK_MARGIN = 8;
const TRACK_SIZE = 8;
const DOT_SIZE = 14;

export function ScrollBars({ allNodes, visibleNodeIds, containerRef }: ScrollBarsProps) {
  const { setViewport } = useReactFlow();
  const viewport = useViewport();
  const [dragging, setDragging] = useState<"h" | "v" | null>(null);
  const dragStartRef = useRef<{ mousePos: number; vpPos: number }>({ mousePos: 0, vpPos: 0 });

  const bounds = getGraphBounds(allNodes, visibleNodeIds);
  const graphW = bounds.maxX - bounds.minX;
  const graphH = bounds.maxY - bounds.minY;

  const containerW = containerRef.current?.clientWidth ?? 1;
  const containerH = containerRef.current?.clientHeight ?? 1;

  const viewW = containerW / viewport.zoom;
  const viewH = containerH / viewport.zoom;

  const showH = viewW < graphW * 0.95;
  const showV = viewH < graphH * 0.95;

  // Dot position (center of the visible area, 0-1)
  const viewCenterX = (-viewport.x / viewport.zoom - bounds.minX + viewW / 2) / graphW;
  const viewCenterY = (-viewport.y / viewport.zoom - bounds.minY + viewH / 2) / graphH;
  const dotX = Math.max(0, Math.min(1, viewCenterX));
  const dotY = Math.max(0, Math.min(1, viewCenterY));

  const handleMouseDown = useCallback(
    (axis: "h" | "v", e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(axis);
      dragStartRef.current = {
        mousePos: axis === "h" ? e.clientX : e.clientY,
        vpPos: axis === "h" ? viewport.x : viewport.y,
      };
    },
    [viewport.x, viewport.y]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const trackLength = dragging === "h"
        ? (containerW - TRACK_MARGIN * 2)
        : (containerH - TRACK_MARGIN * 2);
      const delta = dragging === "h"
        ? e.clientX - dragStartRef.current.mousePos
        : e.clientY - dragStartRef.current.mousePos;
      const graphDim = dragging === "h" ? graphW : graphH;

      const vpDelta = -(delta / trackLength) * graphDim * viewport.zoom;
      const newPos = dragStartRef.current.vpPos + vpDelta;

      setViewport({
        x: dragging === "h" ? newPos : viewport.x,
        y: dragging === "v" ? newPos : viewport.y,
        zoom: viewport.zoom,
      });
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, viewport, containerW, containerH, graphW, graphH, setViewport]);

  if (!showH && !showV) return null;

  return (
    <>
      {showH && (
        <div
          className="absolute z-20"
          style={{
            bottom: TRACK_MARGIN,
            left: TRACK_MARGIN,
            right: TRACK_MARGIN + (showV ? DOT_SIZE + TRACK_MARGIN : 0),
            height: TRACK_SIZE,
            borderRadius: TRACK_SIZE / 2,
            background: "#F97316",
            opacity: 0.6,
          }}
        >
          <div
            onMouseDown={(e) => handleMouseDown("h", e)}
            style={{
              position: "absolute",
              left: `calc(${dotX * 100}% - ${DOT_SIZE / 2}px)`,
              top: -(DOT_SIZE - TRACK_SIZE) / 2,
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              background: "#3B82F6",
              cursor: "grab",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}
      {showV && (
        <div
          className="absolute z-20"
          style={{
            right: TRACK_MARGIN,
            top: TRACK_MARGIN,
            bottom: TRACK_MARGIN + (showH ? DOT_SIZE + TRACK_MARGIN : 0),
            width: TRACK_SIZE,
            borderRadius: TRACK_SIZE / 2,
            background: "#F97316",
            opacity: 0.6,
          }}
        >
          <div
            onMouseDown={(e) => handleMouseDown("v", e)}
            style={{
              position: "absolute",
              top: `calc(${dotY * 100}% - ${DOT_SIZE / 2}px)`,
              left: -(DOT_SIZE - TRACK_SIZE) / 2,
              width: DOT_SIZE,
              height: DOT_SIZE,
              borderRadius: "50%",
              background: "#3B82F6",
              cursor: "grab",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}
    </>
  );
}
