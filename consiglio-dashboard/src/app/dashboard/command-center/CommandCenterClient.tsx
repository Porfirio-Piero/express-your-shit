"use client";

import { useState, useEffect, useCallback } from "react";

interface AgentInfo {
  id: string; name: string; mobName: string; role: string; emoji: string;
  model: string; hasBehavior: boolean; hasPhrases: boolean; hasSoul: boolean;
  isRegistered: boolean; isSpecialist: boolean; soulPreview: string;
}

interface StatusData {
  success: boolean; timestamp: string; agents: AgentInfo[];
  fleetConfig: Record<string, { mobName: string; role: string; emoji: string }>;
  specialistConfig: Record<string, { mobName: string; role: string; emoji: string; trigger: string }>;
  cronJobs: { id: string; name: string; enabled: boolean; schedule: { kind: string; expr?: string; everyMs?: number; tz?: string }; agentId: string }[];
  identity: Record<string, { size: number; modified: string }>;
  platform: { installed: boolean; skillCount: number };
  skills: number; diskSpace: { freeGB: number; totalGB: number };
  lastScoutReport: { file: string; preview: string } | null;
  runningNodeProcesses: number; recentSessionCount: number;
}

const PLATFORM_STANDARDS = [
  { name: "Product Principles", icon: "🎯" }, { name: "Design System", icon: "🎨" },
  { name: "UX Standards", icon: "✨" }, { name: "Engineering", icon: "⚙️" },
  { name: "Accessibility", icon: "♿" }, { name: "Security", icon: "🔒" },
  { name: "QA Release Gates", icon: "✅" }, { name: "Context Preservation", icon: "🧠" },
  { name: "Personality Standard", icon: "🎭" }, { name: "Language Standard", icon: "🇮🇹" },
  { name: "Delegation Model", icon: "👔" },
];

const PENDING_ACTIONS = [
  { id: "capability-evolution-cron", title: "Register Capability Evolution Monthly Cron", description: "Monthly agent usage analysis and recommendations.", category: "automation", urgency: "low", impact: "medium" },
  { id: "specialist-agents", title: "Activate Platform Specialist Agents", description: "Register 9 specialists in openclaw.json for on-demand delegation.", category: "agents", urgency: "low", impact: "high" },
];

function formatCron(s: { kind: string; expr?: string; everyMs?: number; tz?: string }): string {
  if (s.kind === "every" && s.everyMs) return `Every ${Math.round(s.everyMs/3600000*10)/10}h`;
  if (s.kind === "cron" && s.expr) { const p = s.expr.trim().split(/\s+/); if (p.length >= 5) { const d = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; return `${p[4]!=="*"?d[parseInt(p[4])]:"Daily"} @ ${p[2].padStart(2,"0")}:${p[1].padStart(2,"0")} ${s.tz==="America/New_York"?"ET":s.tz||"Local"}`; } return s.expr; }
  return "Custom";
}

