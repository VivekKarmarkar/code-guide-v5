"use client";

import { memo } from "react";

const PARTICLE_COUNT = 12;
const DURATION = 6;

interface ElkRoutedEdgeProps {
  id: string;
  data: {
    elkPath: string;
    layerIndex: number;
    originalEdgeId: string;
    direction: "fwd" | "rev";
  };
  style?: React.CSSProperties;
}

function ElkRoutedEdgeComponent({ id, data, style }: ElkRoutedEdgeProps) {
  if (!data.elkPath) return null;

  const stroke = style?.stroke ?? "var(--edge-stroke)";

  return (
    <g>
      <path
        d={data.elkPath}
        fill="none"
        stroke={stroke}
        strokeWidth={style?.strokeWidth ?? 1.5}
        strokeDasharray={style?.strokeDasharray ?? "6 4"}
      />

      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <circle
          key={i}
          r={2}
          fill="#EF4444"
          opacity={0.9}
        >
          <animateMotion
            dur={`${DURATION}s`}
            repeatCount="indefinite"
            begin={`${(i * DURATION) / PARTICLE_COUNT}s`}
            path={data.elkPath}
          />
        </circle>
      ))}
    </g>
  );
}

export const ElkRoutedEdge = memo(ElkRoutedEdgeComponent);
