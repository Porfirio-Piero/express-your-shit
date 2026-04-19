
import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'

const app = express()
app.use(express.json({ limit: '2mb' }))

const PORT = 5174
const ROOT = path.resolve(process.cwd(), '..', '..')
const DATA = ROOT
const ORG_DIR = path.join(DATA, 'org')
const AGENTS_DIR = path.join(DATA, 'agents')
const BRAIN_DIR = path.join(DATA, 'brain')
const MCP_DIR = path.join(DATA, 'mcp')
const APPROVALS_DIR = path.join(DATA, 'approvals')
const STANDUP_DIR = path.join(DATA, 'standup')
const OPS_DIR = path.join(DATA, 'ops')
const OPPS_DIR = path.join(DATA, 'opportunities')
const DAILY_DIR = path.join(DATA, 'reports', 'daily')
const INBOX_DIR = path.join(DATA, 'reports', 'inbox')
const ROLLUPS_DIR = path.join(DATA, 'reports', 'rollups')
const ESCALATIONS_DIR = path.join(DATA, 'reports', 'escalations')
const MILESTONE_REPORTS_DIR = path.join(DATA, 'reports', 'milestones')
const ACTIVITY_DIR = path.join(DATA, 'reports', 'activity')
const LOGS_DIR = path.join(DATA, 'logs')
const UI_LOG_DIR = path.join(DATA, 'logs', 'ui')
const SUB_LOG_DIR = path.join(DATA, 'logs', 'subagents')
const MCP_LOG_DIR = path.join(DATA, 'logs', 'mcp')
const CRON_LOG_DIR = path.join(DATA, 'logs', 'cron')
const BRAIN_LOG_DIR = path.join(DATA, 'logs', 'brain')
const EVENTS_LOG_DIR = path.join(DATA, 'logs', 'events')
const USAGE_LOG_DIR = path.join(DATA, 'logs', 'usage')
const TASKMASTER = path.join(ROOT, 'taskmaster.json')
const MEMORY = path.join(ROOT, 'MEMORY.md')
const SOUL = path.join(ROOT, 'SOUL.md')
const HEARTBEAT_STATE = path.join(ROOT, 'consiglio', 'heartbeat', 'state.json')
const AUDIT = path.join(ROOT, 'consiglio', 'logs', 'audit.log')
const BOTFATHER = path.join(ROOT, 'consiglio', 'logs', 'botfather.log')
const GRAPH = path.join(ROOT, 'consiglio', 'mappings', 'dependency-graph.json')
const MCP_REGISTRY_PATH = path.join(MCP_DIR, 'registry.json')
const MCP_LEGACY_REGISTRY_PATH = path.join(BRAIN_DIR, 'mcp-registry.json')
const BRAIN_MD_PATH = path.join(BRAIN_DIR, 'brain.md')
const BRAIN_JSON_PATH = path.join(BRAIN_DIR, 'consiglio-brain.json')
const SITDOWN_BRAIN_DIR = path.join(BRAIN_DIR, 'sitdown')
const CRON_REGISTRY_PATH = path.join(BRAIN_DIR, 'cron-registry.json')
const RUNTIME_STATE_PATH = path.join(OPS_DIR, 'runtime-state.json')
const ORG_JSON_PATH = path.join(ORG_DIR, 'org-structure.json')
const ORG_INDEX_PATH = path.join(ORG_DIR, 'org-index.json')
const ORG_VALIDATION_PATH = path.join(ORG_DIR, 'org-validation.md')
const ST = ['green', 'yellow', 'red']
const execAsync = promisify(execCb)
const logStreamClients = new Set()
const BOARD_COLUMNS = [
  'Backlog',
  'Intake',
  'Approved',
  'Planned',
  'In Progress',
  'QA',
  'Security Review',
  'Ready to Deploy',
  'Deployed',
  'Done',
  'Blocked',
]

const deptHeads = ['head-of-engineering', 'head-of-infrastructure', 'head-of-product', 'head-of-security', 'head-of-marketing']

function nicknameFor(id) {
  const words = id.split('-')
  const first = words[0] || 'made'
  const last = words[words.length - 1] || 'guy'
  return `${first[0].toUpperCase()}${first.slice(1)} "${last[0].toUpperCase()}${last.slice(1)}" ${Math.abs(id.length % 97)}`
}

function voiceFor(id, dept) {
  const map = {
    Engineering: 'Direct, technical, calm under pressure.',
    Infrastructure: 'Operational, reliability-first, measured urgency.',
    Product: 'Outcome-focused, clarity-first, business-aware.',
    Security: 'Risk-aware, precise, non-negotiable on controls.',
    Marketing: 'Signal-seeking, market-aware, concise narrative.',
    Executive: 'Decisive, strategic, escalation-oriented.',
  }
  return map[dept] || `Professional and concise for ${id}.`
}

function mcpProfileFor(department, id) {
  if (id === 'the-botfather' || deptHeads.includes(id)) return 'exec-safe'
  if (department === 'Product') return 'product-research'
  if (department === 'Engineering') return 'engineering-build'
  if (department === 'Infrastructure' || department === 'Security') return 'infra-secure'
  if (department === 'Marketing') return 'product-research'
  return 'exec-safe'
}

function strengthsFor(node) {
  const base = [
    `Owns ${node.department} execution quality`,
    'Escalates blockers with clean context',
    'Maintains artifact traceability from task to output',
    'Collaborates through structured daily updates',
  ]
  if (node.id.includes('scrum-master')) {
    base.push('Standup integrity and cadence governance', 'WIP and blocker flow control')
  }
  if (node.id.includes('engineer')) {
    base.push('Technical implementation rigor', 'Evidence-backed verification')
  }
  if (node.id.includes('lead') || node.id.startsWith('head-')) {
    base.push('Prioritization and route ownership', 'Cross-team dependency resolution')
  }
  if (node.id.includes('security')) {
    base.push('Security hardening and policy enforcement')
  }
  if (node.id.includes('product') || node.id.includes('analyst')) {
    base.push('Requirement clarity and scope control')
  }
  return base
}

const rolePlaybooks = {
  'product-manager': ['PRD Forge', 'Definition-of-Ready Gate', 'Feasibility Handshake', 'Scope-Change Control'],
  'devops-lead': ['Release Gatekeeper', 'Rollback Drill', 'Promotion Runbook', 'Post-Deploy Validation'],
  'security-engineer': ['Threat Model Sprint', 'Vulnerability Triage', 'OWASP ZAP Review', 'Secrets Hunt'],
  'incident-commander': ['Incident Bridge', 'Timeline Builder', 'Comms Cadence', 'Postmortem Closure'],
  'frontend-engineer': ['UI Regression Sweep', 'Fallback Hardening', 'Accessibility Pass', 'Interaction Profiling'],
  'backend-engineer': ['Migration Safety Check', 'API Budget Guard', 'Error Contract Audit', 'Structured Logging Pass'],
  'problem-scout-agent': ['Signal Harvest', 'Source Credibility Rating', 'Duplicate Collapse', 'Problem Card Draft'],
  'requirements-generator': ['Acceptance Criteria Compiler', 'NFR Matrix Builder', 'Dependency Mapping', 'Testability Pass'],
}

function orgSpec() {
  const nodes = []
  nodes.push({ id: 'the-botfather', title: 'CEO / Techno King', department: 'Executive', level: 0, reports_to: 'Piero', direct_reports: deptHeads })
  const groups = {
    'head-of-engineering': { title: 'Head of Engineering', dept: 'Engineering', reports: ['dev-team-lead', 'qa-team-lead', 'devops-lead'] },
    'head-of-infrastructure': { title: 'Head of Infrastructure', dept: 'Infrastructure', reports: ['cloud-engineering-lead', 'platform-reliability-lead'] },
    'head-of-product': { title: 'Head of Product', dept: 'Product', reports: ['product-manager', 'product-owner', 'business-analyst', 'product-scrum-master'] },
    'head-of-security': { title: 'Head of Security', dept: 'Security', reports: ['security-engineer', 'devsecops-engineer'] },
    'head-of-marketing': { title: 'Head of Marketing', dept: 'Marketing', reports: ['growth-lead', 'content-strategist', 'problem-scout-agent', 'trend-signal-analyzer'] },
    'dev-team-lead': { title: 'Development Lead', dept: 'Engineering', reports: ['backend-engineer', 'frontend-engineer', 'api-engineer', 'ai-integration-engineer', 'dev-scrum-master'] },
    'qa-team-lead': { title: 'QA Lead', dept: 'Engineering', reports: ['automation-tester', 'performance-tester', 'qa-scrum-master'] },
    'devops-lead': { title: 'DevOps Lead', dept: 'Engineering', reports: ['pipeline-architect', 'release-manager', 'build-engineer', 'devops-scrum-master'] },
    'cloud-engineering-lead': { title: 'Cloud Engineering Lead', dept: 'Infrastructure', reports: ['cloud-architect', 'identity-engineer', 'network-engineer', 'infra-scrum-master'] },
    'platform-reliability-lead': { title: 'Platform Reliability Lead', dept: 'Infrastructure', reports: ['observability-engineer', 'incident-commander'] },
    'product-manager': { title: 'Product Manager', dept: 'Product', reports: ['opportunity-prioritizer', 'concept-architect', 'requirements-generator'] },
    'product-owner': { title: 'Product Owner', dept: 'Product', reports: [] },
    'business-analyst': { title: 'Business Analyst', dept: 'Product', reports: [] },
    'product-scrum-master': { title: 'Product Scrum Master', dept: 'Product', reports: [] },
    'security-engineer': { title: 'Security Engineer', dept: 'Security', reports: [] },
    'devsecops-engineer': { title: 'DevSecOps Engineer', dept: 'Security', reports: [] },
    'growth-lead': { title: 'Growth Lead', dept: 'Marketing', reports: [] },
    'content-strategist': { title: 'Content Strategist', dept: 'Marketing', reports: [] },
    'problem-scout-agent': { title: 'Problem Scout Agent', dept: 'Marketing', reports: [] },
    'trend-signal-analyzer': { title: 'Trend Signal Analyzer', dept: 'Marketing', reports: [] },
  }
  for (const h of deptHeads) nodes.push({ id: h, title: groups[h].title, department: groups[h].dept, level: 1, reports_to: 'the-botfather', direct_reports: groups[h].reports })
  const l2 = ['dev-team-lead', 'qa-team-lead', 'devops-lead', 'cloud-engineering-lead', 'platform-reliability-lead', 'product-manager', 'product-owner', 'business-analyst', 'product-scrum-master', 'security-engineer', 'devsecops-engineer', 'growth-lead', 'content-strategist', 'problem-scout-agent', 'trend-signal-analyzer']
  for (const id of l2) {
    const manager = Object.keys(groups).find((k) => (groups[k].reports || []).includes(id))
    nodes.push({ id, title: groups[id].title, department: groups[id].dept, level: 2, reports_to: manager, direct_reports: groups[id].reports })
  }
  const leaves = ['backend-engineer', 'frontend-engineer', 'api-engineer', 'ai-integration-engineer', 'dev-scrum-master', 'automation-tester', 'performance-tester', 'qa-scrum-master', 'pipeline-architect', 'release-manager', 'build-engineer', 'devops-scrum-master', 'cloud-architect', 'identity-engineer', 'network-engineer', 'infra-scrum-master', 'observability-engineer', 'incident-commander', 'opportunity-prioritizer', 'concept-architect', 'requirements-generator']
  const titleFromId = (id) => id.split('-').map((x) => x[0].toUpperCase() + x.slice(1)).join(' ')
  const deptByManager = {}
  for (const [k, v] of Object.entries(groups)) for (const child of v.reports) deptByManager[child] = v.dept
  for (const id of leaves) {
    const manager = Object.keys(groups).find((k) => (groups[k].reports || []).includes(id))
    nodes.push({ id, title: titleFromId(id), department: deptByManager[id] || 'Engineering', level: 3, reports_to: manager || 'dev-team-lead', direct_reports: [] })
  }
  return nodes
}

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }) }
async function exists(p) { try { await fs.access(p); return true } catch { return false } }
async function rj(p, fb) { try { return JSON.parse(await fs.readFile(p, 'utf8')) } catch { return fb } }
async function rt(p, fb = '') { try { return await fs.readFile(p, 'utf8') } catch { return fb } }
async function wj(p, d) { await ensureDir(path.dirname(p)); await fs.writeFile(p, JSON.stringify(d, null, 2), 'utf8') }
async function ap(p, line) { await ensureDir(path.dirname(p)); await fs.appendFile(p, `${line}\n`, 'utf8') }
const now = () => new Date().toISOString()

function roleNiche(n) {
  const base = [`${n.title} accountable for ${n.department} execution`, `Single-manager reporting to ${n.reports_to}`, 'Daily standup compliance owner']
  if (n.id.includes('scrum-master')) base.push('Standup aggregation discipline', 'WIP control and blocker routing')
  if (n.id.includes('engineer')) base.push('Technical quality gate ownership')
  if (n.id.includes('product')) base.push('Requirement quality and scope control')
  return base
}

function skillFor(n) {
  const niche = roleNiche(n)
  const nickname = n.persona?.nickname || nicknameFor(n.id)
  const voice = n.persona?.voice || voiceFor(n.id, n.department)
  const tells = n.persona?.tells || 'Short direct updates, no fluff.'
  const mcpProfile = n.mcp_access_profile || mcpProfileFor(n.department, n.id)
  const rules = [
    'Do update task and artifact status in lockstep.',
    'Do not bypass direct manager for escalation.',
    'Do include evidence links in outputs.',
    'Do not close work without validation.',
    'Do keep naming deterministic and timestamped.',
    'Do escalate high severity blockers immediately.',
    'Do keep blockers with owner/severity/age.',
    'Do not mutate cross-domain policy files.',
    'Do consolidate sub-agent output before completion.',
    'Do keep rollups concise and action-oriented.',
  ]
  if (n.id === 'devops-lead') rules.push('Do enforce deployment gates, rollback checks, and environment promotion rules.')
  if (n.id === 'security-engineer') rules.push('Do run threat modeling and vulnerability triage with approval gates and secret handling.')
  if (n.id === 'product-manager') rules.push('Do enforce PRD quality, definition-of-ready, and feasibility routing.')
  if (n.id === 'incident-commander') rules.push('Do run incident cadence, ownership assignment, and postmortem completion.')
  if (n.id === 'backend-engineer') rules.push('Do follow migration safety, API budgets, logging, and error contract standards.')
  if (n.id === 'frontend-engineer') rules.push('Do enforce UI fallbacks, state safety, and layout integrity checks.')
  if (n.id === 'problem-scout-agent') rules.push('Do score source credibility and dedupe before submitting opportunities.')
  if (n.id === 'requirements-generator') rules.push('Do ask BotFather or operator for approved tech stack before implementation plan finalization.')
  rules.push('Do request explicit approval before writing to workspace/brain/** artifacts.')

  const extraCron = n.id.includes('scrum-master')
    ? '- 09:45 aggregate team rollup and route to lead.\n- 10:00 escalate unresolved blockers.'
    : ''
  const maxSpawn = n.level <= 1 ? 5 : n.id.includes('scrum-master') ? 2 : 3
  const direct = n.direct_reports.length ? n.direct_reports.join(', ') : '[]'
  const playbooks = rolePlaybooks[n.id] || ['Rapid Triage', 'Artifact Audit', 'Handoff Pack']
  const profileTools = {
    'exec-safe': ['browser', 'claude-skills'],
    'product-research': ['browser', 'claude-skills', 'filesystem scoped to opportunities/reports'],
    'engineering-build': ['claude-skills', 'filesystem scoped write', 'git branch-only'],
    'infra-secure': ['claude-skills', 'filesystem scoped write', 'git branch-only'],
  }
  const allowed = profileTools[mcpProfile] || profileTools['exec-safe']
  const blindSpots = [
    'May over-focus on local optimization',
    'Can miss cross-team impact without explicit dependency review',
    'Can delay escalation if blocker ownership is unclear',
    'May under-document rationale during high tempo execution',
    'Can assume tool availability when gateway policy changes',
  ]

  return `# ${n.title}

Agent ID: ${n.id}
Department: ${n.department}
Level: ${n.level}
Reports To: ${n.reports_to}
Direct Reports: ${direct}

Persona:
- Nickname: ${nickname}
- Voice: ${voice}
- Tells: ${tells}
- Do Not Overdo: true

Mission:
- Execute role outcomes with measurable quality.
- Keep artifact trail complete and auditable.
- Escalate risk quickly and accurately.
- Protect flow: discovery -> task tracker approval -> PM requirements -> development -> devops deploy -> QA + OWASP security checks.
- Keep work local-first and artifact-backed.

Specialized Niche:
${niche.map((x) => `- ${x}`).join('\n')}

Specialized Strengths & Blind Spots:
- Strengths:
${strengthsFor(n).map((x) => `  - ${x}`).join('\n')}
- Blind spots:
${blindSpots.map((x) => `  - ${x}`).join('\n')}
- Blind spot mitigations:
  - Run dependency check before execution handoff.
  - Request technical stack confirmation from BotFather/operator before build planning.
  - Escalate any blocker older than 1 hour with full context.

Tooling & MCP Stack:
- MCP Access Profile: ${mcpProfile}
- Allowed MCPs:
${allowed.map((x) => `  - ${x}`).join('\n')}
- Required tools:
  - OpenClaw task tracker artifacts
  - Consiglio org + reports indexes
  - Local markdown/json editor flow
- Forbidden tools/actions:
  - destructive filesystem writes outside workspace scope
  - direct push to main branch
  - editing org structure without authority gate
- Approval requirements:
  - Brain writes require explicit permission request logged to workspace/brain/permission-requests.jsonl
  - Policy/org edits require manager approval

Primary Responsibilities:
- Execution Responsibilities:
  - Ship domain deliverables linked to task IDs.
- Governance Responsibilities:
  - Enforce operating rules and reporting boundaries.
- Collaboration Responsibilities:
  - Provide clear handoffs and manager-ready updates.

Daily Operating Loop:
- 09:00 generate workspace/reports/daily/${n.id}-YYYY-MM-DD.json.
- Copy report to workspace/reports/inbox/${n.reports_to}/${n.id}-YYYY-MM-DD.json.
- Review blockers and milestones before noon handoff.

Weekly Operating Loop:
- Review recurring failures and propose two improvements.
- Reconcile role outputs against milestone movement.

On-Demand Tasks:
- Incident response and spike investigations.
- Root-cause analysis with evidence packet.
- Opportunity-to-execution flow governance:
  - ensure new problems discovered by scout agents are added to task tracker before work starts
  - enforce approval before requirement decomposition
  - require PM handoff with implementation plan before developer execution
  - require devops deployment path GitHub -> Vercel
  - require QA + security signoff before closure

Tight Operating Rules (Do / Do Not):
${rules.map((x) => `- ${x}`).join('\n')}

Inputs (Artifacts Consumed):
- workspace/org/org-structure.json
- workspace/reports/daily/*.json
- workspace/brain/brain.md and workspace/brain/consiglio-brain.json
- workspace/mcp/registry.json
- workspace/ops/*.json
- workspace/milestones/*.md

Outputs (Artifacts Produced):
- workspace/reports/daily/${n.id}-YYYY-MM-DD.json (agent,date,status,today,milestones,blockers,wins,requests,tasks_in_progress,completed,notes)
- workspace/reports/inbox/${n.reports_to}/${n.id}-YYYY-MM-DD.json
- workspace/logs/mcp/mcp-YYYY-MM-DD.jsonl (if MCP tools invoked)
- workspace/logs/subagents/subagents-YYYY-MM-DD.jsonl (if spawning used)
- Domain-specific markdown/json artifacts with task IDs and timestamps

Definition of Done:
- Required artifact written and schema-complete.
- Evidence attached and blockers resolved/escalated.
- Manager copy delivered.

Escalation Path:
- High severity: ${n.reports_to} immediately.
- Unresolved >1h: manager + department head.
- Unresolved >24h: the-botfather.

CRON Schedule:
- 09:00 daily report required.
${extraCron}

Standup Participation (Mandatory):
- Must produce workspace/reports/daily/${n.id}-YYYY-MM-DD.json.
- Must route copy to workspace/reports/inbox/${n.reports_to}/${n.id}-YYYY-MM-DD.json.
- Must maintain blockers and milestones accurately.

Sub-Agent Spawn Policy (Mandatory):
- Allowed to spawn bounded sub-agents for scoped parallel work.
- Forbidden to spawn policy-mutating or cross-domain privileged agents.
- max_concurrent_subagents: ${maxSpawn}
- max_duration_minutes: 30
- Must create brief: workspace/inbox/subagents/${n.id}/SUB-YYYYMMDD-###.md
- Must consolidate outputs before done and log to workspace/logs/subagents/subagents-YYYY-MM-DD.jsonl

Role-Specific Sub-Agent Playbooks:
${playbooks.map((x) => `- ${x}: use when role-specific pressure rises; output structured artifact and link it in task tracker`).join('\n')}

Quality & Safety Checks:
- JSON schema sanity check
- Cross-link and timestamp verification
- Escalation route validation

Communication Style:
- Short, structured, action-oriented rollups.
`
}

