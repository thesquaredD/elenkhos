"use server";

import { z } from "zod";
import { zfd } from "zod-form-data";
import OpenAI from "openai";
import {
  debates,
  transcripts,
  _arguments,
  _relations,
  premises,
  criticalQuestions,
} from "@/drizzle/schema";
import { transcribeAndDiarize } from "../server/transcribe-and-diarize";
import { findArguments } from "../server/find-argument";
import { analyzeArgument } from "../server/analyse-argument";
import { findArgumentRelations } from "../server/find-argument-relations";
import { actionClient } from "@/lib/safe-action";
import { db } from "@/drizzle/db";
import { revalidatePath } from "next/cache";

const schema = zfd.formData({
  debateName: zfd.text(z.string().min(1)),
  debateDescription: zfd.text(z.string().optional()),
  audioFile: zfd.file(),
  assemblyKey: zfd.text(z.string().min(1)),
  openaiKey: zfd.text(z.string().min(1)),
});

export type ArgumentResponse = {
  scheme: string;
  conclusion: string;
  critical_questions: string[];
  premises: string[];
  short_name: string;
  text: string;
  speaker: string;
};

export const analyseDebate = actionClient
  .schema(schema)
  .stateAction<{ debateId?: number }>(async ({ parsedInput }) => {
    console.log("Starting analyseDebate function");
    const { audioFile, assemblyKey, openaiKey, debateName, debateDescription } =
      parsedInput;

    // Initialize OpenAI client
    console.log("Initializing OpenAI client");
    const openai = new OpenAI({ apiKey: openaiKey });

    // 1. Get transcript
    console.log("Getting transcript data");
    const transcript = await transcribeAndDiarize(
      await audioFile.arrayBuffer(),
      assemblyKey
    );
    console.log("Transcript data received");

    // 2. Find arguments
    console.log("Finding arguments");
    const mergedSegments = await findArguments(
      transcript.utterances ?? [],
      openai
    );
    console.log(`Found ${mergedSegments.length} arguments`);

    // 3. Analyze all arguments
    console.log("Analyzing arguments");
    const analyzedArguments = await Promise.all(
      mergedSegments.map((segment) => analyzeArgument(segment, openai))
    );
    console.log("Arguments analyzed");

    // 4. Prepare argument data structures
    const argumentData: ArgumentResponse[] = mergedSegments.map(
      (segment, i) => ({
        scheme: analyzedArguments[i].scheme,
        conclusion: analyzedArguments[i].conclusion,
        critical_questions: analyzedArguments[i].critical_questions,
        premises: analyzedArguments[i].premises,
        short_name: analyzedArguments[i].short_name,
        text: segment.text,
        speaker: segment.speaker,
        start: segment.start,
        end: segment.end,
      })
    );

    console.log("Argument data prepared");

    // 5. Find relations (before transaction)
    console.log("Finding argument relations");
    const relations = await findArgumentRelations(
      argumentData.map((arg, index) => ({
        id: index + 1, // Temporary IDs for relation finding
        ...arg,
      })),
      openai
    );
    console.log(`Found ${relations.length} relations`);

    // Now do all database operations in a single transaction
    return await db.transaction(async (tx) => {
      // 6. Create debate
      const [newDebate] = await tx
        .insert(debates)
        .values({
          title: debateName,
          description: debateDescription,
        })
        .returning();

      console.log("1. Created debate with ID:", newDebate.id);

      // 7. Insert transcript
      await tx.insert(transcripts).values({
        debateId: newDebate.id,
        externalId: transcript.id || "",
        text: transcript.text || "",
        utterances: transcript.utterances || [],
        words: transcript.words || [],
        confidence: transcript.confidence || 0,
        audioDuration: transcript.audio_duration || 0,
        status: String(transcript.status || "completed"),
      });

      console.log("2. Transcript inserted");

      // 8. Insert all arguments and collect their IDs
      console.log("3. Inserting arguments");
      const insertedArguments = [];
      for (let i = 0; i < argumentData.length; i++) {
        const argData = argumentData[i];
        const analysis = analyzedArguments[i];

        // Insert argument
        const [argument] = await tx
          .insert(_arguments)
          .values({
            debateId: newDebate.id,
            ...argData,
            shortName: analysis.short_name,
          })
          .returning();
        insertedArguments.push(argument);

        // Insert premises
        if (analysis.premises && analysis.premises.length > 0) {
          await tx.insert(premises).values(
            analysis.premises.map((premiseText) => ({
              argumentId: argument.id,
              text: premiseText,
            }))
          );
        }

        // Insert critical questions
        if (
          analysis.critical_questions &&
          analysis.critical_questions.length > 0
        ) {
          await tx.insert(criticalQuestions).values(
            analysis.critical_questions.map((questionText: string) => ({
              argumentId: argument.id,
              text: questionText,
            }))
          );
        }
      }

      // 9. Insert relations using the real IDs
      console.log("4. Inserting relations");
      for (const relation of relations) {
        if (relation.type !== "ATTACK" && relation.type !== "SUPPORT") {
          console.log(`Skipping relation of type: ${relation.type}`);
          continue;
        }
        await tx.insert(_relations).values({
          debateId: newDebate.id,
          sourceId: insertedArguments[relation.source - 1].id, // Map temporary IDs to real IDs
          targetId: insertedArguments[relation.target - 1].id,
          type: relation.type,
          criterion: relation.criterion,
          confidence: relation.confidence,
        });
      }

      console.log("Transaction completed successfully");
      revalidatePath(`/debates`);
      return { debateId: newDebate.id };
    });
  });
