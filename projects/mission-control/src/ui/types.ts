export type TaskMasterChecklistItem = {
  item: string
  done: boolean
}

export type TaskMasterTask = {
  id: string
  title?: string
  description?: string
  status?: string
  column?: string
  priority?: string
  createdAt?: string
  updatedAt?: string
  dueDate?: string
  approvalState?: string
  flowStage?: string
  blockerText?: string
  createdBy?: string
  tier?: string
  tags?: string[]
  location?: string
  notes?: string
  checklist?: TaskMasterChecklistItem[]
  ownerAgent?: string
  crew?: string
  blockers?: string
  repo?: string
  branch?: string
  branch_name?: string
  pr_url?: string
  pr_status?: string
  ci_status?: string
  preview_url?: string
  production_url?: string
  deployment_timestamp?: string
  qa_notes?: string
  security_notes?: string
  acceptance_criteria?: string
  evidence_links?: string[]
  subtasks?: string[]
  swarm_logs?: string[]
}

export type TaskMasterData = {
  project?: string
  lastUpdated?: string
  columns?: string[]
  tasks: TaskMasterTask[]
}

export type RegistryResponse = {
  ok: boolean
  source?: string
  registry?: Record<string, unknown>
}

export type Agent = {
  id: string
  workspace: string
  path: string
  role: string
  reportsTo: string
  crew: string
  heartbeatUpdatedAt: string | null
  status: string
  blockers?: number
  missed?: boolean
  directReports?: string[]
  persona?: {
    nickname?: string
    voice?: string
    tells?: string
    do_not_overdo?: boolean
  }
  primaryStrengths?: string[]
  mcpAccessProfile?: string
  snippets: {
    skill?: string
    memory?: string
    soul?: string
  }
}

export type OrgResponse = {
  ok: boolean
  agents: Agent[]
  org: {
    roots: string[]
    edges: Array<{ from: string; to: string; type: string }>
  }
}

export type WorkspaceFile = {
  name: string
  path: string
  exists: boolean
  updatedAt: string | null
}

export type WorkspacesResponse = {
  ok: boolean
  root: string
  workspaces: string[]
}

export type WorkspaceFilesResponse = {
  ok: boolean
  workspace: string
  path: string
  files: WorkspaceFile[]
}

export type WorkspaceReadResponse = {
  ok: boolean
  workspace: string
  file: string
  path: string
  content: string
  updatedAt: string | null
}

export type GraphResponse = {
  ok: boolean
  graph: {
    version?: string
    generatedAt?: string
    nodes?: Array<Record<string, unknown>>
    edges?: Array<Record<string, unknown>>
  }
}

export type HeartbeatState = {
  runId?: string
  reason?: string
  detections?: string[]
  actions?: Array<Record<string, unknown>>
  result?: string
  at?: string
  lastRunAt?: string | null
}

export type HeartbeatResponse = {
  ok: boolean
  state: HeartbeatState
  source?: string
}

export type SitdownComment = {
  id: string
  actor: string
  text: string
  mentions: string[]
  timestamp: string
}

export type SitdownContribution = {
  agentId: string
  role: string
  model: string
  workedOn: string[]
  next: string[]
  blockers: Array<{ text: string; severity: 'low' | 'med' | 'high' | string; taskId?: string; escalateTo?: string }>
  approvalRequests: Array<{ type: string; text: string }>
  opportunities: string[]
  comments: SitdownComment[]
  postedAt?: string
}

export type SitdownParticipant = {
  agentId: string
  role: string
  status: 'Not Posted' | 'Posted' | 'Blocked' | 'Waiting Approval' | 'Excluded' | string
  activeTasks: number
  blockers: number
  waitingApproval: number
  mentioned: boolean
  excluded?: boolean
}

export type SitdownSummary = {
  topBlockers: string[]
  approvalsNeeded: string[]
  deploymentRisks: string[]
  securityFlags: string[]
  performanceConcerns: string[]
  suggestedPriorities: string[]
  suggestedEscalations: string[]
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Critical' | string
}

export type SitdownSession = {
  id: string
  date: string
  start_time: string | null
  end_time: string | null
  locked: boolean
  participants: SitdownParticipant[]
  contributions: SitdownContribution[]
  summary: SitdownSummary
}

export type SitdownResponse = {
  ok: boolean
  session: SitdownSession
}

export type GatewayStatus = {
  id: string
  name: string
  location: 'local' | 'remote' | 'vps' | string
  status: 'Connected' | 'Degraded' | 'Disconnected' | string
  latencyMs: number | null
  lastCheckAt: string | null
  models: string[]
  activeRuns: number
  lastError?: string
  metadata?: Record<string, unknown>
}