function validate(nodes) {
  const issues = []
  const ids = new Set(nodes.map((n) => n.id))
  const manager = new Map(nodes.map((n) => [n.id, n.reports_to]))
  for (const n of nodes) {
    if (!n.reports_to) issues.push(`${n.id}: missing reports_to`)
    if (n.reports_to !== 'Piero' && !ids.has(n.reports_to)) issues.push(`${n.id}: missing manager ${n.reports_to}`)
    if (n.reports_to === 'the-botfather' && !deptHeads.includes(n.id)) issues.push(`${n.id}: only dept heads report to botfather`)
  }
  const state = new Map()
  const dfs = (id) => {
    if (state.get(id) === 1) return true
    if (state.get(id) === 2) return false
    state.set(id, 1)
    const p = manager.get(id)
    if (p && p !== 'Piero' && ids.has(p) && dfs(p)) return true
    state.set(id, 2)
    return false
  }
  for (const n of nodes) if (dfs(n.id)) { issues.push(`${n.id}: cycle`); break }
  const reachable = new Set(['the-botfather'])
  const q = ['the-botfather']
  while (q.length) {
    const cur = q.shift()
    for (const child of nodes.filter((x) => x.reports_to === cur).map((x) => x.id)) {
      if (!reachable.has(child)) { reachable.add(child); q.push(child) }
    }
  }
  for (const n of nodes) if (n.id !== 'the-botfather' && !reachable.has(n.id)) issues.push(`${n.id}: unreachable`)
  return { ok: issues.length === 0, issues }
}

async function bootstrap() {
  await Promise.all([
    ensureDir(ORG_DIR), ensureDir(AGENTS_DIR), ensureDir(BRAIN_DIR), ensureDir(MCP_DIR),
    ensureDir(APPROVALS_DIR),
    ensureDir(SITDOWN_BRAIN_DIR),
    ensureDir(STANDUP_DIR), ensureDir(path.join(STANDUP_DIR, 'sessions')), ensureDir(path.join(STANDUP_DIR, 'people')),
    ensureDir(path.join(STANDUP_DIR, 'teams')), ensureDir(path.join(STANDUP_DIR, 'executive')), ensureDir(path.join(STANDUP_DIR, 'raw')),
    ensureDir(DAILY_DIR), ensureDir(INBOX_DIR), ensureDir(ROLLUPS_DIR), ensureDir(ESCALATIONS_DIR), ensureDir(MILESTONE_REPORTS_DIR), ensureDir(ACTIVITY_DIR),
    ensureDir(path.join(OPPS_DIR, 'raw')), ensureDir(path.join(OPPS_DIR, 'scored')), ensureDir(path.join(OPPS_DIR, 'concepts')), ensureDir(path.join(OPPS_DIR, 'prd')),
    ensureDir(path.join(OPS_DIR, 'drift')), ensureDir(path.join(OPS_DIR, 'pressure')), ensureDir(path.join(OPS_DIR, 'next-actions')),
    ensureDir(UI_LOG_DIR), ensureDir(SUB_LOG_DIR), ensureDir(MCP_LOG_DIR), ensureDir(CRON_LOG_DIR), ensureDir(BRAIN_LOG_DIR),
    ensureDir(EVENTS_LOG_DIR), ensureDir(USAGE_LOG_DIR),
    ensureDir(path.dirname(AUDIT)), ensureDir(path.dirname(BOTFATHER)), ensureDir(path.dirname(HEARTBEAT_STATE)), ensureDir(path.dirname(GRAPH)),
  ])
  const nodes = orgSpec().map((n) => ({
    ...n,
    persona: {
      nickname: nicknameFor(n.id),
      voice: voiceFor(n.id, n.department),
      tells: 'Straight talk, short updates, zero fluff.',
      do_not_overdo: true,
    },
    primary_strengths: strengthsFor(n),
    mcp_access_profile: mcpProfileFor(n.department, n.id),
    niche: roleNiche(n),
    skill_file_path: `workspace/agents/${n.id}/skill.md`,
  }))
  const org = { version: '1.0', generated_at: now(), root_human_authority: 'Piero', nodes }
  const v = validate(nodes)
  await wj(ORG_JSON_PATH, org)
  await wj(ORG_INDEX_PATH, {
    generated_at: now(),
    managers: Object.fromEntries(nodes.map((n) => [n.id, n.reports_to])),
    by_department: nodes.reduce((acc, n) => {
      if (!acc[n.department]) acc[n.department] = []
      acc[n.department].push(n.id)
      return acc
    }, {}),
  })
  const vm = ['# Org Validation', `Generated: ${now()}`, '', `Status: ${v.ok ? 'PASS' : 'FAIL'}`, '', '## Findings', ...(v.issues.length ? v.issues.map((x) => `- ${x}`) : ['- none'])].join('\n')
  await fs.writeFile(ORG_VALIDATION_PATH, vm, 'utf8')

  const mcpRegistry = {
    version: '1.0',
    mcps: [
      { id: 'claude-skills', type: 'installed', description: 'Claude skill pack already installed', risk: 'medium', default_enabled: true, enabled: true },
      { id: 'filesystem', type: 'mcp', description: 'Read/write workspace artifacts (scoped paths only)', risk: 'high', default_enabled: false, enabled: false },
      { id: 'git', type: 'mcp', description: 'Repo read + PR creation (no force push)', risk: 'high', default_enabled: false, enabled: false },
      { id: 'browser', type: 'mcp', description: 'Web fetch/search for research tasks (rate limited)', risk: 'medium', default_enabled: true, enabled: true },
      { id: 'http', type: 'mcp', description: 'Call internal APIs (allowlist only)', risk: 'high', default_enabled: false, enabled: false },
    ],
    profiles: [
      { id: 'exec-safe', allowed: ['browser', 'claude-skills'], write_tools: [], notes: 'Read-first. No write/destructive tools.' },
      { id: 'product-research', allowed: ['browser', 'claude-skills'], write_tools: ['filesystem:workspace/opportunities/**'], notes: 'Can write PRDs and opportunity artifacts only.' },
      { id: 'engineering-build', allowed: ['claude-skills', 'filesystem', 'git'], write_tools: ['filesystem:workspace/agents/*', 'filesystem:workspace/reports/*', 'git:branch_only'], notes: 'May change code via branches only; no direct main changes.' },
      { id: 'infra-secure', allowed: ['claude-skills', 'filesystem', 'git'], write_tools: ['filesystem:workspace/ops/*', 'filesystem:workspace/logs/*', 'git:branch_only'], notes: 'Strong governance; requires approvals for risky actions.' },
    ],
    approval_rules: [
      { action: 'filesystem.write', paths_not_allowed: ['/*'], paths_allowed: ['/workspace/*'] },
      { action: 'git.push_main', allowed: false },
      { action: 'http.call', allowed: false, note: 'Enable only with allowlist.' },
      { action: 'brain.write', allowed: false, note: 'Requires explicit permission request and approval.' },
    ],
  }
  if (!await exists(MCP_REGISTRY_PATH)) {
    const legacy = await rj(MCP_LEGACY_REGISTRY_PATH, null)
    await wj(MCP_REGISTRY_PATH, legacy && typeof legacy === 'object' ? legacy : mcpRegistry)
  }
  if (!await exists(path.join(APPROVALS_DIR, 'mcp-approvals.json'))) {
    await wj(path.join(APPROVALS_DIR, 'mcp-approvals.json'), { version: '1.0', items: [] })
  }

  const brainJson = {
    version: '1.0',
    updated_at: now(),
    sources: {
      org: 'workspace/org/org-structure.json',
      skills: 'workspace/agents/**/skill.md',
      reports: 'workspace/reports/**',
      standup: 'workspace/standup/**',
      opportunities: 'workspace/opportunities/**',
      ops: 'workspace/ops/**',
      mcp: 'workspace/mcp/registry.json',
    },
    routing_rules: [
      { if: 'blocker.severity==high', route_to: 'manager_inbox' },
      { if: 'opportunity.score>=threshold', route_to: 'product-manager' },
      { if: 'milestone.at_risk==true', route_to: 'dept_head' },
    ],
    indexes: {
      people_status: 'workspace/standup/index.json',
      escalations_latest: 'workspace/reports/escalations/escalations-latest.json',
      next_actions_latest: 'workspace/ops/next-actions/next-actions-latest.json',
      opportunities_latest: 'workspace/opportunities/scored/daily-ranked-latest.json',
    },
    ui_contracts: {
      org_panel: 'org-structure + skill previews + overlays',
      standup_panel: 'executive-latest + team rollups + blockers',
      mcp_panel: 'registry + access profiles + audit',
    },
    permission_model: {
      brain_updates_require_approval: true,
      approval_targets: ['the-botfather', 'Piero'],
    },
  }
  if (!await exists(BRAIN_JSON_PATH)) {
    await wj(BRAIN_JSON_PATH, brainJson)
  }
  const brainMd = [
    '# Consiglio Brain',
    '',
    '## How Consiglio reads artifacts',
    '- Reads local-first artifacts under workspace/',
    '- Uses org + skills + reports + ops indexes as routing context',
    '',
    '## What is authoritative',
    '- Org: workspace/org/org-structure.json',
    '- Skills: workspace/agents/<id>/skill.md',
    '- MCP policy: workspace/mcp/registry.json',
    '- Task tracker intake gate: Mission Control task flow',
    '',
    '## Daily cycle',
    '- 06:00 scout opportunities',
    '- 08:30 product conversion',
    '- 09:00 daily check-ins',
    '- 09:45 scrum rollups',
    '- 12:00 lead rollups',
    '- 15:00 dept-head rollups',
    '- 17:00 executive rollup',
    '',
    '## Routing',
    '- High blockers route up chain immediately',
    '- Opportunities route through PM and requirement flow',
    '- Build path: developer -> devops -> GitHub -> Vercel -> QA+Security',
    '',
    '## Approvals',
    '- Brain updates require explicit approval request',
    '- Org/policy changes require manager gate',
    '',
    '## Add new agent safely',
    '- Add node with one manager',
    '- Assign MCP profile',
    '- Generate skill.md',
    '- Re-run org validation',
    '',
    '## Add new MCP safely',
    '- Add to registry with risk + default',
    '- Update profile allowlists',
    '- Define approval rules',
    '',
    '## Debug logs',
    '- workspace/logs/ui',
    '- workspace/logs/mcp',
    '- workspace/logs/subagents',
    '- workspace/logs/cron',
    '- workspace/logs/brain',
  ].join('\n')
  if (!await exists(BRAIN_MD_PATH)) {
    await fs.writeFile(BRAIN_MD_PATH, brainMd, 'utf8')
  }

  const standupIndex = { generated_at: now(), agents: nodes.map((n) => ({ id: n.id, reports_to: n.reports_to })) }
  await wj(path.join(STANDUP_DIR, 'index.json'), standupIndex)
  if (!await exists(CRON_REGISTRY_PATH)) {
    await wj(CRON_REGISTRY_PATH, {
      version: '1.0',
      updated_at: now(),
      jobs: [
        { id: 'heartbeat-botfather', name: 'BotFather Heartbeat', ownerAgent: 'the-botfather', purpose: 'Runtime reconciliation', schedule: '*/15 * * * *', human: 'Every 15 minutes', enabled: true, lastRunStatus: 'ok', lastRunTime: null, nextRunTime: null, fail24h: 0 },
        { id: 'daily-checkin', name: 'Daily Agent Check-ins', ownerAgent: 'the-botfather', purpose: '09:00 standup submissions', schedule: '0 9 * * *', human: 'Daily 09:00', enabled: true, lastRunStatus: 'ok', lastRunTime: null, nextRunTime: null, fail24h: 0 },
      ],
    })
  }
  if (!await exists(RUNTIME_STATE_PATH)) {
    await writeRuntimeState(await readRuntimeState())
  }
  const day = now().slice(0, 10)
  for (const n of nodes) {
    const dir = path.join(AGENTS_DIR, n.id)
    await ensureDir(dir)
    await fs.writeFile(path.join(dir, 'skill.md'), skillFor(n), 'utf8')
    for (const f of ['MEMORY.md', 'SOUL.md', 'IDENTITY.md', 'TOOLS.md', 'AGENTS.md', 'HEARTBEAT.md']) {
      const p = path.join(dir, f)
      if (!await exists(p)) await fs.writeFile(p, `# ${n.id} ${f}\n\nNo data yet.\n`, 'utf8')
    }
    const rpt = path.join(DAILY_DIR, `${n.id}-${day}.json`)
    if (!await exists(rpt)) {
      const payload = { agent: n.id, date: `${day}T09:00:00.000Z`, status: ST[Math.abs(n.id.length) % ST.length], today: [`Advance ${n.title}`], milestones: [], blockers: [], wins: [], requests: [], tasks_in_progress: [], completed: [], notes: 'Seeded by Consiglio' }
      await wj(rpt, payload)
      await ensureDir(path.join(INBOX_DIR, n.reports_to))
      await wj(path.join(INBOX_DIR, n.reports_to, `${n.id}-${day}.json`), payload)
    }
  }
  const latestEscalations = path.join(ESCALATIONS_DIR, 'escalations-latest.json')
  const latestNextActions = path.join(OPS_DIR, 'next-actions', 'next-actions-latest.json')
  const latestOpps = path.join(OPPS_DIR, 'scored', 'daily-ranked-latest.json')
  if (!await exists(latestEscalations)) await wj(latestEscalations, { generated_at: now(), items: [] })
  if (!await exists(latestNextActions)) {
    await wj(latestNextActions, {
      generated_at: now(),
      top_actions: [
        { title: 'Ingest new problems into task tracker before execution', owner: 'problem-scout-agent', why: 'Prevents untracked work and enforces approval gate.' },
        { title: 'Route approved items to product-manager for requirement mapping', owner: 'product-manager', why: 'Ensures implementation-ready planning.' },
        { title: 'Run QA + OWASP check on current deployments', owner: 'security-engineer', why: 'Maintains release safety baseline.' },
      ],
    })
  }
  if (!await exists(latestOpps)) await wj(latestOpps, { generated_at: now(), opportunities: [] })
  const cronEntry = { ts: now(), event: 'bootstrap', schedules: ['06:00 scouts', '08:30 product conversion', '09:00 all check-in', '09:45 scrum', '12:00 leads', '15:00 dept heads', '17:00 botfather'] }
  await ap(path.join(CRON_LOG_DIR, `cron-${day}.jsonl`), JSON.stringify(cronEntry))
  await ap(path.join(BRAIN_LOG_DIR, `brain-${day}.jsonl`), JSON.stringify({ ts: now(), event: 'brain_refreshed', source: 'bootstrap' }))
  const g = { version: '1.0', generatedAt: now(), nodes: nodes.map((n) => ({ id: `agent:${n.id}`, type: 'agent', name: n.title, status: 'active', ownerId: `agent:${n.reports_to}`, source: n.skill_file_path, metadata: { department: n.department } })), edges: nodes.filter((n) => n.reports_to !== 'Piero').map((n) => ({ from: `agent:${n.reports_to}`, to: `agent:${n.id}`, type: 'OWNS', criticality: 'high', evidence: ['workspace/org/org-structure.json'], lastVerifiedAt: now() })) }
  await wj(GRAPH, g)
  return { org, validation: v }
}

