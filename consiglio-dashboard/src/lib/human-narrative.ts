// Human Narrative Generator — Turns raw activity data into human-style updates

import { AgentActivity } from "./activity-tracker";

export interface NarrativeStyle {
  tone: "casual" | "professional" | "animated";
  perspective: "first-person" | "third-person";
  verbosity: "brief" | "normal" | "detailed";
}

const DEFAULT_STYLE: NarrativeStyle = {
  tone: "casual",
  perspective: "third-person",
  verbosity: "normal",
};

// Agent personality templates
const AGENT_PERSONALITIES: Record<string, {
  catchphrase: string;
  workStyle: string;
  personality: string;
}> = {
  "BotFather": {
    catchphrase: "Bada bing, bada boom.",
    workStyle: "orchestrating everything and keeping the family in line",
    personality: "running the show like he always does",
  },
  "Dapper Dan": {
    catchphrase: "Clean build, no errors.",
    workStyle: "writing clean code and shipping fast",
    personality: "grinding through the implementation",
  },
  "Breaking Ben": {
    catchphrase: "Found it. Patched it.",
    workStyle: "breaking things on purpose to make them stronger",
    personality: "tearing through edge cases like a machine",
  },
  "Codex Developer": {
    catchphrase: "Architecture looks solid.",
    workStyle: "deep-diving into architecture and complex systems",
    personality: "heads-down in the deep end of the codebase",
  },
  "Chief of Staff": {
    catchphrase: "Everything's on track.",
    workStyle: "coordinating between agents and keeping things moving",
    personality: "making sure nothing falls through the cracks",
  },
};

// Task type labels with personality
const TASK_TYPE_LABELS: Record<string, string> = {
  orchestration: "orchestration",
  development: "coding",
  research: "research",
  security: "security work",
  coordination: "coordination",
  testing: "testing",
  deployment: "deployment",
};

export function generateHumanNarrative(
  activity: AgentActivity,
  style: NarrativeStyle = DEFAULT_STYLE
): string {
  const duration = getDurationMinutes(activity.startTime);
  const personality = AGENT_PERSONALITIES[activity.agent];
  const taskLabel = TASK_TYPE_LABELS[activity.taskType] || activity.taskType;

  switch (activity.status) {
    case "running":
      return generateRunningNarrative(activity, duration, personality, taskLabel, style);
    case "idle":
      return generateIdleNarrative(activity, personality);
    case "error":
      return generateErrorNarrative(activity, duration, personality, taskLabel);
    case "completed":
      return generateCompletedNarrative(activity, personality);
    case "paused":
      return generatePausedNarrative(activity, duration, personality);
    default:
      return `${activity.agent} is working on ${activity.task.toLowerCase()}.`;
  }
}

function generateRunningNarrative(
  activity: AgentActivity,
  duration: number,
  personality: typeof AGENT_PERSONALITIES[string] | undefined,
  taskLabel: string,
  style: NarrativeStyle
): string {
  const name = activity.agent;
  const task = activity.task.toLowerCase();
  const progress = activity.progress || 0;

  // Get the latest update message for context
  const latestUpdate = activity.updates?.[activity.updates.length - 1]?.message || "";

  if (duration < 5) {
    return style.verbosity === "brief"
      ? `${name} just started ${taskLabel}.`
      : `${name} just kicked off ${task}. Fresh out the gate — give 'em a minute to get going.`;
  }

  if (duration < 30) {
    return style.verbosity === "brief"
      ? `${name} is working on ${taskLabel} (${duration}m in).`
      : `${name}'s been at ${task} for about ${duration} minutes now. Still getting warmed up, but making moves.`;
  }

  const timeStr = formatDuration(duration);

  if (progress > 90) {
    return `${name}'s almost done with ${task}. ${timeStr} in and wrapping things up. ${personality?.catchphrase || "Almost there."}`;
  }

  if (progress > 70) {
    return `${name}'s been grinding on ${task} for ${timeStr} now. The hard part's done — just finishing up. ${latestUpdate ? latestUpdate + "." : ""}`;
  }

  if (progress > 40) {
    return `${name}'s deep in ${task}. ${timeStr} in and making real progress. ${personality?.personality || "Getting it done."} ${latestUpdate ? latestUpdate + "." : ""}`;
  }

  return `${name}'s working on ${task}. ${timeStr} in, still ${personality?.workStyle || "plugging away"}. ${latestUpdate ? latestUpdate + "." : "Making progress."}`;
}

function generateIdleNarrative(
  activity: AgentActivity,
  personality: typeof AGENT_PERSONALITIES[string] | undefined
): string {
  const name = activity.agent;
  return `${name}'s on standby. ${personality?.catchphrase || "Ready when needed."} Standing by for the next assignment.`;
}

function generateErrorNarrative(
  activity: AgentActivity,
  duration: number,
  personality: typeof AGENT_PERSONALITIES[string] | undefined,
  taskLabel: string
): string {
  const name = activity.agent;
  return `${name} hit a snag during ${taskLabel}. Been about ${formatDuration(duration)} — they're troubleshooting now. Nothing ${name} can't handle.`;
}

function generateCompletedNarrative(
  activity: AgentActivity,
  personality: typeof AGENT_PERSONALITIES[string] | undefined
): string {
  const name = activity.agent;
  const task = activity.task.toLowerCase();
  const duration = activity.duration
    ? `in ${formatDuration(activity.duration)}`
    : "";
  return `${name} wrapped up ${task} ${duration}. ${personality?.catchphrase || "Done."} Clean finish.`;
}

function generatePausedNarrative(
  activity: AgentActivity,
  duration: number,
  personality: typeof AGENT_PERSONALITIES[string] | undefined
): string {
  const name = activity.agent;
  return `${name} paused after ${formatDuration(duration)}. Probably waiting on something. They'll pick back up when the green light comes.`;
}

export function generateStatusEmoji(status: AgentActivity["status"]): string {
  switch (status) {
    case "running":
      return "🟢";
    case "idle":
      return "🟡";
    case "error":
      return "🔴";
    case "completed":
      return "✅";
    case "paused":
      return "⏸️";
    default:
      return "⚪";
  }
}

export function generateStatusLabel(status: AgentActivity["status"]): string {
  switch (status) {
    case "running":
      return "Active";
    case "idle":
      return "Standing By";
    case "error":
      return "Error";
    case "completed":
      return "Completed";
    case "paused":
      return "Paused";
    default:
      return "Unknown";
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

function getDurationMinutes(startTime: string): number {
  const startMs = new Date(startTime).getTime();
  const nowMs = Date.now();
  return Math.max(1, Math.round((nowMs - startMs) / 60000));
}

export function generateActivityFeed(activities: AgentActivity[]): string[] {
  return activities
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10)
    .map((activity) => {
      const emoji = generateStatusEmoji(activity.status);
      const timeAgo = formatDuration(
        Math.round((Date.now() - new Date(activity.startTime).getTime()) / 60000)
      );
      return `${emoji} ${activity.agent} — ${activity.task} (${timeAgo} ago)`;
    });
}