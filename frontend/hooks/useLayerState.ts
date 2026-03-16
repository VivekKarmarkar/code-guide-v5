"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { LayerMeta } from "@/lib/types";

export type Mode = "static" | "dynamic";

interface LayerState {
  mode: Mode;
  currentLayer: number;
  totalLayers: number;
  layerMeta: LayerMeta | null;
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
  setMode: (mode: Mode) => void;
  jumpToLayer: (index: number) => void;
  step: () => void;
  rewind: () => void;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
}

export function useLayerState(layers: LayerMeta[]): LayerState {
  const [mode, setModeRaw] = useState<Mode>("static");
  const [currentLayer, setCurrentLayer] = useState(layers.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    clearPlayback();
    if (newMode === "dynamic") {
      setCurrentLayer(-1);
    } else {
      setCurrentLayer(layers.length - 1);
    }
    setModeRaw(newMode);
  }, [layers.length, clearPlayback]);

  const step = useCallback(() => {
    setCurrentLayer((prev) => Math.min(prev + 1, layers.length - 1));
  }, [layers.length]);

  const rewind = useCallback(() => {
    clearPlayback();
    setCurrentLayer((prev) => Math.max(prev - 1, mode === "dynamic" ? -1 : 0));
  }, [mode, clearPlayback]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    clearPlayback();
  }, [clearPlayback]);

  useEffect(() => {
    if (!isPlaying) return;

    intervalRef.current = setInterval(() => {
      setCurrentLayer((prev) => {
        if (prev >= layers.length - 1) {
          clearPlayback();
          return prev;
        }
        return prev + 1;
      });
    }, 3500);

    return () => clearPlayback();
  }, [isPlaying, layers.length, clearPlayback]);

  const jumpToLayer = useCallback((index: number) => {
    if (mode === "static") {
      setCurrentLayer(Math.max(0, Math.min(index, layers.length - 1)));
    }
  }, [mode, layers.length]);

  const layerMeta = currentLayer >= 0 ? layers[currentLayer] : null;
  const visibleNodeIds = useMemo(
    () => new Set(currentLayer >= 0 ? layers[currentLayer].nodeIds : []),
    [currentLayer, layers]
  );
  const visibleEdgeIds = useMemo(
    () => new Set(currentLayer >= 0 ? layers[currentLayer].edgeIds : []),
    [currentLayer, layers]
  );

  return {
    mode,
    currentLayer,
    totalLayers: layers.length,
    layerMeta,
    visibleNodeIds,
    visibleEdgeIds,
    setMode,
    jumpToLayer,
    step,
    rewind,
    play,
    pause,
    isPlaying,
  };
}
