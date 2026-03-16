"use client";

import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleReset = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
      <ZoomButton onClick={handleZoomIn} label="Zoom in">+</ZoomButton>
      <ZoomButton onClick={handleZoomOut} label="Zoom out">−</ZoomButton>
      <ZoomButton onClick={handleReset} label="Reset view">↺</ZoomButton>
    </div>
  );
}

function ZoomButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-md
                 border border-[var(--border-color)]
                 bg-[var(--bg-primary)]
                 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                 transition-colors text-lg font-medium"
    >
      {children}
    </button>
  );
}
