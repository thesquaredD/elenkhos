import "server-only";
import OpenAI from "openai";
import { MergedSegment, MergedSegmentsResponseSchema } from "../types";
import { zodResponseFormat } from "openai/helpers/zod";

export async function findArguments(
  segments: MergedSegment[],
  openai: OpenAI
): Promise<MergedSegment[]> {
  const prompt = `
    Analyze the following segments from a debate transcript. **Exclude any interjections** and ensure that **only segments from the same speaker are merged** into a given argument.

    ${JSON.stringify(segments, null, 2)}

    Identify which segments belong to the same argument and should be merged. **Only merge segments that have the same 'speaker'.**

    Return a list of merged arguments, where each argument is represented as a dictionary with 'text' and 'speaker' keys.
  `;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content:
            "You are a debate analysis assistant specializing in argument segmentation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: zodResponseFormat(
        MergedSegmentsResponseSchema,
        "merged_segments"
      ),
    });

    const response = completion.choices[0].message.parsed;

    if (!response) {
      throw new Error("No parsed segments found in the response");
    }

    return response.final_answer;
  } catch (error) {
    console.error("Error during merging segments:", error);
    return segments;
  }
}
