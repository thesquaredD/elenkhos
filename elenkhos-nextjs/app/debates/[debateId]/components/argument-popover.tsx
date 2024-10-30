"use client";

import { Button } from "@/components/ui/button";
import { DrizzleArgument } from "@/drizzle/schema";
import { X } from "lucide-react";
import ArgumentDetails from "./argument-details";

interface ArgumentOverlayProps {
  argument: DrizzleArgument;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ArgumentOverlay({
  argument,
  position,
  onClose,
}: ArgumentOverlayProps) {
  return (
    <div
      className="fixed z-50 w-[500px] max-h-[80vh] overflow-y-auto bg-background border rounded-lg shadow-lg"
      style={{
        right: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-50"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <ArgumentDetails argument={argument} />
    </div>
  );
}
