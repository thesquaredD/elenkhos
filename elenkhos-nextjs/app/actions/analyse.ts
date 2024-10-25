"use server";

import { z } from "zod";
import { zfd } from "zod-form-data";
import OpenAI from "openai";
import {
  debates,
  transcripts,
  _arguments,
  _relations,
  DrizzleArgument,
} from "@/drizzle/schema";
import { transcribeAndDiarize } from "../server/transcribe-and-diarize";
import { findArguments } from "../server/find-argument";
import { analyzeArgument } from "../server/analyse-argument";
import { findArgumentRelations } from "../server/find-argument-relations";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";

const schema = zfd.formData({
  audioFile: zfd.file(),
  assemblyKey: zfd.text(z.string().min(1)),
  openaiKey: zfd.text(z.string().min(1)),
});

export const analyseDebate = actionClient
  .schema(schema)
  .stateAction<{ debateId?: number }>(async ({ parsedInput }) => {
    const { audioFile, assemblyKey, openaiKey } = parsedInput;

    // Create a new debate entry
    const [newDebate] = await db
      .insert(debates)
      .values({
        title: "New Debate",
        description: "Automatically generated debate",
      })
      .returning({ id: debates.id });

    const debateId = newDebate.id;

    // Transcribe and diarize the audio
    const audioBuffer = await audioFile.arrayBuffer();
    const transcript = await transcribeAndDiarize(audioBuffer, assemblyKey);

    // Save the transcript
    await db.insert(transcripts).values({
      debateId: debateId,
      externalId: transcript.id,
      text: transcript.text ?? "",
      utterances: transcript.utterances as unknown,
      words: transcript.words as unknown,
      confidence: transcript.confidence,
      audioDuration: transcript.audio_duration,
      status: String(transcript.status),
    });

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiKey });

    // Find arguments
    const segments =
      transcript.utterances?.map((u) => ({
        text: u.text,
        speaker: u.speaker,
      })) ?? [];
    const mergedSegments = await findArguments(segments, openai);

    // Analyze arguments and save them
    for (const segment of mergedSegments) {
      const analysis = await analyzeArgument(segment, openai);
      await db.insert(_arguments).values({
        debateId: debateId,
        scheme: analysis.scheme,
        conclusion: analysis.conclusion,
        text: segment.text,
        speaker: segment.speaker,
      });
    }

    // Find and save argument relations
    const savedArguments: DrizzleArgument[] = await db
      .select()
      .from(_arguments)
      .where(eq(_arguments.debateId, debateId));

    const relations = await findArgumentRelations(savedArguments, openai);

    for (const relation of relations) {
      if (relation.type !== "attack" && relation.type !== "support") {
        continue;
      }
      await db.insert(_relations).values({
        debateId: debateId,
        sourceId: relation.source,
        targetId: relation.target,
        type: relation.type,
      });
    }

    return { debateId };
  });
