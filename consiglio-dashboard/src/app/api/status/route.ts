export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || "C:\\Users\\devpi\\.openclaw\\workspace";
const OPENCLAW_ROOT = process.env.OPENCLAW_ROOT || "C:\\Users\\devpi\\.openclaw";

// Agent fleet config — mob names matching agent directories
const FLEET_CONFIG: Record<string, { mobName: string; role: string; emoji: string }> = {
  "main": { mobName: "Don BotFather", role: "Boss of Bosses", emoji: "🤖" },
  "dapper-dan": { mobName: "Dapper Dan the Builder", role: "Construction Capo", emoji: "💼" },
  "breaking-ben": { mobName: 'Benjamin "Bricks" Testa', role: "Demolition & QA Capo", emoji: "🔨" },
  "codex-developer": { mobName: 'Nico "The Architect" Codex', role: "Architecture Capo", emoji: "🔧" },
  "chief-of-staff": { mobName: "Consigliere Chief", role: "Coordination Capo", emoji: "📋" },
  "model-buzz-scout": { mobName: 'Mikey "The Ear" Models', role: "Intelligence Scout", emoji: "🔍" },
};

// Specialist on-demand config
const SPECIALIST_CONFIG: Record<string, { mobName: string; role: string; emoji: string; trigger: string }> = {
  "tony-blueprints": { mobName: 'Tony Blueprints', role: "Product Architecture", emoji: "🏗️", trigger: "product redesign, feature planning" },
  "bella-buttons": { mobName: 'Bella Buttons', role: "UX & Interface Design", emoji: "🎨", trigger: "UI polish, interaction design" },
  "vinny-visuals": { mobName: 'Vinny Visuals', role: "Visual & Brand Review", emoji: "👁️", trigger: "brand consistency, art direction" },
  "nico-stack": { mobName: 'Nico Stack', role: "Architecture & Infra", emoji: "⚡", trigger: "risky architecture changes" },
  "joey-no-bugs": { mobName: 'Joey No-Bugs', role: "QA & Testing", emoji: "🐛", trigger: "regression testing, release confidence" },
  "sal-the-shield": { mobName: 'Sal the Shield', role: "Security Review", emoji: "🛡️", trigger: "auth, endpoints, secrets" },
  "frankie-fastlane": { mobName: 'Frankie Fastlane', role: "Performance", emoji: "🏎️", trigger: "slowness, scale, optimization" },
  "rocco-rollout": { mobName: 'Rocco Rollout', role: "Release & Deployment", emoji: "🚀", trigger: "production deployment" },
  "connie-consigliere": { mobName: 'Connie Consigliere', role: "Strategy & Agent Design", emoji: "🎩", trigger: "agent redesign, strategy" },
};

interface AgentInfo {
  id: string;
  name: string;
  mobName: string;
  role: string;
  emoji: string;
  model: string;
  hasBehavior: boolean;
  hasPhrases: boolean;
  hasSoul: boolean;
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; everyMs?: number; tz?: string };
  agentId: string;
  payload?: { message?: string; model?: string };
  delivery?: { mode: string; channel?: string; to?: string };
}

