export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || "C:\\Users\\devpi\\.openclaw\\workspace";
const OPENCLAW_ROOT = process.env.OPENCLAW_ROOT || "C:\\Users\\devpi\\.openclaw";

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; everyMs?: number; tz?: string };
  agentId: string;
  payload?: { message?: string; model?: string };
  delivery?: { mode: string; channel?: string; to?: string };
}

interface AgentConfig {
  name: string;
  model: string;
}

export async function GET() {
  try {
    // 1. Read openclaw.json for agents
    const ocJsonPath = path.join(OPENCLAW_ROOT, "openclaw.json");
    let agents: AgentConfig[] = [];
    try {
      const raw = await fs.readFile(ocJsonPath, "utf-8");
      const config = JSON.parse(raw);
      agents = (config.agents?.list || []).map((a: any) => ({
        name: a.name,
        model: a.model || config.agents?.defaults?.model || "unknown",
      }));
    } catch { /* openclaw.json not readable */ }

    // 2. Read cron jobs
    const cronPath = path.join(OPENCLAW_ROOT, "cron", "jobs.json");
    let cronJobs: CronJob[] = [];
    try {
      const raw = await fs.readFile(cronPath, "utf-8");
      const cronConfig = JSON.parse(raw);
      cronJobs = (cronConfig.jobs || [])
        .filter((j: CronJob) => j.enabled)
        .map((j: CronJob) => ({
          id: j.id,
          name: j.name,
          enabled: j.enabled,
          schedule: j.schedule,
          agentId: j.agentId,
          payload: j.payload,
          delivery: j.delivery,
        }));
    } catch { /* cron not readable */ }

    // 3. Read identity files
    const identityFiles = [
      "SOUL.md", "IDENTITY.md", "MEMORY.md", "AGENTS.md", "COMPANY.md", "HEARTBEAT.md",
    ];
    const identity: Record<string, { size: number; modified: string }> = {};
    for (const f of identityFiles) {
      try {
        const p = path.join(WORKSPACE, f);
        const stat = await fs.stat(p);
        identity[f] = { size: stat.size, modified: stat.mtime.toISOString() };
      } catch { /* skip */ }
    }

    // 4. Read platform status
    const platformPath = path.join(WORKSPACE, "platform", "ai-engineering", "INSTALLATION-RECORD.md");
    let platformInstalled = false;
    try {
      await fs.access(platformPath);
      platformInstalled = true;
    } catch { /* not installed */ }

    // 5. Read skills count
    const skillsDir = path.join(WORKSPACE, "skills");
    let skillCount = 0;
    try {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      skillCount = entries.filter(e => e.isDirectory()).length;
    } catch { /* skip */ }

    // 6. Platform skills
    const platformSkillsDir = path.join(WORKSPACE, "platform", "ai-engineering", "skills");
    let platformSkillCount = 0;
    try {
      const entries = await fs.readdir(platformSkillsDir, { withFileTypes: true });
      platformSkillCount = entries.filter(e => e.isDirectory()).length;
    } catch { /* skip */ }

    // 7. Disk space
    let diskFreeGB = 0;
    let diskTotalGB = 0;
    try {
      const out = execSync("powershell -NoProfile -Command \"(Get-PSDrive C).Free; (Get-PSDrive C).Used\"", { encoding: "utf-8" });
      const lines = out.trim().split("\n").map((l: string) => parseFloat(l.trim()));
      diskFreeGB = (lines[0] || 0) / (1024 * 1024 * 1024);
      diskTotalGB = diskFreeGB + (lines[1] || 0) / (1024 * 1024 * 1024);
    } catch { /* skip */ }

    // 8. Model buzz scout last report
    const reportDir = path.join(WORKSPACE, "platform", "ai-engineering", "reports", "model-buzz-scout");
    let lastScoutReport = null;
    try {
      const files = await fs.readdir(reportDir);
      const mdFiles = files.filter((f: string) => f.endsWith(".md")).sort().reverse();
      if (mdFiles.length > 0) {
        const content = await fs.readFile(path.join(reportDir, mdFiles[0]), "utf-8");
        lastScoutReport = { file: mdFiles[0], preview: content.substring(0, 500) };
      }
    } catch { /* no reports yet */ }

    // 9. Vinny Vault last report
    const vvDir = path.join(WORKSPACE, "vinny-vault", "reports");
    let lastVVReport = null;
    try {
      const files = await fs.readdir(vvDir);
      const mdFiles = files.filter((f: string) => f.endsWith(".md")).sort().reverse();
      if (mdFiles.length > 0) {
        lastVVReport = { file: mdFiles[0] };
      }
    } catch { /* skip */ }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      agents,
      cronJobs,
      identity,
      platform: {
        installed: platformInstalled,
        skillCount: platformSkillCount,
      },
      skills: skillCount,
      diskSpace: { freeGB: Math.round(diskFreeGB * 10) / 10, totalGB: Math.round(diskTotalGB * 10) / 10 },
      lastScoutReport,
      lastVVReport,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load status" },
      { status: 500 }
    );
  }
}