import { z } from "zod";
import Graph from "graphology";
import { DrizzleArgument } from "@/drizzle/schema";
import { Node } from "@xyflow/react";

export const WordSchema = z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
  confidence: z.number(),
  speaker: z.string(),
});

export const UtteranceSchema = z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
  confidence: z.number(),
  speaker: z.string(),
  words: z.array(WordSchema),
});

export const TranscriptSchema = z.object({
  id: z.string(),
  text: z.string(),
  utterances: z.array(UtteranceSchema),
  words: z.array(WordSchema),
  confidence: z.number(),
  audio_duration: z.number(),
  status: z.string(),
  error: z.string().nullable(),
  summary: z.string().nullable(),
});

export const StepSchema = z.object({
  explanation: z.string(),
  output: z.string(),
});

export const MergedSegmentSchema = z.object({
  text: z.string(),
  speaker: z.string(),
  start: z.number(),
  end: z.number(),
});

export const MergedSegmentsResponseSchema = z.object({
  steps: z.array(StepSchema),
  final_answer: z.array(MergedSegmentSchema),
});

export const ArgumentAnalysisSchema = z.object({
  scheme: z.string(),
  premises: z.array(z.string()),
  conclusion: z.string(),
  critical_questions: z.array(z.string()),
  short_name: z.string(),
});

export const RelationTypeSchema = z.enum(["SUPPORT", "ATTACK"]);

export type ArgumentNodeData = DrizzleArgument & {
  label: string;
  speakerShape: number;
};
export interface ArgumentNode extends Node {
  data: ArgumentNodeData;
}

export type RelationType = z.infer<typeof RelationTypeSchema>;

export const ArgumentSchema = ArgumentAnalysisSchema.extend({
  id: z.number(),
  text: z.string(),
  speaker: z.string(),
});

export const RelationSchema = z.object({
  source: z.number(),
  target: z.number(),
  type: z.enum(["ATTACK", "SUPPORT", "NONE"]),
  criterion: z.enum([
    "LOGICAL_CONTRADICTION",
    "PREMISE_UNDERMINING",
    "REBUTTAL",
    "UNDERCUTTING",
    "PREMISE_REINFORCEMENT",
    "CONCLUSION_STRENGTHENING",
    "INFERENTIAL_BACKING",
    "EVIDENTIAL_SUPPORT",
    "NO_RELATION",
  ]),
  confidence: z.number(),
  description: z.string().optional(),
});
export const DebateAnalysisSchema = z.object({
  arguments: z.array(ArgumentSchema),
  graph: z.instanceof(Graph),
});

export type Utterance = z.infer<typeof UtteranceSchema>;
export type Word = z.infer<typeof WordSchema>;
export type Transcript = z.infer<typeof TranscriptSchema>;
export type MergedSegment = z.infer<typeof MergedSegmentSchema>;
export type ArgumentAnalysis = z.infer<typeof ArgumentAnalysisSchema>;
export type Argument = z.infer<typeof ArgumentSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type DebateAnalysis = z.infer<typeof DebateAnalysisSchema>;