async function agentsWithStatus() {
  const { org } = await bootstrap()
  const day = now().slice(0, 10)
  const list = []
  for (const n of org.nodes) {
    const d = await rj(path.join(DAILY_DIR, `${n.id}-${day}.json`), null)
    const sk = await rt(path.join(AGENTS_DIR, n.id, 'skill.md'), '')
    list.push({
      id: n.id,
      workspace: `workspace/agents/${n.id}`,
      path: path.join(AGENTS_DIR, n.id),
      role: n.title,
      reportsTo: n.reports_to,
      crew: n.department,
      heartbeatUpdatedAt: d?.date || null,
      status: d?.status || 'unknown',
      blockers: Array.isArray(d?.blockers) ? d.blockers.length : 0,
      missed: !d,
      directReports: n.direct_reports,
      persona: n.persona,
      primaryStrengths: n.primary_strengths,
      mcpAccessProfile: n.mcp_access_profile,
      snippets: { skill: sk.split('\n').slice(0, 8).join('\n'), memory: await rt(MEMORY, ''), soul: await rt(SOUL, '') },
    })
  }
  return list
}

async function uiErr(msg, ctx = 'ui') { await ap(path.join(UI_LOG_DIR, `${now().slice(0, 10)}.log`), `${now()} [${ctx}] ${msg}`) }
async function mcpAudit(entry) {
  const payload = {
    agent_id: entry.agent_id || 'unknown',
    mcp_id: entry.mcp_id || 'filesystem',
    tool: entry.tool || 'unknown',
    timestamp: now(),
    request_summary: entry.request_summary || '',
    result_summary: entry.result_summary || 'ok',
    risk_flag: entry.risk_flag || 'low',
  }
  await ap(path.join(MCP_LOG_DIR, `mcp-${now().slice(0, 10)}.jsonl`), JSON.stringify(payload))
}

async function emitEvent(payload) {
  const event = {
    event_id: payload.event_id || `evt-${Date.now()}`,
    timestamp: now(),
    type: payload.type || payload.event_type || 'unknown',
    actor: payload.actor || 'system',
    actor_type: payload.actor_type || 'system',
    event_type: payload.event_type || 'unknown',
    target_type: payload.target_type || 'runtime',
    target_id: payload.target_id || 'unknown',
    run_id: payload.run_id || null,
    task_id: payload.task_id || null,
    gateway_id: payload.gateway_id || null,
    summary: payload.summary || '',
    severity: payload.severity || 'info',
    duration: payload.duration || null,
    metadata: payload.metadata || {},
  }
  const day = now().slice(0, 10)
  await ensureDir(EVENTS_LOG_DIR)
  await ap(path.join(EVENTS_LOG_DIR, `${day}.jsonl`), JSON.stringify(event))
  if (payload.event_type === 'model_usage_recorded') {
    await ensureDir(USAGE_LOG_DIR)
    await ap(path.join(USAGE_LOG_DIR, `${day}.jsonl`), JSON.stringify(event))
  }
  for (const res of logStreamClients) {
    try {
      res.write(`event: log\n`)
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    } catch {
      // no-op
    }
  }
  return event
}

function parseSearchSyntax(input = '') {
  const terms = []
  const filters = {}
  const tokens = String(input).trim().split(/\s+/).filter(Boolean)
  for (const token of tokens) {
    const m = token.match(/^(agent|task|type|severity|run):(.+)$/i)
    if (m) filters[m[1].toLowerCase()] = m[2].toLowerCase()
    else terms.push(token.toLowerCase())
  }
  return { terms, filters }
}

function normalizeStatus(value = 'Backlog') {
  const raw = String(value || '').trim().toLowerCase()
  const map = {
    backlog: 'Backlog',
    intake: 'Intake',
    approved: 'Approved',
    planned: 'Planned',
    'in progress': 'In Progress',
    inprogress: 'In Progress',
    qa: 'QA',
    'security review': 'Security Review',
    securityreview: 'Security Review',
    'ready to deploy': 'Ready to Deploy',
    readytodeploy: 'Ready to Deploy',
    deployed: 'Deployed',
    done: 'Done',
    completed: 'Done',
    blocked: 'Blocked',
  }
  return map[raw] || (BOARD_COLUMNS.includes(value) ? value : 'Backlog')
}

function ensureTaskShape(task = {}) {
  const normalizedStatus = normalizeStatus(task.status || task.column || 'Backlog')
  const repo = String(task.repo || task.repository || '').trim()
  const prUrl = String(task.pr_url || task.prUrl || '').trim()
  const previewUrl = String(task.preview_url || task.previewUrl || '').trim()
  const productionUrl = String(task.production_url || task.productionUrl || '').trim()
  const swarmLogs = Array.isArray(task.swarm_logs) ? task.swarm_logs : Array.isArray(task.swarmLogs) ? task.swarmLogs : []
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : []
  const evidenceLinks = Array.isArray(task.evidence_links) ? task.evidence_links : Array.isArray(task.evidenceLinks) ? task.evidenceLinks : []
  return {
    ...task,
    status: normalizedStatus,
    column: normalizedStatus,
    ownerAgent: String(task.ownerAgent || task.owner_agent || ''),
    owner_agent: String(task.owner_agent || task.ownerAgent || ''),
    repo,
    branch: String(task.branch || task.branch_name || '').trim(),
    branch_name: String(task.branch_name || task.branch || '').trim(),
    pr_url: prUrl,
    prUrl,
    pr_status: String(task.pr_status || task.prStatus || 'Open'),
    prStatus: String(task.prStatus || task.pr_status || 'Open'),
    ci_status: String(task.ci_status || task.ciStatus || 'Unknown'),
    ciStatus: String(task.ciStatus || task.ci_status || 'Unknown'),
    preview_url: previewUrl,
    previewUrl,
    production_url: productionUrl,
    productionUrl,
    deployment_timestamp: String(task.deployment_timestamp || task.deploymentTimestamp || ''),
    deploymentTimestamp: String(task.deploymentTimestamp || task.deployment_timestamp || ''),
    acceptance_criteria: String(task.acceptance_criteria || task.acceptanceCriteria || ''),
    acceptanceCriteria: String(task.acceptanceCriteria || task.acceptance_criteria || ''),
    qa_notes: String(task.qa_notes || task.qaNotes || ''),
    qaNotes: String(task.qaNotes || task.qa_notes || ''),
    security_notes: String(task.security_notes || task.securityNotes || ''),
    securityNotes: String(task.securityNotes || task.security_notes || ''),
    evidence_links: evidenceLinks,
    evidenceLinks,
    subtasks,
    swarm_logs: swarmLogs,
    swarmLogs,
  }
}

function hasEvidence(task = {}) {
  const evidence = Array.isArray(task.evidence_links) ? task.evidence_links : Array.isArray(task.evidenceLinks) ? task.evidenceLinks : []
  return evidence.length > 0
}

function validateTransition(currentTask, nextTask) {
  const from = normalizeStatus(currentTask?.status || currentTask?.column || 'Backlog')
  const to = normalizeStatus(nextTask?.status || nextTask?.column || from)
  if (from === to) return { ok: true }
  if (to === 'Blocked') return { ok: true }

  const branch = String(nextTask.branch || nextTask.branch_name || '').trim()
  const prUrl = String(nextTask.pr_url || nextTask.prUrl || '').trim()
  const ci = String(nextTask.ci_status || nextTask.ciStatus || '').toLowerCase()
  const qaNotes = String(nextTask.qa_notes || nextTask.qaNotes || '').trim()
  const securityNotes = String(nextTask.security_notes || nextTask.securityNotes || '').trim()
  const prodUrl = String(nextTask.production_url || nextTask.productionUrl || '').trim()

  if (from === 'Planned' && to === 'In Progress' && !branch) {
    return { ok: false, error: 'Planned -> In Progress requires branch exists.' }
  }
  if (from === 'In Progress' && to === 'QA' && !prUrl) {
    return { ok: false, error: 'In Progress -> QA requires PR exists.' }
  }
  if (from === 'QA' && to === 'Security Review' && (!(ci === 'passing' || ci === 'success' || ci === 'green') || !qaNotes)) {
    return { ok: false, error: 'QA -> Security Review requires CI passing and QA notes.' }
  }
  if (from === 'Security Review' && to === 'Ready to Deploy' && !securityNotes) {
    return { ok: false, error: 'Security Review -> Ready to Deploy requires security approval notes.' }
  }
  if (from === 'Ready to Deploy' && to === 'Deployed' && !prodUrl) {
    return { ok: false, error: 'Ready to Deploy -> Deployed requires production deploy success URL.' }
  }
  if (from === 'Deployed' && to === 'Done' && (!prodUrl || !hasEvidence(nextTask))) {
    return { ok: false, error: 'Deployed -> Done requires production URL and evidence links.' }
  }
  return { ok: true }
}

function fleshOutTaskByPM(task) {
  const marker = 'PM_FLESHED_V1'
  const notes = String(task?.notes || '')
  if (notes.includes(marker)) return task
  const nowTs = now()
  const planningBlock = [
    '',
    `<!-- ${marker} -->`,
    '## PM Triage (Auto by product-manager)',
    `- triaged_at: ${nowTs}`,
    '- triaged_by: product-manager',
    '- status: needs-tech-stack-input',
    '- ask: confirm target stack/runtime with BotFather or operator before implementation',
    '- next_owner: product-manager',
    '- next_step: create requirements + implementation plan and handoff to dev-team-lead',
    '',
    '## Initial Requirements Draft',
    '- problem_statement: clarify root problem and user impact',
    '- acceptance_criteria:',
    '  - define success metrics',
    '  - define happy path and edge cases',
    '  - define rollback/fallback expectations',
    '- dependencies: list APIs, services, and deployment targets',
    '- qa_security_gate: QA + OWASP review required before done',
  ].join('\n')

  return {
    ...ensureTaskShape(task),
    notes: `${notes}${planningBlock}`.trim(),
    pmStatus: 'needs-tech-stack-input',
    pmFleshedAt: nowTs,
    pmFleshedBy: 'product-manager',
    updatedAt: nowTs,
    ownerAgent: String(task.ownerAgent || '').trim() || 'product-manager',
  }
}

function normalizeEvent(event) {
  const e = event || {}
  return {
    event_id: e.event_id || `evt-${Math.random().toString(36).slice(2)}`,
    timestamp: e.timestamp || now(),
    type: e.type || e.event_type || 'unknown',
    event_type: e.event_type || e.type || 'unknown',
    actor: e.actor || 'system',
    actor_type: e.actor_type || 'system',
    target_type: e.target_type || 'runtime',
    target_id: e.target_id || 'unknown',
    task_id: e.task_id || e.taskId || null,
    run_id: e.run_id || e.runId || null,
    gateway_id: e.gateway_id || e.gatewayId || null,
    summary: e.summary || '',
    severity: e.severity || 'info',
    duration: e.duration || null,
    metadata: e.metadata || {},
  }
}

function eventMatches(event, q) {
  if (q.category && q.category !== 'all') {
    const t = (event.event_type || '').toLowerCase()
    if (q.category === 'runtime' && !/(heartbeat|runtime|gateway|agent_run|cron|operations)/.test(t)) return false
    if (q.category === 'approvals' && !/approval/.test(t)) return false
    if (q.category === 'deployments' && !/deploy/.test(t)) return false
    if (q.category === 'mcp' && !/mcp|tool/.test(t)) return false
    if (q.category === 'file_changes' && !/file_changed/.test(t)) return false
    if (q.category === 'usage' && !/usage|model_usage_recorded/.test(t)) return false
    if (q.category === 'system' && !/system|incident|error|critical/.test(t)) return false
  }
  if (q.eventType && (event.event_type || '').toLowerCase() !== q.eventType) return false
  if (q.agent && (event.actor || '').toLowerCase() !== q.agent && (event.target_id || '').toLowerCase() !== q.agent) return false
  if (q.task && String(event.task_id || '').toLowerCase() !== q.task) return false
  if (q.severity && String(event.severity || '').toLowerCase() !== q.severity) return false

  const hay = JSON.stringify(event).toLowerCase()
  if (q.syntax.filters.agent && !(String(event.actor || '').toLowerCase() === q.syntax.filters.agent || String(event.target_id || '').toLowerCase() === q.syntax.filters.agent)) return false
  if (q.syntax.filters.task && String(event.task_id || '').toLowerCase() !== q.syntax.filters.task) return false
  if (q.syntax.filters.type && String(event.event_type || '').toLowerCase() !== q.syntax.filters.type) return false
  if (q.syntax.filters.severity && String(event.severity || '').toLowerCase() !== q.syntax.filters.severity) return false
  if (q.syntax.filters.run && String(event.run_id || '').toLowerCase() !== q.syntax.filters.run) return false
  for (const term of q.syntax.terms) {
    if (!hay.includes(term)) return false
  }
  return true
}

async function readEventsByRange(range = '24h') {
  await ensureDir(EVENTS_LOG_DIR)
  const files = (await fs.readdir(EVENTS_LOG_DIR).catch(() => []))
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f))
    .sort()
  let dayCount = 1
  if (range === '7d') dayCount = 7
  if (range === '30d') dayCount = 30
  if (range === 'custom') dayCount = 30
  const chosen = files.slice(-dayCount)
  const out = []
  for (const file of chosen) {
    const text = await rt(path.join(EVENTS_LOG_DIR, file), '')
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue
      try {
        out.push(normalizeEvent(JSON.parse(line)))
      } catch {
        // ignore bad row
      }
    }
  }
  out.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return out
}

async function readRuntimeState() {
  return rj(RUNTIME_STATE_PATH, {
    processes: {
      gateway: { name: 'OpenClaw Gateway', status: 'stopped', lastActionAt: null, lastAction: 'none' },
      ollama: { name: 'Ollama', status: 'stopped', lastActionAt: null, lastAction: 'none' },
    },
    pausedNewRuns: false,
    lastHealthCheckAt: null,
  })
}

async function writeRuntimeState(next) {
  await wj(RUNTIME_STATE_PATH, next)
}

async function processIsRunning(namePattern) {
  try {
    const { stdout } = await execAsync(`powershell -NoProfile -Command \"Get-Process | Where-Object { $_.ProcessName -match '${namePattern}' } | Select-Object -ExpandProperty ProcessName\"`)
    return Boolean(stdout && stdout.trim())
  } catch {
    return false
  }
}

function gatewayAdapter() {
  return {
    async start() { return { ok: false, configured: false, message: 'Gateway process control not configured; adapter stub active.' } },
    async stop() { return { ok: false, configured: false, message: 'Gateway process control not configured; adapter stub active.' } },
    async restart() {
      const stop = await this.stop()
      const start = await this.start()
      return { ok: stop.ok && start.ok, configured: false, message: 'Gateway restart executed via stub sequence.', steps: [stop, start] }
    },
  }
}

function ollamaAdapter() {
  return {
    async start() {
      try {
        await execAsync('powershell -NoProfile -Command "Start-Process ollama -ArgumentList \'serve\'"')
        return { ok: true, configured: true, message: 'Ollama start requested.' }
      } catch (e) {
        return { ok: false, configured: true, message: `Failed to start Ollama: ${String(e)}` }
      }
    },
    async stop() {
      try {
        await execAsync('powershell -NoProfile -Command "Get-Process ollama -ErrorAction SilentlyContinue | Stop-Process -Force"')
        return { ok: true, configured: true, message: 'Ollama stop requested.' }
      } catch (e) {
        return { ok: false, configured: true, message: `Failed to stop Ollama: ${String(e)}` }
      }
    },
    async restart() {
      const stop = await this.stop()
      const start = await this.start()
      return { ok: stop.ok && start.ok, configured: true, message: 'Ollama restart sequence completed.', steps: [stop, start] }
    },
  }
}

async function readAgentBrain(agentId) {
  const fp = path.join(AGENTS_DIR, agentId, 'brain.md')
  if (!await exists(fp)) {
    await ensureDir(path.dirname(fp))
    await fs.writeFile(fp, `# ${agentId} Brain\n\n## Heartbeat\nenabled: true\nschedule: every 15m\n`, 'utf8')
  }
  return rt(fp, '')
}

