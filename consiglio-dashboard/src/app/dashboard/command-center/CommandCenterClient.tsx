"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─── */
interface AgentInfo {
  id: string; name: string; mobName: string; role: string; emoji: string;
  model: string; hasBehavior: boolean; hasPhrases: boolean; hasSoul: boolean;
  isRegistered: boolean; isSpecialist: boolean; soulPreview: string;
}

interface SystemInfo {
  diskSpace: { freeGB: number; totalGB: number; usedPct: number };
  nodeProcesses: number; uptimeHours: number;
  security: { watchdogStatus: string; motionEvents: number; lastMotionTime: string };
  recentSessions: number;
}

interface AttentionItem {
  id: string; severity: string; category: string; title: string; description: string; action: string;
}

interface StatusData {
  success: boolean; timestamp: string; agents: AgentInfo[];
  fleetConfig: Record<string, { mobName: string; role: string; emoji: string; model: string }>;
  specialistConfig: Record<string, { mobName: string; role: string; emoji: string; trigger: string }>;
  cronJobs: { id: string; name: string; enabled: boolean; schedule: { kind: string; expr?: string; everyMs?: number; tz?: string }; agentId: string }[];
  identity: Record<string, { size: number; modified: string }>;
  platform: { installed: boolean; skillCount: number; version: string };
  skills: number; system: SystemInfo;
  recentCommits: { hash: string; message: string; date: string }[];
  vercelProjects: number;
  lastScoutReport: { file: string; preview: string } | null;
  todayMemory: string | null;
  attentionItems: AttentionItem[];
}

const TABS = [
  { id: "overview" as const, label: "Overview", icon: "⚡" },
  { id: "fleet" as const, label: "La Famiglia", icon: "🤖" },
  { id: "specialists" as const, label: "Specialists", icon: "🎭" },
  { id: "operations" as const, label: "Operations", icon: "📡" },
  { id: "actions" as const, label: "Approvals", icon: "⚡" },
];

function formatCron(s: { kind: string; expr?: string; everyMs?: number; tz?: string }): string {
  if (s.kind === "every" && s.everyMs) return `Every ${Math.round(s.everyMs/3600000*10)/10}h`;
  if (s.kind === "cron" && s.expr) {
    const p = s.expr.trim().split(/\s+/);
    if (p.length >= 5) { const d = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; return `${p[4]!=="*"?d[parseInt(p[4])]:"Daily"} @ ${p[2].padStart(2,"0")}:${p[1].padStart(2,"0")} ${s.tz==="America/New_York"?"ET":s.tz||""}`; }
    return s.expr;
  }
  return "Custom";
}

function sevColor(s: string) { return s==="critical"?"text-red-400 bg-red-500/10 border-red-500/20":s==="high"?"text-orange-400 bg-orange-500/10 border-orange-500/20":s==="medium"?"text-yellow-400 bg-yellow-500/10 border-yellow-500/20":"text-gray-400 bg-gray-500/10 border-gray-500/20"; }

