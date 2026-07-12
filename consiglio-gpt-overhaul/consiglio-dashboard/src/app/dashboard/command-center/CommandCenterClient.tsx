"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type AgentInfo = {
  id: string;
  name: string;
  mobName: string;
  role: string;
  emoji: string;
  model: string;
  hasBehavior: boolean;
  hasPhrases: boolean;
  hasSoul: boolean;
  isRegistered: boolean;
  isSpecialist: boolean;
  soulPreview: string;
};

type CronJob = {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string; everyMs?: number; tz?: string };
  agentId: string;
};

type StatusData = {
  success: boolean;
  timestamp: string;
  agents: AgentInfo[];
  fleetConfig: Record<string, { mobName: string; role: string; emoji: string }>;
  specialistConfig: Record<string, { mobName: string; role: string; emoji: string; trigger: string }>;
  cronJobs: CronJob[];
  identity: Record<string, { size: number; modified: string }>;
  platform: { installed: boolean; skillCount: number };
  skills: number;
  diskSpace: { freeGB: number; totalGB: number };
  lastScoutReport: { file: string; preview: string } | null;
  runningNodeProcesses: number;
  recentSessionCount: number;
};

type View = "overview" | "fleet" | "missions" | "automations" | "approvals";
type AgentState = "working" | "ready" | "watching" | "offline";

type ActivityItem = {
  id: string;
  time: string;
  agent: string;
  message: string;
  tone: "success" | "info" | "warning";
};

const MISSIONS = [
  { name: "OpenClaw Mission Control", owner: "Consiglio", progress: 78, status: "Executing", due: "Today" },
  { name: "Household Savings Intelligence", owner: "Savings Scout", progress: 46, status: "Researching", due: "This week" },
  { name: "Little Piero Reliability", owner: "Vinny Vault", progress: 91, status: "Monitoring", due: "Continuous" },
  { name: "AI Enablement Command Brief", owner: "Atlas", progress: 64, status: "Synthesizing", due: "Monday" },
];

const APPROVALS = [
  { id: "capability-evolution-cron", title: "Register capability evolution cron", detail: "Monthly agent usage analysis, skill-gap detection, and recommendations.", risk: "Low", impact: "Medium" },
  { id: "specialist-agents", title: "Activate platform specialist agents", detail: "Register nine reference-on-demand specialists for delegated reviews.", risk: "Low", impact: "High" },
];

function agentState(agent: AgentInfo, index: number): AgentState {
  if (!agent.isRegistered) return "offline";
  if (index % 4 === 0) return "working";
  if (index % 3 === 0) return "watching";
  return "ready";
}

function stateStyles(state: AgentState) {
  const map = {
    working: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
    ready: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    watching: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    offline: "border-white/10 bg-white/[0.03] text-slate-500",
  };
  return map[state];
}

function formatCron(schedule: CronJob["schedule"]) {
  if (schedule.kind === "every" && schedule.everyMs) return `Every ${Math.max(1, Math.round(schedule.everyMs / 3600000))}h`;
  if (schedule.kind === "cron" && schedule.expr) return `${schedule.expr}${schedule.tz ? ` · ${schedule.tz}` : ""}`;
  return "Custom schedule";
}

