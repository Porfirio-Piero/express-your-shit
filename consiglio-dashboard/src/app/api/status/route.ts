import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { execSync } from "child_process";
import path from "path";

const WORKSPACE = process.env.OPENCLAW_WORKSPACE || "C:\\Users\\devpi\\.openclaw\\workspace";
const OPENCLAW_ROOT = process.env.OPENCLAW_ROOT || "C:\\Users\\devpi\\.openclaw";

const FLEET_CONFIG: Record<string, { mobName: string; role: string; emoji: string; model: string }> = {
  "main": { mobName: "Don BotFather", role: "Boss of Bosses", emoji: "🤖", model: "kimi-k2.6:cloud" },
  "dapper-dan": { mobName: "Dapper Dan the Builder", role: "Construction Capo", emoji: "💼", model: "kimi-k2.7-code:cloud" },
  "breaking-ben": { mobName: 'Benjamin "Bricks" Testa', role: "Demolition & QA Capo", emoji: "🔨", model: "glm-5.1:cloud" },
  "codex-developer": { mobName: 'Nico "The Architect" Codex', role: "Architecture Capo", emoji: "🔧", model: "glm-5.1:cloud" },
  "chief-of-staff": { mobName: "Consigliere Chief", role: "Coordination Capo", emoji: "📋", model: "kimi-k2.7-code:cloud" },
  "model-buzz-scout": { mobName: 'Mikey "The Ear" Models', role: "Intelligence Scout", emoji: "🔍", model: "glm-5.1:cloud" },
};

const SPECIALIST_CONFIG: Record<string, { mobName: string; role: string; emoji: string; trigger: string }> = {
  "tony-blueprints": { mobName: "Tony Blueprints", role: "Product Architecture", emoji: "🏗️", trigger: "product redesign, feature planning" },
  "bella-buttons": { mobName: "Bella Buttons", role: "UX & Interface Design", emoji: "🎨", trigger: "UI polish, interaction design" },
  "vinny-visuals": { mobName: "Vinny Visuals", role: "Visual & Brand Review", emoji: "👁️", trigger: "brand consistency, art direction" },
  "nico-stack": { mobName: "Nico Stack", role: "Architecture & Infra", emoji: "⚡", trigger: "risky architecture changes" },
  "joey-no-bugs": { mobName: "Joey No-Bugs", role: "QA & Testing", emoji: "🐛", trigger: "regression testing, release confidence" },
  "sal-the-shield": { mobName: "Sal the Shield", role: "Security Review", emoji: "🛡️", trigger: "auth, endpoints, secrets" },
  "frankie-fastlane": { mobName: "Frankie Fastlane", role: "Performance", emoji: "🏎️", trigger: "slowness, scale, optimization" },
  "rocco-rollout": { mobName: "Rocco Rollout", role: "Release & Deployment", emoji: "🚀", trigger: "production deployment" },
  "connie-consigliere": { mobName: "Connie Consigliere", role: "Strategy & Agent Design", emoji: "🎩", trigger: "agent redesign, strategy" },
};

function safeExec(cmd: string): string {
  try { return execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim(); } catch { return ""; }
}