export default function CommandCenterClient() {
  const [status, setStatus] = useState<StatusData|null>(null);
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"fleet"|"specialists"|"monitoring"|"actions">("fleet");

  const fetchData = useCallback(async () => {
    try { const r = await fetch("/api/status"); const j = await r.json(); if (j.success) setStatus(j); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 15000); return () => clearInterval(i); }, [fetchData]);

  const handleApprove = async (id: string, approved: boolean) => {
    const note = actionNotes[id]||"";
    try { await fetch("/api/approve", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:approved?"approve":"reject",target:id,approved,note}) }); setApprovals(p=>({...p,[id]:approved})); } catch { setApprovals(p=>({...p,[id]:approved})); }
  };

  if (loading || !status) return <div className="p-8 max-w-[1600px] mx-auto"><div className="animate-pulse space-y-6"><div className="h-10 bg-[#1e1e3a] rounded-lg w-1/3" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-24 bg-[#1e1e3a] rounded-xl" />)}</div></div></div>;

  const freeGB = status.diskSpace.freeGB||0, totalGB = status.diskSpace.totalGB||0, usedPct = totalGB>0?Math.round(((totalGB-freeGB)/totalGB)*100):0;
  const activeFleet = status.agents.filter(a => !a.isSpecialist);
  const specialistAgents = Object.entries(status.specialistConfig).map(([id,c])=>({id,...c,discovered:status.agents.some(a=>a.id===id)}));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3"><span className="text-3xl">🚀</span>Consiglio Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">La famiglia • Real-time monitoring • Platform v1.2.3</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
            <span className="text-xs text-gray-500">• {status.runningNodeProcesses} node procs • {status.recentSessionCount} sessions/24h</span>
          </div>
          <span className="text-xs text-gray-500">{new Date(status.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <SC label="Active Fleet" value={activeFleet.length.toString()} icon="🤖" color="text-red-400" />
        <SC label="Specialists" value={specialistAgents.length.toString()} icon="🎭" color="text-purple-400" />
        <SC label="Skills" value={(status.skills + status.platform.skillCount).toString()} icon="⚡" color="text-yellow-400" />
        <SC label="Cron Jobs" value={status.cronJobs.length.toString()} icon="⏰" color="text-green-400" />
        <SC label="Platform" value="v1.2.3" icon="🏗️" color="text-purple-400" />
        <SC label="Disk Free" value={`${freeGB.toFixed(1)} GB`} icon="💾" color={freeGB>100?"text-green-400":"text-red-400"} />
        <SC label="Standards" value={PLATFORM_STANDARDS.length.toString()} icon="📐" color="text-cyan-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#16162a] rounded-xl border border-[#252542] p-1">
        {[{id:"fleet" as const,l:"La Famiglia",i:"🤖"},{id:"specialists" as const,l:"Specialists",i:"🎭"},{id:"monitoring" as const,l:"Monitoring",i:"📊"},{id:"actions" as const,l:"Approvals",i:"⚡"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab===t.id?"bg-[#252542] text-white shadow-md":"text-gray-400 hover:text-white hover:bg-[#1e1e3a]"}`}>
            <span>{t.i}</span><span className="hidden sm:inline">{t.l}</span>
          </button>
        ))}
      </div>

      {/* Fleet Tab */}
      {activeTab==="fleet" && (
        <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
          <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2"><span>🤖</span>La Famiglia — Active Fleet</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">{activeFleet.length} registered</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeFleet.map(a => (
              <div key={a.id} className={`bg-[#1e1e3a] rounded-lg border border-[#252542] p-4 hover:border-[#3a3a5a] transition-all ${a.isRegistered?"ring-1 ring-green-500/20":""}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{a.mobName}</div>
                    <div className="text-xs text-gray-400">{a.role}</div>
                  </div>
                  {a.isRegistered && <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-[#252542] text-gray-300 font-mono">{a.model}</span>
                  {a.hasBehavior && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300" title="Has BEHAVIOR.md">🎭</span>}
                  {a.hasPhrases && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300" title="Has PHRASES.md">🗣️</span>}
                  {a.isRegistered?<span className="text-xs text-green-400">Active</span>:<span className="text-xs text-gray-500">Available</span>}
                </div>
                {a.soulPreview && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{a.soulPreview}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Specialists Tab */}
      {activeTab==="specialists" && (
        <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
          <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2"><span>🎭</span>Reference-on-Demand Specialists</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">BotFather delegates</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {specialistAgents.map(s=>(
              <div key={s.id} className="bg-[#1e1e3a] rounded-lg border border-[#252542] p-4 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{s.mobName}</div>
                    <div className="text-xs text-gray-400">{s.role}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Reference</span>
                </div>
                <div className="text-xs text-gray-500 mt-1"><span className="text-gray-400">Trigger:</span> {s.trigger}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4">
            <div className="bg-[#1e1e3a] rounded-lg p-3 text-xs text-gray-400 border border-[#252542]">
              <span className="text-purple-400">ℹ️</span> Each specialist has BEHAVIOR.md + PHRASES.md with Italian-American personality profiles. Small/reversible changes don&apos;t require specialist review.
            </div>
          </div>
        </section>
      )}

      {/* Monitoring Tab */}
      {activeTab==="monitoring" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
            <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542]"><h2 className="text-white font-semibold flex items-center gap-2"><span>⏰</span>Active Cron Jobs</h2></div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {status.cronJobs.length===0?<p className="text-gray-500 text-sm text-center py-4">No active cron jobs</p>:status.cronJobs.map(j=>(
                <div key={j.id} className="bg-[#1e1e3a] rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1"><div className="text-sm text-white font-medium truncate">{j.name}</div><div className="text-xs text-gray-400 mt-0.5">{formatCron(j.schedule)} • {j.agentId}</div></div>
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 whitespace-nowrap">Active</span>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
            <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542]"><h2 className="text-white font-semibold flex items-center gap-2"><span>💾</span>System Health</h2></div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">C: Drive</span><span className="text-white font-mono">{freeGB.toFixed(1)} GB free / {totalGB.toFixed(1)} GB</span></div>
                <div className="w-full h-3 bg-[#252542] rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${usedPct>90?"bg-red-500":usedPct>75?"bg-yellow-500":"bg-green-500"}`} style={{width:`${usedPct}%`}} /></div>
                <div className="text-xs text-gray-500 mt-1">{usedPct}% used</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1e1e3a] rounded-lg p-3 text-center"><div className="text-lg font-bold text-green-400">{status.runningNodeProcesses}</div><div className="text-xs text-gray-400">Node Processes</div></div>
                <div className="bg-[#1e1e3a] rounded-lg p-3 text-center"><div className="text-lg font-bold text-blue-400">{status.recentSessionCount}</div><div className="text-xs text-gray-400">Sessions/24h</div></div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Identity Files</div>
                <div className="space-y-1">{Object.entries(status.identity).map(([f,i])=><div key={f} className="flex items-center justify-between text-xs"><span className="text-gray-300">{f}</span><span className="text-gray-500">{(i.size/1024).toFixed(1)} KB</span></div>)}</div>
              </div>
            </div>
          </section>
          <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
            <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542]"><h2 className="text-white font-semibold flex items-center gap-2"><span>📊</span>Reports & Intelligence</h2></div>
            <div className="p-4 space-y-3">
              {status.lastScoutReport?(
                <div className="bg-[#1e1e3a] rounded-lg p-4"><div className="flex items-center gap-2 mb-2"><span className="text-lg">🔍</span><span className="text-sm font-semibold text-white">Mikey Models — Latest Scout Report</span><span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">Weekly</span></div><p className="text-xs text-gray-400 line-clamp-4">{status.lastScoutReport.preview}</p></div>
              ):(
                <div className="bg-[#1e1e3a] rounded-lg p-4 text-center"><span className="text-2xl block mb-2">🔍</span><p className="text-sm text-gray-400">Mikey Models drops the first report Sunday 8 AM ET</p></div>
              )}
            </div>
          </section>
          <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
            <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542]"><h2 className="text-white font-semibold flex items-center gap-2"><span>📐</span>Engineering Standards</h2></div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {PLATFORM_STANDARDS.map(s=><div key={s.name} className="bg-[#1e1e3a] rounded-lg p-3 flex items-center gap-3 hover:bg-[#252542] transition-colors cursor-pointer"><span className="text-lg">{s.icon}</span><span className="text-sm text-white">{s.name}</span></div>)}
            </div>
            {status.platform.installed && <div className="px-4 pb-4"><div className="bg-[#1e1e3a] rounded-lg p-3 text-xs text-gray-400"><span className="text-green-400">✓</span> Platform AI Engineering v1.2.3 installed — {status.platform.skillCount} platform skills + {PLATFORM_STANDARDS.length} standards</div></div>}
          </section>
        </div>
      )}

      {/* Actions Tab */}
      {activeTab==="actions" && (
        <section className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
          <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2"><span>⚡</span>Pending Approvals</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">{PENDING_ACTIONS.length} items</span>
          </div>
          <div className="p-4 space-y-3">
            {PENDING_ACTIONS.map(a=>{const d=approvals[a.id]!==undefined;return(
              <div key={a.id} className={`bg-[#1e1e3a] rounded-lg p-5 border-l-4 ${d?(approvals[a.id]?"border-l-green-500":"border-l-red-500"):"border-l-yellow-500"}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white">{a.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.urgency==="high"?"bg-red-500/20 text-red-400":a.urgency==="medium"?"bg-yellow-500/20 text-yellow-400":"bg-gray-500/20 text-gray-400"}`}>{a.urgency}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{a.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.impact==="high"?"bg-green-500/20 text-green-400":"bg-gray-500/20 text-gray-400"}`}>impact: {a.impact}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{a.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d?<span className={`text-sm font-medium px-3 py-2 rounded-lg ${approvals[a.id]?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{approvals[a.id]?"✅ Approved":"❌ Rejected"}</span>:(
                      <><button onClick={()=>handleApprove(a.id,true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors">Approve</button>
                      <button onClick={()=>handleApprove(a.id,false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/50 hover:bg-red-600 text-white transition-colors">Reject</button></>
                    )}
                  </div>
                </div>
                <div className="mt-3"><input type="text" placeholder="Add a note (optional)..." value={actionNotes[a.id]||""} onChange={e=>setActionNotes(p=>({...p,[a.id]:e.target.value}))} className="w-full bg-[#252542] border border-[#3a3a5a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" disabled={d} /></div>
              </div>
            );})}
          </div>
        </section>
      )}

      <div className="text-center text-xs text-gray-600 py-4">Consiglio Command Center • OpenClaw Platform v1.2.3 • All Cloud Models • <span className="text-green-500">●</span> Systems Nominal</div>
    </div>
  );
}

function SC({label,value,icon,color}:{label:string;value:string;icon:string;color:string}){
  return <div className="bg-[#16162a] rounded-xl border border-[#252542] p-3 text-center hover:border-[#3a3a5a] transition-colors"><div className="text-lg mb-1">{icon}</div><div className={`text-xl font-bold ${color}`}>{value}</div><div className="text-xs text-gray-400 mt-0.5">{label}</div></div>;
}