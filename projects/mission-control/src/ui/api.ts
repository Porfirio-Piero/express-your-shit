import type {
  GraphResponse,
  HeartbeatResponse,
  OrgResponse,
  RegistryResponse,
  SitdownResponse,
  SitdownSession,
  SitdownContribution,
  TaskMasterData,
  WorkspacesResponse,
  WorkspaceFilesResponse,
  WorkspaceReadResponse,
  GatewayStatus,
  AgentRun,
  HeartbeatSchedule,
  CronJob,
  ModelUsageRecord,
  ActivityEvent,
  LedgerResponse,
  MCPControlPlaneResponse,
  MCPEntry,
  MCPRegistry,
  RoutingRule,
  UsageSummaryResponse,
} from './types'

async function readJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`${options?.method || 'GET'} ${url} failed: ${res.status}`)
  return res.json()
}

export async function fetchTaskMaster(signal?: AbortSignal): Promise<TaskMasterData & { source?: string }> {
  return readJson('/api/taskmaster', { signal })
}

export async function fetchRegistry(signal?: AbortSignal): Promise<RegistryResponse> {
  return readJson('/api/registry', { signal })
}

export async function fetchOrg(signal?: AbortSignal): Promise<OrgResponse> {
  return readJson('/api/org', { signal })
}

export async function rebuildOrg(): Promise<{ ok: boolean }> {
  return readJson('/api/org/rebuild', { method: 'POST' })
}

export async function fetchTasks(signal?: AbortSignal): Promise<{ ok: boolean; source?: string; tasks: TaskMasterData['tasks'] }> {
  return readJson('/api/tasks', { signal })
}

export async function updateTask(taskId: string, patch: Record<string, unknown>, actorId = 'botfather'): Promise<{ ok: boolean }> {
  return readJson('/api/tasks/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, patch, actorId }),
  })
}

export async function syncTaskMetadata(taskId: string, actorId = 'botfather'): Promise<{ ok: boolean; task?: Record<string, unknown>; error?: string }> {
  return readJson('/api/tasks/sync-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, actorId }),
  })
}

export async function deleteTask(taskId: string, actorId = 'botfather'): Promise<{ ok: boolean }> {
  return readJson('/api/tasks/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, actorId }),
  })
}

export async function dontDoTask(taskId: string, reason: string, actorId = 'botfather'): Promise<{ ok: boolean }> {
  return readJson('/api/tasks/dont-do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, reason, actorId }),
  })
}

export async function createTask(payload: {
  title: string
  status?: string
  priority?: string
  ownerAgent?: string
  description?: string
  dueDate?: string
  approvalState?: string
  blockerText?: string
  flowStage?: string
  tags?: string[]
  notes?: string
  actorId?: string
}): Promise<{ ok: boolean; task?: Record<string, unknown> }> {
  return readJson('/api/tasks/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function importTasks(): Promise<{ ok: boolean; imported: number }> {
  return readJson('/api/tasks/import', { method: 'POST' })
}

export async function fetchWorkspaces(signal?: AbortSignal): Promise<WorkspacesResponse> {
  return readJson('/api/workspaces', { signal })
}

export async function fetchWorkspaceFiles(id: string, signal?: AbortSignal): Promise<WorkspaceFilesResponse> {
  return readJson(`/api/workspaces/${encodeURIComponent(id)}/files`, { signal })
}

export async function readWorkspaceFile(id: string, file: string, signal?: AbortSignal): Promise<WorkspaceReadResponse> {
  return readJson(`/api/workspaces/${encodeURIComponent(id)}/read?file=${encodeURIComponent(file)}`, { signal })
}

export async function fetchDailyReport(id: string, signal?: AbortSignal): Promise<{ ok: boolean; report: Record<string, unknown> | null; path?: string }> {
  return readJson(`/api/reports/daily/${encodeURIComponent(id)}`, { signal })
}

export async function writeWorkspaceFile(id: string, file: string, content: string, actorId = 'botfather', approved = false): Promise<{ ok: boolean; updatedAt?: string; path?: string }> {
  return readJson(`/api/workspaces/${encodeURIComponent(id)}/write`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file, content, actorId, approved }),
  })
}

export async function fetchGraph(signal?: AbortSignal): Promise<GraphResponse> {
  return readJson('/api/graph', { signal })
}

export async function rebuildGraph(): Promise<GraphResponse> {
  return readJson('/api/graph/rebuild', { method: 'POST' })
}

export async function fetchHeartbeatState(signal?: AbortSignal): Promise<HeartbeatResponse> {
  return readJson('/api/heartbeat/state', { signal })
}

export async function runHeartbeat(): Promise<HeartbeatResponse> {
  return readJson('/api/heartbeat/run', { method: 'POST' })
}

