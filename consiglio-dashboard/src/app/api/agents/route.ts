import { NextResponse } from "next/server";
import { getActivityLog, getAgentStats } from "@/lib/activity-tracker";
import { generateHumanNarrative, generateStatusEmoji, generateStatusLabel, formatDuration } from "@/lib/human-narrative";

export async function GET() {
  try {
    const log = getActivityLog();
    const stats = getAgentStats();

    // Enrich each agent with human narrative and display data
    const agents = Object.entries(log.agents).map(([id, activity]) => {
      const durationMs = Date.now() - new Date(activity.startTime).getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      return {
        id,
        agent: activity.agent,
        agentEmoji: activity.agentEmoji,
        model: activity.model,
        task: activity.task,
        taskType: activity.taskType,
        status: activity.status,
        startTime: activity.startTime,
        endTime: activity.endTime,
        duration: activity.duration,
        progress: activity.progress,
        narrative: activity.narrative || generateHumanNarrative(activity),
        statusEmoji: generateStatusEmoji(activity.status),
        statusLabel: generateStatusLabel(activity.status),
        durationDisplay: formatDuration(durationMinutes),
        durationMinutes,
        latestUpdate: activity.updates?.[activity.updates.length - 1]?.message || null,
        updates: activity.updates,
      };
    });

    // Sort: running first, then idle, then error
    const statusOrder = { running: 0, idle: 1, paused: 2, error: 3, completed: 4 };
    agents.sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));

    // Enrich history
    const history = log.history.slice(0, 20).map((activity) => ({
      ...activity,
      narrative: activity.narrative || generateHumanNarrative(activity),
      statusEmoji: generateStatusEmoji(activity.status),
      statusLabel: generateStatusLabel(activity.status),
      durationDisplay: activity.duration
        ? formatDuration(activity.duration)
        : "—",
    }));

    return NextResponse.json({
      success: true,
      lastUpdated: log.lastUpdated,
      timestamp: new Date().toISOString(),
      stats: {
        ...stats,
        agentsOnline: stats.activeAgents + stats.idleAgents,
      },
      agents,
      history,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch agent data" },
      { status: 500 }
    );
  }
}

// Allow periodic refresh of activity data
export const dynamic = "force-dynamic";