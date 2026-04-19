import React from 'react'
import { createTask, fetchHeartbeatState, fetchOrg, fetchRegistry, fetchTasks, runHeartbeat, syncTaskMetadata, updateTask } from '../api'
import type { TaskMasterTask } from '../types'

type LaneKey =
  | 'Backlog'
  | 'Intake'
  | 'Approved'
  | 'Planned'
  | 'In Progress'
  | 'QA'
  | 'Security Review'
  | 'Ready to Deploy'
  | 'Deployed'
  | 'Done'
  | 'Blocked'

const LANES: LaneKey[] = [
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

function normalizeLane(value?: string): LaneKey {
  const raw = String(value || '').trim().toLowerCase()
  const map: Record<string, LaneKey> = {
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
  return map[raw] || 'Backlog'
}

function getValue(task: TaskMasterTask, ...keys: string[]): string {
  for (const key of keys) {
    const v = (task as any)[key]
    if (v !== undefined && v !== null && String(v).length) return String(v)
  }
  return ''
}

function splitList(input: string): string[] {
  return String(input || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function joinList(input?: string[]): string {
  return Array.isArray(input) ? input.join(', ') : ''
}

function ciBadgeClass(ci: string) {
  const v = ci.toLowerCase()
  if (v.includes('pass') || v.includes('success') || v.includes('green')) return 'mc-badge-good'
  if (v.includes('run') || v.includes('pending')) return 'mc-badge-warn'
  if (v.includes('fail') || v.includes('error') || v.includes('red')) return 'mc-badge-bad'
  return ''
}

function prBadgeClass(pr: string) {
  const v = pr.toLowerCase()
  if (v.includes('approved') || v.includes('merged')) return 'mc-badge-good'
  if (v.includes('open')) return 'mc-badge-warn'
  if (v.includes('closed')) return 'mc-badge-bad'
  return ''
}

export function MissionView() {
  const [loading, setLoading] = React.useState(true)
  const [err, setErr] = React.useState<string | null>(null)
  const [tasks, setTasks] = React.useState<TaskMasterTask[]>([])
  const [agentOptions, setAgentOptions] = React.useState<string[]>([])
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [showQuickAdd, setShowQuickAdd] = React.useState(false)
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [syncingId, setSyncingId] = React.useState<string | null>(null)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [transitionError, setTransitionError] = React.useState<string | null>(null)
  const [heartbeat, setHeartbeat] = React.useState<any>(null)

  const [newTask, setNewTask] = React.useState({
    title: '',
    ownerAgent: '',
    priority: 'medium',
    repo: '',
    acceptance_criteria: '',
    notes: '',
  })

  const [filters, setFilters] = React.useState({
    search: '',
    agent: 'all',
    repo: 'all',
    status: 'all',
    priority: 'all',
  })

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const [registry, org, taskRes, hbRes] = await Promise.all([
        fetchRegistry(),
        fetchOrg(),
        fetchTasks(),
        fetchHeartbeatState(),
      ])
      void registry
      const list = (taskRes.tasks || []).map((task) => ({ ...task, status: normalizeLane(getValue(task, 'status', 'column')) }))
      setTasks(list)
      setAgentOptions((org?.agents || []).map((a: any) => String(a.id)).filter(Boolean))
      setHeartbeat(hbRes?.state || null)
      setTransitionError(null)
      setErr(null)
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const repoOptions = React.useMemo(() => {
    const set = new Set<string>()
    for (const t of tasks) {
      const repo = getValue(t, 'repo')
      if (repo) set.add(repo)
    }
    return Array.from(set).sort()
  }, [tasks])

  const filtered = React.useMemo(() => {
    const s = filters.search.trim().toLowerCase()
    return tasks.filter((t) => {
      const lane = normalizeLane(getValue(t, 'status', 'column'))
      const owner = getValue(t, 'ownerAgent', 'owner_agent')
      const repo = getValue(t, 'repo')
      const priority = getValue(t, 'priority').toLowerCase()
      const hay = `${t.id} ${getValue(t, 'title')} ${owner} ${repo} ${getValue(t, 'description')} ${getValue(t, 'notes')}`.toLowerCase()

      if (s && !hay.includes(s)) return false
      if (filters.agent !== 'all' && owner !== filters.agent) return false
      if (filters.repo !== 'all' && repo !== filters.repo) return false
      if (filters.status !== 'all' && lane !== filters.status) return false
      if (filters.priority !== 'all' && priority !== filters.priority) return false
      return true
    })
  }, [tasks, filters])

  const grouped = React.useMemo(() => {
    const map: Record<LaneKey, TaskMasterTask[]> = {
      Backlog: [],
      Intake: [],
      Approved: [],
      Planned: [],
      'In Progress': [],
      QA: [],
      'Security Review': [],
      'Ready to Deploy': [],
      Deployed: [],
      Done: [],
      Blocked: [],
    }
    for (const task of filtered) map[normalizeLane(getValue(task, 'status', 'column'))].push(task)
    return map
  }, [filtered])

  const metrics = React.useMemo(() => {
    const inProgress = tasks.filter((t) => normalizeLane(getValue(t, 'status', 'column')) === 'In Progress').length
    const blocked = tasks.filter((t) => normalizeLane(getValue(t, 'status', 'column')) === 'Blocked').length
    const pendingApprovals = tasks.filter((t) => normalizeLane(getValue(t, 'status', 'column')) === 'Approved' || normalizeLane(getValue(t, 'status', 'column')) === 'Security Review').length
    return { agents: agentOptions.length, inProgress, pendingApprovals, blocked }
  }, [tasks, agentOptions])

  async function saveTaskPatch(taskId: string, patch: Record<string, unknown>) {
    setSavingId(taskId)
    try {
      const res = await updateTask(taskId, patch, 'botfather')
      if (!(res as any).ok) throw new Error('update failed')
      setTransitionError(null)
      await refresh()
    } catch (e: any) {
      setTransitionError(String(e?.message || e))
    } finally {
      setSavingId(null)
    }
  }

  async function moveTask(taskId: string, lane: LaneKey) {
    await saveTaskPatch(taskId, { status: lane, column: lane })
  }

  async function addTask() {
    if (!newTask.title.trim()) return
    try {
      await createTask({
        title: newTask.title.trim(),
        ownerAgent: newTask.ownerAgent.trim(),
        priority: newTask.priority,
        status: 'Intake',
        notes: newTask.notes,
        acceptance_criteria: newTask.acceptance_criteria,
        repo: newTask.repo,
        actorId: 'botfather',
      } as any)
      setNewTask({ title: '', ownerAgent: '', priority: 'medium', repo: '', acceptance_criteria: '', notes: '' })
      setShowQuickAdd(false)
      await refresh()
    } catch (e) {
      setErr(String(e))
    }
  }

  async function syncMetadata(taskId: string) {
    setSyncingId(taskId)
    try {
      await syncTaskMetadata(taskId, 'botfather')
      await refresh()
    } finally {
      setSyncingId(null)
    }
  }

  const heartbeatStatus = Array.isArray(heartbeat?.detections) && heartbeat.detections.includes('HEALTHY') ? 'Healthy' : heartbeat?.detections?.length ? 'Issues' : 'No Data'

  return (
    <div className="mc-pane mc-mission-shell">
      <div className="mc-pane-header mc-mission-header">
        <div>
          <div className="mc-mission-title">Mission Control</div>
          <div className="mc-mission-subtitle">BotFather Command Center</div>
          <div className="mc-subtle">Kanban 2.0 engineering operations board</div>
        </div>
        <div className="mc-actions">
          <button className="mc-btn" onClick={() => setShowQuickAdd((v) => !v)}>{showQuickAdd ? 'Close Quick Add' : 'Quick Add Task'}</button>
          <button className="mc-btn mc-btn-outline" onClick={() => void refresh()}>Refresh</button>
          <button className="mc-btn mc-btn-primary-glow" onClick={async () => { await runHeartbeat(); await refresh() }}>Run Heartbeat</button>
        </div>
      </div>

      {err ? <div className="mc-error">{err}</div> : null}
      {transitionError ? <div className="mc-error">{transitionError}</div> : null}

      <div className="mc-metric-grid">
        <article className="mc-metric-card mc-mission-stat mc-mission-stat-1"><div className="mc-metric-value">{metrics.agents}</div><div className="mc-metric-label">Agents</div></article>
        <article className="mc-metric-card mc-mission-stat mc-mission-stat-2"><div className="mc-metric-value">{metrics.inProgress}</div><div className="mc-metric-label">In Progress</div></article>
        <article className="mc-metric-card mc-mission-stat mc-mission-stat-3"><div className="mc-metric-value">{metrics.pendingApprovals}</div><div className="mc-metric-label">Pending Approvals</div></article>
        <article className="mc-metric-card mc-mission-stat mc-mission-stat-4"><div className="mc-metric-value">{metrics.blocked}</div><div className="mc-metric-label">Blocked</div></article>
      </div>

      <section className="mc-heartbeat-panel" style={{ marginBottom: 8 }}>
        <div className="mc-heartbeat-left">
          <div className="mc-heartbeat-meta">
            <div><strong>Status:</strong> <span className={`mc-badge ${heartbeatStatus === 'Healthy' ? 'mc-badge-good' : heartbeatStatus === 'Issues' ? 'mc-badge-bad' : 'mc-badge-warn'}`}>{heartbeatStatus}</span></div>
            <div><strong>Last run:</strong> {heartbeat?.lastRunAt || heartbeat?.at || 'No data yet'}</div>
            <div><strong>Detections:</strong> {(heartbeat?.detections || []).join(', ') || 'none'}</div>
          </div>
        </div>
        <div className="mc-heartbeat-right">
          <div className="mc-subtle">Board transitions are gate-validated against PR, CI, QA, security, and deployment evidence.</div>
        </div>
      </section>

      {showQuickAdd ? (
        <section className="mc-block" style={{ margin: '0 12px 12px 12px' }}>
          <div className="mc-inline-form" style={{ gridTemplateColumns: '2fr 1fr 140px 1fr auto' }}>
            <input value={newTask.title} onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))} placeholder="Task title" />
            <input list="agent-options" value={newTask.ownerAgent} onChange={(e) => setNewTask((s) => ({ ...s, ownerAgent: e.target.value }))} placeholder="Owner agent" />
            <select value={newTask.priority} onChange={(e) => setNewTask((s) => ({ ...s, priority: e.target.value }))}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <input value={newTask.repo} onChange={(e) => setNewTask((s) => ({ ...s, repo: e.target.value }))} placeholder="Repo" />
            <button className="mc-btn mc-btn-primary-glow" onClick={() => void addTask()}>Create in Intake</button>
            <textarea className="mc-editor" style={{ gridColumn: '1 / -1', minHeight: 72 }} value={newTask.acceptance_criteria} onChange={(e) => setNewTask((s) => ({ ...s, acceptance_criteria: e.target.value }))} placeholder="Acceptance criteria" />
            <textarea className="mc-editor" style={{ gridColumn: '1 / -1', minHeight: 72 }} value={newTask.notes} onChange={(e) => setNewTask((s) => ({ ...s, notes: e.target.value }))} placeholder="Context and scope" />
          </div>
        </section>
      ) : null}

      <section className="mc-block" style={{ margin: '0 12px 12px 12px' }}>
        <div className="mc-kanban-filterbar">
          <input value={filters.search} onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))} placeholder="Search task, owner, repo, notes" />
          <select value={filters.agent} onChange={(e) => setFilters((s) => ({ ...s, agent: e.target.value }))}>
            <option value="all">All agents</option>
            {agentOptions.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
          <select value={filters.repo} onChange={(e) => setFilters((s) => ({ ...s, repo: e.target.value }))}>
            <option value="all">All repos</option>
            {repoOptions.map((repo) => <option key={repo} value={repo}>{repo}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}>
            <option value="all">All status</option>
            {LANES.map((lane) => <option key={lane} value={lane}>{lane}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters((s) => ({ ...s, priority: e.target.value }))}>
            <option value="all">All priority</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
      </section>

      <datalist id="agent-options">
        {agentOptions.map((id) => <option key={id} value={id} />)}
      </datalist>

      <section className="mc-block" style={{ margin: '0 12px 12px 12px' }}>
        <div className="mc-board mc-mission-board">
          {LANES.map((lane) => (
            <div
              key={lane}
              className="mc-col mc-col-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const taskId = e.dataTransfer.getData('text/task-id')
                if (taskId) void moveTask(taskId, lane)
                setDraggingId(null)
              }}
            >
              <div className="mc-col-title">
                <span>{lane}</span>
                <span className="mc-col-count">{grouped[lane].length}</span>
              </div>
              <div className="mc-col-cards">
                {grouped[lane].map((task) => {
                  const id = String(task.id)
                  const isOpen = !!expanded[id]
                  const prStatus = getValue(task, 'pr_status', 'prStatus') || 'Open'
                  const ciStatus = getValue(task, 'ci_status', 'ciStatus') || 'Unknown'
                  const owner = getValue(task, 'ownerAgent', 'owner_agent')
                  const priority = getValue(task, 'priority') || 'medium'
                  const repo = getValue(task, 'repo')
                  const branch = getValue(task, 'branch', 'branch_name')
                  const prUrl = getValue(task, 'pr_url', 'prUrl')
                  const previewUrl = getValue(task, 'preview_url', 'previewUrl')
                  const productionUrl = getValue(task, 'production_url', 'productionUrl')
                  const deploymentTimestamp = getValue(task, 'deployment_timestamp', 'deploymentTimestamp')
                  const qaNotes = getValue(task, 'qa_notes', 'qaNotes')
                  const securityNotes = getValue(task, 'security_notes', 'securityNotes')
                  const acceptance = getValue(task, 'acceptance_criteria', 'acceptanceCriteria')
                  const evidenceLinks = joinList((task as any).evidence_links || (task as any).evidenceLinks)
                  const subtasks = joinList((task as any).subtasks)
                  const swarmLogs = joinList((task as any).swarm_logs || (task as any).swarmLogs)

                  return (
                    <div
                      key={id}
                      className="mc-card mc-card-draggable"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/task-id', id)
                        setDraggingId(id)
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      style={draggingId === id ? { opacity: 0.5 } : undefined}
                    >
                      <div className="mc-card-title">{getValue(task, 'title') || id}</div>
                      <div className="mc-card-meta">
                        <span className="mc-pill">{id}</span>
                        <span className={`mc-pill mc-pill-priority-${priority.toLowerCase()}`}>{priority}</span>
                        {owner ? <span className="mc-pill mc-pill-owner">{owner}</span> : null}
                        <span className={`mc-badge ${prBadgeClass(prStatus)}`}>PR: {prStatus}</span>
                        <span className={`mc-badge ${ciBadgeClass(ciStatus)}`}>CI: {ciStatus}</span>
                      </div>
                      <div className="mc-subtle" style={{ marginTop: 6 }}>{repo ? `${repo}` : 'No repo set'} {branch ? `| ${branch}` : ''}</div>

                      <div className="mc-actions" style={{ marginTop: 8 }}>
                        <button className="mc-btn" onClick={() => setExpanded((s) => ({ ...s, [id]: !s[id] }))}>{isOpen ? 'Collapse' : 'Edit Inline'}</button>
                        <button className="mc-btn" onClick={() => void syncMetadata(id)}>{syncingId === id ? 'Syncing...' : 'Sync GitHub/Vercel'}</button>
                        {savingId === id ? <span className="mc-subtle">Saving...</span> : null}
                      </div>

                      {isOpen ? (
                        <div className="mc-inline-form mc-kanban-editor-grid" style={{ marginTop: 8 }}>
                          <input defaultValue={getValue(task, 'title')} placeholder="Title" onBlur={(e) => void saveTaskPatch(id, { title: e.target.value })} />
                          <input list="agent-options" defaultValue={owner} placeholder="Owner agent" onBlur={(e) => void saveTaskPatch(id, { ownerAgent: e.target.value, owner_agent: e.target.value })} />
                          <select defaultValue={priority} onChange={(e) => void saveTaskPatch(id, { priority: e.target.value })}>
                            <option value="low">low</option>
                            <option value="medium">medium</option>
                            <option value="high">high</option>
                          </select>
                          <select defaultValue={normalizeLane(getValue(task, 'status', 'column'))} onChange={(e) => void moveTask(id, e.target.value as LaneKey)}>
                            {LANES.map((x) => <option key={x} value={x}>{x}</option>)}
                          </select>

                          <input defaultValue={repo} placeholder="Repo" onBlur={(e) => void saveTaskPatch(id, { repo: e.target.value })} />
                          <input defaultValue={branch} placeholder="Branch" onBlur={(e) => void saveTaskPatch(id, { branch: e.target.value, branch_name: e.target.value })} />
                          <input defaultValue={prUrl} placeholder="PR URL" onBlur={(e) => void saveTaskPatch(id, { pr_url: e.target.value, prUrl: e.target.value })} />
                          <select defaultValue={prStatus} onChange={(e) => void saveTaskPatch(id, { pr_status: e.target.value, prStatus: e.target.value })}>
                            <option>Open</option>
                            <option>Approved</option>
                            <option>Merged</option>
                            <option>Closed</option>
                          </select>

                          <select defaultValue={ciStatus} onChange={(e) => void saveTaskPatch(id, { ci_status: e.target.value, ciStatus: e.target.value })}>
                            <option>Passing</option>
                            <option>Failing</option>
                            <option>Running</option>
                            <option>Unknown</option>
                          </select>
                          <input defaultValue={previewUrl} placeholder="Preview URL" onBlur={(e) => void saveTaskPatch(id, { preview_url: e.target.value, previewUrl: e.target.value })} />
                          <input defaultValue={productionUrl} placeholder="Production URL" onBlur={(e) => void saveTaskPatch(id, { production_url: e.target.value, productionUrl: e.target.value })} />
                          <input defaultValue={deploymentTimestamp} placeholder="Deployment timestamp" onBlur={(e) => void saveTaskPatch(id, { deployment_timestamp: e.target.value, deploymentTimestamp: e.target.value })} />

                          <textarea className="mc-editor" defaultValue={acceptance} placeholder="Acceptance criteria" onBlur={(e) => void saveTaskPatch(id, { acceptance_criteria: e.target.value, acceptanceCriteria: e.target.value })} />
                          <textarea className="mc-editor" defaultValue={qaNotes} placeholder="QA notes" onBlur={(e) => void saveTaskPatch(id, { qa_notes: e.target.value, qaNotes: e.target.value })} />
                          <textarea className="mc-editor" defaultValue={securityNotes} placeholder="Security notes" onBlur={(e) => void saveTaskPatch(id, { security_notes: e.target.value, securityNotes: e.target.value })} />
                          <textarea className="mc-editor" defaultValue={getValue(task, 'description')} placeholder="Description" onBlur={(e) => void saveTaskPatch(id, { description: e.target.value })} />

                          <input defaultValue={evidenceLinks} placeholder="Evidence links (comma separated)" onBlur={(e) => void saveTaskPatch(id, { evidence_links: splitList(e.target.value), evidenceLinks: splitList(e.target.value) })} />
                          <input defaultValue={subtasks} placeholder="Subtasks (comma separated)" onBlur={(e) => void saveTaskPatch(id, { subtasks: splitList(e.target.value) })} />
                          <textarea className="mc-editor" defaultValue={swarmLogs} placeholder="Swarm activity log (comma separated summary entries)" onBlur={(e) => void saveTaskPatch(id, { swarm_logs: splitList(e.target.value), swarmLogs: splitList(e.target.value) })} />
                          <textarea className="mc-editor" defaultValue={getValue(task, 'notes')} placeholder="Operational notes" onBlur={(e) => void saveTaskPatch(id, { notes: e.target.value })} />
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