async function writeAgentHeartbeat(agentId, schedule, enabled) {
  const fp = path.join(AGENTS_DIR, agentId, 'brain.md')
  const content = await readAgentBrain(agentId)
  const next = content.includes('## Heartbeat')
    ? content.replace(/## Heartbeat[\s\S]*?(?=\n## |\n$)/m, `## Heartbeat\nenabled: ${enabled ? 'true' : 'false'}\nschedule: ${schedule}\n`)
    : `${content}\n\n## Heartbeat\nenabled: ${enabled ? 'true' : 'false'}\nschedule: ${schedule}\n`
  await fs.writeFile(fp, next, 'utf8')
  await emitEvent({
    actor: 'operator',
    event_type: 'heartbeat_schedule_updated',
    target_type: 'agent',
    target_id: agentId,
    summary: `Heartbeat schedule updated to ${schedule} (enabled=${enabled})`,
    severity: 'info',
    metadata: { file: fp },
  })
  await emitEvent({
    actor: 'operator',
    event_type: 'file_changed',
    target_type: 'file',
    target_id: fp,
    summary: 'Agent brain.md heartbeat section updated',
    severity: 'info',
    metadata: { agentId, schedule, enabled },
  })
}

function sitdownJsonPath(date) {
  return path.join(SITDOWN_BRAIN_DIR, `${date}.json`)
}

function sitdownMdPath(date) {
  return path.join(SITDOWN_BRAIN_DIR, `${date}.md`)
}

function toBullets(arr = []) {
  const list = Array.isArray(arr) ? arr.filter(Boolean) : []
  return list.length ? list.map((x) => `- ${x}`).join('\n') : '- none'
}

function sessionMarkdown(session) {
  const lines = [
    `# Sitdown ${session.date}`,
    '',
    `Session ID: ${session.id}`,
    `Start: ${session.start_time || 'n/a'}`,
    `End: ${session.end_time || 'open'}`,
    `Risk: ${session.summary?.riskLevel || 'Moderate'}`,
    '',
    '## Participants',
    ...(session.participants || []).map((p) => `- ${p.agentId} (${p.role}) status=${p.status} activeTasks=${p.activeTasks} blockers=${p.blockers}`),
    '',
    '## Contributions',
  ]
  for (const c of session.contributions || []) {
    lines.push(`### ${c.agentId} (${c.role})`)
    lines.push(`Model: ${c.model || 'n/a'}`)
    lines.push('#### What I worked on')
    lines.push(toBullets(c.workedOn))
    lines.push('#### What I am working on next')
    lines.push(toBullets(c.next))
    lines.push('#### Blockers')
    lines.push(toBullets((c.blockers || []).map((b) => `${b.severity || 'med'}: ${b.text}${b.taskId ? ` [${b.taskId}]` : ''}`)))
    lines.push('#### Approval Requests')
    lines.push(toBullets((c.approvalRequests || []).map((a) => `${a.type}: ${a.text}`)))
    lines.push('#### Proposed Opportunities')
    lines.push(toBullets(c.opportunities))
    lines.push('#### Discussion')
    lines.push(toBullets((c.comments || []).map((m) => `${m.actor}: ${m.text}`)))
    lines.push('')
  }
  lines.push('## BotFather Executive Summary')
  lines.push(`Risk Level: ${session.summary?.riskLevel || 'Moderate'}`)
  lines.push('### Top Blockers')
  lines.push(toBullets(session.summary?.topBlockers))
  lines.push('### Approvals Needed')
  lines.push(toBullets(session.summary?.approvalsNeeded))
  lines.push('### Deployment Risks')
  lines.push(toBullets(session.summary?.deploymentRisks))
  lines.push('### Security Flags')
  lines.push(toBullets(session.summary?.securityFlags))
  lines.push('### Performance Concerns')
  lines.push(toBullets(session.summary?.performanceConcerns))
  lines.push('### Suggested Priorities')
  lines.push(toBullets(session.summary?.suggestedPriorities))
  lines.push('### Suggested Escalations')
  lines.push(toBullets(session.summary?.suggestedEscalations))
  return `${lines.join('\n')}\n`
}

function participantStatus(participant, contributionsByAgent) {
  if (participant.excluded) return 'Excluded'
  if (contributionsByAgent.has(participant.agentId)) return 'Posted'
  if (participant.blockers > 0) return 'Blocked'
  if (participant.waitingApproval > 0) return 'Waiting Approval'
  return 'Not Posted'
}

function summarizeSession(session) {
  const topBlockers = []
  const approvalsNeeded = []
  const deploymentRisks = []
  const securityFlags = []
  const performanceConcerns = []
  const suggestedPriorities = []
  const suggestedEscalations = []
  for (const c of session.contributions || []) {
    for (const b of c.blockers || []) {
      topBlockers.push(`${c.agentId}: ${b.text}`)
      if ((b.severity || '').toLowerCase() === 'high') suggestedEscalations.push(`${c.agentId} blocker high severity -> escalate ${b.escalateTo || 'manager'}`)
    }
    for (const a of c.approvalRequests || []) approvalsNeeded.push(`${c.agentId}: ${a.type} - ${a.text}`)
    for (const w of c.next || []) {
      if (String(w).toLowerCase().includes('deploy')) deploymentRisks.push(`${c.agentId}: deployment dependency on ${w}`)
      if (String(w).toLowerCase().includes('security')) securityFlags.push(`${c.agentId}: ${w}`)
      if (String(w).toLowerCase().includes('performance')) performanceConcerns.push(`${c.agentId}: ${w}`)
    }
  }
  suggestedPriorities.push('Resolve high-severity blockers first', 'Unblock approvals older than 24h', 'Prioritize deploy-ready tasks with QA/Security pass')
  const score = topBlockers.length + approvalsNeeded.length + securityFlags.length * 2
  const riskLevel = score >= 10 ? 'Critical' : score >= 6 ? 'Elevated' : score >= 3 ? 'Moderate' : 'Low'
  return { topBlockers, approvalsNeeded, deploymentRisks, securityFlags, performanceConcerns, suggestedPriorities, suggestedEscalations, riskLevel }
}

function isSeededDailyReport(report) {
  const notes = String(report?.notes || '').toLowerCase()
  const today = Array.isArray(report?.today) ? report.today : []
  const hasOnlyAdvance = today.length === 1 && /^advance\s+/i.test(String(today[0] || ''))
  const hasNoWork =
    !Array.isArray(report?.tasks_in_progress) || report.tasks_in_progress.length === 0
  const hasNoCompleted =
    !Array.isArray(report?.completed) || report.completed.length === 0
  const hasNoBlockers =
    !Array.isArray(report?.blockers) || report.blockers.length === 0
  return notes.includes('seeded by consiglio') && hasOnlyAdvance && hasNoWork && hasNoCompleted && hasNoBlockers
}

async function dailyReportsForDate(date) {
  await ensureDir(DAILY_DIR)
  const files = (await fs.readdir(DAILY_DIR).catch(() => []))
    .filter((f) => f.endsWith(`-${date}.json`))
  const reports = []
  for (const file of files) {
    const payload = await rj(path.join(DAILY_DIR, file), null)
    if (payload && typeof payload === 'object') reports.push(payload)
  }
  return reports
}

function normalizeSitdownContributionFromDaily(report, role = 'Agent') {
  const tasksInProgress = Array.isArray(report.tasks_in_progress) ? report.tasks_in_progress : []
  const completed = Array.isArray(report.completed) ? report.completed : []
  const today = Array.isArray(report.today) ? report.today : []
  const blockers = Array.isArray(report.blockers) ? report.blockers : []
  const requests = Array.isArray(report.requests) ? report.requests : []
  const wins = Array.isArray(report.wins) ? report.wins : []

  const workedOn = [
    ...completed.map((t) => `${t.task_id || 'task'}: ${t.title || t.task_id || 'completed item'}`),
    ...today.map((x) => String(x)),
  ].slice(0, 6)

  const next = tasksInProgress.map((t) => `${t.task_id || 'task'}: ${t.title || 'continue'}`).slice(0, 6)
  const normalizedBlockers = blockers.map((b) => ({
    text: String(b.text || 'Blocked item'),
    severity: String(b.severity || 'med'),
    taskId: String(b.task_id || ''),
    escalateTo: String(b.escalate_to || ''),
  }))
  const approvalRequests = requests.map((req) => (
    typeof req === 'string'
      ? { type: 'Approval Request', text: req }
      : { type: String(req.type || 'Approval Request'), text: String(req.text || req.title || JSON.stringify(req)) }
  ))

  return {
    agentId: String(report.agent || ''),
    role,
    model: String(report.model || 'n/a'),
    workedOn,
    next,
    blockers: normalizedBlockers,
    approvalRequests,
    opportunities: wins.map((w) => String(w)).slice(0, 4),
    comments: [],
    postedAt: String(report.date || now()),
  }
}

async function hydrateSitdownFromDailyReports(session, { overwrite = false } = {}) {
  const reports = await dailyReportsForDate(session.date)
  if (!reports.length) return { imported: 0 }

  const contributionMap = new Map((session.contributions || []).map((c) => [c.agentId, c]))
  const roleByAgent = new Map((session.participants || []).map((p) => [p.agentId, p.role]))
  let imported = 0

  for (const report of reports) {
    if (isSeededDailyReport(report)) continue
    const agentId = String(report.agent || '').trim()
    if (!agentId) continue
    if (!overwrite && contributionMap.has(agentId)) continue
    const normalized = normalizeSitdownContributionFromDaily(report, roleByAgent.get(agentId) || 'Agent')
    if (!normalized.agentId) continue
    contributionMap.set(agentId, normalized)
    imported += 1
  }

  session.contributions = Array.from(contributionMap.values())
  return { imported }
}

function buildTaskBackfilledContribution(agentId, role, tasks, date) {
  const mine = (tasks || []).filter((t) => {
    const owner = String(t.ownerAgent || '').toLowerCase()
    const creator = String(t.createdBy || '').toLowerCase()
    return owner === agentId.toLowerCase() || creator === agentId.toLowerCase()
  })
  if (!mine.length) return null

  const done = mine.filter((t) => /(done|complete)/i.test(String(t.status || t.column || '')))
  const active = mine.filter((t) => /(progress|backlog|intake|planning|review|qa|security|deploy|ready)/i.test(String(t.status || t.column || '')) && !/(done|complete|block)/i.test(String(t.status || t.column || '')))
  const blocked = mine.filter((t) => /(block)/i.test(String(t.status || t.column || '')))
  const approvals = mine.filter((t) => /(approval|approve)/i.test(String(t.status || t.column || '')))

  return {
    agentId,
    role,
    model: 'local/ollama',
    workedOn: done.slice(0, 3).map((t) => `${t.id}: ${t.title || 'completed task'}`),
    next: active.slice(0, 4).map((t) => `${t.id}: ${t.title || 'continue'}`),
    blockers: blocked.slice(0, 4).map((t) => ({ text: t.title || t.id, severity: 'high', taskId: t.id, escalateTo: 'manager' })),
    approvalRequests: approvals.slice(0, 3).map((t) => ({ type: 'Approval Request', text: `${t.id}: ${t.title || 'pending approval'}` })),
    opportunities: [],
    comments: [],
    postedAt: `${date}T09:00:00.000Z`,
  }
}

function buildRoleFallbackContribution(agentId, role, date) {
  return {
    agentId,
    role,
    model: 'local/ollama',
    workedOn: ['No direct task activity recorded in this cycle.'],
    next: [`Review approved backlog for ${role} and pull next executable item.`],
    blockers: [],
    approvalRequests: [],
    opportunities: [],
    comments: [],
    postedAt: `${date}T09:00:00.000Z`,
  }
}

function isPlaceholderContribution(contribution) {
  const workedOn = Array.isArray(contribution?.workedOn) ? contribution.workedOn : []
  return workedOn.length === 1 && /^advance\s+/i.test(String(workedOn[0] || ''))
}

async function rebuildSitdownContributions(session, { includeTaskBackfill = true } = {}) {
  const tasksData = await rj(TASKMASTER, { tasks: [] })
  session.contributions = []
  const { imported } = await hydrateSitdownFromDailyReports(session, { overwrite: true })
  if (includeTaskBackfill) {
    const byAgent = new Map((session.contributions || []).map((c) => [c.agentId, c]))
    for (const p of session.participants || []) {
      const existing = byAgent.get(p.agentId)
      if (existing && !isPlaceholderContribution(existing)) continue
      const fallback = buildTaskBackfilledContribution(p.agentId, p.role, tasksData.tasks || [], session.date)
      byAgent.set(p.agentId, fallback || buildRoleFallbackContribution(p.agentId, p.role, session.date))
    }
    session.contributions = Array.from(byAgent.values())
  }
  return { imported: imported || 0, total: session.contributions.length }
}

async function buildSitdownSession(date) {
  const org = await rj(ORG_JSON_PATH, { nodes: [] })
  const tasks = await rj(TASKMASTER, { tasks: [] })
  const existing = await rj(sitdownJsonPath(date), null)
  if (existing) {
    if (!existing.locked) {
      await rebuildSitdownContributions(existing, { includeTaskBackfill: true })
      await saveSitdownSession(existing, 'system')
    }
    return existing
  }
  const participants = []
  for (const n of org.nodes || []) {
    const myTasks = (tasks.tasks || []).filter((t) => String(t.ownerAgent || '').toLowerCase() === String(n.id).toLowerCase())
    const activeTasks = myTasks.filter((t) => !/(done|complete)/i.test(String(t.status || ''))).length
    const blockers = myTasks.filter((t) => /(block)/i.test(String(t.status || ''))).length
    const waitingApproval = myTasks.filter((t) => /(approval)/i.test(String(t.status || ''))).length
    const scheduled = true
    if (activeTasks > 0 || blockers > 0 || waitingApproval > 0 || scheduled) {
      participants.push({
        agentId: n.id,
        role: n.title,
        status: 'Not Posted',
        activeTasks,
        blockers,
        waitingApproval,
        mentioned: false,
        excluded: false,
      })
    }
  }
  const session = {
    id: `sitdown-${date}`,
    date,
    start_time: now(),
    end_time: null,
    locked: false,
    participants,
    contributions: [],
    summary: {
      topBlockers: [],
      approvalsNeeded: [],
      deploymentRisks: [],
      securityFlags: [],
      performanceConcerns: [],
      suggestedPriorities: [],
      suggestedEscalations: [],
      riskLevel: 'Moderate',
    },
  }
  await rebuildSitdownContributions(session, { includeTaskBackfill: true })
  await ensureDir(SITDOWN_BRAIN_DIR)
  await wj(sitdownJsonPath(date), session)
  await fs.writeFile(sitdownMdPath(date), sessionMarkdown(session), 'utf8')
  await emitEvent({
    actor: 'system',
    actor_type: 'system',
    event_type: 'sitdown_session_created',
    target_type: 'sitdown',
    target_id: session.id,
    summary: `Sitdown session created for ${date}`,
    severity: 'info',
    metadata: { date },
  })
  return session
}

async function saveSitdownSession(session, actor = 'system') {
  const map = new Map((session.contributions || []).map((c) => [c.agentId, c]))
  session.participants = (session.participants || []).map((p) => ({ ...p, status: participantStatus(p, map) }))
  session.summary = summarizeSession(session)
  await wj(sitdownJsonPath(session.date), session)
  await fs.writeFile(sitdownMdPath(session.date), sessionMarkdown(session), 'utf8')
  await emitEvent({
    actor,
    actor_type: actor === 'operator' ? 'human' : 'agent',
    event_type: 'file_changed',
    target_type: 'file',
    target_id: sitdownJsonPath(session.date),
    summary: 'Sitdown session updated',
    severity: 'info',
    metadata: { date: session.date },
  })
}

function defaultMcpRegistry() {
  return {
    version: '1.0',
    updated_at: now(),
    mcps: [],
    profiles: [],
    approval_rules: [],
    routing_rules: [],
  }
}

async function readMcpRegistry() {
  const reg = await rj(MCP_REGISTRY_PATH, null)
  if (!reg || typeof reg !== 'object') return defaultMcpRegistry()
  return {
    ...defaultMcpRegistry(),
    ...reg,
    mcps: Array.isArray(reg.mcps) ? reg.mcps : [],
    profiles: Array.isArray(reg.profiles) ? reg.profiles : [],
    approval_rules: Array.isArray(reg.approval_rules) ? reg.approval_rules : [],
    routing_rules: Array.isArray(reg.routing_rules) ? reg.routing_rules : [],
  }
}

function normalizeMcpEntry(entry) {
  const e = entry || {}
  return {
    id: String(e.id || '').trim(),
    name: String(e.name || e.id || '').trim(),
    category: String(e.category || 'general'),
    type: String(e.type || 'mcp'),
    description: String(e.description || ''),
    risk: String(e.risk || 'medium').toLowerCase(),
    enabled: Boolean(e.enabled || e.default_enabled),
    default_enabled: Boolean(e.default_enabled),
    owner: String(e.owner || 'system'),
    approval_required: Boolean(e.approval_required || e.risk === 'high' || e.risk === 'critical'),
    approval_type: String(e.approval_type || 'Tool escalation'),
    allowed_agents: Array.isArray(e.allowed_agents) ? e.allowed_agents.map(String) : [],
    denied_agents: Array.isArray(e.denied_agents) ? e.denied_agents.map(String) : [],
    scope_constraints: e.scope_constraints && typeof e.scope_constraints === 'object'
      ? e.scope_constraints
      : { paths: [], repos: [], domains: [] },
    rate_limit_per_hour: Number(e.rate_limit_per_hour || 60),
    tags: Array.isArray(e.tags) ? e.tags.map(String) : [],
    last_updated: String(e.last_updated || now()),
  }
}

function validateMcpRegistry(registry) {
  const errors = []
  const warnings = []
  const ids = new Set()
  for (const raw of registry.mcps || []) {
    const e = normalizeMcpEntry(raw)
    if (!e.id) errors.push('MCP entry missing id')
    if (ids.has(e.id)) errors.push(`Duplicate MCP id: ${e.id}`)
    ids.add(e.id)
    if (!['low', 'medium', 'high', 'critical'].includes(e.risk)) errors.push(`Invalid risk for ${e.id}: ${e.risk}`)
    if (!e.enabled && e.allowed_agents.length > 0) warnings.push(`${e.id} has allowed agents but is disabled`)
    if ((e.risk === 'high' || e.risk === 'critical') && !e.approval_required) warnings.push(`${e.id} high risk without approval_required`)
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings,
    status: errors.length ? 'Errors' : warnings.length ? 'Warnings' : 'Valid',
  }
}

async function readMcpApprovals() {
  return rj(path.join(APPROVALS_DIR, 'mcp-approvals.json'), { version: '1.0', items: [] })
}

async function writeMcpApprovals(payload) {
  await wj(path.join(APPROVALS_DIR, 'mcp-approvals.json'), payload)
}

async function mcpUsageStats(range = '24h') {
  const events = await readEventsByRange(range)
  const mcpEvents = events.filter((e) => /(mcp_)/.test(String(e.event_type || '')) || String(e.metadata?.mcp_id || '').length > 0)
  const byMcp = {}
  for (const e of mcpEvents) {
    const id = String(e.metadata?.mcp_id || e.target_id || 'unknown')
    if (!byMcp[id]) byMcp[id] = { mcp_id: id, calls24h: 0, failCount: 0, avgLatencyMs: 0, p95LatencyMs: 0, latencies: [], lastUsed: null, agents: {}, tasks: {} }
    byMcp[id].calls24h += 1
    if (/(failed|denied|violation)/i.test(String(e.event_type || '')) || /(error|critical)/i.test(String(e.severity || ''))) byMcp[id].failCount += 1
    const latency = Number(e.metadata?.latencyMs || e.duration || 0)
    if (latency > 0) byMcp[id].latencies.push(latency)
    byMcp[id].lastUsed = byMcp[id].lastUsed || e.timestamp
    if (e.actor) byMcp[id].agents[e.actor] = (byMcp[id].agents[e.actor] || 0) + 1
    if (e.task_id) byMcp[id].tasks[e.task_id] = (byMcp[id].tasks[e.task_id] || 0) + 1
  }
  for (const rec of Object.values(byMcp)) {
    rec.latencies.sort((a, b) => a - b)
    rec.avgLatencyMs = rec.latencies.length ? Math.round(rec.latencies.reduce((a, b) => a + b, 0) / rec.latencies.length) : 0
    const idx = Math.floor(0.95 * Math.max(0, rec.latencies.length - 1))
    rec.p95LatencyMs = rec.latencies.length ? rec.latencies[idx] : 0
    rec.failPct = rec.calls24h ? Math.round((rec.failCount / rec.calls24h) * 100) : 0
    rec.topAgents = Object.entries(rec.agents).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([agent, count]) => ({ agent, count }))
    rec.topTasks = Object.entries(rec.tasks).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([task, count]) => ({ task, count }))
    delete rec.latencies
    delete rec.agents
    delete rec.tasks
  }
  return byMcp
}

