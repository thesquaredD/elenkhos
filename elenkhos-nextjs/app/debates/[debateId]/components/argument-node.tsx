"use client";

import { memo } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { ArgumentNode } from "@/app/types";

const commonClasses = {
  wrapper: "w-[150px] h-[150px]",
  path: "fill-white stroke-black stroke-1",
};

const shapeVariants = [
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 100 100">
        <rect x="1" y="1" width="98" height="98" />
      </svg>
    ),
    className: commonClasses.wrapper,
    pathClass: commonClasses.path,
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="49" />
      </svg>
    ),
    className: commonClasses.wrapper,
    pathClass: commonClasses.path,
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 100 100">
        <path d="M1 25 L50 1 L99 25 L99 75 L50 99 L1 75 Z" />
      </svg>
    ),
    className: commonClasses.wrapper,
    pathClass: commonClasses.path,
  },
  {
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 100 100">
        <path d="M50 1 L99 50 L50 99 L1 50 Z" />
      </svg>
    ),
    className: commonClasses.wrapper,
    pathClass: commonClasses.path,
  },
];

function ArgumentNodeComponent({ data }: NodeProps<ArgumentNode>) {
  const shape = shapeVariants[data.speakerShape % shapeVariants.length];
  const Icon = shape.icon;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="relative inline-block">
        <Icon className={`${shape.className} ${shape.pathClass}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col gap-2 w-[130px]">
            <div className="text-sm font-medium text-center line-clamp-3">
              {data.shortName || data.text || "No conclusion"}
            </div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export default memo(ArgumentNodeComponent);
