"use client";

import type { Mode } from "@/hooks/useLayerState";
import { ThemeToggle } from "./ThemeToggle";

interface ControlBarProps {
  mode: Mode;
  currentLayer: number;
  totalLayers: number;
  isPlaying: boolean;
  magnifierActive: boolean;
  onSetMode: (mode: Mode) => void;
  onJumpToLayer: (index: number) => void;
  onStep: () => void;
  onRewind: () => void;
  onPlay: () => void;
  onPause: () => void;
  onToggleMagnifier: () => void;
}

export function ControlBar({
  mode,
  currentLayer,
  totalLayers,
  isPlaying,
  onSetMode,
  onJumpToLayer,
  onStep,
  onRewind,
  onPlay,
  onPause,
  magnifierActive,
  onToggleMagnifier,
}: ControlBarProps) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
      <div className="flex items-center gap-1">
        <ModeButton active={mode === "static"} onClick={() => onSetMode("static")}>
          Static
        </ModeButton>
        <ModeButton active={mode === "dynamic"} onClick={() => onSetMode("dynamic")}>
          Dynamic
        </ModeButton>
      </div>

      <div className="flex items-center gap-2">
        {mode === "static" ? (
          Array.from({ length: totalLayers }, (_, i) => (
            <button
              key={i}
              onClick={() => onJumpToLayer(i)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors
                ${currentLayer === i
                  ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                }`}
            >
              {i + 1}
            </button>
          ))
        ) : (
          <>
            <ControlButton onClick={onRewind} disabled={currentLayer <= -1}>
              ⏪
            </ControlButton>
            {isPlaying ? (
              <ControlButton onClick={onPause}>⏸</ControlButton>
            ) : (
              <ControlButton onClick={onPlay} disabled={currentLayer >= totalLayers - 1}>
                ▶
              </ControlButton>
            )}
            <ControlButton onClick={onStep} disabled={currentLayer >= totalLayers - 1}>
              ⏭
            </ControlButton>
            <span className="text-xs text-[var(--text-secondary)] ml-2 tabular-nums">
              {currentLayer < 0 ? "—" : `${currentLayer + 1} / ${totalLayers}`}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMagnifier}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors
            ${magnifierActive
              ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
              : "border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          aria-label="Toggle magnifier"
        >
          🔍
        </button>
        <ThemeToggle />
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-md transition-colors
        ${active
          ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
    >
      {children}
    </button>
  );
}

function ControlButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-md
                 border border-[var(--border-color)]
                 text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-colors"
    >
      {children}
    </button>
  );
}
