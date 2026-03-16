"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface ArchitectureNodeData {
  label: string;
  description: string;
  semanticType: string;
  color: string;
  layerIndex: number;
  edgeCount: number;
  width: number;
  height: number;
}

function ArchitectureNodeComponent({ data }: { data: ArchitectureNodeData }) {
  return (
    <div
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: `${data.color}18`,
        borderColor: `${data.color}60`,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: 8,
        cursor: "default",
        animation: "fadeIn 0.4s ease-out",
      }}
      className="flex flex-col items-center justify-center px-4 py-3"
    >
      <div
        className="font-semibold leading-tight"
        style={{ color: data.color, fontSize: 16 }}
      >
        {data.label}
      </div>
      <div
        className="mt-1 text-center leading-snug"
        style={{ color: "var(--text-secondary)", fontSize: 13 }}
      >
        {data.description}
      </div>

      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Top} id="top" className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent);
