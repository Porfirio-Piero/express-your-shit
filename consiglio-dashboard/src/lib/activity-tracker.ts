// Activity Tracker — JSON-based agent activity logging system

export interface AgentActivity {
  id: string;
  agent: string;
  agentEmoji: string;
  model: string;
  task: string;
  taskType: string;
  status: "running" | "idle" | "error" | "completed" | "paused";
  startTime: string;
  endTime?: string;
  duration?: number; // minutes
  progress?: number; // 0-100
  narrative?: string;
  updates?: ActivityUpdate[];
}

export interface ActivityUpdate {
  timestamp: string;
  message: string;
  progress?: number;
}

export interface ActivityLog {
  lastUpdated: string;
  agents: Record<string, AgentActivity>;
  history: AgentActivity[];
}

const DEFAULT_LOG: ActivityLog = {
  lastUpdated: new Date().toISOString(),
  agents: {
    "botfather": {
      id: "botfather-active",
      agent: "BotFather",
      agentEmoji: "🤖",
      model: "Kimi K2.6",
      task: "Managing Consiglio dashboard deployment and handling user requests",
      taskType: "orchestration",
      status: "running",
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      progress: 85,
      narrative: "BotFather's been running the show all morning. Deployed the dashboard, fielding requests, keeping the family in line. Classic BotFather — never stops.",
      updates: [
        { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), message: "Session started, reviewing overnight activity", progress: 10 },
        { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), message: "Deployed Consiglio dashboard to Vercel", progress: 40 },
        { timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), message: "Processing user requests and agent coordination", progress: 70 },
        { timestamp: new Date().toISOString(), message: "Building live agent tracker feature", progress: 85 },
      ],
    },
    "dapper-dan": {
      id: "dapper-dan-active",
      agent: "Dapper Dan",
      agentEmoji: "💼",
      model: "Kimi K2.7-Code",
      task: "LM Studio setup and cloud connection configuration",
      taskType: "development",
      status: "running",
      startTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
      progress: 72,
      narrative: "Dapper Dan's been grinding on the LM Studio setup for about 3 and a half hours now. He figured out the cloud connection — that was the tricky part. Wrapping up the config now, should be done soon.",
      updates: [
        { timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), message: "Starting LM Studio environment setup", progress: 5 },
        { timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), message: "Working through Docker configuration", progress: 25 },
        { timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), message: "Cloud connection breakthrough — got it working", progress: 55 },
        { timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), message: "Finalizing cloud config, testing endpoints", progress: 72 },
      ],
    },
    "codex-developer": {
      id: "codex-developer-active",
      agent: "Codex Developer",
      agentEmoji: "🔧",
      model: "GLM 5.2",
      task: "Model intelligence deep dive — benchmarking and architecture review",
      taskType: "research",
      status: "running",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      progress: 60,
      narrative: "Codex Developer is deep in the weeds on the model intelligence review. About 2 hours in — he's benchmarking the GLM 5.2 and Kimi K2.7-Code configs, comparing context windows and tool use patterns. Real architecture-brain work.",
      updates: [
        { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), message: "Starting model intelligence analysis", progress: 10 },
        { timestamp: new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString(), message: "Benchmarking GLM 5.2 context handling", progress: 35 },
        { timestamp: new Date(Date.now() - 0.4 * 60 * 60 * 1000).toISOString(), message: "Analyzing K2.7-Code tool use patterns", progress: 60 },
      ],
    },
    "breaking-ben": {
      id: "breaking-ben-idle",
      agent: "Breaking Ben",
      agentEmoji: "🔨",
      model: "GLM 5.2",
      task: "Standing by for security audit",
      taskType: "security",
      status: "idle",
      startTime: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      narrative: "Breaking Ben's on standby. He wrapped up the last security sweep about 30 minutes ago and he's ready for the next audit. You know Ben — always ready to break things.",
      updates: [
        { timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), message: "Completed security sweep, standing by", progress: 0 },
      ],
    },
    "chief-of-staff": {
      id: "chief-of-staff-active",
      agent: "Chief of Staff",
      agentEmoji: "📋",
      model: "Kimi K2.7-Code",
      task: "Coordinating multi-agent pipeline and status reporting",
      taskType: "coordination",
      status: "running",
      startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      progress: 50,
      narrative: "Chief of Staff has been orchestrating the agent pipeline for about an hour and a half. Keeping tabs on Dapper Dan's LM Studio work, routing tasks between agents, making sure nothing falls through the cracks.",
      updates: [
        { timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), message: "Initiating multi-agent coordination", progress: 15 },
        { timestamp: new Date(Date.now() - 0.7 * 60 * 60 * 1000).toISOString(), message: "Pipeline running smoothly, all agents reporting", progress: 50 },
      ],
    },
  },
  history: [
    {
      id: "dapper-dan-consiglio-deploy",
      agent: "Dapper Dan",
      agentEmoji: "💼",
      model: "Kimi K2.7-Code",
      task: "Deployed Consiglio Dashboard v1 to Vercel",
      taskType: "development",
      status: "completed",
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      progress: 100,
      narrative: "Dapper Dan knocked out the initial dashboard deployment in about an hour. Clean build, no errors. That's how he does it.",
    },
    {
      id: "breaking-ben-security-audit-v1",
      agent: "Breaking Ben",
      agentEmoji: "🔨",
      model: "GLM 5.2",
      task: "Security audit of Consiglio Dashboard auth flow",
      taskType: "security",
      status: "completed",
      startTime: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      progress: 100,
      narrative: "Breaking Ben spent 2 hours tearing apart the auth flow. Found 3 minor issues, all patched. He's thorough — that's why we keep him around.",
    },
  ],
};

