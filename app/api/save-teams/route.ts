import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function POST(req: NextRequest) {
  try {
    const { csv } = await req.json() as { csv: string };
    if (!csv || typeof csv !== "string") {
      return NextResponse.json({ error: "csv field required" }, { status: 400 });
    }
    const csvPath = path.join(PROJECT_ROOT, "teams.csv");
    await fs.writeFile(csvPath, csv, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
