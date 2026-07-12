export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || "C:\\Users\\devpi\\.openclaw\\workspace";

// POST /api/approve — record an approval action
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, target, approved, note } = body;

    if (!action || !target) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: action, target" },
        { status: 400 }
      );
    }

    // Write approval to audit log
    const auditDir = path.join(WORKSPACE, "consiglio-dashboard", "audit");
    await fs.mkdir(auditDir, { recursive: true });

    const entry = {
      timestamp: new Date().toISOString(),
      action,
      target,
      approved: Boolean(approved),
      note: note || "",
      source: "consiglio-command-center",
    };

    const auditFile = path.join(auditDir, `approvals-${new Date().toISOString().split("T")[0]}.jsonl`);
    await fs.appendFile(auditFile, JSON.stringify(entry) + "\n");

    return NextResponse.json({ success: true, ...entry });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record approval" },
      { status: 500 }
    );
  }
}