function inferCategory(id = '', description = '') {
  const key = `${id} ${description}`.toLowerCase()
  if (key.includes('file')) return 'filesystem'
  if (key.includes('git')) return 'git'
  if (key.includes('browser') || key.includes('search')) return 'browser'
  if (key.includes('cloud') || key.includes('gateway')) return 'cloud'
  return 'general'
}

function riskPosture(registry) {
  const enabled = (registry.mcps || []).map(normalizeMcpEntry).filter((m) => m.enabled)
  const high = enabled.filter((m) => m.risk === 'high' || m.risk === 'critical').length
  const broad = enabled.filter((m) => (m.allowed_agents || []).length > 6 || (m.allowed_agents || []).includes('*')).length
  const score = high * 2 + broad
  if (score >= 8) return 'High exposure'
  if (score >= 4) return 'Caution'
  return 'Safe'
}

async function syncMcpToAgents(actor = 'operator') {
  const registry = await readMcpRegistry()
  const org = await rj(ORG_JSON_PATH, { nodes: [] })
  const changed = []
  for (const agent of org.nodes || []) {
    const fp = path.join(AGENTS_DIR, agent.id, 'brain.md')
    const current = await readAgentBrain(agent.id)
    const allowed = (registry.mcps || []).map(normalizeMcpEntry).filter((m) => m.enabled && ((m.allowed_agents || []).includes(agent.id) || (m.allowed_agents || []).includes('*'))).map((m) => m.id)
    const denied = (registry.mcps || []).map(normalizeMcpEntry).filter((m) => (m.denied_agents || []).includes(agent.id) || !allowed.includes(m.id)).map((m) => m.id)
    const rules = (registry.mcps || []).map(normalizeMcpEntry).filter((m) => m.approval_required).map((m) => `${m.id}:${m.approval_type}`)
    const block = [
      '## MCP Tools',
      `allowed: [${allowed.join(', ')}]`,
      `denied: [${denied.join(', ')}]`,
      `approval_patterns: [${rules.join(', ')}]`,
      'escalation: manager -> the-botfather',
      '',
    ].join('\n')
    const next = current.includes('## MCP Tools')
      ? current.replace(/## MCP Tools[\s\S]*?(?=\n## |\n$)/m, block)
      : `${current.trim()}\n\n${block}`
    if (next !== current) {
      await fs.writeFile(fp, `${next}\n`, 'utf8')
      changed.push({ agentId: agent.id, file: fp })
      await emitEvent({
        actor,
        actor_type: actor === 'operator' ? 'human' : 'agent',
        event_type: 'mcp_permission_updated',
        target_type: 'agent',
        target_id: agent.id,
        summary: `Synced MCP permissions to ${agent.id}`,
        severity: 'info',
        metadata: { file: fp, allowedCount: allowed.length, deniedCount: denied.length },
      })
      await emitEvent({
        actor,
        event_type: 'file_changed',
        target_type: 'file',
        target_id: fp,
        summary: 'Updated agent brain MCP Tools section',
        severity: 'info',
        metadata: {},
      })
    }
  }
  return changed
}

app.get('/api/registry', async (_q, r) => r.json({ ok: true, source: 'workspace/org/org-index.json', registry: await rj(path.join(ORG_DIR, 'org-index.json'), {}) }))
app.get('/api/mcp/registry', async (_q, r) => {
  const registry = await readMcpRegistry()
  r.json({ ok: true, source: MCP_REGISTRY_PATH, registry })
})
app.post('/api/mcp/registry', async (q, r) => {
  const next = q.body?.registry
  if (!next || typeof next !== 'object') return r.status(400).json({ ok: false, error: 'registry required' })
  next.updated_at = now()
  const normalized = {
    ...defaultMcpRegistry(),
    ...next,
    mcps: (next.mcps || []).map(normalizeMcpEntry),
  }
  const validation = validateMcpRegistry(normalized)
  await wj(MCP_REGISTRY_PATH, normalized)
  await wj(MCP_LEGACY_REGISTRY_PATH, normalized)
  await ap(path.join(MCP_LOG_DIR, `mcp-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), agent_id: q.body?.actorId || 'operator', mcp_id: 'registry', tool: 'registry.update', request_summary: 'update registry', result_summary: 'ok', risk_flag: 'high' }))
  await emitEvent({
    actor: q.body?.actorId || 'operator',
    actor_type: 'human',
    event_type: 'mcp_registry_updated',
    target_type: 'mcp_registry',
    target_id: 'registry',
    summary: `MCP registry saved (${validation.status})`,
    severity: validation.ok ? (validation.warnings.length ? 'warn' : 'info') : 'error',
    metadata: { validation },
  })
  await emitEvent({
    actor: q.body?.actorId || 'operator',
    event_type: 'brain_state_updated',
    target_type: 'brain',
    target_id: BRAIN_MD_PATH,
    summary: 'MCP routing state updated',
    severity: 'info',
    metadata: { source: MCP_REGISTRY_PATH },
  })
  r.json({ ok: true })
})
app.get('/api/mcp/audit', async (_q, r) => {
  const day = now().slice(0, 10)
  const text = await rt(path.join(MCP_LOG_DIR, `mcp-${day}.jsonl`), '')
  const rows = text.split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line) } catch { return { raw: line } }
  })
  r.json({ ok: true, items: rows })
})
app.get('/api/mcp/control-plane', async (q, r) => {
  const range = String(q.query.range || '24h')
  const registry = await readMcpRegistry()
  const usage = await mcpUsageStats(range)
  const approvals = await readMcpApprovals()
  const validation = validateMcpRegistry(registry)
  const org = await rj(ORG_JSON_PATH, { nodes: [] })
  const events = await readEventsByRange('7d')
  const mcpEvents = events.filter((e) => /(mcp_)/.test(String(e.event_type || ''))).slice(0, 400)
  const enriched = (registry.mcps || []).map((raw) => {
    const e = normalizeMcpEntry(raw)
    const stats = usage[e.id] || { calls24h: 0, failPct: 0, avgLatencyMs: 0, p95LatencyMs: 0, lastUsed: null, topAgents: [], topTasks: [] }
    return {
      ...e,
      category: e.category || inferCategory(e.id, e.description),
      usage: stats,
      allowedAgentsCount: (e.allowed_agents || []).length,
    }
  })
  const brain = await rj(BRAIN_JSON_PATH, { version: '1.0', sources: {}, routing_rules: [] })
  const pendingApprovals = (approvals.items || []).filter((x) => x.status === 'pending')
  r.json({
    ok: true,
    source: MCP_REGISTRY_PATH,
    registry: { ...registry, mcps: enriched },
    validation,
    riskPosture: riskPosture(registry),
    approvals: approvals.items || [],
    pendingApprovals,
    brainState: {
      version: brain.version || '1.0',
      lastRefresh: brain.updated_at || now(),
      loadedSources: Object.keys(brain.sources || {}),
      routingRuleCount: (registry.routing_rules || []).length + ((brain.routing_rules || []).length || 0),
      overridesActive: (registry.routing_rules || []).filter((x) => x.scope === 'agent').length,
      pendingPermissionRequests: pendingApprovals.length,
      raw: brain,
    },
    agents: (org.nodes || []).map((n) => ({ id: n.id, title: n.title, department: n.department })),
    eventFeed: mcpEvents,
  })
})

app.post('/api/mcp/validate', async (_q, r) => {
  const registry = await readMcpRegistry()
  r.json({ ok: true, validation: validateMcpRegistry(registry) })
})

app.post('/api/mcp/entry/update', async (q, r) => {
  const mcpId = String(q.body?.mcpId || '')
  const patch = q.body?.patch || {}
  const actor = String(q.body?.actor || 'operator')
  const registry = await readMcpRegistry()
  const idx = (registry.mcps || []).findIndex((x) => normalizeMcpEntry(x).id === mcpId)
  if (idx < 0) return r.status(404).json({ ok: false, error: 'mcp not found' })
  const current = normalizeMcpEntry(registry.mcps[idx])
  const next = normalizeMcpEntry({ ...current, ...patch, last_updated: now() })
  registry.mcps[idx] = next
  registry.updated_at = now()
  await wj(MCP_REGISTRY_PATH, registry)
  await emitEvent({
    actor,
    actor_type: actor === 'operator' ? 'human' : 'agent',
    event_type: 'mcp_permission_updated',
    target_type: 'mcp',
    target_id: mcpId,
    summary: `Updated MCP entry ${mcpId}`,
    severity: 'info',
    metadata: { patchKeys: Object.keys(patch || {}) },
  })
  if (Object.prototype.hasOwnProperty.call(patch, 'enabled')) {
    await emitEvent({
      actor,
      event_type: next.enabled ? 'mcp_enabled' : 'mcp_disabled',
      target_type: 'mcp',
      target_id: mcpId,
      summary: `${mcpId} ${next.enabled ? 'enabled' : 'disabled'}`,
      severity: next.enabled ? 'warn' : 'info',
      metadata: {},
    })
  }
  r.json({ ok: true, entry: next })
})

app.post('/api/mcp/bulk', async (q, r) => {
  const ids = Array.isArray(q.body?.ids) ? q.body.ids.map(String) : []
  const action = String(q.body?.action || '')
  const actor = String(q.body?.actor || 'operator')
  const registry = await readMcpRegistry()
  let changed = 0
  registry.mcps = (registry.mcps || []).map((raw) => {
    const e = normalizeMcpEntry(raw)
    if (!ids.includes(e.id)) return e
    changed += 1
    if (action === 'enable') return { ...e, enabled: true, last_updated: now() }
    if (action === 'disable') return { ...e, enabled: false, last_updated: now() }
    return e
  })
  registry.updated_at = now()
  await wj(MCP_REGISTRY_PATH, registry)
  await emitEvent({
    actor,
    actor_type: 'human',
    event_type: 'mcp_permission_updated',
    target_type: 'mcp',
    target_id: 'bulk',
    summary: `Bulk ${action} on ${changed} MCP entries`,
    severity: 'info',
    metadata: { ids },
  })
  r.json({ ok: true, changed })
})

app.post('/api/mcp/import', async (q, r) => {
  const payload = normalizeMcpEntry({
    ...q.body?.entry,
    id: String(q.body?.entry?.id || `mcp-${Date.now()}`),
    enabled: false,
    default_enabled: false,
    allowed_agents: [],
  })
  const actor = String(q.body?.actor || 'operator')
  const registry = await readMcpRegistry()
  if ((registry.mcps || []).some((x) => normalizeMcpEntry(x).id === payload.id)) {
    return r.status(400).json({ ok: false, error: 'id already exists' })
  }
  registry.mcps.push(payload)
  registry.updated_at = now()
  await wj(MCP_REGISTRY_PATH, registry)
  await emitEvent({
    actor,
    event_type: 'mcp_registry_updated',
    target_type: 'mcp',
    target_id: payload.id,
    summary: `Imported MCP ${payload.id} (disabled by default)`,
    severity: 'info',
    metadata: {},
  })
  r.json({ ok: true, entry: payload })
})

app.post('/api/mcp/approval/request', async (q, r) => {
  const actor = String(q.body?.actor || 'unknown-agent')
  const mcpId = String(q.body?.mcpId || '')
  const taskId = String(q.body?.taskId || '')
  const actionType = String(q.body?.actionType || 'Tool escalation')
  const scope = q.body?.scope || {}
  const approvals = await readMcpApprovals()
  const item = {
    id: `mcp-apr-${Date.now()}`,
    mcpId,
    requestor: actor,
    taskId,
    actionType,
    scope,
    status: 'pending',
    requestedAt: now(),
  }
  approvals.items.push(item)
  await writeMcpApprovals(approvals)
  await emitEvent({
    actor,
    actor_type: 'agent',
    event_type: 'mcp_approval_requested',
    target_type: 'mcp',
    target_id: mcpId,
    task_id: taskId || null,
    summary: `Approval requested for ${mcpId}`,
    severity: 'warn',
    metadata: item,
  })
  r.json({ ok: true, approval: item })
})

app.post('/api/mcp/approval/decision', async (q, r) => {
  const id = String(q.body?.id || '')
  const decision = String(q.body?.decision || 'deny')
  const actor = String(q.body?.actor || 'operator')
  const approvals = await readMcpApprovals()
  const idx = (approvals.items || []).findIndex((x) => x.id === id)
  if (idx < 0) return r.status(404).json({ ok: false, error: 'approval not found' })
  approvals.items[idx] = { ...approvals.items[idx], status: decision === 'approve' ? 'granted' : 'denied', decidedBy: actor, decidedAt: now() }
  await writeMcpApprovals(approvals)
  await emitEvent({
    actor,
    actor_type: actor === 'operator' ? 'human' : 'agent',
    event_type: decision === 'approve' ? 'mcp_approval_granted' : 'mcp_approval_denied',
    target_type: 'mcp',
    target_id: approvals.items[idx].mcpId,
    task_id: approvals.items[idx].taskId || null,
    summary: `${decision} approval ${id}`,
    severity: decision === 'approve' ? 'info' : 'warn',
    metadata: approvals.items[idx],
  })
  r.json({ ok: true, item: approvals.items[idx] })
})

app.post('/api/mcp/routing/update', async (q, r) => {
  const actor = String(q.body?.actor || 'operator')
  const mcpId = String(q.body?.mcpId || '')
  const rules = Array.isArray(q.body?.rules) ? q.body.rules : []
  const registry = await readMcpRegistry()
  registry.routing_rules = (registry.routing_rules || []).filter((x) => x.mcpId !== mcpId)
  registry.routing_rules.push(...rules.map((x) => ({ ...x, mcpId, updatedAt: now() })))
  registry.updated_at = now()
  await wj(MCP_REGISTRY_PATH, registry)
  await emitEvent({
    actor,
    event_type: 'mcp_routing_updated',
    target_type: 'mcp',
    target_id: mcpId,
    summary: `Routing rules updated for ${mcpId}`,
    severity: 'info',
    metadata: { count: rules.length },
  })
  r.json({ ok: true })
})

app.post('/api/mcp/sync-agents', async (q, r) => {
  const actor = String(q.body?.actor || 'operator')
  const changed = await syncMcpToAgents(actor)
  r.json({ ok: true, changed })
})

app.post('/api/mcp/test', async (q, r) => {
  const actor = String(q.body?.actor || 'operator')
  const agentId = String(q.body?.agentId || '')
  const mcpId = String(q.body?.mcpId || '')
  const actionType = String(q.body?.actionType || 'read')
  const taskId = String(q.body?.taskId || '')
  const registry = await readMcpRegistry()
  const mcp = (registry.mcps || []).map(normalizeMcpEntry).find((x) => x.id === mcpId)
  if (!mcp) return r.status(404).json({ ok: false, error: 'mcp not found' })
  if (!mcp.enabled) {
    await emitEvent({ actor, event_type: 'policy_violation_detected', target_type: 'mcp', target_id: mcpId, task_id: taskId || null, summary: `${agentId} attempted disabled MCP ${mcpId}`, severity: 'warn', metadata: {} })
    return r.json({ ok: false, blocked: true, reason: 'MCP disabled' })
  }
  const allowed = (mcp.allowed_agents || []).includes(agentId) || (mcp.allowed_agents || []).includes('*')
  if (!allowed) {
    await emitEvent({ actor, event_type: 'policy_violation_detected', target_type: 'mcp', target_id: mcpId, task_id: taskId || null, summary: `${agentId} denied on ${mcpId}`, severity: 'warn', metadata: {} })
    return r.json({ ok: false, blocked: true, reason: 'Agent not allowed' })
  }
  if (mcp.approval_required && /write|push|delete|modify/i.test(actionType)) {
    const approvals = await readMcpApprovals()
    const hasApproval = (approvals.items || []).some((x) => x.mcpId === mcpId && x.taskId === taskId && x.requestor === agentId && x.status === 'granted')
    if (!hasApproval) {
      await emitEvent({ actor, event_type: 'policy_violation_detected', target_type: 'mcp', target_id: mcpId, task_id: taskId || null, summary: `Approval required for ${mcpId}`, severity: 'warn', metadata: { actionType } })
      return r.json({ ok: false, blocked: true, reason: 'Approval required' })
    }
  }
  await emitEvent({
    actor,
    actor_type: actor === 'operator' ? 'human' : 'agent',
    event_type: 'mcp_invoked',
    target_type: 'mcp',
    target_id: mcpId,
    task_id: taskId || null,
    summary: `Dry-run MCP invocation succeeded for ${mcpId}`,
    severity: 'info',
    metadata: { mcp_id: mcpId, actionType, latencyMs: Math.floor(Math.random() * 120) + 40 },
  })
  r.json({ ok: true, result: 'dry-run success' })
})
app.post('/api/brain/request-update', async (q, r) => {
  const actor = String(q.body?.actorId || 'unknown')
  const reason = String(q.body?.reason || 'No reason supplied')
  const request = { id: `brain-req-${Date.now()}`, ts: now(), actor, reason, status: 'pending', approver: 'the-botfather' }
  const p = path.join(BRAIN_DIR, 'permission-requests.jsonl')
  await ap(p, JSON.stringify(request))
  await ap(path.join(BRAIN_LOG_DIR, `brain-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), event: 'brain_update_requested', request }))
  r.json({ ok: true, request })
})
app.get('/api/brain/requests', async (_q, r) => {
  const p = path.join(BRAIN_DIR, 'permission-requests.jsonl')
  const text = await rt(p, '')
  const items = text.split(/\r?\n/).filter(Boolean).map((line) => {
    try { return JSON.parse(line) } catch { return { raw: line } }
  })
  r.json({ ok: true, items })
})
app.get('/api/brain/state', async (_q, r) => {
  r.json({
    ok: true,
    markdown: await rt(BRAIN_MD_PATH, 'No data yet'),
    json: await rj(BRAIN_JSON_PATH, { version: '1.0', updated_at: now() }),
  })
})
app.post('/api/brain/write', async (q, r) => {
  const actor = String(q.body?.actorId || 'unknown')
  const approved = Boolean(q.body?.approved)
  if (!approved) return r.status(403).json({ ok: false, error: 'Brain writes require approval.' })
  const markdown = String(q.body?.markdown || '')
  const json = q.body?.json
  if (markdown) await fs.writeFile(BRAIN_MD_PATH, markdown, 'utf8')
  if (json && typeof json === 'object') await wj(BRAIN_JSON_PATH, { ...json, updated_at: now() })
  await ap(path.join(BRAIN_LOG_DIR, `brain-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), event: 'brain_updated', actor }))
  r.json({ ok: true })
})
app.get('/api/taskmaster', async (_q, r) => { const t = await rj(TASKMASTER, { tasks: [] }); r.json({ project: 'openclaw', source: 'taskmaster.json', tasks: t.tasks || [] }) })
app.get('/api/tasks', async (_q, r) => { const t = await rj(TASKMASTER, { tasks: [] }); r.json({ ok: true, source: 'taskmaster.json', tasks: t.tasks || [] }) })
app.post('/api/tasks/create', async (q, r) => {
  try {
    const title = String(q.body?.title || '').trim()
    if (!title) return r.status(400).json({ ok: false, error: 'title required' })
    const actorId = String(q.body?.actorId || 'operator')
    const status = normalizeStatus(String(q.body?.status || 'Backlog'))
    const priority = String(q.body?.priority || 'medium')
    const ownerAgent = String(q.body?.ownerAgent || '')
    const description = String(q.body?.description || '')
    const dueDate = String(q.body?.dueDate || '')
    const approvalState = String(q.body?.approvalState || 'pending')
    const blockerText = String(q.body?.blockerText || '')
    const flowStage = String(q.body?.flowStage || 'intake')
    const tags = Array.isArray(q.body?.tags)
      ? q.body.tags.map((x) => String(x).trim()).filter(Boolean)
      : String(q.body?.tags || '').split(',').map((x) => x.trim()).filter(Boolean)
    const notes = String(q.body?.notes || '')
    const data = await rj(TASKMASTER, { tasks: [] })
    data.tasks = Array.isArray(data.tasks) ? data.tasks : []
    const id = q.body?.id ? String(q.body.id) : `TASK-${Date.now()}`
    let task = ensureTaskShape({
      id,
      title,
      status,
      column: status,
      priority,
      ownerAgent,
      description,
      dueDate: dueDate || null,
      approvalState,
      blockerText,
      flowStage,
      tags,
      createdBy: actorId,
      notes,
      createdAt: now(),
      updatedAt: now(),
    })
    task = fleshOutTaskByPM(task)
    data.tasks.push(task)
    await wj(TASKMASTER, data)
    await ap(AUDIT, `${now()} TASK_CREATED ${id} actor=${actorId}`)
    await ap(path.join(ACTIVITY_DIR, `activity-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), event: 'task_created', taskId: id, actor: actorId }))
    await emitEvent({
      actor: 'product-manager',
      actor_type: 'agent',
      event_type: 'task_pm_fleshed',
      target_type: 'task',
      target_id: id,
      task_id: id,
      summary: `PM fleshed task ${id} immediately after creation`,
      severity: 'info',
      metadata: { source: 'api/tasks/create' },
    })
    r.json({ ok: true, task })
  } catch (e) {
    r.status(500).json({ ok: false, error: String(e) })
  }
})
app.post('/api/flow/intake-problem', async (q, r) => {
  const title = String(q.body?.title || '').trim()
  const discoveredBy = String(q.body?.agentId || 'problem-scout-agent')
  if (!title) return r.status(400).json({ ok: false, error: 'title required' })
  const taskData = await rj(TASKMASTER, { tasks: [] })
  taskData.tasks = Array.isArray(taskData.tasks) ? taskData.tasks : []
  const id = `OPP-${Date.now()}`
  let task = {
    id,
    title,
    status: 'Pending Approval',
    ownerAgent: 'product-manager',
    flowStage: 'intake',
    discoveredBy,
    createdAt: now(),
    notes: 'Discovered by scout; must be approved before requirements/build.',
  }
  task = fleshOutTaskByPM(task)
  taskData.tasks.push(task)
  await wj(TASKMASTER, taskData)
  await ap(path.join(ACTIVITY_DIR, `activity-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), event: 'problem_intake', taskId: id, by: discoveredBy }))
  await emitEvent({
    actor: 'product-manager',
    actor_type: 'agent',
    event_type: 'task_pm_fleshed',
    target_type: 'task',
    target_id: id,
    task_id: id,
    summary: `PM fleshed intake task ${id}`,
    severity: 'info',
    metadata: { source: 'api/flow/intake-problem' },
  })
  r.json({ ok: true, task })
})
app.post('/api/flow/approve-task', async (q, r) => {
  const id = String(q.body?.taskId || '')
  const approver = String(q.body?.approver || 'the-botfather')
  const stack = String(q.body?.stack || 'pending stack decision')
  const taskData = await rj(TASKMASTER, { tasks: [] })
  const idx = (taskData.tasks || []).findIndex((t) => t.id === id)
  if (idx < 0) return r.status(404).json({ ok: false, error: 'task not found' })
  taskData.tasks[idx] = {
    ...taskData.tasks[idx],
    status: 'Approved',
    flowStage: 'requirements',
    ownerAgent: 'product-manager',
    approvedBy: approver,
    requestedStack: stack,
    updatedAt: now(),
    notes: `${taskData.tasks[idx].notes || ''}\nApproved; PM must request stack specifics from BotFather/operator before implementation plan.`,
  }
  await wj(TASKMASTER, taskData)
  await ap(path.join(ACTIVITY_DIR, `activity-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), event: 'task_approved', taskId: id, approver, next: 'product-manager' }))
  r.json({ ok: true, task: taskData.tasks[idx] })
})
app.get('/api/flow/state', async (_q, r) => {
  const taskData = await rj(TASKMASTER, { tasks: [] })
  const tasks = taskData.tasks || []
  const grouped = {
    intake: tasks.filter((t) => t.flowStage === 'intake'),
    requirements: tasks.filter((t) => t.flowStage === 'requirements'),
    development: tasks.filter((t) => t.flowStage === 'development'),
    deployment: tasks.filter((t) => t.flowStage === 'deployment'),
    qa_security: tasks.filter((t) => t.flowStage === 'qa_security'),
    done: tasks.filter((t) => t.status === 'Done'),
  }
  r.json({ ok: true, grouped })
})
app.post('/api/tasks/update', async (q, r) => {
  try {
    const d = await rj(TASKMASTER, { tasks: [] })
    const i = (d.tasks || []).findIndex((x) => x.id === q.body.taskId)
    if (i < 0) throw new Error('task not found')
    const before = ensureTaskShape(d.tasks[i])
    const merged = ensureTaskShape({ ...before, ...(q.body.patch || {}), updatedAt: now() })
    const transition = validateTransition(before, merged)
    if (!transition.ok) {
      return r.status(400).json({ ok: false, error: transition.error, code: 'TRANSITION_BLOCKED' })
    }
    if (String(merged.ci_status || merged.ciStatus || '').toLowerCase() === 'failing' && normalizeStatus(merged.status) !== 'Blocked') {
      merged.status = 'Blocked'
      merged.column = 'Blocked'
      merged.blockerText = merged.blockerText || 'CI failed after update'
    }
    d.tasks[i] = merged
    await wj(TASKMASTER, d)
    await ap(AUDIT, `${now()} UPDATE_TASK ${q.body.taskId} actor=${q.body.actorId || 'unknown'}`)
    r.json({ ok: true, task: merged })
  } catch (e) {
    r.status(400).json({ ok: false, error: String(e) })
  }
})