export async function fetchAuditLog(signal?: AbortSignal): Promise<string> {
  const res = await fetch('/api/logs/audit', { signal })
  if (!res.ok) throw new Error(`GET /api/logs/audit failed: ${res.status}`)
  return res.text()
}

export async function fetchBotfatherLog(signal?: AbortSignal): Promise<string> {
  const res = await fetch('/api/logs/botfather', { signal })
  if (!res.ok) throw new Error(`GET /api/logs/botfather failed: ${res.status}`)
  return res.text()
}

export async function fetchLedgerEvents(params: {
  limit?: number
  cursor?: number
  search?: string
  eventType?: string
  agent?: string
  task?: string
  severity?: string
  range?: string
  category?: string
}, signal?: AbortSignal): Promise<LedgerResponse> {
  const qp = new URLSearchParams()
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && String(v).length) qp.set(k, String(v))
  }
  return readJson(`/api/logs/ledger?${qp.toString()}`, { signal })
}

export async function fetchUsageSummary(range = '7d', signal?: AbortSignal): Promise<UsageSummaryResponse> {
  return readJson(`/api/logs/usage-summary?range=${encodeURIComponent(range)}`, { signal })
}

export async function logEvent(payload: {
  type: string
  severity?: string
  actor?: string
  actor_type?: string
  target_type?: string
  target_id?: string
  task_id?: string | null
  run_id?: string | null
  gateway_id?: string | null
  summary?: string
  duration?: number | null
  metadata?: Record<string, unknown>
}): Promise<{ ok: boolean; event: ActivityEvent }> {
  return readJson('/api/logs/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function spawnAgent(agentId: string, crew: string): Promise<{ ok: boolean; workspace?: string }> {
  return readJson('/api/spawn-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, crew, actorId: 'botfather' }),
  })
}

export async function spawnSubAgentBrief(agentId: string, task: string): Promise<{ ok: boolean; brief?: string }> {
  return readJson('/api/subagents/spawn-brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, task }),
  })
}

export async function retireAgent(agentId: string): Promise<{ ok: boolean }> {
  return readJson('/api/retire-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, actorId: 'botfather' }),
  })
}

export async function fetchSitdown(signal?: AbortSignal): Promise<SitdownResponse> {
  return readJson('/api/sitdown', { signal })
}

export async function fetchSitdownSessions(signal?: AbortSignal): Promise<{ ok: boolean; sessions: string[] }> {
  return readJson('/api/sitdown/sessions', { signal })
}

export async function fetchSitdownSession(date?: string, signal?: AbortSignal): Promise<{ ok: boolean; session: SitdownSession }> {
  const qp = date ? `?date=${encodeURIComponent(date)}` : ''
  return readJson(`/api/sitdown/session${qp}`, { signal })
}

export async function runSitdown(date?: string, actor = 'operator'): Promise<{ ok: boolean; session: SitdownSession }> {
  return readJson('/api/sitdown/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, actor }),
  })
}

export async function postSitdownContribution(date: string, agentId: string, contribution: SitdownContribution): Promise<{ ok: boolean; session: SitdownSession }> {
  return readJson('/api/sitdown/contribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, agentId, contribution }),
  })
}

export async function postSitdownComment(date: string, agentId: string, actor: string, text: string): Promise<{ ok: boolean; session: SitdownSession }> {
  return readJson('/api/sitdown/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, agentId, actor, text }),
  })
}

export async function excludeSitdownParticipant(date: string, agentId: string, excluded: boolean, actor = 'operator'): Promise<{ ok: boolean; session: SitdownSession }> {
  return readJson('/api/sitdown/exclude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, agentId, excluded, actor }),
  })
}

export async function forceSitdownAgentUpdate(date: string, agentId: string): Promise<{ ok: boolean; session: SitdownSession }> {
  return readJson('/api/sitdown/agent-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, agentId }),
  })
}

export async function generateSitdownSummary(date: string, actor = 'the-botfather'): Promise<{ ok: boolean; session: SitdownSession }> {
  return readJson('/api/sitdown/summary/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, actor }),
  })
}

export async function publishSitdownSummary(date: string, actor = 'the-botfather'): Promise<{ ok: boolean }> {
  return readJson('/api/sitdown/publish-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, actor }),
  })
}

export async function convertSitdownToActionPlan(date: string, actor = 'the-botfather'): Promise<{ ok: boolean; created: Array<Record<string, unknown>> }> {
  return readJson('/api/sitdown/convert-action-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, actor }),
  })
}

export async function fetchMcpRegistry(signal?: AbortSignal): Promise<{ ok: boolean; source?: string; registry: MCPRegistry }> {
  return readJson('/api/mcp/registry', { signal })
}