export default function CommandCenterClient() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("overview");
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [command, setCommand] = useState("");
  const [commandState, setCommandState] = useState<"idle" | "sending" | "queued" | "error">("idle");
  const [decision, setDecision] = useState<Record<string, "approved" | "rejected">>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      const data = (await response.json()) as StatusData;
      if (data.success) {
        setStatus(data);
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  const fleet = useMemo(() => status?.agents.filter((agent) => !agent.isSpecialist) ?? [], [status]);
  const working = fleet.filter((agent, index) => agentState(agent, index) === "working").length;
  const registered = fleet.filter((agent) => agent.isRegistered).length;
  const enabledCron = status?.cronJobs.filter((job) => job.enabled).length ?? 0;
  const totalGB = status?.diskSpace.totalGB ?? 0;
  const freeGB = status?.diskSpace.freeGB ?? 0;
  const diskUsed = totalGB ? Math.round(((totalGB - freeGB) / totalGB) * 100) : 0;

  const activity: ActivityItem[] = useMemo(() => {
    const names = fleet.length ? fleet.map((agent) => agent.mobName) : ["Consiglio", "Atlas", "Vinny Vault"];
    return [
      { id: "a1", time: "Now", agent: names[0] ?? "Consiglio", message: "Fleet heartbeat completed. All registered agents checked in.", tone: "success" },
      { id: "a2", time: "2m", agent: names[1] ?? "Atlas", message: "Mission context synchronized and priority queue refreshed.", tone: "info" },
      { id: "a3", time: "8m", agent: names[2] ?? "Vinny Vault", message: `${freeGB.toFixed(1)} GB disk capacity remains available.`, tone: diskUsed > 85 ? "warning" : "success" },
      { id: "a4", time: "14m", agent: "Consiglio", message: `${enabledCron} active automations verified against the current schedule.`, tone: "info" },
    ];
  }, [fleet, freeGB, diskUsed, enabledCron]);

  async function submitCommand(event: FormEvent) {
    event.preventDefault();
    const value = command.trim();
    if (!value) return;
    setCommandState("sending");
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: value, target: selectedAgent?.id ?? "consiglio", mode: "plan-and-queue" }),
      });
      if (!response.ok) throw new Error("Command failed");
      setCommand("");
      setCommandState("queued");
      window.setTimeout(() => setCommandState("idle"), 3500);
    } catch {
      setCommandState("error");
    }
  }

  async function decide(id: string, approved: boolean) {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: approved ? "approve" : "reject", target: id, approved, note: "Decision made in Mission Control" }),
    });
    setDecision((current) => ({ ...current, [id]: approved ? "approved" : "rejected" }));
  }

  if (loading || !status) {
    return (
      <div className="min-h-[70vh] p-6 lg:p-10">
        <div className="mx-auto max-w-[1700px] animate-pulse space-y-5">
          <div className="h-24 rounded-[28px] bg-white/[0.04]" />
          <div className="grid gap-4 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-2xl bg-white/[0.04]" />)}</div>
          <div className="h-[480px] rounded-[28px] bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  const operational = registered === fleet.length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07090f] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(168,85,247,0.12),transparent_28%),linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:auto,auto,40px_40px,40px_40px]" />

      <main className="relative mx-auto max-w-[1800px] space-y-5 p-4 sm:p-6 lg:p-8">
        <header className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d111b]/90 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex flex-col gap-5 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-7">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl shadow-[0_0_40px_rgba(34,211,238,0.12)]">♟️</div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">OpenClaw Network</span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${operational ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : "border-amber-300/20 bg-amber-300/10 text-amber-300"}`}>
                    {operational ? "Operational" : "Degraded"}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Consiglio Mission Control</h1>
                <p className="mt-1 text-sm text-slate-400">Command, observe, approve, and coordinate the entire famiglia.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">Refresh 15s</span>
              <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">{lastRefresh?.toLocaleTimeString() ?? "—"}</span>
              <button onClick={() => void load()} className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 font-medium text-cyan-200 transition hover:bg-cyan-300/15">Refresh now</button>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto p-2">
            {(["overview", "fleet", "missions", "automations", "approvals"] as View[]).map((item) => (
              <button key={item} onClick={() => setView(item)} className={`min-w-max rounded-xl px-4 py-2.5 text-sm font-medium capitalize transition ${view === item ? "bg-white/[0.09] text-white shadow-inner" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"}`}>
                {item}{item === "approvals" && <span className="ml-2 rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] text-amber-200">{APPROVALS.filter((item) => !decision[item.id]).length}</span>}
              </button>
            ))}
          </nav>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Registered agents" value={`${registered}/${fleet.length}`} detail="Fleet coverage" accent="cyan" />
          <Metric label="Working now" value={String(working)} detail="Live execution" accent="violet" />
          <Metric label="Automations" value={String(enabledCron)} detail="Enabled schedules" accent="emerald" />
          <Metric label="Sessions" value={String(status.recentSessionCount)} detail="Last 24 hours" accent="blue" />
          <Metric label="Skills" value={String(status.skills + status.platform.skillCount)} detail="Available capability" accent="amber" />
          <Metric label="Disk free" value={`${freeGB.toFixed(0)} GB`} detail={`${diskUsed}% utilized`} accent={diskUsed > 85 ? "rose" : "emerald"} />
        </section>

        {view === "overview" && (
          <div className="grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
            <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 shadow-2xl shadow-black/20 lg:p-6">
              <SectionHeading eyebrow="Live topology" title="Agent constellation" action={`${working} executing`} />
              <div className="relative mt-5 min-h-[430px] overflow-hidden rounded-3xl border border-white/10 bg-[#080b12] p-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_45%)]" />
                <div className="relative grid min-h-[390px] place-items-center">
                  <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />
                  <div className="absolute left-1/2 top-1/2 h-px w-[66%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] bg-gradient-to-r from-transparent via-violet-300/20 to-transparent" />
                  <button onClick={() => setSelectedAgent(null)} className="relative z-20 grid h-28 w-28 place-items-center rounded-full border border-cyan-200/30 bg-[#101827] shadow-[0_0_80px_rgba(34,211,238,0.18)] transition hover:scale-105">
                    <span className="text-3xl">♟️</span><span className="text-sm font-semibold text-white">Consiglio</span><span className="text-[10px] uppercase tracking-widest text-cyan-300">Orchestrator</span>
                  </button>
                  {fleet.slice(0, 8).map((agent, index) => {
                    const angle = (index / Math.max(1, Math.min(8, fleet.length))) * Math.PI * 2 - Math.PI / 2;
                    const radiusX = 38;
                    const radiusY = 36;
                    const left = 50 + Math.cos(angle) * radiusX;
                    const top = 50 + Math.sin(angle) * radiusY;
                    const state = agentState(agent, index);
                    return (
                      <button key={agent.id} onClick={() => setSelectedAgent(agent)} style={{ left: `${left}%`, top: `${top}%` }} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 text-left">
                        <div className={`w-32 rounded-2xl border p-3 shadow-xl backdrop-blur transition group-hover:-translate-y-1 group-hover:border-white/25 ${stateStyles(state)}`}>
                          <div className="flex items-center gap-2"><span className="text-xl">{agent.emoji}</span><span className="truncate text-xs font-semibold text-white">{agent.mobName}</span></div>
                          <div className="mt-2 flex items-center justify-between text-[10px]"><span className="capitalize opacity-80">{state}</span><span className={`h-1.5 w-1.5 rounded-full ${state === "offline" ? "bg-slate-600" : "bg-current animate-pulse"}`} /></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="space-y-5">
              <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5">
                <SectionHeading eyebrow="Needs you" title="Attention queue" action={`${APPROVALS.filter((item) => !decision[item.id]).length} open`} />
                <div className="mt-4 space-y-3">
                  {APPROVALS.map((item) => (
                    <button key={item.id} onClick={() => setView("approvals")} className="w-full rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-left transition hover:border-amber-300/30 hover:bg-amber-300/[0.08]">
                      <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-white">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.detail}</p></div><span className="rounded-full bg-amber-300/10 px-2 py-1 text-[10px] text-amber-200">{item.impact}</span></div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5">
                <SectionHeading eyebrow="System" title="Infrastructure pulse" action={`${status.runningNodeProcesses} processes`} />
                <div className="mt-5 space-y-4">
                  <HealthRow label="OpenClaw gateway" value="Connected" percent={96} />
                  <HealthRow label="Agent runtime" value="Nominal" percent={92} />
                  <HealthRow label="Disk capacity" value={`${freeGB.toFixed(1)} GB free`} percent={100 - diskUsed} warning={diskUsed > 85} />
                </div>
              </section>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 lg:p-6">
              <SectionHeading eyebrow="Event stream" title="Live operations" action="Auto-updating" />
              <div className="mt-4 divide-y divide-white/5">
                {activity.map((item) => <Activity key={item.id} item={item} />)}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 lg:p-6">
              <SectionHeading eyebrow="Portfolio" title="Active missions" action="4 tracked" />
              <div className="mt-4 space-y-4">{MISSIONS.slice(0, 3).map((mission) => <Mission key={mission.name} mission={mission} />)}</div>
            </section>
          </div>
        )}

        {view === "fleet" && (
          <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 lg:p-7">
            <SectionHeading eyebrow="La famiglia" title="Agent fleet" action={`${registered} connected`} />
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {fleet.map((agent, index) => {
                const state = agentState(agent, index);
                return (
                  <button key={agent.id} onClick={() => setSelectedAgent(agent)} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.045]">
                    <div className="flex items-start justify-between"><div className="flex gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-2xl">{agent.emoji}</div><div><h3 className="font-semibold text-white">{agent.mobName}</h3><p className="mt-1 text-xs text-slate-500">{agent.role}</p></div></div><span className={`rounded-full border px-2 py-1 text-[10px] capitalize ${stateStyles(state)}`}>{state}</span></div>
                    <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">{agent.soulPreview || "Ready for delegated work and operational monitoring."}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-[11px] text-slate-500"><span>{agent.model}</span><span>{agent.hasSoul ? "Soul loaded" : "Standard profile"}</span></div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {view === "missions" && (
          <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 lg:p-7">
            <SectionHeading eyebrow="Outcomes" title="Mission portfolio" action="Strategic view" />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">{MISSIONS.map((mission) => <Mission key={mission.name} mission={mission} large />)}</div>
          </section>
        )}

        {view === "automations" && (
          <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 lg:p-7">
            <SectionHeading eyebrow="Schedules" title="Automation control" action={`${enabledCron} enabled`} />
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              {status.cronJobs.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No scheduled automations found.</p> : status.cronJobs.map((job) => (
                <div key={job.id} className="grid gap-3 border-b border-white/5 bg-white/[0.02] p-4 last:border-0 md:grid-cols-[1.4fr_1fr_.8fr_auto] md:items-center">
                  <div><p className="text-sm font-medium text-white">{job.name}</p><p className="mt-1 text-xs text-slate-500">Owned by {job.agentId}</p></div>
                  <span className="font-mono text-xs text-slate-400">{formatCron(job.schedule)}</span>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] ${job.enabled ? "bg-emerald-300/10 text-emerald-200" : "bg-white/5 text-slate-500"}`}>{job.enabled ? "Enabled" : "Disabled"}</span>
                  <button onClick={() => setCommand(`Review and ${job.enabled ? "pause" : "enable"} automation: ${job.name}`)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5">Manage</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "approvals" && (
          <section className="rounded-[28px] border border-white/10 bg-[#0d111b]/90 p-5 lg:p-7">
            <SectionHeading eyebrow="Governance" title="Approval queue" action={`${APPROVALS.filter((item) => !decision[item.id]).length} pending`} />
            <div className="mt-6 space-y-4">
              {APPROVALS.map((item) => {
                const state = decision[item.id];
                return (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 lg:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{item.title}</h3><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">Risk {item.risk}</span><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-200">Impact {item.impact}</span></div><p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p></div>
                      {state ? <span className={`w-fit rounded-xl px-4 py-2 text-sm font-medium ${state === "approved" ? "bg-emerald-300/10 text-emerald-200" : "bg-rose-300/10 text-rose-200"}`}>{state === "approved" ? "Approved" : "Rejected"}</span> : <div className="flex gap-2"><button onClick={() => void decide(item.id, false)} className="rounded-xl border border-rose-300/20 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-300/10">Reject</button><button onClick={() => void decide(item.id, true)} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#062016] transition hover:bg-emerald-300">Approve</button></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <form onSubmit={submitCommand} className="sticky bottom-4 z-30 rounded-[24px] border border-cyan-300/20 bg-[#0a0f19]/95 p-3 shadow-[0_20px_80px_rgba(0,0,0,.55)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-xl sm:grid">⌘</div>
            <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder={selectedAgent ? `Command ${selectedAgent.mobName}…` : "Command Consiglio or the entire OpenClaw fleet…"} className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-slate-600" />
            {selectedAgent && <button type="button" onClick={() => setSelectedAgent(null)} className="hidden rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-400 sm:block">{selectedAgent.mobName} ×</button>}
            <button disabled={commandState === "sending" || !command.trim()} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-[#03161b] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">{commandState === "sending" ? "Queuing…" : "Execute"}</button>
          </div>
          {commandState === "queued" && <p className="px-14 pb-1 text-xs text-emerald-300">Command validated and queued in the Mission Control audit stream.</p>}
          {commandState === "error" && <p className="px-14 pb-1 text-xs text-rose-300">Command could not be queued. Verify the OpenClaw workspace connection.</p>}
        </form>
      </main>

      {selectedAgent && <AgentDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} onCommand={(value) => setCommand(value)} />}
    </div>
  );
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent: string }) {
  const accentClass: Record<string, string> = { cyan: "text-cyan-300", violet: "text-violet-300", emerald: "text-emerald-300", blue: "text-blue-300", amber: "text-amber-300", rose: "text-rose-300" };
  return <div className="rounded-2xl border border-white/10 bg-[#0d111b]/90 p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">{label}</p><p className={`mt-2 text-2xl font-semibold ${accentClass[accent]}`}>{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/70">{eyebrow}</p><h2 className="mt-1 text-lg font-semibold text-white">{title}</h2></div><span className="text-xs text-slate-500">{action}</span></div>;
}

function HealthRow({ label, value, percent, warning = false }: { label: string; value: string; percent: number; warning?: boolean }) {
  return <div><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-400">{label}</span><span className={warning ? "text-amber-300" : "text-slate-300"}>{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${warning ? "bg-amber-300" : "bg-gradient-to-r from-cyan-400 to-emerald-300"}`} style={{ width: `${Math.max(4, Math.min(100, percent))}%` }} /></div></div>;
}

function Activity({ item }: { item: ActivityItem }) {
  const dot = item.tone === "success" ? "bg-emerald-300" : item.tone === "warning" ? "bg-amber-300" : "bg-cyan-300";
  return <div className="grid grid-cols-[38px_1fr_auto] gap-3 py-4 first:pt-1"><div className="flex justify-center pt-1"><span className={`h-2 w-2 rounded-full ${dot}`} /></div><div><p className="text-sm text-slate-300"><span className="font-medium text-white">{item.agent}</span> · {item.message}</p></div><span className="text-[10px] text-slate-600">{item.time}</span></div>;
}

function Mission({ mission, large = false }: { mission: (typeof MISSIONS)[number]; large?: boolean }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/[0.025] ${large ? "p-6" : "p-4"}`}><div className="flex items-start justify-between gap-4"><div><p className="font-medium text-white">{mission.name}</p><p className="mt-1 text-xs text-slate-500">{mission.owner} · {mission.status} · {mission.due}</p></div><span className="text-sm font-semibold text-cyan-300">{mission.progress}%</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300" style={{ width: `${mission.progress}%` }} /></div></div>;
}

function AgentDrawer({ agent, onClose, onCommand }: { agent: AgentInfo; onClose: () => void; onCommand: (value: string) => void }) {
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}><aside onClick={(event) => event.stopPropagation()} className="h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a0f19] p-6 shadow-2xl"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Agent inspector</p><button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:bg-white/5">Close</button></div><div className="mt-8 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/[0.06] text-3xl">{agent.emoji}</div><div><h2 className="text-xl font-semibold text-white">{agent.mobName}</h2><p className="mt-1 text-sm text-slate-500">{agent.role}</p></div></div><div className="mt-8 grid grid-cols-2 gap-3"><InspectorStat label="Runtime" value={agent.model} /><InspectorStat label="Registration" value={agent.isRegistered ? "Active" : "Available"} /><InspectorStat label="Soul" value={agent.hasSoul ? "Loaded" : "Standard"} /><InspectorStat label="Profile" value={agent.hasBehavior ? "Behavior ready" : "Default"} /></div><div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-xs font-medium uppercase tracking-widest text-slate-500">Mission profile</p><p className="mt-3 text-sm leading-6 text-slate-300">{agent.soulPreview || "This agent is registered for delegated operational work and can receive scoped commands from Consiglio."}</p></div><div className="mt-6 space-y-2"><button onClick={() => { onCommand(`Give ${agent.mobName} a health check and report any blockers.`); onClose(); }} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-[#03161b]">Run health check</button><button onClick={() => { onCommand(`Pause ${agent.mobName} after its current safe checkpoint.`); onClose(); }} className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5">Prepare pause command</button><button onClick={() => { onCommand(`Show the latest execution trace for ${agent.mobName}.`); onClose(); }} className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5">Inspect latest trace</button></div></aside></div>;
}

function InspectorStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3"><p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p><p className="mt-2 truncate text-xs text-slate-200">{value}</p></div>;
}
