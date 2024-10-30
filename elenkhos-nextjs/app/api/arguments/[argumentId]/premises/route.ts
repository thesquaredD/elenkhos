import { db } from "@/drizzle/db";
import { premises } from "@/drizzle/schema";
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

    const premisesList = await db.query.premises.findMany({
      where: eq(premises.argumentId, argumentId),
    });

    return NextResponse.json(premisesList);
  } catch (error) {
    console.error("Error fetching premises:", error);
    return NextResponse.json(
      { error: "Failed to fetch premises" },
      { status: 500 }
    );
  }
}