export type RuntimeProcessStatus = {
  name: string
  status: 'running' | 'stopped' | 'degraded' | string
  lastActionAt: string | null
  lastAction: string
}

export type AgentRun = {
  runId: string
  agentId: string
  role: string
  status: 'running' | 'blocked' | 'error' | string
  taskId: string
  taskTitle: string
  startedAt: string
  durationSec: number
  model: string
  tokens: number
  action: string
  subagents?: Array<{ id: string; status: string; action: string }>
}

export type HeartbeatSchedule = {
  agentId: string
  enabled: boolean
  schedule: string
  nextRun: string | null
  lastStatus: string
  lastRunAt: string | null
  fail24h: number
}

export type CronJob = {
  id: string
  name: string
  ownerAgent: string
  purpose: string
  schedule: string
  human: string
  enabled: boolean
  lastRunStatus: string
  lastRunTime: string | null
  nextRunTime: string | null
  fail24h: number
}

export type ModelUsageRecord = {
  model?: string
  agentId?: string
  tokens: number
  runs: number
  local?: number
  cloud?: number
  avgDurationSec?: number
  costEstimate?: number
}

export type ActivityEvent = {
  event_id: string
  timestamp: string
  type?: string
  actor_type?: 'agent' | 'human' | 'system' | string
  actor: string
  event_type: string
  target_type: string
  target_id: string
  run_id?: string | null
  task_id?: string | null
  gateway_id?: string | null
  summary: string
  severity: 'info' | 'warn' | 'error' | string
  duration?: number | null
  metadata?: Record<string, unknown>
}

export type LedgerResponse = {
  ok: boolean
  items: ActivityEvent[]
  total: number
  nextCursor: number | null
  filters: {
    agents: string[]
    tasks: string[]
    eventTypes: string[]
    severities: string[]
  }
}

export type UsageSummaryResponse = {
  ok: boolean
  byAgent: Array<{ agentId: string; tokens: number; runs: number; avgDurationSec: number }>
  byModel: Array<{ model: string; tokens: number; runs: number; avgDurationSec: number; local: number; cloud: number; costEstimate: number }>
  byDay: Array<{ date: string; tokens: number; local: number; cloud: number; costEstimate: number }>
}

export type ScopeConstraint = {
  paths: string[]
  repos: string[]
  domains: string[]
}

export type PermissionRule = {
  action: string
  allowed?: boolean
  paths_allowed?: string[]
  paths_not_allowed?: string[]
  note?: string
}

export type RoutingRule = {
  id?: string
  mcpId: string
  description: string
  when?: string
  scope?: 'global' | 'agent' | string
  agentId?: string
  requireApproval?: boolean
  updatedAt?: string
}

export type MCPEntry = {
  id: string
  name: string
  category: string
  type: string
  description: string
  risk: 'low' | 'medium' | 'high' | 'critical' | string
  enabled: boolean
  default_enabled: boolean
  owner: string
  approval_required: boolean
  approval_type: string
  allowed_agents: string[]
  denied_agents: string[]
  scope_constraints: ScopeConstraint
  rate_limit_per_hour: number
  tags: string[]
  last_updated: string
  usage?: {
    mcp_id: string
    calls24h: number
    failCount: number
    failPct: number
    avgLatencyMs: number
    p95LatencyMs: number
    lastUsed: string | null
    topAgents: Array<{ agent: string; count: number }>
    topTasks: Array<{ task: string; count: number }>
  }
  allowedAgentsCount?: number
}

export type MCPRegistry = {
  version: string
  updated_at?: string
  mcps: MCPEntry[]
  profiles: Array<Record<string, unknown>>
  approval_rules: PermissionRule[]
  routing_rules: RoutingRule[]
}

export type MCPApproval = {
  id: string
  mcpId: string
  requestor: string
  taskId: string
  actionType: string
  scope: Record<string, unknown>
  status: 'pending' | 'granted' | 'denied' | string
  requestedAt: string
  decidedBy?: string
  decidedAt?: string
}

export type MCPControlPlaneResponse = {
  ok: boolean
  source: string
  registry: MCPRegistry
  validation: { ok: boolean; errors: string[]; warnings: string[]; status: 'Valid' | 'Warnings' | 'Errors' | string }
  riskPosture: 'Safe' | 'Caution' | 'High exposure' | string
  approvals: MCPApproval[]
  pendingApprovals: MCPApproval[]
  brainState: {
    version: string
    lastRefresh: string
    loadedSources: string[]
    routingRuleCount: number
    overridesActive: number
    pendingPermissionRequests: number
    raw: Record<string, unknown>
  }
  agents: Array<{ id: string; title: string; department: string }>
  eventFeed: ActivityEvent[]
}
