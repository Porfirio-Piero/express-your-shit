export const dynamic = "force-dynamic";

import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || "C:\\Users\\devpi\\.openclaw\\workspace";
const MAX_COMMAND_LENGTH = 2000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = typeof body.command === "string" ? body.command.trim() : "";
    const target = typeof body.target === "string" && body.target.trim() ? body.target.trim() : "consiglio";
    const mode = body.mode === "execute" ? "execute" : "plan-and-queue";

    if (!command) return NextResponse.json({ success: false, error: "Command is required" }, { status: 400 });
    if (command.length > MAX_COMMAND_LENGTH) return NextResponse.json({ success: false, error: `Command exceeds ${MAX_COMMAND_LENGTH} characters` }, { status: 400 });

    const commandId = crypto.randomUUID();
    const entry = {
      id: commandId,
      timestamp: new Date().toISOString(),
      command,
      target,
      mode,
      status: "queued",
      source: "consiglio-mission-control",
      requiresApproval: /delete|remove|purchase|send|deploy|shutdown|restart|install|uninstall|credential|secret/i.test(command),
    };

    const commandDir = path.join(WORKSPACE, "consiglio-dashboard", "commands");
    await fs.mkdir(commandDir, { recursive: true });
    const queueFile = path.join(commandDir, `queue-${new Date().toISOString().split("T")[0]}.jsonl`);
    await fs.appendFile(queueFile, `${JSON.stringify(entry)}\n`, "utf8");

    return NextResponse.json({ success: true, command: entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to queue command";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
