import { ArgumentNode } from "@/app/types";
import { db } from "@/drizzle/db";
import { _arguments, _relations, debates } from "@/drizzle/schema";
import { Edge } from "@xyflow/react";
import { eq } from "drizzle-orm";
import DebateFlow from "./components/debate-flow";

interface DebatePageProps {
  params: {
    debateId: string;
  };
}

export default async function DebatePage({ params }: DebatePageProps) {
  const { debateId } = await params;

  const debate = await db
    .select()
    .from(debates)
    .where(eq(debates.id, Number(debateId)))
    .execute();
  const argumentsData = await db
    .select()
    .from(_arguments)
    .where(eq(_arguments.debateId, Number(debateId)));

  const relationsData = await db
    .select()
    .from(_relations)
    .where(eq(_relations.debateId, Number(debateId)));

  const speakerShapes = new Map(
    Array.from(new Set(argumentsData.map((arg) => arg.speaker)))
      .filter(Boolean)
      .sort() // Sort for stability
      .map((speaker, index) => [speaker, index])
  );

  const nodes: ArgumentNode[] = argumentsData.map((arg) => ({
    id: arg.id.toString(),
    data: {
      ...arg,
      label: arg.conclusion ?? "",
      speakerShape: arg.speaker ? speakerShapes.get(arg.speaker) ?? 0 : 0,
    },
    type: "argument",
    position: { x: 100, y: 100 }, // You might want to calculate actual positions
  }));

  const edges: Edge[] = relationsData.map((rel) => ({
    id: rel.id.toString(),
    source: rel.sourceId.toString(),
    target: rel.targetId.toString(),
    type: "relation",
    data: {
      type: rel.type,
    },
  }));

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-4xl font-bold">{debate[0].title}</h1>
      <DebateFlow nodes={nodes} edges={edges} />
    </div>
  );
}