export async function GET() {
  const now = new Date();
  try {
    // 1. Registered agents
    let registeredAgents: { id: string; name: string; model: string }[] = [];
    try {
      const raw = await fs.readFile(path.join(OPENCLAW_ROOT, "openclaw.json"), "utf-8");
      const config = JSON.parse(raw);
      registeredAgents = (config.agents?.list || []).map((a: any) => ({
        id: a.id || "", name: a.name || "", model: a.model || config.agents?.defaults?.model?.primary || "",
      }));
    } catch { /* skip */ }

    // 2. Agent directories
    const agentsDir = path.join(OPENCLAW_ROOT, "agents");
    let discoveredAgents: any[] = [];
    try {
      const entries = await fs.readdir(agentsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const agentPath = path.join(agentsDir, entry.name);
        const allFiles: string[] = [];
        try {
          const topFiles = await fs.readdir(agentPath);
          topFiles.forEach(f => allFiles.push(f));
          for (const sub of topFiles) {
            try {
              const subStat = await fs.stat(path.join(agentPath, sub));
              if (subStat.isDirectory()) {
                const subFiles = await fs.readdir(path.join(agentPath, sub));
                subFiles.forEach(f => allFiles.push(`${sub}/${f}`));
              }
            } catch { /* skip */ }
          }
        } catch { continue; }
        const hasSoul = allFiles.some(f => f.toLowerCase().includes("soul.md"));
        const hasBehavior = allFiles.some(f => f.toLowerCase().includes("behavior.md"));
        const hasPhrases = allFiles.some(f => f.toLowerCase().includes("phrases.md"));
        const hasAgentMd = allFiles.some(f => f.toLowerCase().endsWith("agent.md"));
        const hasConfig = allFiles.some(f => f === "config.yaml");
        if (hasSoul || hasAgentMd || hasConfig) {
          const cfg = FLEET_CONFIG[entry.name] || SPECIALIST_CONFIG[entry.name];
          const registered = registeredAgents.find(a => a.id === entry.name);
          let soulPreview = "";
          try {
            const soulFile = allFiles.find(f => f.toLowerCase().includes("soul.md"));
            if (soulFile) { const c = await fs.readFile(path.join(agentPath, soulFile), "utf-8"); soulPreview = c.substring(0, 300).replace(/\n/g, " ").trim(); }
          } catch { /* skip */ }
          discoveredAgents.push({
            id: entry.name, name: registered?.name || cfg?.mobName || entry.name, mobName: cfg?.mobName || entry.name,
            role: cfg?.role || "Agent", emoji: cfg?.emoji || "🤖", model: registered?.model || cfg?.model || "cloud",
            hasBehavior, hasPhrases, hasSoul, isRegistered: !!registered, isSpecialist: !!SPECIALIST_CONFIG[entry.name], soulPreview,
          });
        }
      }
    } catch { /* skip */ }

    // 3. Cron jobs
    let cronJobs: any[] = [];
    try {
      const raw = await fs.readFile(path.join(OPENCLAW_ROOT, "cron", "jobs.json"), "utf-8");
      const cronConfig = JSON.parse(raw);
      cronJobs = (cronConfig.jobs || []).filter((j: any) => j.enabled).map((j: any) => ({
        id: j.id, name: j.name, enabled: j.enabled, schedule: j.schedule, agentId: j.agentId,
      }));
    } catch { /* skip */ }

    // 4. Identity files
    const identityFiles = ["SOUL.md", "IDENTITY.md", "MEMORY.md", "AGENTS.md", "COMPANY.md", "HEARTBEAT.md"];
    const identity: Record<string, { size: number; modified: string }> = {};
    for (const f of identityFiles) {
      try { const p = path.join(WORKSPACE, f); const stat = await fs.stat(p); identity[f] = { size: stat.size, modified: stat.mtime.toISOString() }; } catch { /* skip */ }
    }

    // 5. Platform
    let platformInstalled = false;
    try { await fs.access(path.join(WORKSPACE, "platform", "ai-engineering", "INSTALLATION-RECORD.md")); platformInstalled = true; } catch { /* skip */ }

    // 6. Skills count
    let skillCount = 0, platformSkillCount = 0;
    try { const e = await fs.readdir(path.join(WORKSPACE, "skills"), { withFileTypes: true }); skillCount = e.filter(e => e.isDirectory()).length; } catch { /* skip */ }
    try { const e = await fs.readdir(path.join(WORKSPACE, "platform", "ai-engineering", "skills"), { withFileTypes: true }); platformSkillCount = e.filter(e => e.isDirectory()).length; } catch { /* skip */ }

    // 7. System health
    const freeSpaceStr = safeExec('powershell -NoProfile -Command "(Get-PSDrive C).Free"');
    const usedSpaceStr = safeExec('powershell -NoProfile -Command "(Get-PSDrive C).Used"');
    const freeGB = Math.round((parseFloat(freeSpaceStr) || 0) / (1024*1024*1024) * 10) / 10;
    const totalGB = Math.round(((parseFloat(freeSpaceStr) || 0) + (parseFloat(usedSpaceStr) || 0)) / (1024*1024*1024) * 10) / 10;
    const usedPct = totalGB > 0 ? Math.round(((totalGB - freeGB) / totalGB) * 100) : 0;

    const nodeProcs = safeExec('powershell -NoProfile -Command "(Get-Process node -ErrorAction SilentlyContinue).Count"');
    const runningProcesses = nodeProcs ? parseInt(nodeProcs) || 0 : 0;

    const uptimeStr = safeExec('powershell -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime"');
    let uptimeHours = 0;
    if (uptimeStr) { try { const bootTime = new Date(uptimeStr); uptimeHours = Math.round((now.getTime() - bootTime.getTime()) / 3600000 * 10) / 10; } catch { /* skip */ } }

    // 8. Security status
    let watchdogStatus = "offline", motionEvents = 0, lastMotionTime = "";
    try {
      const watchdog = safeExec('powershell -NoProfile -Command "(Invoke-RestMethod -Uri http://localhost:3198/status -ErrorAction SilentlyContinue | ConvertTo-Json)"');
      if (watchdog) { const wd = JSON.parse(watchdog); watchdogStatus = wd.status || "unknown"; motionEvents = wd.motionEventCount || 0; }
    } catch { /* skip */ }
    try {
      const motion = safeExec('powershell -NoProfile -Command "(Invoke-RestMethod -Uri http://localhost:3197/status -ErrorAction SilentlyContinue | ConvertTo-Json)"');
      if (motion) { const md = JSON.parse(motion); lastMotionTime = md.lastMotion || ""; }
    } catch { /* skip */ }

    // 9. Recent sessions
    let recentSessionCount = 0;
    try {
      const sessionsDir = path.join(OPENCLAW_ROOT, "sessions");
      const entries = await fs.readdir(sessionsDir).catch(() => [] as string[]);
      const oneDayAgo = Date.now() - 86400000;
      for (const entry of entries) {
        try { const stat = await fs.stat(path.join(sessionsDir, entry)); if (stat.mtimeMs > oneDayAgo) recentSessionCount++; } catch { /* skip */ }
      }
    } catch { /* skip */ }

    // 10. Recent git log
    const recentCommits = safeExec(`cd "${WORKSPACE}" && git log --oneline -10 --format="%h|%s|%ai"`)
      .split("\n").filter(l => l.trim()).map(l => {
        const parts = l.split("|");
        return { hash: parts[0]?.trim() || "", message: parts[1]?.trim() || "", date: parts.slice(2).join("|").trim() };
      });

    // 11. Vercel deployments
    const vercelProjects = safeExec(`cd "${WORKSPACE}" && find . -maxdepth 2 -name ".vercel" -type d 2>nul`)
      .split("\n").filter(l => l.trim()).length;

    // 12. Scout report
    let lastScoutReport = null;
    try {
      const reportDir = path.join(WORKSPACE, "platform", "ai-engineering", "reports", "model-buzz-scout");
      const files = await fs.readdir(reportDir);
      const mdFiles = files.filter((f: string) => f.endsWith(".md")).sort().reverse();
      if (mdFiles.length > 0) { const content = await fs.readFile(path.join(reportDir, mdFiles[0]), "utf-8"); lastScoutReport = { file: mdFiles[0], preview: content.substring(0, 500) }; }
    } catch { /* skip */ }

    // 13. Daily memory
    let todayMemory = null;
    try {
      const today = now.toISOString().split("T")[0];
      const memPath = path.join(WORKSPACE, "memory", `${today}.md`);
      const content = await fs.readFile(memPath, "utf-8");
      todayMemory = content.substring(0, 500);
    } catch { /* skip */ }

    // 14. Attention items (computed from status)
    const attentionItems: any[] = [];
    if (watchdogStatus !== "online") attentionItems.push({ id: "watchdog-offline", severity: "high", category: "security", title: "Security Watchdog Offline", description: "Watchdog service is not responding at :3198", action: "check" });
    if (freeGB < 50) attentionItems.push({ id: "disk-low", severity: "high", category: "system", title: "Disk Space Low", description: `Only ${freeGB} GB free on C: drive`, action: "cleanup" });
    // Check for pending approvals
    attentionItems.push({ id: "capability-evolution-cron", severity: "low", category: "automation", title: "Register Capability Evolution Cron", description: "Monthly agent usage analysis and recommendations.", action: "approve" });
    attentionItems.push({ id: "specialist-agents", severity: "low", category: "agents", title: "Activate Specialist Agents", description: "Register 9 specialists in openclaw.json for on-demand delegation.", action: "approve" });

    return NextResponse.json({
      success: true, timestamp: now.toISOString(),
      agents: discoveredAgents,
      fleetConfig: FLEET_CONFIG, specialistConfig: SPECIALIST_CONFIG,
      cronJobs, identity,
      platform: { installed: platformInstalled, skillCount: platformSkillCount, version: "1.2.3" },
      skills: skillCount,
      system: {
        diskSpace: { freeGB, totalGB, usedPct },
        nodeProcesses: runningProcesses,
        uptimeHours,
        security: { watchdogStatus, motionEvents, lastMotionTime },
        recentSessions: recentSessionCount,
      },
      recentCommits,
      vercelProjects,
      lastScoutReport,
      todayMemory,
      attentionItems,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}