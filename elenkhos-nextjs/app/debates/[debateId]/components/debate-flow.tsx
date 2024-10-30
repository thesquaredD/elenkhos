"use client";

import Dagre from "@dagrejs/dagre";
import React, { useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  ConnectionMode,
} from "@xyflow/react";
import { ArgumentNode } from "@/app/types";
import { Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ArgumentNodeComponent from "./argument-node";
import RelationEdge, { GraphMarkers } from "./relation-edge";
import { Button } from "@/components/ui/button";

const nodeTypes = {
  argument: ArgumentNodeComponent,
};
const edgeTypes = {
  relation: RelationEdge,
};

const getLayoutedElements = (
  nodes: ArgumentNode[],
  edges: Edge[],
  options: { direction: string }
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Much more aggressive spacing
  g.setGraph({
    rankdir: options.direction,
    nodesep: 200, // Horizontal spacing between nodes
    ranksep: 150, // Vertical spacing between ranks
    ranker: "tight-tree", // Different layout algorithm
    align: "DL", // Align nodes to reduce crossings
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target, { weight: 2 }));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: (node.measured?.width ?? 0) + 100, // Much more padding
      height: (node.measured?.height ?? 0) + 50,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      return {
        ...node,
        position: {
          x: position.x - (node.measured?.width ?? 0) / 2,
          y: position.y - (node.measured?.height ?? 0) / 2,
        },
      };
    }),
    edges,
  };
};
interface DebateFlowProps {
  nodes: ArgumentNode[];
  edges: Edge[];
}

const LayoutFlow = ({ nodes, edges }: DebateFlowProps) => {
  const { fitView } = useReactFlow();
  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);

  const onLayout = useCallback(
    (direction: string) => {
      const layouted = getLayoutedElements(nodesState, edgesState, {
        direction,
      });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodesState, edgesState]
  );

  return (
    <>
      <GraphMarkers />
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        connectionMode={ConnectionMode.Loose}
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <Button onClick={() => onLayout("TB")}>Set Layout</Button>
        </Panel>
      </ReactFlow>
    </>
  );
};

export default function DebateFlow({ nodes, edges }: DebateFlowProps) {
  return (
    <ReactFlowProvider>
      <LayoutFlow nodes={nodes} edges={edges} />
    </ReactFlowProvider>
  );
}