export async function saveMcpRegistry(registry: MCPRegistry, actorId = 'botfather'): Promise<{ ok: boolean }> {
  return readJson('/api/mcp/registry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registry, actorId }),
  })
}

export async function fetchMcpAudit(signal?: AbortSignal): Promise<{ ok: boolean; items: Record<string, unknown>[] }> {
  return readJson('/api/mcp/audit', { signal })
}

export async function fetchMcpControlPlane(range = '24h', signal?: AbortSignal): Promise<MCPControlPlaneResponse> {
  return readJson(`/api/mcp/control-plane?range=${encodeURIComponent(range)}`, { signal })
}

export async function validateMcpRegistry(): Promise<{ ok: boolean; validation: { ok: boolean; errors: string[]; warnings: string[]; status: string } }> {
  return readJson('/api/mcp/validate', { method: 'POST' })
}

export async function updateMcpEntry(mcpId: string, patch: Partial<MCPEntry>, actor = 'operator'): Promise<{ ok: boolean; entry: MCPEntry }> {
  return readJson('/api/mcp/entry/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mcpId, patch, actor }),
  })
}

export async function bulkMcpAction(ids: string[], action: 'enable' | 'disable', actor = 'operator'): Promise<{ ok: boolean; changed: number }> {
  return readJson('/api/mcp/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, action, actor }),
  })
}

export async function importMcp(entry: Partial<MCPEntry>, actor = 'operator'): Promise<{ ok: boolean; entry: MCPEntry }> {
  return readJson('/api/mcp/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entry, actor }),
  })
}

export async function updateMcpRouting(mcpId: string, rules: RoutingRule[], actor = 'operator'): Promise<{ ok: boolean }> {
  return readJson('/api/mcp/routing/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mcpId, rules, actor }),
  })
}

export async function syncMcpToAgents(actor = 'operator'): Promise<{ ok: boolean; changed: Array<{ agentId: string; file: string }> }> {
  return readJson('/api/mcp/sync-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor }),
  })
}

export async function requestMcpApproval(payload: { mcpId: string; taskId: string; actor: string; actionType: string; scope?: Record<string, unknown> }): Promise<{ ok: boolean; approval: Record<string, unknown> }> {
  return readJson('/api/mcp/approval/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function decideMcpApproval(id: string, decision: 'approve' | 'deny', actor = 'operator'): Promise<{ ok: boolean; item: Record<string, unknown> }> {
  return readJson('/api/mcp/approval/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, decision, actor }),
  })
}

export async function testMcp(payload: { mcpId: string; agentId: string; actionType: string; taskId?: string; actor?: string }): Promise<{ ok: boolean; blocked?: boolean; reason?: string; result?: string }> {
  return readJson('/api/mcp/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function fetchBrainState(signal?: AbortSignal): Promise<{ ok: boolean; markdown: string; json: Record<string, unknown> }> {
  return readJson('/api/brain/state', { signal })
}

export async function requestBrainUpdate(actorId: string, reason: string): Promise<{ ok: boolean; request: Record<string, unknown> }> {
  return readJson('/api/brain/request-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actorId, reason }),
  })
}

export async function fetchOperationsOverview(signal?: AbortSignal): Promise<{
  ok: boolean
  environment: string
  runtime?: {
    pausedNewRuns?: boolean
    lastHealthCheckAt?: string | null
    processes?: Record<string, { status: string; lastActionAt: string | null; lastAction: string }>
  }
  gateways: GatewayStatus[]
  runningAgents: AgentRun[]
  heartbeats: HeartbeatSchedule[]
  cronJobs: CronJob[]
  usage: { byAgent: ModelUsageRecord[]; byModel: ModelUsageRecord[] }
  kpis: Record<string, number>
  activityFeed: ActivityEvent[]
}> {
  return readJson('/api/operations/overview', { signal })
}

export async function runOperationsAction(action: string, actor = 'operator', metadata?: Record<string, unknown>): Promise<{ ok: boolean; result: Record<string, unknown> }> {
  return readJson('/api/operations/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, actor, metadata }),
  })
}

export async function updateHeartbeatSchedule(agentId: string, schedule: string, enabled: boolean): Promise<{ ok: boolean }> {
  return readJson('/api/operations/heartbeat/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId, schedule, enabled }),
  })
}

export async function fetchCronRegistry(signal?: AbortSignal): Promise<{ ok: boolean; registry: { jobs: CronJob[] } }> {
  return readJson('/api/operations/cron-registry', { signal })
}

export async function saveCronRegistry(registry: { jobs: CronJob[] }, actor = 'operator'): Promise<{ ok: boolean }> {
  return readJson('/api/operations/cron-registry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registry, actor }),
  })
}

export async function runCronJob(jobId: string, actor = 'operator'): Promise<{ ok: boolean }> {
  return readJson('/api/operations/cron/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, actor }),
  })
}