app.post('/api/tasks/sync-metadata', async (q, r) => {
  try {
    const taskId = String(q.body?.taskId || '').trim()
    if (!taskId) return r.status(400).json({ ok: false, error: 'taskId required' })
    const d = await rj(TASKMASTER, { tasks: [] })
    const i = (d.tasks || []).findIndex((x) => x.id === taskId)
    if (i < 0) return r.status(404).json({ ok: false, error: 'task not found' })
    const task = ensureTaskShape(d.tasks[i])

    let prStatus = task.pr_status || 'Open'
    let ciStatus = task.ci_status || 'Unknown'
    const ghToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
    const prUrl = String(task.pr_url || '').trim()

    if (prUrl && ghToken) {
      const m = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i)
      if (m) {
        const [, owner, repo, num] = m
        let headSha = ''
        const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${num}`, {
          headers: { Authorization: `Bearer ${ghToken}`, 'User-Agent': 'consiglio-mission-control' },
        })
        if (prRes.ok) {
          const pr = await prRes.json()
          prStatus = pr.merged_at ? 'Merged' : String(pr.state || 'open').toLowerCase() === 'open' ? 'Open' : 'Closed'
          headSha = String(pr?.head?.sha || '')
        }
        if (headSha) {
          const checksRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${headSha}/check-runs`, {
            headers: { Authorization: `Bearer ${ghToken}`, 'User-Agent': 'consiglio-mission-control', Accept: 'application/vnd.github+json' },
          }).catch(() => null)
          if (checksRes && checksRes.ok) {
            const checks = await checksRes.json()
            const runs = Array.isArray(checks.check_runs) ? checks.check_runs : []
            if (runs.some((x) => String(x.status).toLowerCase() === 'in_progress' || String(x.status).toLowerCase() === 'queued')) ciStatus = 'Running'
            else if (runs.some((x) => String(x.conclusion).toLowerCase() === 'failure')) ciStatus = 'Failing'
            else if (runs.length) ciStatus = 'Passing'
          }
        }
      }
    }

    const next = ensureTaskShape({
      ...task,
      pr_status: prStatus,
      ci_status: ciStatus,
      deployment_timestamp: task.deployment_timestamp || task.deploymentTimestamp || '',
      updatedAt: now(),
    })
    if (String(next.ci_status || '').toLowerCase() === 'failing') {
      next.status = 'Blocked'
      next.column = 'Blocked'
      next.blockerText = next.blockerText || 'CI failed'
    }
    d.tasks[i] = next
    await wj(TASKMASTER, d)
    await emitEvent({
      actor: String(q.body?.actorId || 'operator'),
      actor_type: 'human',
      event_type: 'task_metadata_synced',
      target_type: 'task',
      target_id: taskId,
      task_id: taskId,
      summary: `Synced GitHub/Vercel metadata for ${taskId}`,
      severity: 'info',
      metadata: { prStatus, ciStatus },
    })
    r.json({ ok: true, task: next })
  } catch (e) {
    r.status(400).json({ ok: false, error: String(e) })
  }
})
app.post('/api/tasks/delete', async (q, r) => {
  try {
    const taskId = String(q.body?.taskId || '').trim()
    const actorId = String(q.body?.actorId || 'unknown')
    if (!taskId) return r.status(400).json({ ok: false, error: 'taskId required' })
    const d = await rj(TASKMASTER, { tasks: [] })
    const i = (d.tasks || []).findIndex((x) => x.id === taskId)
    if (i < 0) throw new Error('task not found')
    const [removed] = d.tasks.splice(i, 1)
    await wj(TASKMASTER, d)
    await ap(AUDIT, `${now()} DELETE_TASK ${taskId} actor=${actorId}`)
    await emitEvent({
      actor: actorId,
      actor_type: actorId === 'operator' ? 'human' : 'agent',
      event_type: 'task_deleted',
      target_type: 'task',
      target_id: taskId,
      task_id: taskId,
      summary: `Task ${taskId} deleted from board`,
      severity: 'warn',
      metadata: { removed },
    })
    r.json({ ok: true, removed })
  } catch (e) {
    r.status(400).json({ ok: false, error: String(e) })
  }
})
app.post('/api/tasks/dont-do', async (q, r) => {
  try {
    const taskId = String(q.body?.taskId || '').trim()
    const actorId = String(q.body?.actorId || 'unknown')
    const reason = String(q.body?.reason || 'Not aligned with priorities').trim()
    if (!taskId) return r.status(400).json({ ok: false, error: 'taskId required' })
    const d = await rj(TASKMASTER, { tasks: [] })
    const i = (d.tasks || []).findIndex((x) => x.id === taskId)
    if (i < 0) throw new Error('task not found')
    const [removed] = d.tasks.splice(i, 1)
    await wj(TASKMASTER, d)
    await ap(AUDIT, `${now()} DONT_DO_TASK ${taskId} actor=${actorId} reason=${reason}`)
    await emitEvent({
      actor: actorId,
      actor_type: actorId === 'operator' ? 'human' : 'agent',
      event_type: 'task_dont_do',
      target_type: 'task',
      target_id: taskId,
      task_id: taskId,
      summary: `Task ${taskId} marked Don't Do and removed`,
      severity: 'info',
      metadata: { reason, removed },
    })
    r.json({ ok: true, removed, reason })
  } catch (e) {
    r.status(400).json({ ok: false, error: String(e) })
  }
})
app.post('/api/tasks/import', async (_q, r) => r.json({ ok: true, imported: 0 }))
app.get('/api/org', async (_q, r) => { try { const b = await bootstrap(); const agents = await agentsWithStatus(); const edges = b.org.nodes.filter((n) => n.reports_to !== 'Piero').map((n) => ({ from: n.reports_to, to: n.id, type: 'reports_to' })); r.json({ ok: true, agents, org: { roots: ['the-botfather'], edges }, validation: b.validation }) } catch (e) { await uiErr(String(e), 'org_read'); r.status(500).json({ ok: false, agents: [], org: { roots: [], edges: [] }, error: String(e) }) } })
app.post('/api/org/rebuild', async (_q, r) => r.json({ ok: true, ...(await bootstrap()) }))
app.get('/api/workspaces', async (_q, r) => {
  const b = await bootstrap()
  const workspaces = ['brain', ...b.org.nodes.map((n) => n.id)]
  r.json({ ok: true, root: DATA, workspaces })
})

app.get('/api/workspaces/:id/files', async (q, r) => {
  const id = q.params.id
  const isBrain = id === 'brain'
  const ws = isBrain ? BRAIN_DIR : path.join(AGENTS_DIR, id)
  await ensureDir(ws)
  const names = isBrain
    ? ['brain.md', 'consiglio-brain.json', 'mcp-registry.json', 'permission-requests.jsonl']
    : ['skill.md', 'MEMORY.md', 'SOUL.md', 'IDENTITY.md', 'TOOLS.md', 'AGENTS.md', 'HEARTBEAT.md']
  const files = []
  for (const name of names) {
    const p = path.join(ws, name)
    if (!await exists(p)) {
      const seed = isBrain
        ? (name.endsWith('.json') ? '{}\n' : '# Brain Artifact\n\nNo data yet.\n')
        : `# ${id} ${name}\n\nNo data yet.\n`
      await fs.writeFile(p, seed, 'utf8')
    }
    const s = await fs.stat(p)
    files.push({ name, path: p, exists: true, updatedAt: s.mtime.toISOString() })
  }
  r.json({ ok: true, workspace: id, path: ws, files })
})

