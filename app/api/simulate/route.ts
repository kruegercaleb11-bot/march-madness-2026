import { NextResponse } from "next/server";
import { runSimulation } from "@/lib/simulate";
import { TEAMS } from "@/lib/teams-data";

export async function POST() {
  try {
    const result = runSimulation(TEAMS);
    return NextResponse.json({
      ...result,
      generated_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[simulate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
