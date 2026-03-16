"use client";

import { useState, useCallback } from "react";
import { useLayerState } from "@/hooks/useLayerState";
import { ControlBar } from "./ControlBar";
import { DiagramCanvas } from "./DiagramCanvas";
import { ExplanationPanel } from "./ExplanationPanel";
import type { FrontendInput } from "@/lib/types";

interface SystemViewProps {
  data: FrontendInput;
}

export function SystemView({ data }: SystemViewProps) {
  const layer = useLayerState(data.layers);
  const [magnifierActive, setMagnifierActive] = useState(false);
  const toggleMagnifier = useCallback(() => setMagnifierActive((v) => !v), []);

  return (
    <div className="h-screen flex flex-col">
      <ControlBar
        mode={layer.mode}
        currentLayer={layer.currentLayer}
        totalLayers={layer.totalLayers}
        isPlaying={layer.isPlaying}
        magnifierActive={magnifierActive}
        onSetMode={layer.setMode}
        onJumpToLayer={layer.jumpToLayer}
        onStep={layer.step}
        onRewind={layer.rewind}
        onPlay={layer.play}
        onPause={layer.pause}
        onToggleMagnifier={toggleMagnifier}
      />

      <div className="flex-1 min-h-0">
        <DiagramCanvas
          allNodes={data.reactFlow.nodes}
          allEdges={data.reactFlow.edges}
          visibleNodeIds={layer.visibleNodeIds}
          visibleEdgeIds={layer.visibleEdgeIds}
          magnifierActive={magnifierActive}
        />
      </div>

      <ExplanationPanel layerMeta={layer.layerMeta} />
    </div>
  );
}
