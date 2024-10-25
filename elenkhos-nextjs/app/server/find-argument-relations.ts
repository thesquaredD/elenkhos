import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { Relation, RelationSchema } from "../types";
import { z } from "zod";
import { ArgumentResponse } from "../actions/analyse";

export async function findArgumentRelations(
  _arguments: ArgumentResponse[],
  openai: OpenAI
): Promise<Relation[]> {
  const prompt = `
        Analyze the relationships between the following arguments in a debate:
        
        ${JSON.stringify(_arguments, null, 2)}
        
        For each pair of arguments, determine if there is a support or attack relationship or if they are unrelated.
      `;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: "You are a debate analysis assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: zodResponseFormat(RelationsResponseSchema, "relations"),
    });

    const response = completion.choices[0].message.parsed;

    if (!response) {
      throw new Error("No parsed relations found in the response");
    }

    return response.relations;
  } catch (error) {
    console.error("Error during relations analysis:", error);
    throw error;
  }
}

const RelationsResponseSchema = z.object({
  relations: z.array(RelationSchema),
});