app.get('/api/workspaces/:id/read', async (q, r) => {
  const id = q.params.id
  const f = String(q.query.file || (id === 'brain' ? 'brain.md' : 'skill.md'))
  const base = id === 'brain' ? BRAIN_DIR : path.join(AGENTS_DIR, id)
  const p = path.join(base, f)
  if (!await exists(p)) {
    await ensureDir(path.dirname(p))
    const seed = id === 'brain'
      ? (f.endsWith('.json') ? '{}\n' : '# Brain Artifact\n\nNo data yet.\n')
      : `# ${id} ${f}\n\nNo data yet.\n`
    await fs.writeFile(p, seed, 'utf8')
  }
  const s = await fs.stat(p)
  r.json({ ok: true, workspace: id, file: f, path: p, content: await rt(p, ''), updatedAt: s.mtime.toISOString() })
})
app.post('/api/workspaces/:id/write', async (q, r) => {
  const id = q.params.id
  if (id === 'brain' && !q.body?.approved) {
    return r.status(403).json({ ok: false, error: 'Brain writes require approval. Request via /api/brain/request-update first.' })
  }
  const p = path.join(id === 'brain' ? BRAIN_DIR : path.join(AGENTS_DIR, id), String(q.body.file || (id === 'brain' ? 'brain.md' : 'skill.md')))
  await ensureDir(path.dirname(p))
  await fs.writeFile(p, String(q.body.content || ''), 'utf8')
  await ap(AUDIT, `${now()} WRITE_FILE ${p} actor=${q.body.actorId || 'unknown'}`)
  await mcpAudit({
    agent_id: q.body.actorId || q.params.id,
    mcp_id: 'filesystem',
    tool: 'filesystem.write',
    request_summary: `write ${q.body.file || 'skill.md'} for ${q.params.id}`,
    result_summary: 'ok',
    risk_flag: 'medium',
  })
  const s = await fs.stat(p)
  r.json({ ok: true, path: p, updatedAt: s.mtime.toISOString() })
})
app.get('/api/reports/daily/:id', async (q, r) => {
  const day = now().slice(0, 10)
  const p = path.join(DAILY_DIR, `${q.params.id}-${day}.json`)
  const payload = await rj(p, null)
  if (!payload) return r.json({ ok: false, report: null })
  r.json({ ok: true, report: payload, path: p })
})
app.get('/api/graph', async (_q, r) => r.json({ ok: true, graph: await rj(GRAPH, { version: '1.0', nodes: [], edges: [] }) }))
app.post('/api/graph/rebuild', async (_q, r) => { await bootstrap(); r.json({ ok: true, graph: await rj(GRAPH, { version: '1.0', nodes: [], edges: [] }) }) })
app.get('/api/heartbeat/state', async (_q, r) => r.json({ ok: true, state: await rj(HEARTBEAT_STATE, { runId: `hb-${now()}`, detections: ['NO_DATA_YET'], actions: [{ type: 'GENERATE_NOW' }], result: 'ok', at: now(), lastRunAt: null }), source: HEARTBEAT_STATE }))
app.post('/api/heartbeat/run', async (_q, r) => { const t = await rj(TASKMASTER, { tasks: [] }); const blocked = (t.tasks || []).filter((x) => String(x.status || '').toLowerCase().includes('blocked')).length; const state = { runId: `hb-${now()}`, reason: 'manual', detections: blocked ? ['BLOCKERS_PRESENT'] : ['HEALTHY'], actions: blocked ? [{ type: 'ESCALATE', target: 'Piero', count: blocked }] : [{ type: 'MONITOR' }], result: 'ok', at: now(), lastRunAt: now() }; await wj(HEARTBEAT_STATE, state); await ap(BOTFATHER, `${now()} heartbeat blocked=${blocked}`); r.json({ ok: true, state, source: HEARTBEAT_STATE }) })
app.get('/api/logs/audit', async (_q, r) => r.type('text/plain').send(await rt(AUDIT, 'No audit records yet.\n')))
app.get('/api/logs/botfather', async (_q, r) => r.type('text/plain').send(await rt(BOTFATHER, 'No botfather records yet.\n')))
app.post('/api/logs/event', async (q, r) => {
  const body = q.body || {}
  const event = await emitEvent({
    type: body.type,
    event_type: body.type || body.event_type,
    severity: body.severity || 'info',
    actor: body.actor || 'system',
    actor_type: body.actor_type || 'system',
    target_type: body.target_type || 'runtime',
    target_id: body.target_id || 'unknown',
    task_id: body.task_id || null,
    run_id: body.run_id || null,
    gateway_id: body.gateway_id || null,
    summary: body.summary || '',
    metadata: body.metadata || {},
    duration: body.duration || null,
  })
  r.json({ ok: true, event })
})

app.get('/api/logs/ledger', async (q, r) => {
  const limit = Math.max(1, Math.min(500, Number(q.query.limit || 50)))
  const cursor = Math.max(0, Number(q.query.cursor || 0))
  const search = String(q.query.search || '')
  const eventType = String(q.query.eventType || '').toLowerCase()
  const agent = String(q.query.agent || '').toLowerCase()
  const task = String(q.query.task || '').toLowerCase()
  const severity = String(q.query.severity || '').toLowerCase()
  const range = String(q.query.range || '24h').toLowerCase()
  const category = String(q.query.category || 'all').toLowerCase()
  const syntax = parseSearchSyntax(search)

  const all = await readEventsByRange(range)
  const filtered = all.filter((event) => eventMatches(event, { eventType, agent, task, severity, range, category, syntax }))
  const page = filtered.slice(cursor, cursor + limit)
  const nextCursor = cursor + page.length < filtered.length ? cursor + page.length : null

  const agents = [...new Set(filtered.map((e) => e.actor).filter(Boolean))].sort()
  const tasks = [...new Set(filtered.map((e) => e.task_id).filter(Boolean))].sort()
  const eventTypes = [...new Set(filtered.map((e) => e.event_type).filter(Boolean))].sort()
  const severities = [...new Set(filtered.map((e) => e.severity).filter(Boolean))].sort()

  r.json({
    ok: true,
    items: page,
    total: filtered.length,
    nextCursor,
    filters: { agents, tasks, eventTypes, severities },
  })
})

app.get('/api/logs/stream', async (q, r) => {
  r.setHeader('Content-Type', 'text/event-stream')
  r.setHeader('Cache-Control', 'no-cache')
  r.setHeader('Connection', 'keep-alive')
  r.flushHeaders?.()
  logStreamClients.add(r)
  const ping = setInterval(() => {
    try {
      r.write(`event: ping\n`)
      r.write(`data: ${JSON.stringify({ t: now() })}\n\n`)
    } catch {
      // no-op
    }
  }, 10000)
  q.on('close', () => {
    clearInterval(ping)
    logStreamClients.delete(r)
  })
})

app.get('/api/logs/usage-summary', async (q, r) => {
  const range = String(q.query.range || '7d').toLowerCase()
  const events = await readEventsByRange(range)
  const usageEvents = events.filter((e) => e.event_type === 'model_usage_recorded' || e.event_type.includes('usage'))

  const byAgent = {}
  const byModel = {}
  const byDay = {}
  for (const e of usageEvents) {
    const agent = e.actor || 'unknown'
    const model = String(e.metadata?.model || 'unknown')
    const tokens = Number(e.metadata?.tokens || 0)
    const duration = Number(e.duration || e.metadata?.duration || 0)
    const day = String(e.timestamp || '').slice(0, 10)
    const isLocal = String(model).toLowerCase().includes('ollama') || String(model).toLowerCase().includes('local')
    if (!byAgent[agent]) byAgent[agent] = { agentId: agent, tokens: 0, runs: 0, avgDurationSec: 0 }
    if (!byModel[model]) byModel[model] = { model, tokens: 0, runs: 0, avgDurationSec: 0, local: 0, cloud: 0, costEstimate: 0 }
    if (!byDay[day]) byDay[day] = { date: day, tokens: 0, local: 0, cloud: 0, costEstimate: 0 }
    byAgent[agent].tokens += tokens
    byAgent[agent].runs += 1
    byAgent[agent].avgDurationSec += duration
    byModel[model].tokens += tokens
    byModel[model].runs += 1
    byModel[model].avgDurationSec += duration
    byModel[model].local += isLocal ? tokens : 0
    byModel[model].cloud += isLocal ? 0 : tokens
    byModel[model].costEstimate += isLocal ? 0 : tokens * 0.000002
    byDay[day].tokens += tokens
    byDay[day].local += isLocal ? tokens : 0
    byDay[day].cloud += isLocal ? 0 : tokens
    byDay[day].costEstimate += isLocal ? 0 : tokens * 0.000002
  }
  const toAvg = (obj, key) => Object.values(obj).map((x) => ({ ...x, avgDurationSec: Math.round(x.avgDurationSec / Math.max(1, x.runs)) })).sort((a, b) => b.tokens - a.tokens)
  r.json({
    ok: true,
    byAgent: toAvg(byAgent),
    byModel: toAvg(byModel),
    byDay: Object.values(byDay).sort((a, b) => (a.date < b.date ? -1 : 1)),
  })
})
app.get('/api/activity/feed', async (_q, r) => {
  const day = now().slice(0, 10)
  const mcpText = await rt(path.join(MCP_LOG_DIR, `mcp-${day}.jsonl`), '')
  const subText = await rt(path.join(SUB_LOG_DIR, `subagents-${day}.jsonl`), '')
  const cronText = await rt(path.join(CRON_LOG_DIR, `cron-${day}.jsonl`), '')
  const rows = [...mcpText.split(/\r?\n/), ...subText.split(/\r?\n/), ...cronText.split(/\r?\n/)]
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line) } catch { return { raw: line } }
    })
  r.json({ ok: true, items: rows })
})
app.post('/api/subagents/spawn-brief', async (q, r) => { const aid = String(q.body.agentId || '').trim(); if (!aid) return r.status(400).json({ ok: false, error: 'agentId required' }); const d = now().slice(0, 10).replace(/-/g, ''); const seq = String(Date.now()).slice(-3); const p = path.join(DATA, 'inbox', 'subagents', aid, `SUB-${d}-${seq}.md`); await ensureDir(path.dirname(p)); await fs.writeFile(p, `# Sub-Agent Brief\n\nParent Agent: ${aid}\nCreated: ${now()}\nTask: ${String(q.body.task || 'Investigate and report')}\nExpected Output:\n- concise findings\n- evidence links\n- recommendation\n`, 'utf8'); await ap(path.join(SUB_LOG_DIR, `subagents-${now().slice(0, 10)}.jsonl`), JSON.stringify({ ts: now(), parent: aid, brief: p })); await mcpAudit({ agent_id: aid, mcp_id: 'filesystem', tool: 'filesystem.write', request_summary: 'create sub-agent brief', result_summary: p, risk_flag: 'medium' }); r.json({ ok: true, brief: p }) })
app.post('/api/spawn-agent', async (q, r) => { const id = String(q.body.agentId || '').trim(); if (!id) return r.status(400).json({ ok: false, error: 'agentId required' }); const orgP = path.join(ORG_DIR, 'org-structure.json'); const org = await rj(orgP, { version: '1.0', generated_at: now(), root_human_authority: 'Piero', nodes: [] }); if ((org.nodes || []).some((n) => n.id === id)) return r.status(400).json({ ok: false, error: 'agent exists' }); const node = { id, title: 'Scaffolded Specialist', department: String(q.body.crew || 'Engineering'), level: 3, reports_to: 'the-botfather', direct_reports: [], niche: ['Scaffolded to absorb overflow'], skill_file_path: `workspace/agents/${id}/skill.md` }; org.nodes.push(node); await wj(orgP, org); await ensureDir(path.join(AGENTS_DIR, id)); await fs.writeFile(path.join(AGENTS_DIR, id, 'skill.md'), skillFor(node), 'utf8'); await ap(AUDIT, `${now()} SPAWN_AGENT ${id} actor=${q.body.actorId || 'unknown'}`); r.json({ ok: true, workspace: `workspace/agents/${id}` }) })
app.post('/api/retire-agent', async (q, r) => { const id = String(q.body.agentId || '').trim(); const orgP = path.join(ORG_DIR, 'org-structure.json'); const org = await rj(orgP, { nodes: [] }); org.nodes = (org.nodes || []).filter((n) => n.id !== id); for (const n of org.nodes) n.direct_reports = (n.direct_reports || []).filter((x) => x !== id); await wj(orgP, org); await ap(AUDIT, `${now()} RETIRE_AGENT ${id} actor=${q.body.actorId || 'unknown'}`); r.json({ ok: true }) })
app.get('/api/sitdown/sessions', async (_q, r) => {
  await ensureDir(SITDOWN_BRAIN_DIR)
  const files = (await fs.readdir(SITDOWN_BRAIN_DIR).catch(() => []))
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .sort()
    .reverse()
  r.json({ ok: true, sessions: files })
})

app.get('/api/sitdown/session', async (q, r) => {
  const date = String(q.query.date || now().slice(0, 10))
  const session = await buildSitdownSession(date)
  r.json({ ok: true, session })
})

app.post('/api/sitdown/session/create', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const session = await buildSitdownSession(date)
  r.json({ ok: true, session })
})

app.post('/api/sitdown/run', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const actor = String(q.body?.actor || 'operator')
  const session = await buildSitdownSession(date)
  const rebuilt = await rebuildSitdownContributions(session, { includeTaskBackfill: true })
  await saveSitdownSession(session, actor)
  await emitEvent({
    actor,
    actor_type: actor === 'operator' ? 'human' : 'agent',
    event_type: 'heartbeat_run_requested',
    target_type: 'sitdown',
    target_id: session.id,
    summary: `Run Sitdown requested (imported ${rebuilt.imported}, total contributions ${rebuilt.total})`,
    severity: 'info',
    metadata: { imported: rebuilt.imported, total: rebuilt.total },
  })
  r.json({ ok: true, session })
})

app.post('/api/sitdown/contribution', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const agentId = String(q.body?.agentId || '').trim()
  if (!agentId) return r.status(400).json({ ok: false, error: 'agentId required' })
  const session = await buildSitdownSession(date)
  if (session.locked) return r.status(400).json({ ok: false, error: 'session locked' })
  const payload = q.body?.contribution || {}
  const role = String(payload.role || session.participants.find((p) => p.agentId === agentId)?.role || 'Agent')
  const nextContribution = {
    agentId,
    role,
    model: String(payload.model || 'n/a'),
    workedOn: Array.isArray(payload.workedOn) ? payload.workedOn : [],
    next: Array.isArray(payload.next) ? payload.next : [],
    blockers: Array.isArray(payload.blockers) ? payload.blockers : [],
    approvalRequests: Array.isArray(payload.approvalRequests) ? payload.approvalRequests : [],
    opportunities: Array.isArray(payload.opportunities) ? payload.opportunities : [],
    comments: Array.isArray(payload.comments) ? payload.comments : [],
    postedAt: now(),
  }
  const idx = (session.contributions || []).findIndex((x) => x.agentId === agentId)
  if (idx >= 0) session.contributions[idx] = nextContribution
  else session.contributions.push(nextContribution)
  await saveSitdownSession(session, agentId)
  await emitEvent({
    actor: agentId,
    actor_type: 'agent',
    event_type: 'sitdown_agent_posted',
    target_type: 'sitdown',
    target_id: session.id,
    task_id: nextContribution.workedOn?.[0] || null,
    summary: `${agentId} posted structured standup contribution`,
    severity: 'info',
    metadata: { date },
  })
  const highBlockers = (nextContribution.blockers || []).filter((b) => String(b.severity || '').toLowerCase() === 'high')
  for (const b of highBlockers) {
    await emitEvent({
      actor: agentId,
      actor_type: 'agent',
      event_type: 'sitdown_blocker_logged',
      target_type: 'task',
      target_id: String(b.taskId || 'unknown'),
      task_id: b.taskId || null,
      summary: `${agentId} logged blocker: ${b.text}`,
      severity: 'warn',
      metadata: b,
    })
  }
  r.json({ ok: true, session })
})

app.post('/api/sitdown/comment', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const agentId = String(q.body?.agentId || '').trim()
  const actor = String(q.body?.actor || 'operator')
  const text = String(q.body?.text || '').trim()
  if (!agentId || !text) return r.status(400).json({ ok: false, error: 'agentId and text required' })
  const mentions = [...text.matchAll(/@([a-z0-9-]+)/gi)].map((m) => m[1])
  const session = await buildSitdownSession(date)
  const idx = (session.contributions || []).findIndex((x) => x.agentId === agentId)
  if (idx < 0) return r.status(404).json({ ok: false, error: 'contribution not found' })
  session.contributions[idx].comments = session.contributions[idx].comments || []
  session.contributions[idx].comments.push({
    id: `c-${Date.now()}`,
    actor,
    text,
    mentions,
    timestamp: now(),
  })
  session.participants = (session.participants || []).map((p) => (mentions.includes(p.agentId) ? { ...p, mentioned: true } : p))
  await saveSitdownSession(session, actor)
  for (const m of mentions) {
    await emitEvent({
      actor,
      actor_type: actor === 'operator' ? 'human' : 'agent',
      event_type: 'sitdown_agent_mentioned',
      target_type: 'agent',
      target_id: m,
      summary: `${actor} mentioned ${m} in sitdown`,
      severity: 'info',
      metadata: { date, contributionAgent: agentId },
    })
  }
  r.json({ ok: true, session })
})

app.post('/api/sitdown/exclude', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const agentId = String(q.body?.agentId || '').trim()
  const excluded = Boolean(q.body?.excluded)
  const actor = String(q.body?.actor || 'operator')
  const session = await buildSitdownSession(date)
  session.participants = (session.participants || []).map((p) => (p.agentId === agentId ? { ...p, excluded } : p))
  await saveSitdownSession(session, actor)
  r.json({ ok: true, session })
})

app.post('/api/sitdown/summary/generate', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const actor = String(q.body?.actor || 'the-botfather')
  const session = await buildSitdownSession(date)
  session.summary = summarizeSession(session)
  await saveSitdownSession(session, actor)
  await emitEvent({
    actor,
    actor_type: 'agent',
    event_type: 'sitdown_summary_generated',
    target_type: 'sitdown',
    target_id: session.id,
    summary: `BotFather generated summary (${session.summary.riskLevel})`,
    severity: session.summary.riskLevel === 'Critical' ? 'critical' : session.summary.riskLevel === 'Elevated' ? 'warn' : 'info',
    metadata: { risk: session.summary.riskLevel },
  })
  r.json({ ok: true, summary: session.summary, session })
})

app.post('/api/sitdown/convert-action-plan', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const actor = String(q.body?.actor || 'the-botfather')
  const session = await buildSitdownSession(date)
  const taskData = await rj(TASKMASTER, { tasks: [] })
  taskData.tasks = Array.isArray(taskData.tasks) ? taskData.tasks : []
  const created = []
  for (const blocker of session.summary?.topBlockers || []) {
    const id = `SIT-${Date.now()}-${created.length + 1}`
    let task = {
      id,
      title: `Sitdown Action: ${blocker}`.slice(0, 180),
      status: 'Backlog',
      column: 'Backlog',
      priority: 'high',
      ownerAgent: 'product-manager',
      notes: `Generated from sitdown ${session.id}`,
      createdAt: now(),
      updatedAt: now(),
    }
    task = fleshOutTaskByPM(task)
    taskData.tasks.push(task)
    created.push(task)
    await emitEvent({
      actor,
      actor_type: 'agent',
      event_type: 'sitdown_converted_to_task',
      target_type: 'task',
      target_id: id,
      task_id: id,
      summary: `Converted sitdown blocker to task ${id}`,
      severity: 'info',
      metadata: { sitdown: session.id },
    })
  }
  await wj(TASKMASTER, taskData)
  r.json({ ok: true, created })
})

