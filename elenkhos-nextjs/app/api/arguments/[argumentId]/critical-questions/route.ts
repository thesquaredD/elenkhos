import { db } from "@/drizzle/db";
import { criticalQuestions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { argumentId: string } }
) {
  try {
    const argumentId = parseInt(params.argumentId);

    if (isNaN(argumentId)) {
      return NextResponse.json(
        { error: "Invalid argument ID" },
        { status: 400 }
      );
    }

    const questionsList = await db.query.criticalQuestions.findMany({
      where: eq(criticalQuestions.argumentId, argumentId),
    });

    return NextResponse.json(questionsList);
  } catch (error) {
    console.error("Error fetching critical questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch critical questions" },
      { status: 500 }
    );
  }
}
