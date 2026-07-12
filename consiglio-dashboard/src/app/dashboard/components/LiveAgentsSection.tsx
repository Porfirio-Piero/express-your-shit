"use client";

import { useState, useEffect } from "react";

interface AgentUpdate {
  timestamp: string;
  message: string;
  progress?: number;
}

interface AgentData {
  id: string;
  agent: string;
  agentEmoji: string;
  model: string;
  task: string;
  taskType: string;
  status: "running" | "idle" | "error" | "completed" | "paused";
  startTime: string;
  progress?: number;
  narrative: string;
  statusEmoji: string;
  statusLabel: string;
  durationDisplay: string;
  durationMinutes: number;
  latestUpdate: string | null;
  updates?: AgentUpdate[];
}

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  completedToday: number;
  agentsOnline: number;
  modelUsage: Record<string, number>;
}

interface ApiResponse {
  success: boolean;
  lastUpdated: string;
  timestamp: string;
  stats: AgentStats;
  agents: AgentData[];
  history: AgentData[];
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]",
    idle: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.3)]",
    error: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    completed: "bg-blue-400",
    paused: "bg-gray-400",
  };
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || "bg-gray-400"} animate-pulse`} />
  );
}

function ProgressBar({ progress, status }: { progress?: number; status: string }) {
  const pct = progress || 0;
  const barColors: Record<string, string> = {
    running: "from-green-500 to-emerald-400",
    idle: "from-yellow-500 to-amber-400",
    error: "from-red-500 to-rose-400",
    paused: "from-gray-500 to-gray-400",
  };
  const gradient = barColors[status] || "from-blue-500 to-cyan-400";

  return (
    <div className="w-full h-1.5 bg-[#252542] rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentData }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = agent.status === "running";

  return (
    <div
      className={`bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden transition-all duration-300 hover:border-[#3a3a5a] ${
        isRunning ? "ring-1 ring-green-500/20" : ""
      }`}
    >
      {/* Header */}
      <div
        className="bg-[#1e1e3a] px-4 py-3 border-b border-[#252542] cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.agentEmoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{agent.agent}</span>
              <StatusDot status={agent.status} />
            </div>
            <div className="text-xs text-gray-400">{agent.model}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full bg-[#252542] text-gray-300 font-mono">
            {agent.durationDisplay}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            agent.status === "running"
              ? "bg-green-500/20 text-green-400"
              : agent.status === "idle"
              ? "bg-yellow-500/20 text-yellow-400"
              : agent.status === "error"
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-500/20 text-gray-400"
          }`}>
            {agent.statusLabel}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Task */}
        <div className="mb-3">
          <div className="text-sm font-medium text-white mb-1">{agent.task}</div>
          <span className="text-xs px-2 py-0.5 rounded bg-[#1e1e3a] text-gray-400 uppercase tracking-wide">
            {agent.taskType}
          </span>
        </div>

        {/* Narrative */}
        <div className="text-sm text-gray-300 leading-relaxed mb-3 italic">
          &ldquo;{agent.narrative}&rdquo;
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{agent.progress || 0}%</span>
            </div>
            <ProgressBar progress={agent.progress} status={agent.status} />
          </div>
        )}

        {/* Latest Update */}
        {agent.latestUpdate && (
          <div className="flex items-start gap-2 text-xs text-gray-400 bg-[#1e1e3a] rounded-lg p-2.5">
            <span className="text-blue-400 mt-0.5">↳</span>
            <span>{agent.latestUpdate}</span>
          </div>
        )}
      </div>

      {/* Expanded Timeline */}
      {expanded && agent.updates && agent.updates.length > 0 && (
        <div className="px-4 pb-4 border-t border-[#252542] pt-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Activity Timeline
          </div>
          <div className="space-y-2">
            {agent.updates.slice().reverse().map((update, idx) => {
              const time = new Date(update.timestamp);
              const timeStr = time.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
              return (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="text-gray-500 font-mono min-w-[60px]">{timeStr}</span>
                  <span className="text-gray-300">{update.message}</span>
                  {update.progress !== undefined && (
                    <span className="text-green-400 ml-auto">{update.progress}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveAgentsSection() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/agents");
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      // Silently fail — we'll retry on next interval
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-[#16162a] rounded-xl border border-[#252542] p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🤖</span>
          <h2 className="text-white font-semibold text-lg">Live Agents</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#1e1e3a] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { agents, stats } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h2 className="text-white font-semibold text-lg">Live Agents</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
            {stats.activeAgents} active
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>🟢 {stats.activeAgents} running</span>
            <span>🟡 {stats.idleAgents} idle</span>
            <span>✅ {stats.completedToday} done today</span>
          </div>
          <div className="text-xs text-gray-500">
            Updated {lastUpdated}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#16162a] rounded-lg border border-[#252542] p-3 text-center">
          <div className="text-xl font-bold text-white">{stats.agentsOnline}</div>
          <div className="text-xs text-gray-400">Online</div>
        </div>
        <div className="bg-[#16162a] rounded-lg border border-[#252542] p-3 text-center">
          <div className="text-xl font-bold text-green-400">{stats.activeAgents}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="bg-[#16162a] rounded-lg border border-[#252542] p-3 text-center">
          <div className="text-xl font-bold text-blue-400">{stats.completedToday}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="bg-[#16162a] rounded-lg border border-[#252542] p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{Object.keys(stats.modelUsage).length}</div>
          <div className="text-xs text-gray-400">Models</div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {agents.length === 0 && (
        <div className="bg-[#16162a] rounded-xl border border-[#252542] p-8 text-center text-gray-400">
          <span className="text-3xl block mb-2">😴</span>
          No agents online right now. They&apos;ll be back.
        </div>
      )}
    </div>
  );
}