/* ─── Main Component ─── */
export default function MissionControlOS() {
  const [status, setStatus] = useState<StatusData|null>(null);
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("overview");
  const [selectedAgent, setSelectedAgent] = useState<string|null>(null);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdResponse, setCmdResponse] = useState<string|null>(null);

  const fetchData = useCallback(async () => {
    try { const r = await fetch("/api/status"); const j = await r.json(); if (j.success) setStatus(j); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 10000); return () => clearInterval(i); }, [fetchData]);

  const handleApprove = async (id: string, approved: boolean) => {
    const note = actionNotes[id]||"";
    try { await fetch("/api/approve", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:approved?"approve":"reject",target:id,approved,note}) }); setApprovals(p=>({...p,[id]:approved})); } catch { setApprovals(p=>({...p,[id]:approved})); }
  };

  const handleCommand = () => {
    if (!cmdInput.trim()) return;
    // Map natural language to actions
    const cmd = cmdInput.toLowerCase();
    if (cmd.includes("snap") || cmd.includes("photo") || cmd.includes("camera")) {
      setCmdResponse("📸 Camera command detected. Use `snap` in Telegram to capture from OBSBOT.");
    } else if (cmd.includes("status") || cmd.includes("health")) {
      setCmdResponse(`✅ System operational. ${status?.system.nodeProcesses||0} node processes, ${status?.system.recentSessions||0} sessions/24h, ${status?.system.diskSpace.freeGB||0}GB free.`);
    } else if (cmd.includes("deploy") || cmd.includes("vercel")) {
      setCmdResponse("🚀 Deploy: Use `git push origin main` for auto-deploy or `npx vercel --prod` for manual.");
    } else if (cmd.includes("security") || cmd.includes("watchdog")) {
      setCmdResponse(`🛡️ Security: Watchdog ${status?.system.security.watchdogStatus||"unknown"}, ${status?.system.security.motionEvents||0} motion events.`);
    } else {
      setCmdResponse("🤖 Command received. For full control, use Telegram commands or OpenClaw CLI.");
    }
    setCmdInput("");
    setTimeout(() => setCmdResponse(null), 8000);
  };

  if (loading || !status) return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
      <div className="text-center"><div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-400 text-sm font-mono">INITIALIZING MISSION CONTROL...</p></div>
    </div>
  );

  const { agents, system, cronJobs, attentionItems, recentCommits } = status;
  const fleet = agents.filter(a => !a.isSpecialist);
  const specialists = Object.entries(status.specialistConfig).map(([id,c])=>({id,...c,discovered:agents.some(a=>a.id===id)}));
  const activeAgents = fleet.filter(a => a.isRegistered).length;
  const totalAgents = fleet.length;
  const criticals = attentionItems.filter(a => a.severity==="critical"||a.severity==="high");
  const sysHealth = system.security.watchdogStatus==="online"?"operational":system.security.watchdogStatus==="degraded"?"degraded":"needs-attention";
  const healthColor = sysHealth==="operational"?"green":sysHealth==="degraded"?"amber":"red";
  const healthPulse = sysHealth==="operational"?"animate-pulse":"";
  const freeGB = system.diskSpace.freeGB, totalGB = system.diskSpace.totalGB, usedPct = system.diskSpace.usedPct;

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* ─── HEADER ─── */}
      <header className="border-b border-[#1a1a2e] bg-[#0d0d1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full bg-${healthColor}-400 ${healthPulse} shadow-[0_0_8px_rgba(${healthColor==="green"?"74,222,128":healthColor==="amber"?"251,191,36":"248,113,113"},0.6)]`} />
              <h1 className="text-sm sm:text-base font-bold tracking-wider text-gray-100">CONSIGLIO MISSION CONTROL</h1>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${sysHealth==="operational"?"text-green-400 border-green-500/30 bg-green-500/10":sysHealth==="degraded"?"text-amber-400 border-amber-500/30 bg-amber-500/10":"text-red-400 border-red-500/30 bg-red-500/10"}`}>
              {sysHealth==="operational"?"OPERATIONAL":sysHealth==="degraded"?"DEGRADED":"NEEDS ATTENTION"}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs font-mono text-gray-500">
            <span>{activeAgents}/{totalAgents} agents</span>
            <span>{system.recentSessions} sessions/24h</span>
            <span>{freeGB.toFixed(0)}GB free</span>
            <span className="text-gray-600">{new Date(status.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* ─── STATUS CARDS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <StatCard label="Agents" value={`${activeAgents}/${totalAgents}`} icon="🤖" color="text-cyan-400" sub="active" />
          <StatCard label="Working" value={system.recentSessions.toString()} icon="⚙️" color="text-blue-400" sub="sessions/24h" />
          <StatCard label="Attention" value={criticals.length.toString()} icon="⚠️" color={criticals.length>0?"text-red-400":"text-green-400"} sub={criticals.length>0?"items":"clear"} />
          <StatCard label="Cron Jobs" value={cronJobs.length.toString()} icon="⏰" color="text-green-400" sub="scheduled" />
          <StatCard label="Skills" value={(status.skills + status.platform.skillCount).toString()} icon="⚡" color="text-yellow-400" sub="available" />
          <StatCard label="Security" value={system.security.motionEvents.toString()} icon="🛡️" color={system.security.watchdogStatus==="online"?"text-green-400":"text-red-400"} sub="motion events" />
          <StatCard label="Disk" value={`${usedPct}%`} icon="💾" color={usedPct>90?"text-red-400":usedPct>75?"text-amber-400":"text-green-400"} sub={`${freeGB.toFixed(0)}GB free`} />
          <StatCard label="Uptime" value={`${system.uptimeHours}h`} icon="🕐" color="text-blue-400" sub="since boot" />
        </div>

        {/* ─── TABS ─── */}
        <div className="flex gap-1 bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] p-1 overflow-x-auto">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex-1 min-w-[80px] px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${activeTab===t.id?"bg-[#1a1a2e] text-white shadow-md":"text-gray-500 hover:text-gray-300 hover:bg-[#12121f]"}`}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab==="overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Agent Constellation */}
            <div className="lg:col-span-2 bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span className="text-cyan-400">◆</span> Agent Constellation</h2>
                <span className="text-[10px] font-mono text-gray-600">LIVE</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                {fleet.map(a => (
                  <button key={a.id} onClick={()=>setSelectedAgent(selectedAgent===a.id?null:a.id)}
                    className={`bg-[#12121f] rounded-lg border p-3 text-left transition-all hover:border-cyan-500/30 ${selectedAgent===a.id?"border-cyan-500/50 ring-1 ring-cyan-500/20":a.isRegistered?"border-[#1a1a2e]":"border-[#1a1a2e] opacity-60"}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{a.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{a.mobName}</div>
                        <div className="text-[10px] text-gray-500">{a.role}</div>
                      </div>
                      {a.isRegistered && <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)]" />}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a1a2e] text-gray-400">{a.model}</span>
                      {a.hasBehavior && <span className="text-[10px]" title="BEHAVIOR.md">🎭</span>}
                      {a.hasPhrases && <span className="text-[10px]" title="PHRASES.md">🗣️</span>}
                      {a.hasSoul && <span className="text-[10px]" title="SOUL.md">📜</span>}
                    </div>
                    {selectedAgent===a.id && a.soulPreview && <p className="text-[10px] text-gray-600 mt-2 line-clamp-3 border-t border-[#1a1a2e] pt-2">{a.soulPreview}</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Attention Queue */}
            <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span className="text-amber-400">⚡</span> Attention Queue</h2>
                <span className="text-[10px] font-mono text-gray-600">{attentionItems.length} items</span>
              </div>
              <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                {attentionItems.map(item => (
                  <div key={item.id} className={`bg-[#12121f] rounded-lg p-3 border-l-2 ${item.severity==="high"?"border-l-red-500":item.severity==="medium"?"border-l-amber-500":"border-l-gray-600"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${sevColor(item.severity)}`}>{item.severity}</span>
                      <span className="text-xs font-medium text-white">{item.title}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">{item.description}</p>
                  </div>
                ))}
                {system.security.watchdogStatus!=="online" && (
                  <div className="bg-[#12121f] rounded-lg p-3 border-l-2 border-l-red-500">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-red-400 bg-red-500/10 border border-red-500/20">critical</span>
                      <span className="text-xs font-medium text-white">Watchdog Offline</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Security watchdog not responding at :3198</p>
                  </div>
                )}
              </div>
            </div>

            {/* Operations Feed */}
            <div className="lg:col-span-2 bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span className="text-green-400">◉</span> Live Operations</h2>
                <span className="text-[10px] font-mono text-gray-600">{recentCommits.length} recent</span>
              </div>
              <div className="p-3 space-y-1 max-h-[250px] overflow-y-auto font-mono text-[11px]">
                {recentCommits.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 py-1 border-b border-[#1a1a2e]/50">
                    <span className="text-cyan-500/70 shrink-0">{c.hash}</span>
                    <span className="text-gray-300 flex-1 truncate">{c.message}</span>
                    <span className="text-gray-600 shrink-0 text-[10px]">{new Date(c.date).toLocaleDateString()}</span>
                  </div>
                ))}
                {cronJobs.slice(0, 5).map(j => (
                  <div key={j.id} className="flex items-start gap-2 py-1 border-b border-[#1a1a2e]/50">
                    <span className="text-green-500/70 shrink-0">⏰</span>
                    <span className="text-gray-300 flex-1 truncate">{j.name}</span>
                    <span className="text-gray-600 shrink-0 text-[10px]">{formatCron(j.schedule)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e]">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span className="text-blue-400">■</span> System Health</h2>
              </div>
              <div className="p-3 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">C: Drive</span><span className="font-mono text-gray-400">{freeGB.toFixed(1)} GB / {totalGB.toFixed(1)} GB</span></div>
                  <div className="w-full h-2 bg-[#1a1a2e] rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${usedPct>90?"bg-red-500":usedPct>75?"bg-amber-500":"bg-green-500"}`} style={{width:`${usedPct}%`}} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#12121f] rounded-lg p-2 text-center"><div className="text-lg font-bold text-blue-400">{system.nodeProcesses}</div><div className="text-[10px] text-gray-500">Node Procs</div></div>
                  <div className="bg-[#12121f] rounded-lg p-2 text-center"><div className="text-lg font-bold text-purple-400">{system.uptimeHours}</div><div className="text-[10px] text-gray-500">Hours Up</div></div>
                </div>
                <div className="bg-[#12121f] rounded-lg p-2">
                  <div className="flex items-center justify-between text-xs mb-1"><span className="text-gray-500">Security</span><span className={`font-mono ${system.security.watchdogStatus==="online"?"text-green-400":"text-red-400"}`}>{system.security.watchdogStatus}</span></div>
                  <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Motion Events</span><span className="font-mono text-gray-400">{system.security.motionEvents}</span></div>
                </div>
                <div className="bg-[#12121f] rounded-lg p-2">
                  <div className="text-[10px] text-gray-500 mb-1">Identity Files</div>
                  {Object.entries(status.identity).slice(0,4).map(([f,i])=><div key={f} className="flex justify-between text-[10px]"><span className="text-gray-400">{f}</span><span className="text-gray-600">{(i.size/1024).toFixed(1)} KB</span></div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FLEET TAB ─── */}
        {activeTab==="fleet" && (
          <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
            <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span>🤖</span>La Famiglia — Active Fleet</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{fleet.filter(a=>a.isRegistered).length} active</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fleet.map(a => (
                <div key={a.id} className={`bg-[#12121f] rounded-lg border p-4 hover:border-[#3a3a5a] transition-all ${a.isRegistered?"ring-1 ring-green-500/20":"opacity-60"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{a.mobName}</div>
                      <div className="text-[10px] text-gray-500">{a.role}</div>
                    </div>
                    {a.isRegistered && <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1a2e] text-gray-300">{a.model}</span>
                    {a.hasBehavior && <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300" title="BEHAVIOR.md">🎭</span>}
                    {a.hasPhrases && <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-300" title="PHRASES.md">🗣️</span>}
                    {a.hasSoul && <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300" title="SOUL.md">📜</span>}
                  </div>
                  {a.isRegistered?<span className="text-[10px] text-green-400">● Registered & Active</span>:<span className="text-[10px] text-gray-600">○ Available (not registered)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SPECIALISTS TAB ─── */}
        {activeTab==="specialists" && (
          <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
            <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span>🎭</span>Reference-on-Demand Specialists</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">BotFather delegates</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specialists.map(s=>(
                <div key={s.id} className="bg-[#12121f] rounded-lg border border-[#1a1a2e] p-4 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{s.mobName}</div>
                      <div className="text-[10px] text-gray-500">{s.role}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Reference</span>
                  </div>
                  <div className="text-[10px] text-gray-600"><span className="text-gray-500">Trigger:</span> {s.trigger}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── OPERATIONS TAB ─── */}
        {activeTab==="operations" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e]"><h2 className="text-sm font-semibold text-white flex items-center gap-2"><span>⏰</span>Scheduled Jobs</h2></div>
              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {cronJobs.map(j=>(
                  <div key={j.id} className="bg-[#12121f] rounded-lg p-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1"><div className="text-xs text-white font-medium truncate">{j.name}</div><div className="text-[10px] text-gray-500 mt-0.5">{formatCron(j.schedule)} • {j.agentId}</div></div>
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 whitespace-nowrap">Active</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
              <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e]"><h2 className="text-sm font-semibold text-white flex items-center gap-2"><span>📊</span>Recent Activity</h2></div>
              <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto font-mono text-[11px]">
                {recentCommits.map((c,i)=>(
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[#1a1a2e]/50">
                    <span className="text-cyan-500/70 shrink-0">{c.hash}</span>
                    <span className="text-gray-300 flex-1 truncate">{c.message}</span>
                    <span className="text-gray-600 shrink-0 text-[10px]">{new Date(c.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
            {status.lastScoutReport && (
              <div className="lg:col-span-2 bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
                <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e]"><h2 className="text-sm font-semibold text-white flex items-center gap-2"><span>🔍</span>Mikey Models — Latest Intel</h2></div>
                <div className="p-4"><p className="text-xs text-gray-400 line-clamp-6">{status.lastScoutReport.preview}</p></div>
              </div>
            )}
          </div>
        )}

        {/* ─── APPROVALS TAB ─── */}
        {activeTab==="actions" && (
          <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
            <div className="bg-[#12121f] px-4 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2"><span>⚡</span>Pending Approvals</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{attentionItems.length} items</span>
            </div>
            <div className="p-4 space-y-3">
              {attentionItems.map(a=>{const d=approvals[a.id]!==undefined;return(
                <div key={a.id} className={`bg-[#12121f] rounded-lg p-5 border-l-4 ${d?(approvals[a.id]?"border-l-green-500":"border-l-red-500"):"border-l-amber-500"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white text-sm">{a.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${sevColor(a.severity)}`}>{a.severity}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{a.category}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{a.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {d?<span className={`text-xs font-medium px-3 py-2 rounded-lg ${approvals[a.id]?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{approvals[a.id]?"✅ Approved":"❌ Rejected"}</span>:(
                        <><button onClick={()=>handleApprove(a.id,true)} className="px-4 py-2 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-colors">Approve</button>
                        <button onClick={()=>handleApprove(a.id,false)} className="px-4 py-2 rounded-lg text-xs font-medium bg-red-600/50 hover:bg-red-600 text-white transition-colors">Reject</button></>
                      )}
                    </div>
                  </div>
                  <div className="mt-3"><input type="text" placeholder="Add a note (optional)..." value={actionNotes[a.id]||""} onChange={e=>setActionNotes(p=>({...p,[a.id]:e.target.value}))} className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" disabled={d} /></div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ─── COMMAND BAR ─── */}
        <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] overflow-hidden">
          <div className="bg-[#12121f] px-4 py-2 border-b border-[#1a1a2e] flex items-center gap-2">
            <span className="text-cyan-400 text-sm">⌘</span>
            <span className="text-xs text-gray-400 font-medium">Command Consiglio</span>
          </div>
          <div className="p-3 flex gap-2">
            <input type="text" value={cmdInput} onChange={e=>setCmdInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleCommand()} placeholder="Ask Consiglio... (snap, status, deploy, security)" className="flex-1 bg-[#12121f] border border-[#1a1a2e] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50" />
            <button onClick={handleCommand} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors">Execute</button>
          </div>
          {cmdResponse && <div className="px-4 pb-3"><div className="bg-[#12121f] rounded-lg p-3 text-xs text-gray-300 border border-cyan-500/20">{cmdResponse}</div></div>}
        </div>

        <div className="text-center text-[10px] text-gray-700 py-2 font-mono">
          CONSIGLIO MISSION CONTROL • OpenCLAW Platform v{status.platform.version} • All Cloud Models • <span className="text-green-600">●</span> {sysHealth.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function StatCard({label,value,icon,color,sub}:{label:string;value:string;icon:string;color:string;sub:string}){
  return (
    <div className="bg-[#0d0d1a] rounded-xl border border-[#1a1a2e] p-3 text-center hover:border-[#2a2a3e] transition-colors">
      <div className="text-sm mb-0.5">{icon}</div>
      <div className={`text-xl font-bold ${color} font-mono`}>{value}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
      <div className="text-[9px] text-gray-700">{sub}</div>
    </div>
  );
}