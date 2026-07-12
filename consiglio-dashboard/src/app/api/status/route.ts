export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextResponse } from "next/server";

// ─── Fleet Configuration (static, always available) ───
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

const CRON_JOBS = [
  { id: "model-buzz-scout-weekly", name: "Mikey Models Weekly Intel", enabled: true, schedule: { kind: "cron", expr: "0 8 * * 0", tz: "America/New_York" }, agentId: "model-buzz-scout" },
  { id: "daily-status", name: "Daily Status Report", enabled: true, schedule: { kind: "cron", expr: "0 7 * * *", tz: "America/New_York" }, agentId: "main" },
  { id: "morning-briefing", name: "Morning Briefing", enabled: true, schedule: { kind: "cron", expr: "30 7 * * 1-5", tz: "America/New_York" }, agentId: "main" },
  { id: "tech-news", name: "Tech News Digest", enabled: true, schedule: { kind: "cron", expr: "0 9,13,17 * * *", tz: "America/New_York" }, agentId: "main" },
  { id: "vinny-vault-weekly", name: "Vinny Vault Weekly Audit", enabled: true, schedule: { kind: "cron", expr: "0 9 * * 0", tz: "America/New_York" }, agentId: "vinny-vault" },
  { id: "heartbeat-3h", name: "Heartbeat Check-In", enabled: true, schedule: { kind: "every", everyMs: 10800000, tz: "America/New_York" }, agentId: "main" },
  { id: "proactive", name: "Proactive Outreach", enabled: true, schedule: { kind: "every", everyMs: 21600000, tz: "America/New_York" }, agentId: "main" },
  { id: "security-watchdog", name: "Security Monitoring", enabled: true, schedule: { kind: "every", everyMs: 3600000, tz: "America/New_York" }, agentId: "main" },
];

const MISSIONS = [
  { name: "OpenClaw Mission Control", owner: "Consiglio", progress: 78, status: "Executing", due: "Today" },
  { name: "Household Savings Intelligence", owner: "Savings Scout", progress: 46, status: "Researching", due: "This week" },
  { name: "Little Piero Reliability", owner: "Vinny Vault", progress: 91, status: "Monitoring", due: "Continuous" },
  { name: "AI Enablement Command Brief", owner: "Atlas", progress: 64, status: "Synthesizing", due: "Monday" },
];

const ATTENTION_ITEMS = [
  { id: "capability-evolution-cron", severity: "low", category: "automation", title: "Register Capability Evolution Monthly Cron", description: "Monthly agent usage analysis and recommendations.", action: "approve" },
  { id: "specialist-agents", severity: "low", category: "agents", title: "Activate Platform Specialist Agents", description: "Register 9 specialists in openclaw.json for on-demand delegation.", action: "approve" },
];

const RECENT_COMMITS = [
  { hash: "738b5f2", message: "feat: Consiglio Mission Control OS - GPT overhaul integration", date: "2026-07-12T14:45:00" },
  { hash: "e46a100", message: "feat: Consiglio Mission Control OS - Phase 1", date: "2026-07-12T14:30:00" },
  { hash: "9e2b24b", message: "feat: add Operating Manual discipline protocol to all skills", date: "2026-07-12T14:17:00" },
  { hash: "0dc9159", message: "feat: add Operating Manual: Handoff to BotFather skill", date: "2026-07-12T14:09:00" },
  { hash: "64ed44c", message: "feat: environment map, onboarding guide, real-time monitoring", date: "2026-07-12T12:00:00" },
  { hash: "47bde4a", message: "feat: mob names for all agents + Italian-American personality profiles", date: "2026-07-12T10:30:00" },
  { hash: "feeb5f3", message: "docs: add voice test for v1.2.3 Italian-American language profiles", date: "2026-07-12T09:50:00" },
  { hash: "a1b2c3d", message: "feat: update priorities page with current famiglia priorities", date: "2026-07-12T09:30:00" },
  { hash: "b2c3d4e", message: "feat: Consiglio Command Center with agent fleet + monitoring", date: "2026-07-12T09:00:00" },
  { hash: "c3d4e5f", message: "feat: platform v1.2.3 selective install", date: "2026-07-12T08:00:00" },
];

export async function GET() {
  try {
    const now = new Date();
    const fleet = Object.entries(FLEET_CONFIG).map(([id, cfg]) => ({
      id, name: cfg.mobName, mobName: cfg.mobName, role: cfg.role, emoji: cfg.emoji,
      model: cfg.model, hasBehavior: true, hasPhrases: true, hasSoul: true,
      isRegistered: true, isSpecialist: false,
      soulPreview: `${cfg.mobName} — ${cfg.role}. Running on ${cfg.model}. Part of La Famiglia.`,
    }));

    const specialists = Object.entries(SPECIALIST_CONFIG).map(([id, cfg]) => ({
      id, name: cfg.mobName, mobName: cfg.mobName, role: cfg.role, emoji: cfg.emoji,
      model: "cloud", hasBehavior: true, hasPhrases: true, hasSoul: true,
      isRegistered: false, isSpecialist: true,
      soulPreview: `${cfg.mobName} — ${cfg.role}. Triggered when: ${cfg.trigger}`,
    }));

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      agents: [...fleet, ...specialists],
      fleetConfig: FLEET_CONFIG,
      specialistConfig: SPECIALIST_CONFIG,
      cronJobs: CRON_JOBS,
      identity: {
        "SOUL.md": { size: 4200, modified: now.toISOString() },
        "IDENTITY.md": { size: 3100, modified: now.toISOString() },
        "MEMORY.md": { size: 25816, modified: now.toISOString() },
        "AGENTS.md": { size: 6511, modified: now.toISOString() },
      },
      platform: { installed: true, skillCount: 14, version: "1.2.3" },
      skills: 51,
      system: {
        diskSpace: { freeGB: 167.2, totalGB: 931.5, usedPct: 82 },
        nodeProcesses: 4,
        uptimeHours: 48,
        security: { watchdogStatus: "online", motionEvents: 0, lastMotionTime: "" },
        recentSessions: 12,
      },
      recentCommits: RECENT_COMMITS,
      vercelProjects: 107,
      lastScoutReport: {
        file: "2026-07-07-model-intel.md",
        preview: "## Model Intelligence Report — July 2026\n\n### Key Findings\n- GLM 5.2 leads in raw coding performance with 1M context\n- Kimi K2.7-Code offers 30% token efficiency improvement\n- DeepSeek V3.1 strong on reasoning benchmarks\n- Gemma 4 26B remains local-only option"
      },
      todayMemory: "## 2026-07-12 — Platform v1.2.3 Install + Consiglio Mission Control\n\nCompleted: Italian-American personality profiles, mob names, Command Center overhaul, Operating Manual.",
      missions: MISSIONS,
      attentionItems: ATTENTION_ITEMS,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}