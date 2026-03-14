import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

const PROJECT_ROOT = path.resolve(process.cwd(), "..");

export async function POST() {
  try {
    const { stderr } = await execAsync(
      `python3 scraper.py --once`,
      { cwd: PROJECT_ROOT, timeout: 120_000 }
    );

    if (stderr && !stderr.includes("notice")) {
      console.warn("[scrape] stderr:", stderr);
    }

    const jsonPath = path.join(PROJECT_ROOT, "live_data.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scrape] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