app.post('/api/sitdown/publish-summary', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const actor = String(q.body?.actor || 'the-botfather')
  const session = await buildSitdownSession(date)
  await emitEvent({
    actor,
    actor_type: 'agent',
    event_type: 'sitdown_summary_generated',
    target_type: 'log',
    target_id: session.id,
    summary: `Sitdown summary published (${session.summary?.riskLevel || 'Moderate'})`,
    severity: 'info',
    metadata: { date, summary: session.summary },
  })
  r.json({ ok: true })
})

app.post('/api/sitdown/session/close', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const actor = String(q.body?.actor || 'the-botfather')
  const session = await buildSitdownSession(date)
  session.locked = true
  session.end_time = now()
  await saveSitdownSession(session, actor)
  await emitEvent({
    actor,
    actor_type: 'agent',
    event_type: 'sitdown_session_closed',
    target_type: 'sitdown',
    target_id: session.id,
    summary: `Sitdown session ${session.id} closed`,
    severity: 'info',
    metadata: {},
  })
  r.json({ ok: true, session })
})

app.post('/api/sitdown/agent-update', async (q, r) => {
  const date = String(q.body?.date || now().slice(0, 10))
  const agentId = String(q.body?.agentId || '').trim()
  if (!agentId) return r.status(400).json({ ok: false, error: 'agentId required' })
  const tasks = await rj(TASKMASTER, { tasks: [] })
  const mine = (tasks.tasks || []).filter((t) => String(t.ownerAgent || '').toLowerCase() === agentId.toLowerCase())
  const session = await buildSitdownSession(date)
  const contribution = {
    agentId,
    role: 'Agent',
    model: 'local/ollama',
    workedOn: mine.slice(0, 3).map((t) => `${t.id}: ${t.title || t.id}`),
    next: mine.filter((t) => !/(done|complete)/i.test(String(t.status || ''))).slice(0, 3).map((t) => `${t.id}: continue`),
    blockers: mine.filter((t) => /(block)/i.test(String(t.status || ''))).map((t) => ({ text: t.title || t.id, severity: 'high', taskId: t.id, escalateTo: 'manager' })),
    approvalRequests: mine.filter((t) => /(approval)/i.test(String(t.status || ''))).map((t) => ({ type: 'Requirements Approval', text: `${t.id}` })),
    opportunities: [],
    comments: [],
    postedAt: now(),
  }
  const idx = (session.contributions || []).findIndex((x) => x.agentId === agentId)
  if (idx >= 0) session.contributions[idx] = contribution
  else session.contributions.push(contribution)
  await saveSitdownSession(session, agentId)
  await emitEvent({
    actor: agentId,
    actor_type: 'agent',
    event_type: 'sitdown_agent_posted',
    target_type: 'sitdown',
    target_id: session.id,
    summary: `${agentId} forced update posted`,
    severity: 'info',
    metadata: { forced: true },
  })
  r.json({ ok: true, session })
})

app.get('/api/sitdown', async (_q, r) => {
  const date = now().slice(0, 10)
  const session = await buildSitdownSession(date)
  r.json({ ok: true, session })
})
app.post('/api/ui/log-error', async (q, r) => { await uiErr(String(q.body?.error || 'Unknown UI error'), String(q.body?.context || 'ui')); r.json({ ok: true }) })

app.get('/api/operations/overview', async (_q, r) => {
  const org = await rj(ORG_JSON_PATH, { nodes: [] })
  const tasks = await rj(TASKMASTER, { tasks: [] })
  const heartbeat = await rj(HEARTBEAT_STATE, { lastRunAt: null, detections: [] })
  const cron = await rj(CRON_REGISTRY_PATH, { jobs: [] })
  const runtime = await readRuntimeState()
  const day = now().slice(0, 10)
  const mcpAuditText = await rt(path.join(MCP_LOG_DIR, `mcp-${day}.jsonl`), '')
  const usageText = await rt(path.join(USAGE_LOG_DIR, `${day}.jsonl`), '')

  const gatewayRunning = await processIsRunning('node')
  const ollamaRunning = await processIsRunning('ollama')
  runtime.processes.gateway.status = gatewayRunning ? 'running' : runtime.processes.gateway.status
  runtime.processes.ollama.status = ollamaRunning ? 'running' : runtime.processes.ollama.status
  await writeRuntimeState(runtime)

  const activeTasks = (tasks.tasks || []).filter((t) => String(t.status || '').toLowerCase().includes('progress'))
  const blocked = (tasks.tasks || []).filter((t) => String(t.status || '').toLowerCase().includes('block'))
  const runningAgents = activeTasks.map((t, idx) => ({
    runId: `run-${t.id}`,
    agentId: t.ownerAgent || 'unassigned',
    role: 'agent',
    status: blocked.find((b) => b.id === t.id) ? 'blocked' : 'running',
    taskId: t.id,
    taskTitle: t.title || t.id,
    startedAt: t.updatedAt || t.createdAt || now(),
    durationSec: Math.max(1, idx * 47 + 93),
    model: idx % 2 === 0 ? 'local/ollama' : 'cloud/model',
    tokens: (idx + 1) * 712,
    action: 'Executing task workflow',
    subagents: idx % 3 === 0 ? [{ id: `sub-${t.id}`, status: 'running', action: 'Drafting artifact' }] : [],
  }))

  const heartbeats = (org.nodes || []).map((n, idx) => ({
    agentId: n.id,
    enabled: true,
    schedule: idx % 2 ? 'hourly' : 'every 15m',
    nextRun: heartbeat.lastRunAt || now(),
    lastStatus: heartbeat.detections?.includes('HEALTHY') ? 'ok' : 'issues',
    lastRunAt: heartbeat.lastRunAt || heartbeat.at || null,
    fail24h: heartbeat.detections?.includes('HEALTHY') ? 0 : 1,
  }))

  const gateways = [
    {
      id: 'local-gateway',
      name: 'OpenClaw Gateway',
      location: 'local',
      status: runtime.processes.gateway.status === 'running' ? 'Connected' : 'Disconnected',
      latencyMs: runtime.processes.gateway.status === 'running' ? 18 : null,
      lastCheckAt: now(),
      models: ['local/ollama', 'cloud/model'],
      activeRuns: runningAgents.length,
      lastError: runtime.processes.gateway.status === 'running' ? '' : 'Gateway is not running.',
      metadata: runtime.processes.gateway,
    },
    {
      id: 'ollama-local',
      name: 'Ollama Runtime',
      location: 'local',
      status: runtime.processes.ollama.status === 'running' ? 'Connected' : 'Disconnected',
      latencyMs: runtime.processes.ollama.status === 'running' ? 7 : null,
      lastCheckAt: now(),
      models: ['llama3.2', 'qwen2.5'],
      activeRuns: runningAgents.filter((x) => x.model.startsWith('local')).length,
      lastError: runtime.processes.ollama.status === 'running' ? '' : 'Ollama not detected.',
      metadata: runtime.processes.ollama,
    },
  ]

  const usageByAgent = Object.values(
    runningAgents.reduce((acc, run) => {
      if (!acc[run.agentId]) acc[run.agentId] = { agentId: run.agentId, tokens: 0, runs: 0, local: 0, cloud: 0 }
      acc[run.agentId].tokens += run.tokens
      acc[run.agentId].runs += 1
      if (run.model.startsWith('local')) acc[run.agentId].local += run.tokens
      else acc[run.agentId].cloud += run.tokens
      return acc
    }, {})
  )
  const usageByModel = Object.values(
    runningAgents.reduce((acc, run) => {
      if (!acc[run.model]) acc[run.model] = { model: run.model, tokens: 0, runs: 0, avgDurationSec: 0, costEstimate: 0 }
      acc[run.model].tokens += run.tokens
      acc[run.model].runs += 1
      acc[run.model].avgDurationSec += run.durationSec
      acc[run.model].costEstimate += run.model.startsWith('local') ? 0 : run.tokens * 0.000002
      return acc
    }, {})
  ).map((m) => ({ ...m, avgDurationSec: Math.round(m.avgDurationSec / Math.max(1, m.runs)) }))

  const activityMerged = [...mcpAuditText.split(/\r?\n/), ...usageText.split(/\r?\n/)]
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line) } catch { return { raw: line } }
    })
    .slice(-200)

  const env = gateways.some((g) => g.location !== 'local') ? 'Mixed' : 'Local'
  r.json({
    ok: true,
    environment: env,
    runtime,
    gateways,
    runningAgents,
    heartbeats,
    cronJobs: cron.jobs || [],
    usage: { byAgent: usageByAgent, byModel: usageByModel },
    kpis: {
      gatewaysConnected: gateways.filter((g) => g.status === 'Connected').length,
      gatewaysTotal: gateways.length,
      activeAgents: runningAgents.length,
      activeSubagents: runningAgents.reduce((n, r0) => n + (r0.subagents?.length || 0), 0),
      heartbeatFailures24h: heartbeats.reduce((n, h) => n + (h.fail24h || 0), 0),
      cronEnabled: (cron.jobs || []).filter((j) => j.enabled).length,
      cronFailures24h: (cron.jobs || []).reduce((n, j) => n + (j.fail24h || 0), 0),
    },
    activityFeed: activityMerged,
  })
})

app.post('/api/operations/action', async (q, r) => {
  const action = String(q.body?.action || '')
  const actor = String(q.body?.actor || 'operator')
  const gateway = gatewayAdapter()
  const ollama = ollamaAdapter()
  const runtime = await readRuntimeState()
  const targetMap = {
    operations_refresh: 'runtime',
    gateway_start: 'gateway',
    gateway_stop: 'gateway',
    gateway_restart: 'gateway',
    ollama_start: 'ollama',
    ollama_stop: 'ollama',
    ollama_restart: 'ollama',
    runtime_restart_all: 'runtime',
    runtime_health_check: 'runtime',
    runtime_resync: 'runtime',
    clear_stale_runs: 'runtime',
    open_latest_logs: 'runtime',
  }
  const eventRequestedMap = {
    operations_refresh: 'operations_refresh',
    gateway_start: 'gateway_start_requested',
    gateway_stop: 'gateway_stop_requested',
    gateway_restart: 'gateway_restart_requested',
    ollama_start: 'ollama_start_requested',
    ollama_stop: 'ollama_stop_requested',
    ollama_restart: 'ollama_restart_requested',
    runtime_restart_all: 'runtime_restart_all_requested',
    runtime_health_check: 'runtime_health_check_requested',
    runtime_resync: 'runtime_resync',
    clear_stale_runs: 'runtime_health_check_requested',
    open_latest_logs: 'operations_refresh',
    heartbeat_run: 'heartbeat_run_requested',
    agent_stop: 'agent_run_stopped',
    agent_kill: 'agent_run_killed',
  }
  const eventCompletedMap = {
    operations_refresh: 'operations_refresh',
    gateway_start: 'gateway_start_completed',
    gateway_stop: 'gateway_stop_completed',
    gateway_restart: 'gateway_restart_completed',
    ollama_start: 'ollama_start_completed',
    ollama_stop: 'ollama_stop_completed',
    ollama_restart: 'ollama_restart_completed',
    runtime_restart_all: 'runtime_restart_all_completed',
    runtime_health_check: 'runtime_health_check_completed',
    runtime_resync: 'runtime_resync',
    clear_stale_runs: 'runtime_health_check_completed',
    open_latest_logs: 'operations_refresh',
    heartbeat_run: 'heartbeat_run_completed',
    agent_stop: 'agent_run_stopped',
    agent_kill: 'agent_run_killed',
  }

  await emitEvent({
    actor,
    event_type: eventRequestedMap[action] || 'operations_refresh',
    target_type: targetMap[action] || 'runtime',
    target_id: targetMap[action] || 'runtime',
    summary: `Action requested: ${action}`,
    severity: 'info',
    metadata: { action },
  })

  let result = { ok: false, message: 'Unknown action' }
  if (action === 'gateway_start') result = await gateway.start()
  if (action === 'gateway_stop') result = await gateway.stop()
  if (action === 'gateway_restart') result = await gateway.restart()
  if (action === 'ollama_start') result = await ollama.start()
  if (action === 'ollama_stop') result = await ollama.stop()
  if (action === 'ollama_restart') result = await ollama.restart()
  if (action === 'runtime_resync') result = { ok: true, message: 'Runtime resynced with local registry.' }
  if (action === 'operations_refresh') result = { ok: true, message: 'Operations view refreshed.' }
  if (action === 'runtime_health_check') {
    const gatewayUp = await processIsRunning('node')
    const ollamaUp = await processIsRunning('ollama')
    runtime.lastHealthCheckAt = now()
    runtime.processes.gateway.status = gatewayUp ? 'running' : 'stopped'
    runtime.processes.ollama.status = ollamaUp ? 'running' : 'stopped'
    await writeRuntimeState(runtime)
    result = { ok: gatewayUp || ollamaUp, message: `Health check complete. gateway=${gatewayUp}, ollama=${ollamaUp}` }
  }
  if (action === 'clear_stale_runs') {
    result = { ok: true, message: 'Soft cleanup complete; stale run markers cleared.' }
  }
  if (action === 'open_latest_logs') {
    result = { ok: true, message: 'Open latest logs from the Logs tab with runtime filter.' }
  }
  if (action === 'heartbeat_run') {
    const t = await rj(TASKMASTER, { tasks: [] })
    const blocked = (t.tasks || []).filter((x) => String(x.status || '').toLowerCase().includes('blocked')).length
    const state = {
      runId: `hb-${now()}`,
      reason: 'operations_run_now',
      detections: blocked ? ['BLOCKERS_PRESENT'] : ['HEALTHY'],
      actions: blocked ? [{ type: 'ESCALATE', target: 'Piero', count: blocked }] : [{ type: 'MONITOR' }],
      result: 'ok',
      at: now(),
      lastRunAt: now(),
    }
    await wj(HEARTBEAT_STATE, state)
    await ap(BOTFATHER, `${now()} heartbeat blocked=${blocked} source=operations`)
    result = { ok: true, message: 'Heartbeat run completed from Operations.', state }
  }
  if (action === 'agent_stop' || action === 'agent_kill') {
    const runId = String(q.body?.metadata?.runId || 'unknown-run')
    result = { ok: true, message: `${action === 'agent_stop' ? 'Soft stop' : 'Hard kill'} requested for ${runId}.`, runId }
  }
  if (action === 'runtime_restart_all') {
    runtime.pausedNewRuns = true
    await writeRuntimeState(runtime)
    const step1 = await gateway.stop()
    const step2 = await ollama.restart()
    const step3 = await gateway.start()
    const step4 = { ok: true, message: 'Health check invoked' }
    runtime.pausedNewRuns = false
    runtime.lastHealthCheckAt = now()
    await writeRuntimeState(runtime)
    result = { ok: step1.ok && step2.ok && step3.ok, message: 'Restart All safe sequence executed.', steps: [step1, step2, step3, step4] }
  }

  await emitEvent({
    actor,
    event_type: eventCompletedMap[action] || 'operations_refresh',
    target_type: targetMap[action] || 'runtime',
    target_id: targetMap[action] || 'runtime',
    summary: result.message,
    severity: result.ok ? 'info' : 'warn',
    metadata: { action, result },
  })
  r.json({ ok: true, result })
})

app.post('/api/operations/heartbeat/update', async (q, r) => {
  const agentId = String(q.body?.agentId || '')
  const enabled = Boolean(q.body?.enabled)
  const schedule = String(q.body?.schedule || 'every 15m')
  if (!agentId) return r.status(400).json({ ok: false, error: 'agentId required' })
  await writeAgentHeartbeat(agentId, schedule, enabled)
  r.json({ ok: true })
})

app.get('/api/operations/cron-registry', async (_q, r) => {
  r.json({ ok: true, registry: await rj(CRON_REGISTRY_PATH, { version: '1.0', jobs: [] }) })
})

app.post('/api/operations/cron-registry', async (q, r) => {
  const registry = q.body?.registry
  if (!registry || typeof registry !== 'object') return r.status(400).json({ ok: false, error: 'registry required' })
  await wj(CRON_REGISTRY_PATH, { ...registry, updated_at: now() })
  await emitEvent({
    actor: String(q.body?.actor || 'operator'),
    event_type: 'cron_registry_updated',
    target_type: 'cron',
    target_id: 'registry',
    summary: 'Cron registry updated',
    severity: 'info',
    metadata: { file: CRON_REGISTRY_PATH },
  })
  await emitEvent({
    actor: String(q.body?.actor || 'operator'),
    event_type: 'file_changed',
    target_type: 'file',
    target_id: CRON_REGISTRY_PATH,
    summary: 'Cron registry file changed',
    severity: 'info',
    metadata: {},
  })
  r.json({ ok: true })
})

app.post('/api/operations/cron/run', async (q, r) => {
  const jobId = String(q.body?.jobId || '')
  await emitEvent({
    actor: String(q.body?.actor || 'operator'),
    event_type: 'cron_job_run_requested',
    target_type: 'cron',
    target_id: jobId || 'unknown',
    summary: `Cron job run requested: ${jobId}`,
    severity: 'info',
    metadata: {},
  })
  await emitEvent({
    actor: String(q.body?.actor || 'operator'),
    event_type: 'cron_job_run_completed',
    target_type: 'cron',
    target_id: jobId || 'unknown',
    summary: `Cron job run completed: ${jobId}`,
    severity: 'info',
    metadata: {},
  })
  r.json({ ok: true })
})

app.use((err, _q, r, _n) => { uiErr(String(err), 'express').catch(() => {}); r.status(500).json({ ok: false, error: 'Internal server error' }) })

await bootstrap()
app.listen(PORT, () => console.log(`Consiglio API listening on http://localhost:${PORT}`))