// In-memory store (would be file-based in production)
let activityLog: ActivityLog = { ...DEFAULT_LOG };

export function getActivityLog(): ActivityLog {
  return activityLog;
}

export function logAgentStart(
  agentId: string,
  agent: string,
  agentEmoji: string,
  model: string,
  task: string,
  taskType: string
): AgentActivity {
  const activity: AgentActivity = {
    id: `${agentId}-${Date.now()}`,
    agent,
    agentEmoji,
    model,
    task,
    taskType,
    status: "running",
    startTime: new Date().toISOString(),
    progress: 5,
    narrative: `${agent} just got started on ${task.toLowerCase()}. Fresh out the gate, let's see how this goes.`,
    updates: [
      {
        timestamp: new Date().toISOString(),
        message: `Starting: ${task}`,
        progress: 5,
      },
    ],
  };

  activityLog.agents[agentId] = activity;
  activityLog.lastUpdated = new Date().toISOString();
  return activity;
}

export function logAgentUpdate(
  agentId: string,
  message: string,
  progress?: number
): AgentActivity | null {
  const activity = activityLog.agents[agentId];
  if (!activity) return null;

  activity.updates = activity.updates || [];
  activity.updates.push({
    timestamp: new Date().toISOString(),
    message,
    progress,
  });

  if (progress !== undefined) {
    activity.progress = progress;
  }

  activity.narrative = generateNarrative(activity);
  activityLog.lastUpdated = new Date().toISOString();
  return activity;
}

export function logAgentComplete(agentId: string, narrative?: string): AgentActivity | null {
  const activity = activityLog.agents[agentId];
  if (!activity) return null;

  activity.status = "completed";
  activity.endTime = new Date().toISOString();
  activity.progress = 100;

  const startMs = new Date(activity.startTime).getTime();
  const endMs = new Date(activity.endTime).getTime();
  activity.duration = Math.round((endMs - startMs) / 60000);

  if (narrative) {
    activity.narrative = narrative;
  } else {
    activity.narrative = `${activity.agent} wrapped up ${activity.task.toLowerCase()} in ${activity.duration} minutes. Done and dusted.`;
  }

  // Move to history
  activityLog.history.unshift({ ...activity });
  delete activityLog.agents[agentId];
  activityLog.lastUpdated = new Date().toISOString();

  return activity;
}

function generateNarrative(activity: AgentActivity): string {
  const duration = getDurationMinutes(activity.startTime);
  const agentName = activity.agent;

  if (activity.status === "idle") {
    return `${agentName}'s on standby. Last task wrapped up, ready for the next one.`;
  }

  if (activity.status === "error") {
    return `${agentName} hit a snag on ${activity.task.toLowerCase()}. Looking into it — nothing a little troubleshooting can't fix.`;
  }

  if (duration < 5) {
    return `${agentName} just kicked off ${activity.task.toLowerCase()}. Give them a minute to get going.`;
  }

  if (duration < 30) {
    return `${agentName}'s been at ${activity.task.toLowerCase()} for about ${duration} minutes now. Still warming up.`;
  }

  if (duration < 120) {
    const mins = duration;
    const progressPercent = activity.progress || 0;
    if (progressPercent > 70) {
      return `${agentName}'s been grinding on ${activity.task.toLowerCase()} for ${mins} minutes. Almost there — wrapping things up now.`;
    }
    return `${agentName}'s deep in ${activity.task.toLowerCase()}. About ${mins} minutes in and making good progress.`;
  }

  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  const timeStr = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${agentName}'s been grinding on ${activity.task.toLowerCase()} for ${timeStr} now. Real heads-down work — the kind that gets results.`;
}

function getDurationMinutes(startTime: string): number {
  const startMs = new Date(startTime).getTime();
  const nowMs = Date.now();
  return Math.round((nowMs - startMs) / 60000);
}

export function getAgentStats(): {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  completedToday: number;
  modelUsage: Record<string, number>;
} {
  const agents = Object.values(activityLog.agents);
  const activeAgents = agents.filter((a) => a.status === "running").length;
  const idleAgents = agents.filter((a) => a.status === "idle").length;
  const errorAgents = agents.filter((a) => a.status === "error").length;

  const today = new Date().toISOString().split("T")[0];
  const completedToday = activityLog.history.filter(
    (a) => a.endTime && a.endTime.startsWith(today)
  ).length;

  const modelUsage: Record<string, number> = {};
  [...agents, ...activityLog.history].forEach((a) => {
    modelUsage[a.model] = (modelUsage[a.model] || 0) + 1;
  });

  return {
    totalAgents: agents.length,
    activeAgents,
    idleAgents,
    completedToday,
    modelUsage,
  };
}