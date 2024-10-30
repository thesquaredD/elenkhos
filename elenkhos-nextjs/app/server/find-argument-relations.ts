import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { Relation, RelationSchema } from "../types";
import { z } from "zod";
import { ArgumentResponse } from "../actions/analyse";

const systemPrompt = `You are an argumentation analysis system using Dung's Abstract Argumentation Framework (AAF) and its Bipolar extension (BAF).

When analyzing argument relations, follow these formal criteria:

Attack Relations:
- Direct logical contradiction between claims
- Undermining of premises
- Rebuttal of conclusions
- Undercutting of inferential links

Support Relations:
- Premise reinforcement
- Conclusion strengthening
- Inferential backing
- Evidential support

For each argument pair, identify:
1. The type of relation (attack/support/none)
2. The specific criterion met
3. The direction of the relation
4. The strength of the relation (0.0-1.0)`;

export async function findArgumentRelations(
  _arguments: ArgumentResponse[],
  openai: OpenAI
): Promise<Relation[]> {
  const userPrompt = `
    Using AAF/BAF methodology, analyze these argument relations:
    ${JSON.stringify(_arguments, null, 2)}
    
    For each pair, provide:
    - Type and direction of relation
    - Criterion satisfied
    - Confidence score
    `;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
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
