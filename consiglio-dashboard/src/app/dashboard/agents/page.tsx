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
  endTime?: string;
  duration?: number;
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
    <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || "bg-gray-400"} ${status === "running" ? "animate-pulse" : ""}`} />
  );
}

function ProgressBar({ progress, status }: { progress?: number; status: string }) {
  const pct = progress || 0;
  const barColors: Record<string, string> = {
    running: "from-green-500 to-emerald-400",
    idle: "from-yellow-500 to-amber-400",
    error: "from-red-500 to-rose-400",
    paused: "from-gray-500 to-gray-400",
    completed: "from-blue-500 to-cyan-400",
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

function ModelBadge({ model }: { model: string }) {
  const colors: Record<string, string> = {
    "Kimi K2.6": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Kimi K2.7-Code": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "GLM 5.2": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "GLM 5.1": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  const color = colors[model] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>
      {model}
    </span>
  );
}

export default function AgentsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "history">("active");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/agents");
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      // Retry on next interval
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Agent Fleet</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#1e1e3a] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { agents, history, stats } = data;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🤖 Agent Fleet</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Live activity tracking • Real-time status • Human-readable updates
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#16162a] rounded-xl border border-[#252542] p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.agentsOnline}</div>
          <div className="text-xs text-gray-400 mt-1">Online</div>
        </div>
        <div className="bg-[#16162a] rounded-xl border border-[#252542] p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.activeAgents}</div>
          <div className="text-xs text-gray-400 mt-1">Active</div>
        </div>
        <div className="bg-[#16162a] rounded-xl border border-[#252542] p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.idleAgents}</div>
          <div className="text-xs text-gray-400 mt-1">Idle</div>
        </div>
        <div className="bg-[#16162a] rounded-xl border border-[#252542] p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.completedToday}</div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
        {Object.entries(stats.modelUsage).map(([model, count]) => (
          <div key={model} className="bg-[#16162a] rounded-xl border border-[#252542] p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{count}</div>
            <div className="text-xs text-gray-400 mt-1 truncate">{model}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "active"
              ? "bg-[#252542] text-white"
              : "text-gray-400 hover:text-white hover:bg-[#1e1e3a]"
          }`}
        >
          🟢 Active ({agents.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "history"
              ? "bg-[#252542] text-white"
              : "text-gray-400 hover:text-white hover:bg-[#1e1e3a]"
          }`}
        >
          ✅ History ({history.length})
        </button>
        <div className="ml-auto flex items-center text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Live • {lastUpdated}
        </div>
      </div>

      {/* Active Agents */}
      {tab === "active" && (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden transition-all duration-300 hover:border-[#3a3a5a] ${
                agent.status === "running" ? "ring-1 ring-green-500/20" : ""
              }`}
            >
              {/* Card Header */}
              <div
                className="bg-[#1e1e3a] px-4 sm:px-5 py-4 border-b border-[#252542] cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent.agentEmoji}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{agent.agent}</span>
                      <StatusDot status={agent.status} />
                      <ModelBadge model={agent.model} />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {agent.durationDisplay} • {agent.taskType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedAgent === agent.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5">
                {/* Task */}
                <div className="mb-3">
                  <div className="text-base font-medium text-white mb-2">{agent.task}</div>
                </div>

                {/* Narrative */}
                <div className="text-sm text-gray-300 leading-relaxed mb-4 bg-[#1e1e3a] rounded-lg p-3 italic">
                  &ldquo;{agent.narrative}&rdquo;
                </div>

                {/* Progress Bar for Running Agents */}
                {agent.status === "running" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>Progress</span>
                      <span className="font-mono">{agent.progress || 0}%</span>
                    </div>
                    <ProgressBar progress={agent.progress} status={agent.status} />
                  </div>
                )}

                {/* Latest Update */}
                {agent.latestUpdate && (
                  <div className="flex items-start gap-2 text-sm text-gray-400 bg-[#1e1e3a] rounded-lg p-3 mb-3">
                    <span className="text-blue-400">↳</span>
                    <span>{agent.latestUpdate}</span>
                  </div>
                )}
              </div>

              {/* Expanded Timeline */}
              {expandedAgent === agent.id && agent.updates && agent.updates.length > 0 && (
                <div className="px-4 sm:px-5 pb-5 border-t border-[#252542] pt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Activity Timeline
                  </div>
                  <div className="relative pl-4 border-l-2 border-[#252542] space-y-3">
                    {agent.updates.slice().reverse().map((update, idx) => {
                      const time = new Date(update.timestamp);
                      const timeStr = time.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-[#3a3a5a] border-2 border-[#1e1e3a]" />
                          <div className="flex items-start gap-3 text-sm">
                            <span className="text-gray-500 font-mono min-w-[65px]">{timeStr}</span>
                            <span className="text-gray-300">{update.message}</span>
                            {update.progress !== undefined && (
                              <span className="text-green-400 ml-auto font-mono text-xs">{update.progress}%</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {agents.length === 0 && (
            <div className="bg-[#16162a] rounded-xl border border-[#252542] p-8 text-center text-gray-400">
              <span className="text-3xl block mb-2">😴</span>
              No agents online right now. They&apos;ll be back.
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="space-y-3">
          {history.map((task) => (
            <div
              key={task.id}
              className="bg-[#16162a] rounded-xl border border-[#252542] p-4 hover:border-[#3a3a5a] transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{task.agentEmoji}</span>
                  <div>
                    <div className="font-medium text-white text-sm">{task.agent}</div>
                    <div className="text-xs text-gray-400">{task.task}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ModelBadge model={task.model} />
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    ✅ Done
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {task.durationDisplay}
                  </span>
                </div>
              </div>
              {task.narrative && (
                <div className="mt-2 text-sm text-gray-400 italic">
                  {task.narrative}
                </div>
              )}
            </div>
          ))}

          {history.length === 0 && (
            <div className="bg-[#16162a] rounded-xl border border-[#252542] p-8 text-center text-gray-400">
              <span className="text-3xl block mb-2">📋</span>
              No completed tasks yet today. Agents are still working.
            </div>
          )}
        </div>
      )}

      {/* Model Usage */}
      <div className="mt-8 bg-[#16162a] rounded-xl border border-[#252542] p-5">
        <h3 className="text-white font-semibold mb-4">Model Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(stats.modelUsage).map(([model, count]) => {
            const totalAgents = Object.values(stats.modelUsage).reduce((a, b) => a + b, 0);
            const pct = totalAgents > 0 ? Math.round((count / totalAgents) * 100) : 0;
            return (
              <div key={model} className="bg-[#1e1e3a] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">{model}</span>
                  <span className="text-xs text-gray-400">{count} agent{count !== 1 ? "s" : ""}</span>
                </div>
                <div className="w-full h-1.5 bg-[#252542] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{pct}% of fleet</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}