export async function GET() {
  try {
    // 1. Read openclaw.json for registered agents
    const ocJsonPath = path.join(OPENCLAW_ROOT, "openclaw.json");
    let registeredAgents: { id: string; name: string; model: string }[] = [];
    try {
      const raw = await fs.readFile(ocJsonPath, "utf-8");
      const config = JSON.parse(raw);
      registeredAgents = (config.agents?.list || []).map((a: any) => ({
        id: a.id || "",
        name: a.name || "",
        model: a.model || config.agents?.defaults?.model?.primary || "unknown",
      }));
    } catch { /* openclaw.json not readable */ }

    // 2. Scan agent directories for actual agents
    const agentsDir = path.join(OPENCLAW_ROOT, "agents");
    let discoveredAgents: AgentInfo[] = [];
    try {
      const entries = await fs.readdir(agentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const agentPath = path.join(agentsDir, entry.name);
        const agentFiles = await fs.readdir(agentPath).catch(() => [] as string[]);
        const subDirs = await fs.readdir(agentPath, { withFileTypes: true }).catch(() => [] as import("fs").Dirent[]);
        // Check for AGENT.md, SOUL.md, or config.yaml in agent dir or subdirs
        const allFiles = [...agentFiles];
        for (const sub of subDirs) {
          if (sub.isDirectory()) {
            const subFiles = await fs.readdir(path.join(agentPath, sub.name)).catch(() => [] as string[]);
            subFiles.forEach(f => allFiles.push(`${sub.name}/${f}`));
          }
        }

        const hasAgentMd = allFiles.some(f => f.endsWith("AGENT.md") || f.endsWith("AGENT.MD"));
        const hasSoulMd = allFiles.some(f => f.toLowerCase().includes("soul.md"));
        const hasBehavior = allFiles.some(f => f.toLowerCase().includes("behavior.md"));
        const hasPhrases = allFiles.some(f => f.toLowerCase().includes("phrases.md"));
        const hasConfig = allFiles.some(f => f === "config.yaml");

        if (hasAgentMd || hasSoulMd || hasConfig) {
          const config = FLEET_CONFIG[entry.name] || SPECIALIST_CONFIG[entry.name];
          const registered = registeredAgents.find(a => a.id === entry.name);

          discoveredAgents.push({
            id: entry.name,
            name: registered?.name || config?.mobName || entry.name,
            mobName: config?.mobName || entry.name,
            role: config?.role || "Agent",
            emoji: config?.emoji || "🤖",
            model: registered?.model || "cloud",
            hasBehavior,
            hasPhrases,
            hasSoul: hasSoulMd,
          });
        }
      }
    } catch { /* skip */ }

    // 3. Read cron jobs
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
    } catch { /* skip */ }

    // 4. Read identity files
    const identityFiles = ["SOUL.md", "IDENTITY.md", "MEMORY.md", "AGENTS.md", "COMPANY.md", "HEARTBEAT.md"];
    const identity: Record<string, { size: number; modified: string }> = {};
    for (const f of identityFiles) {
      try {
        const p = path.join(WORKSPACE, f);
        const stat = await fs.stat(p);
        identity[f] = { size: stat.size, modified: stat.mtime.toISOString() };
      } catch { /* skip */ }
    }

    // 5. Platform status
    const platformPath = path.join(WORKSPACE, "platform", "ai-engineering", "INSTALLATION-RECORD.md");
    let platformInstalled = false;
    try { await fs.access(platformPath); platformInstalled = true; } catch { /* not installed */ }

    // 6. Skills count
    const skillsDir = path.join(WORKSPACE, "skills");
    let skillCount = 0;
    try {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      skillCount = entries.filter(e => e.isDirectory()).length;
    } catch { /* skip */ }

    // 7. Platform skills count
    const platformSkillsDir = path.join(WORKSPACE, "platform", "ai-engineering", "skills");
    let platformSkillCount = 0;
    try {
      const entries = await fs.readdir(platformSkillsDir, { withFileTypes: true });
      platformSkillCount = entries.filter(e => e.isDirectory()).length;
    } catch { /* skip */ }

    // 8. Disk space
    let diskFreeGB = 0;
    let diskTotalGB = 0;
    try {
      const out = execSync("powershell -NoProfile -Command \"(Get-PSDrive C).Free; (Get-PSDrive C).Used\"", { encoding: "utf-8" });
      const lines = out.trim().split("\n").map((l: string) => parseFloat(l.trim()));
      diskFreeGB = Math.round((lines[0] || 0) / (1024 * 1024 * 1024) * 10) / 10;
      diskTotalGB = Math.round(((lines[0] || 0) + (lines[1] || 0)) / (1024 * 1024 * 1024) * 10) / 10;
    } catch { /* skip */ }

    // 9. Latest reports
    const reportDir = path.join(WORKSPACE, "platform", "ai-engineering", "reports", "model-buzz-scout");
    let lastScoutReport = null;
    try {
      const files = await fs.readdir(reportDir);
      const mdFiles = files.filter((f: string) => f.endsWith(".md")).sort().reverse();
      if (mdFiles.length > 0) {
        const content = await fs.readFile(path.join(reportDir, mdFiles[0]), "utf-8");
        lastScoutReport = { file: mdFiles[0], preview: content.substring(0, 500) };
      }
    } catch { /* no reports */ }

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
      agents: discoveredAgents,
      registeredAgents,
      fleetConfig: FLEET_CONFIG,
      specialistConfig: SPECIALIST_CONFIG,
      cronJobs,
      identity,
      platform: { installed: platformInstalled, skillCount: platformSkillCount },
      skills: skillCount,
      diskSpace: { freeGB: diskFreeGB, totalGB: diskTotalGB },
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