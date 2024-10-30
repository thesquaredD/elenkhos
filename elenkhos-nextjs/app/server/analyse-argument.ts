import OpenAI from "openai";
import {
  ArgumentAnalysis,
  ArgumentAnalysisSchema,
  MergedSegment,
} from "../types";
import { zodResponseFormat } from "openai/helpers/zod";

export async function analyzeArgument(
  segment: MergedSegment,
  openai: OpenAI
): Promise<ArgumentAnalysis> {
  const prompt = `
      Analyze the following argument from a debate:
      Speaker: ${segment.speaker}
      Text: "${segment.text}"
      
      Provide the following information:
      1. The argumentation scheme according to Walton's framework
      2. The premises of the argument
      3. The conclusion of the argument
      4. Critical questions relevant to this argument scheme
      5. A short name for the argument
    `;

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      { role: "system", content: "You are a debate analysis assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
    response_format: zodResponseFormat(
      ArgumentAnalysisSchema,
      "argument_analysis"
    ),
  });

  const analysis = completion.choices[0].message.parsed;

  if (!analysis) {
    throw new Error("Failed to parse the argument analysis");
  }

  return analysis;
}
