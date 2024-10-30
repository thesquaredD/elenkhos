"use client";
import { RelationType } from "@/app/types";
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";

interface RelationEdgeData extends Edge {
  data: {
    type: RelationType;
  };
}

export default function RelationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    // Use bezier instead of step
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3, // Add curvature for smoother bends
  });

  const isAttack = data.type === "ATTACK";
  const edgeStyles = {
    stroke: isAttack ? "rgb(249 115 22)" : "rgb(59 130 246)",
    strokeWidth: 2,
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#arrow-${data.type.toLowerCase()})`}
        style={edgeStyles}
      />
      <EdgeLabelRenderer>
        <div
          className={`
            nodrag nopan 
            absolute -translate-x-1/2 -translate-y-1/2
            px-2 py-1 rounded text-xs font-bold text-white border
            ${
              isAttack
                ? "bg-orange-500 border-orange-600"
                : "bg-blue-500 border-blue-600"
            }
          `}
          style={{
            left: labelX,
            top: labelY,
          }}
        >
          {data.type}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export function GraphMarkers() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <marker
          id="arrow-attack"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-orange-500" />
        </marker>
        <marker
          id="arrow-support"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-blue-500" />
        </marker>
      </defs>
    </svg>
  );
}
