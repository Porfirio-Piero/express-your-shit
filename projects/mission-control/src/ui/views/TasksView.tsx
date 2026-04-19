import React from 'react'
import { createTask, deleteTask, dontDoTask, fetchOrg, fetchTasks, importTasks, updateTask } from '../api'
import type { TaskMasterTask } from '../types'

type LaneKey = 'Backlog' | 'In Progress' | 'Blocked' | 'Completed'
const LANES: LaneKey[] = ['Backlog', 'In Progress', 'Blocked', 'Completed']

function normalizeLane(task: TaskMasterTask): LaneKey {
  const s = String(task.status || task.column || 'Backlog').toLowerCase()
  if (s.includes('progress')) return 'In Progress'
  if (s.includes('block')) return 'Blocked'
  if (s.includes('done') || s.includes('complete')) return 'Completed'
  return 'Backlog'
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

type InlineDraft = {
  title: string
  ownerAgent: string
  priority: string
  status: LaneKey
  dueDate: string
  approvalState: string
  flowStage: string
  blockerText: string
  tagsInput: string
  notes: string
  description: string
}

export function TasksView() {
  const [tasks, setTasks] = React.useState<TaskMasterTask[]>([])
  const [source, setSource] = React.useState('')
  const [err, setErr] = React.useState<string | null>(null)
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(null)
  const [inlineSavingId, setInlineSavingId] = React.useState<string | null>(null)
  const [actorId, setActorId] = React.useState('botfather')
  const [dontDoReasonMap, setDontDoReasonMap] = React.useState<Record<string, string>>({})
  const [agentOptions, setAgentOptions] = React.useState<string[]>([])
  const [agentRoleMap, setAgentRoleMap] = React.useState<Record<string, string>>({})
  const [saving, setSaving] = React.useState(false)
  const [showCreate, setShowCreate] = React.useState(false)
  const [drafts, setDrafts] = React.useState<Record<string, InlineDraft>>({})

  const [newTask, setNewTask] = React.useState<InlineDraft>({
    title: '',
    ownerAgent: '',
    priority: 'medium',
    status: 'Backlog',
    dueDate: '',
    approvalState: 'pending',
    flowStage: 'intake',
    blockerText: '',
    tagsInput: '',
    notes: '',
    description: '',
  })

  const refresh = React.useCallback(async () => {
    try {
      const [data, org] = await Promise.all([
        fetchTasks(),
        fetchOrg().catch(() => null),
      ])
      const incoming = data.tasks || []
      setTasks(incoming)
      setSource(data.source || '')

      const options = (org?.agents || []).map((a: any) => String(a.id)).filter(Boolean)
      setAgentOptions(options)
      const roleMap: Record<string, string> = {}
      for (const agent of org?.agents || []) {
        roleMap[String(agent.id)] = String((agent as any).role || '')
      }
      setAgentRoleMap(roleMap)

      setDrafts((prev) => {
        const next: Record<string, InlineDraft> = {}
        for (const task of incoming) {
          const existing = prev[task.id]
          if (existing) {
            next[task.id] = existing
            continue
          }
          next[task.id] = {
            title: String(task.title || ''),
            ownerAgent: String(task.ownerAgent || ''),
            priority: String(task.priority || 'medium'),
            status: normalizeLane(task),
            dueDate: String(task.dueDate || ''),
            approvalState: String(task.approvalState || 'pending'),
            flowStage: String(task.flowStage || 'intake'),
            blockerText: String(task.blockerText || ''),
            tagsInput: Array.isArray(task.tags) ? task.tags.join(', ') : '',
            notes: String(task.notes || ''),
            description: String(task.description || ''),
          }
        }
        return next
      })
      setErr(null)
    } catch (e) {
      setErr(String(e))
    }
  }, [])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const groups = React.useMemo(() => {
    const map: Record<LaneKey, TaskMasterTask[]> = {
      Backlog: [],
      'In Progress': [],
      Blocked: [],
      Completed: [],
    }
    for (const task of tasks) map[normalizeLane(task)].push(task)
    return map
  }, [tasks])

  async function moveTask(taskId: string, lane: LaneKey) {
    await updateTask(taskId, { status: lane, column: lane }, actorId || 'botfather')
    await refresh()
  }

  async function addNewTask() {
    if (!newTask.title.trim()) return
    setSaving(true)
    try {
      await createTask({
        title: newTask.title.trim(),
        status: newTask.status,
        priority: newTask.priority,
        ownerAgent: newTask.ownerAgent.trim(),
        description: newTask.description.trim(),
        dueDate: newTask.dueDate || undefined,
        approvalState: newTask.approvalState,
        blockerText: newTask.blockerText.trim(),
        flowStage: newTask.flowStage.trim(),
        tags: parseTags(newTask.tagsInput),
        notes: newTask.notes.trim(),
        actorId: actorId.trim() || 'operator',
      })
      setNewTask({
        title: '',
        ownerAgent: '',
        priority: 'medium',
        status: 'Backlog',
        dueDate: '',
        approvalState: 'pending',
        flowStage: 'intake',
        blockerText: '',
        tagsInput: '',
        notes: '',
        description: '',
      })
      setShowCreate(false)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  async function saveInlineCard(taskId: string) {
    const draft = drafts[taskId]
    if (!draft || !draft.title.trim()) return
    setInlineSavingId(taskId)
    try {
      await updateTask(
        taskId,
        {
          title: draft.title.trim(),
          ownerAgent: draft.ownerAgent.trim(),
          priority: draft.priority,
          description: draft.description.trim(),
          dueDate: draft.dueDate || null,
          approvalState: draft.approvalState,
          blockerText: draft.blockerText.trim(),
          flowStage: draft.flowStage.trim(),
          tags: parseTags(draft.tagsInput),
          notes: draft.notes,
          status: draft.status,
          column: draft.status,
        },
        actorId || 'botfather'
      )
      await refresh()
    } finally {
      setInlineSavingId(null)
    }
  }

  async function removeTask(taskId: string) {
    const ok = window.confirm(`Delete task ${taskId}? This removes the card from the board.`)
    if (!ok) return
    setInlineSavingId(taskId)
    try {
      await deleteTask(taskId, actorId || 'botfather')
      await refresh()
    } finally {
      setInlineSavingId(null)
    }
  }

  async function markDontDo(taskId: string) {
    const reason = (dontDoReasonMap[taskId] || '').trim() || 'Not aligned with priorities'
    const ok = window.confirm(`Mark ${taskId} as DON'T DO and remove it from board?`)
    if (!ok) return
    setInlineSavingId(taskId)
    try {
      await dontDoTask(taskId, reason, actorId || 'botfather')
      setDontDoReasonMap((prev) => ({ ...prev, [taskId]: '' }))
      await refresh()
    } finally {
      setInlineSavingId(null)
    }
  }

  function setDraft(taskId: string, patch: Partial<InlineDraft>) {
    setDrafts((prev) => ({ ...prev, [taskId]: { ...prev[taskId], ...patch } }))
  }

  return (
    <section className="mc-pane">
      <div className="mc-pane-header">
        <div>
          <div className="mc-h1">Task Tracker</div>
          <div className="mc-subtle">
            Fully inline Kanban · Backlog / In Progress / Blocked / Completed · source: {source}
          </div>
        </div>
        <div className="mc-actions">
          <input
            style={{ width: 160 }}
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
            placeholder="actor id"
          />
          <button className="mc-btn mc-btn-primary-glow" onClick={() => setShowCreate((s) => !s)}>
            {showCreate ? 'Close New Task' : 'Add New Task'}
          </button>
          <button className="mc-btn" onClick={() => void refresh()}>Refresh</button>
          <button className="mc-btn" onClick={async () => { await importTasks(); await refresh() }}>Import Existing</button>
        </div>
      </div>

      {err ? <div className="mc-error">{err}</div> : null}

      {showCreate ? (
        <div className="mc-detail" style={{ paddingTop: 10, paddingBottom: 6 }}>
          <div className="mc-block-title">Create Task (PM will auto-flesh requirements)</div>
          <div className="mc-inline-form" style={{ gridTemplateColumns: '2fr 1fr 120px 150px' }}>
            <input
              value={newTask.title}
              onChange={(e) => setNewTask((s) => ({ ...s, title: e.target.value }))}
              placeholder="Task title"
            />
            <input
              list="agent-options-create"
              value={newTask.ownerAgent}
              onChange={(e) => setNewTask((s) => ({ ...s, ownerAgent: e.target.value }))}
              placeholder="Owner agent"
            />
            <datalist id="agent-options-create">
              {agentOptions.map((id) => <option key={id} value={id} />)}
            </datalist>
            <select value={newTask.priority} onChange={(e) => setNewTask((s) => ({ ...s, priority: e.target.value }))}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <select value={newTask.status} onChange={(e) => setNewTask((s) => ({ ...s, status: e.target.value as LaneKey }))}>
              {LANES.map((lane) => <option key={lane} value={lane}>{lane}</option>)}
            </select>
            <input
              value={newTask.description}
              onChange={(e) => setNewTask((s) => ({ ...s, description: e.target.value }))}
              placeholder="Description"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask((s) => ({ ...s, dueDate: e.target.value }))}
            />
            <select value={newTask.approvalState} onChange={(e) => setNewTask((s) => ({ ...s, approvalState: e.target.value }))}>
              <option value="pending">approval: pending</option>
              <option value="required">approval: required</option>
              <option value="approved">approval: approved</option>
              <option value="rejected">approval: rejected</option>
            </select>
            <input
              value={newTask.flowStage}
              onChange={(e) => setNewTask((s) => ({ ...s, flowStage: e.target.value }))}
              placeholder="Flow stage"
            />
            <input
              value={newTask.blockerText}
              onChange={(e) => setNewTask((s) => ({ ...s, blockerText: e.target.value }))}
              placeholder="Blocker text"
            />
            <input
              value={newTask.tagsInput}
              onChange={(e) => setNewTask((s) => ({ ...s, tagsInput: e.target.value }))}
              placeholder="Tags (comma-separated)"
            />
            <button className="mc-btn mc-btn-primary-glow" disabled={saving} onClick={() => void addNewTask()}>
              {saving ? 'Adding...' : 'Create Task'}
            </button>
          </div>
          <textarea
            className="mc-editor"
            style={{ minHeight: 90, marginTop: 8 }}
            value={newTask.notes}
            onChange={(e) => setNewTask((s) => ({ ...s, notes: e.target.value }))}
            placeholder="Notes / context"
          />
        </div>
      ) : null}

      <div className="mc-board">
        {LANES.map((lane) => (
          <div
            key={lane}
            className="mc-col mc-col-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault()
              const taskId = e.dataTransfer.getData('text/task-id')
              if (!taskId) return
              await moveTask(taskId, lane)
              setDraggingId(null)
            }}
          >
            <div className="mc-col-title">
              <span>{lane}</span>
              <span className="mc-col-count">{groups[lane].length}</span>
            </div>
            <div className="mc-col-cards">
              {groups[lane].map((task) => {
                const draft = drafts[task.id]
                const isExpanded = expandedCardId === task.id
                const ownerRole = task.ownerAgent ? agentRoleMap[String(task.ownerAgent)] || '' : ''
                const pmStatus = String((task as any).pmStatus || '')
                const pmFleshedAt = String((task as any).pmFleshedAt || '')

                return (
                  <div
                    key={task.id}
                    className="mc-card mc-card-draggable"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/task-id', task.id)
                      setDraggingId(task.id)
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    style={draggingId === task.id ? { opacity: 0.55 } : undefined}
                  >
                    <div className="mc-card-title">{task.title || task.id}</div>
                    <div className="mc-card-meta">
                      <span className="mc-pill">{task.id}</span>
                      {task.priority ? <span className={`mc-pill mc-pill-priority-${String(task.priority).toLowerCase()}`}>{task.priority}</span> : null}
                      {task.ownerAgent ? <span className="mc-pill mc-pill-owner">{task.ownerAgent}</span> : <span className="mc-pill">unassigned</span>}
                      {task.approvalState ? <span className="mc-pill">approval:{task.approvalState}</span> : null}
                      {task.flowStage ? <span className="mc-pill">stage:{task.flowStage}</span> : null}
                      {task.dueDate ? <span className="mc-pill">due:{task.dueDate}</span> : null}
                    </div>
                    <div className="mc-subtle" style={{ marginTop: 6 }}>
                      {ownerRole ? `role: ${ownerRole}` : 'role: n/a'}
                      {pmStatus ? ` · pm: ${pmStatus}` : ''}
                      {pmFleshedAt ? ` · pm@${pmFleshedAt}` : ''}
                    </div>
                    {task.blockerText ? <div className="mc-subtle" style={{ marginTop: 4, color: '#fde68a' }}>blocker: {task.blockerText}</div> : null}
                    {task.notes ? <div className="mc-subtle" style={{ marginTop: 6 }}>{String(task.notes).slice(0, 130)}</div> : null}

                    <div className="mc-actions" style={{ marginTop: 8 }}>
                      <button className="mc-btn" onClick={() => setExpandedCardId((x) => (x === task.id ? null : task.id))}>
                        {isExpanded ? 'Close Edit' : 'Inline Edit'}
                      </button>
                    </div>

                    {isExpanded && draft ? (
                      <div className="mc-inline-form" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
                        <input value={draft.title} onChange={(e) => setDraft(task.id, { title: e.target.value })} placeholder="Title" />
                        <input list="agent-options-create" value={draft.ownerAgent} onChange={(e) => setDraft(task.id, { ownerAgent: e.target.value })} placeholder="Owner agent" />
                        <select value={draft.priority} onChange={(e) => setDraft(task.id, { priority: e.target.value })}>
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                        <select value={draft.status} onChange={(e) => setDraft(task.id, { status: e.target.value as LaneKey })}>
                          {LANES.map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                        <input type="date" value={draft.dueDate} onChange={(e) => setDraft(task.id, { dueDate: e.target.value })} />
                        <select value={draft.approvalState} onChange={(e) => setDraft(task.id, { approvalState: e.target.value })}>
                          <option value="pending">approval: pending</option>
                          <option value="required">approval: required</option>
                          <option value="approved">approval: approved</option>
                          <option value="rejected">approval: rejected</option>
                        </select>
                        <input value={draft.flowStage} onChange={(e) => setDraft(task.id, { flowStage: e.target.value })} placeholder="Flow stage" />
                        <input value={draft.tagsInput} onChange={(e) => setDraft(task.id, { tagsInput: e.target.value })} placeholder="Tags (comma-separated)" />
                        <input value={draft.blockerText} onChange={(e) => setDraft(task.id, { blockerText: e.target.value })} placeholder="Blocker text" style={{ gridColumn: '1 / -1' }} />
                        <input value={draft.description} onChange={(e) => setDraft(task.id, { description: e.target.value })} placeholder="Description" style={{ gridColumn: '1 / -1' }} />
                        <textarea className="mc-editor" style={{ gridColumn: '1 / -1', minHeight: 90 }} value={draft.notes} onChange={(e) => setDraft(task.id, { notes: e.target.value })} placeholder="Notes / updates" />
                        <input
                          style={{ gridColumn: '1 / -1' }}
                          value={dontDoReasonMap[task.id] || ''}
                          onChange={(e) => setDontDoReasonMap((prev) => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Don't Do reason (optional)"
                        />
                        <div className="mc-actions" style={{ gridColumn: '1 / -1' }}>
                          <button className="mc-btn mc-btn-primary-glow" disabled={inlineSavingId === task.id} onClick={() => void saveInlineCard(task.id)}>
                            {inlineSavingId === task.id ? 'Saving...' : 'Save'}
                          </button>
                          <button className="mc-btn" disabled={inlineSavingId === task.id} onClick={() => void removeTask(task.id)}>
                            Delete
                          </button>
                          <button className="mc-btn" disabled={inlineSavingId === task.id} onClick={() => void markDontDo(task.id)}>
                            Don't Do + Remove
                          </button>
                        </div>
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
  )
}
