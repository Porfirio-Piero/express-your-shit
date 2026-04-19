import React from 'react'
import { fetchLedgerEvents, fetchOperationsOverview, fetchUsageSummary, logEvent } from '../api'
import type { ActivityEvent, UsageSummaryResponse } from '../types'

type Category = 'all' | 'runtime' | 'approvals' | 'deployments' | 'mcp' | 'file_changes' | 'usage' | 'system'

type FilterState = {
  search: string
  eventType: string
  agent: string
  task: string
  severity: string
  range: '1h' | '24h' | '7d' | 'custom'
  category: Category
}

const CATEGORY_TABS: Array<{ key: Category; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'runtime', label: 'Runtime' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'deployments', label: 'Deployments' },
  { key: 'mcp', label: 'MCP' },
  { key: 'file_changes', label: 'File Changes' },
  { key: 'usage', label: 'Usage' },
  { key: 'system', label: 'System' },
]

const DEFAULT_FILTERS: FilterState = {
  search: '',
  eventType: '',
  agent: '',
  task: '',
  severity: '',
  range: '24h',
  category: 'all',
}

function sevClass(severity: string) {
  const s = (severity || '').toLowerCase()
  if (s === 'critical') return 'mc-log-critical'
  if (s === 'error') return 'mc-log-error'
  if (s === 'warn' || s === 'warning') return 'mc-log-warn'
  if (s === 'success') return 'mc-log-success'
  return 'mc-log-info'
}

function eventIcon(type: string) {
  const t = (type || '').toLowerCase()
  if (t.includes('deploy')) return 'DEPLOY'
  if (t.includes('heartbeat')) return 'HB'
  if (t.includes('mcp')) return 'MCP'
  if (t.includes('approval')) return 'APR'
  if (t.includes('file')) return 'FILE'
  if (t.includes('runtime') || t.includes('gateway') || t.includes('agent_run')) return 'RUN'
  if (t.includes('usage')) return 'USG'
  return 'EVT'
}

function relTime(ts: string) {
  const n = Date.now()
  const t = new Date(ts || '').getTime()
  if (!Number.isFinite(t)) return 'n/a'
  const diff = Math.max(0, Math.floor((n - t) / 1000))
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function safeDateLabel(ts?: string | null) {
  const t = new Date(ts || '')
  return Number.isFinite(t.getTime()) ? t.toLocaleString() : 'n/a'
}

function safeDateIso(ts?: string | null) {
  const t = new Date(ts || '')
  return Number.isFinite(t.getTime()) ? t.toISOString() : 'n/a'
}

function safeNum(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function safeText(value: unknown, fallback = 'n/a') {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

function copyText(text: string) {
  void navigator.clipboard?.writeText(text)
}

export function LogsView() {
  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS)
  const [items, setItems] = React.useState<ActivityEvent[]>([])
  const [cursor, setCursor] = React.useState<number | null>(0)
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [options, setOptions] = React.useState<{ agents: string[]; tasks: string[]; eventTypes: string[]; severities: string[] }>({
    agents: [],
    tasks: [],
    eventTypes: [],
    severities: [],
  })
  const [liveMode, setLiveMode] = React.useState(false)
  const [selected, setSelected] = React.useState<ActivityEvent | null>(null)
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [showRaw, setShowRaw] = React.useState<Record<string, boolean>>({})
  const [pins, setPins] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('consiglio.logs.pins') || '[]')
    } catch {
      return []
    }
  })
  const [bookmarks, setBookmarks] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('consiglio.logs.bookmarks') || '[]')
    } catch {
      return []
    }
  })
  const [showRuntimePanel, setShowRuntimePanel] = React.useState(false)
  const [runtime, setRuntime] = React.useState<Awaited<ReturnType<typeof fetchOperationsOverview>> | null>(null)
  const [usage, setUsage] = React.useState<UsageSummaryResponse | null>(null)
  const [usageRange, setUsageRange] = React.useState<'day' | 'week' | 'month'>('week')
  const [newEventPulse, setNewEventPulse] = React.useState(false)
  const [incidentMode, setIncidentMode] = React.useState(false)

  const timelineRef = React.useRef<HTMLDivElement | null>(null)
  const loadingRef = React.useRef(false)
  const cursorRef = React.useRef<number | null>(0)

  const persistPins = React.useCallback((next: string[]) => {
    setPins(next)
    localStorage.setItem('consiglio.logs.pins', JSON.stringify(next))
  }, [])
  const persistBookmarks = React.useCallback((next: string[]) => {
    setBookmarks(next)
    localStorage.setItem('consiglio.logs.bookmarks', JSON.stringify(next))
  }, [])

  const fetchPage = React.useCallback(async (reset = false) => {
    if (loadingRef.current) return
    const nextCursor = reset ? 0 : cursorRef.current
    if (nextCursor === null && !reset) return
    try {
      loadingRef.current = true
      setLoading(true)
      const res = await fetchLedgerEvents({
        limit: 60,
        cursor: nextCursor || 0,
        search: filters.search,
        eventType: filters.eventType,
        agent: filters.agent,
        task: filters.task,
        severity: filters.severity,
        range: filters.range,
        category: filters.category,
      })
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]))
      cursorRef.current = res.nextCursor
      setCursor(res.nextCursor)
      setTotal(res.total)
      setOptions(res.filters)
      setErr(null)
    } catch (e) {
      setErr(String(e))
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [filters])

  const refreshAll = React.useCallback(async () => {
    cursorRef.current = 0
    await fetchPage(true)
    const rangeMap: Record<typeof usageRange, string> = { day: '24h', week: '7d', month: '30d' }
    const [usageRes, runtimeRes] = await Promise.all([
      fetchUsageSummary(rangeMap[usageRange]).catch(() => null),
      showRuntimePanel ? fetchOperationsOverview().catch(() => null) : Promise.resolve(null),
    ])
    if (usageRes) setUsage(usageRes)
    if (runtimeRes) setRuntime(runtimeRes)
  }, [fetchPage, showRuntimePanel, usageRange])

  React.useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  React.useEffect(() => {
    if (!liveMode) return
    const stream = new EventSource('/api/logs/stream')
    stream.addEventListener('log', (ev) => {
      try {
        const parsed = JSON.parse((ev as MessageEvent).data) as ActivityEvent
        setItems((prev) => [parsed, ...prev])
        setTotal((n) => n + 1)
        setNewEventPulse(true)
        setTimeout(() => setNewEventPulse(false), 800)
      } catch {
        // ignore
      }
    })
    stream.onerror = () => {
      stream.close()
    }
    return () => stream.close()
  }, [liveMode])

  React.useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  React.useEffect(() => {
    const onScroll = () => {
      const el = timelineRef.current
      if (!el || loadingRef.current || cursorRef.current === null) return
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 260
      if (nearBottom) void fetchPage(false)
    }
    const el = timelineRef.current
    el?.addEventListener('scroll', onScroll)
    return () => el?.removeEventListener('scroll', onScroll)
  }, [fetchPage])

  React.useEffect(() => {
    const criticalEvents = items.filter((e) => (e.severity || '').toLowerCase() === 'critical')
    const fiveMinAgo = Date.now() - 5 * 60 * 1000
    const recentCritical = criticalEvents.filter((e) => new Date(e.timestamp).getTime() >= fiveMinAgo)
    setIncidentMode(recentCritical.length >= 3)
  }, [items])

  const relatedEvents = React.useMemo(() => {
    if (!selected?.run_id) return []
    return items.filter((e) => e.run_id && e.run_id === selected.run_id && e.event_id !== selected.event_id).slice(0, 12)
  }, [items, selected])

  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `consiglio-logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearLocalCache() {
    localStorage.removeItem('consiglio.logs.pins')
    localStorage.removeItem('consiglio.logs.bookmarks')
    setPins([])
    setBookmarks([])
  }

  function toggleExpanded(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }))
  }

  function toggleRaw(id: string) {
    setShowRaw((s) => ({ ...s, [id]: !s[id] }))
  }

  function togglePin(id: string) {
    const next = pins.includes(id) ? pins.filter((x) => x !== id) : [id, ...pins]
    persistPins(next)
  }

  function toggleBookmarkRun(runId?: string | null) {
    if (!runId) return
    const next = bookmarks.includes(runId) ? bookmarks.filter((x) => x !== runId) : [runId, ...bookmarks]
    persistBookmarks(next)
  }

  async function createIncidentTask() {
    await logEvent({
      type: 'incident_declared',
      severity: 'critical',
      actor: 'operator',
      actor_type: 'human',
      target_type: 'system',
      target_id: 'logs',
      summary: 'Incident mode triggered from Logs tab; creating incident task requested.',
      metadata: { source: 'logs_tab' },
    })
    window.location.hash = '/mission'
  }

  return (
    <div className="mc-pane mc-logs-shell">
      <div className="mc-pane-header mc-logs-header">
        <div>
          <div className="mc-mission-title">System Logs</div>
          <div className="mc-mission-subtitle">Everything that happened, traceable.</div>
          <div className="mc-subtle">System Ledger • Runtime Activity • Audit Trail</div>
        </div>
        <div className="mc-actions">
          <button className="mc-btn" onClick={() => void refreshAll()} disabled={loading}>Refresh</button>
          <button className={liveMode ? 'mc-btn mc-btn-primary-glow' : 'mc-btn'} onClick={() => setLiveMode((v) => !v)}>{liveMode ? 'Live On' : 'Live Mode'}</button>
          <button className="mc-btn" onClick={exportJson}>Export JSON</button>
          <button className="mc-btn" onClick={clearLocalCache}>Clear local cache</button>
        </div>
      </div>

      {incidentMode ? (
        <div className="mc-error" style={{ margin: '10px 12px' }}>
          Incident detected: 3+ critical events in 5 minutes.
          <button className="mc-btn" style={{ marginLeft: 8 }} onClick={() => void createIncidentTask()}>Create Incident Task</button>
        </div>
      ) : null}

      <div className="mc-logs-filterbar">
        <input value={filters.search} onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))} placeholder="Search or syntax: agent:botfather task:TASK-1 type:deployment_completed severity:error" />
        <select value={filters.eventType} onChange={(e) => setFilters((s) => ({ ...s, eventType: e.target.value }))}>
          <option value="">Event Type</option>
          {options.eventTypes.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={filters.agent} onChange={(e) => setFilters((s) => ({ ...s, agent: e.target.value }))}>
          <option value="">Agent</option>
          {options.agents.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={filters.task} onChange={(e) => setFilters((s) => ({ ...s, task: e.target.value }))}>
          <option value="">Task</option>
          {options.tasks.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={filters.severity} onChange={(e) => setFilters((s) => ({ ...s, severity: e.target.value }))}>
          <option value="">Severity</option>
          {options.severities.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <select value={filters.range} onChange={(e) => setFilters((s) => ({ ...s, range: e.target.value as FilterState['range'] }))}>
          <option value="1h">Last 1h</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7d</option>
          <option value="custom">Custom</option>
        </select>
        <button className="mc-btn" onClick={() => void refreshAll()}>Apply</button>
      </div>

      <div className="mc-logs-tabs">
        {CATEGORY_TABS.map((tab) => (
          <button key={tab.key} className={filters.category === tab.key ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setFilters((s) => ({ ...s, category: tab.key }))}>{tab.label}</button>
        ))}
        <button className="mc-btn" onClick={() => setExpanded(Object.fromEntries(items.map((e) => [e.event_id, true])))}>Expand all</button>
        <button className="mc-btn" onClick={() => setExpanded({})}>Collapse all</button>
        <button className={showRuntimePanel ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setShowRuntimePanel((v) => !v)}>Show Runtime Panel</button>
        {liveMode ? <span className={`mc-badge mc-badge-good ${newEventPulse ? 'mc-live-pulse' : ''}`}>Live</span> : null}
      </div>

      {showRuntimePanel ? (
        <div className="mc-logs-runtime">
          <article className="mc-pane">
            <div className="mc-pane-header"><div className="mc-h1">Running Agents</div></div>
            <div className="mc-detail">
              {(runtime?.runningAgents || []).length ? (runtime?.runningAgents || []).slice(0, 8).map((r) => (
                <div key={r.runId} className="mc-subtle">{r.agentId} • {r.action} • {relTime(r.startedAt)}</div>
              )) : <div className="mc-subtle">No active runs</div>}
            </div>
          </article>
          <article className="mc-pane">
            <div className="mc-pane-header"><div className="mc-h1">Token Rate</div></div>
            <div className="mc-detail">
              <div className="mc-stat-value">{(runtime?.usage?.byAgent || []).reduce((n, x) => n + Number(x.tokens || 0), 0)}</div>
              <div className="mc-subtle">Current sampled token volume</div>
            </div>
          </article>
          <article className="mc-pane">
            <div className="mc-pane-header"><div className="mc-h1">Model Routing</div></div>
            <div className="mc-detail">
              {(runtime?.usage?.byModel || []).slice(0, 6).map((m) => <div key={m.model} className="mc-subtle">{m.model}: {m.runs} runs</div>)}
            </div>
          </article>
        </div>
      ) : null}

      {err ? <div className="mc-error">{err}</div> : null}

      <div className="mc-logs-layout">
        <section className="mc-pane" ref={timelineRef} style={{ maxHeight: '58vh', overflow: 'auto' }}>
          <div className="mc-pane-header"><div className="mc-h1">Timeline Ledger</div><div className="mc-subtle">{items.length}/{total} loaded</div></div>
          <div className="mc-logs-timeline">
            {items.map((evt) => {
              const isExpanded = Boolean(expanded[evt.event_id])
              const pinned = pins.includes(evt.event_id)
              const bookmarked = evt.run_id ? bookmarks.includes(evt.run_id) : false
              return (
                <article key={evt.event_id} className={`mc-log-card ${sevClass(evt.severity || 'info')} ${pinned ? 'mc-log-pinned' : ''}`}>
                  <div className="mc-log-left">
                    <div className="mc-log-icon">{eventIcon(evt.event_type || evt.type || '')}</div>
                  </div>
                  <div className="mc-log-main">
                    <div className="mc-log-title-row">
                      <strong>{safeText(evt.event_type || evt.type, 'unknown')}</strong>
                      <span className="mc-badge" title={safeDateIso(evt.timestamp)}>{relTime(evt.timestamp)}</span>
                      <span className="mc-subtle">{safeDateLabel(evt.timestamp)}</span>
                    </div>
                    <div className="mc-subtle">{safeText(evt.summary, 'No summary provided.')}</div>
                    <div className="mc-card-meta" style={{ marginTop: 6 }}>
                      <span className="mc-pill">agent:{safeText(evt.actor)}</span>
                      {evt.task_id ? <button className="mc-pill" onClick={() => setFilters((s) => ({ ...s, task: String(evt.task_id) }))}>task:{safeText(evt.task_id)}</button> : null}
                      {evt.run_id ? <span className="mc-pill">run:{safeText(evt.run_id)}</span> : null}
                      <span className={`mc-badge ${sevClass(String(evt.severity || 'info'))}`}>{safeText(evt.severity || 'info')}</span>
                    </div>
                    {isExpanded ? (
                      <div className="mc-log-expand">
                        <div className="mc-subtle">event_id: <button className="mc-btn mc-btn-xs" onClick={() => copyText(safeText(evt.event_id))}>{safeText(evt.event_id)}</button></div>
                        <div className="mc-subtle">actor: {safeText(evt.actor)} ({safeText(evt.actor_type || 'system')})</div>
                        <div className="mc-subtle">target: {safeText(evt.target_type)}:{safeText(evt.target_id)}</div>
                        <div className="mc-subtle">run_id: {safeText(evt.run_id)} · task_id: {safeText(evt.task_id)} · gateway: {safeText(evt.gateway_id)}</div>
                        <div className="mc-subtle">duration: {safeNum(evt.duration ?? evt.metadata?.duration, NaN).toString() === 'NaN' ? 'n/a' : safeNum(evt.duration ?? evt.metadata?.duration)} · model: {String(evt.metadata?.model || 'n/a')} · tokens: {String(evt.metadata?.tokens || 'n/a')}</div>
                        {evt.event_type === 'file_changed' ? (
                          <div className="mc-subtle">diff preview: {safeText(evt.metadata?.diffPreview || evt.metadata?.file, 'No diff preview')}</div>
                        ) : null}
                        <button className="mc-btn mc-btn-xs" onClick={() => toggleRaw(evt.event_id)}>{showRaw[evt.event_id] ? 'Hide Raw JSON' : 'View Raw JSON'}</button>
                        {showRaw[evt.event_id] ? <pre className="mc-notes" style={{ marginTop: 8 }}>{JSON.stringify(evt, null, 2)}</pre> : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="mc-log-right">
                    <button className="mc-btn mc-btn-xs" onClick={() => toggleExpanded(evt.event_id)}>{isExpanded ? 'Collapse' : 'Expand'}</button>
                    <button className="mc-btn mc-btn-xs" onClick={() => setSelected(evt)}>Open Context</button>
                    <button className="mc-btn mc-btn-xs" onClick={() => togglePin(evt.event_id)}>{pinned ? 'Unpin' : 'Pin'}</button>
                    {evt.run_id ? <button className="mc-btn mc-btn-xs" onClick={() => toggleBookmarkRun(evt.run_id)}>{bookmarked ? 'Unbookmark Run' : 'Bookmark Run'}</button> : null}
                  </div>
                </article>
              )
            })}
            {loading ? <div className="mc-subtle" style={{ padding: 12 }}>Loading...</div> : null}
            {!loading && cursor !== null ? <button className="mc-btn" onClick={() => void fetchPage(false)} style={{ margin: 12 }}>Load more</button> : null}
          </div>
        </section>

        <aside className="mc-pane mc-logs-context">
          <div className="mc-pane-header"><div className="mc-h1">Context</div></div>
          {!selected ? (
            <div className="mc-detail"><div className="mc-subtle">Select an event to inspect details, related runs, and navigation shortcuts.</div></div>
          ) : (
            <div className="mc-detail">
              <div className="mc-block-title">{safeText(selected.event_type, 'unknown')}</div>
              <div className="mc-subtle">{safeText(selected.summary)}</div>
              <div className="mc-subtle">actor: {safeText(selected.actor)} · task: {safeText(selected.task_id)} · run: {safeText(selected.run_id)}</div>

              {selected.event_type === 'heartbeat_completed' ? (
                <div className="mc-block">
                  <div className="mc-block-title">Heartbeat Summary</div>
                  <div className="mc-subtle">detections: {safeText(selected.metadata?.detections)}</div>
                  <div className="mc-subtle">actions: {safeText(selected.metadata?.actions)}</div>
                </div>
              ) : null}

              {selected.event_type === 'deployment_completed' ? (
                <div className="mc-block">
                  <div className="mc-block-title">Deployment</div>
                  <div className="mc-subtle">commit: {safeText(selected.metadata?.commit)}</div>
                  <div className="mc-subtle">pipeline: {safeText(selected.metadata?.pipeline)}</div>
                  <div className="mc-subtle">environment: {safeText(selected.metadata?.environment)}</div>
                  <div className="mc-subtle">rollback: {safeText(selected.metadata?.rollback)}</div>
                </div>
              ) : null}

              {selected.event_type === 'mcp_invoked' ? (
                <div className="mc-block">
                  <div className="mc-block-title">MCP Invocation</div>
                  <div className="mc-subtle">mcp: {safeText(selected.metadata?.mcp_id)}</div>
                  <div className="mc-subtle">input: {safeText(selected.metadata?.request_summary)}</div>
                  <div className="mc-subtle">output: {safeText(selected.metadata?.result_summary)}</div>
                </div>
              ) : null}

              {selected.event_type === 'file_changed' ? (
                <div className="mc-block">
                  <div className="mc-block-title">File Change</div>
                  <div className="mc-subtle">file: {safeText(selected.target_id || selected.metadata?.file)}</div>
                  <pre className="mc-notes">{safeText(selected.metadata?.diffPreview, 'No diff preview')}</pre>
                </div>
              ) : null}

              <div className="mc-block">
                <div className="mc-block-title">Related Logs</div>
                {relatedEvents.length ? relatedEvents.map((e) => (
                  <button key={e.event_id} className="mc-list-btn" onClick={() => setSelected(e)}>{safeText(e.event_type)} · {relTime(e.timestamp)}</button>
                )) : <div className="mc-subtle">No related run logs.</div>}
              </div>

              <div className="mc-actions">
                <button className="mc-btn" onClick={() => { window.location.hash = '/operations' }}>Jump to Operations</button>
                <button className="mc-btn" onClick={() => { window.location.hash = '/mission' }}>Jump to Kanban</button>
                <button className="mc-btn" onClick={() => { window.location.hash = '/org' }}>Jump to Agent</button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <section className="mc-ops-usage" style={{ marginTop: 12 }}>
        <article className="mc-pane">
          <div className="mc-pane-header">
            <div>
              <div className="mc-h1">Token Usage Over Time</div>
              <div className="mc-subtle">Day/week/month split by local vs cloud and estimated cost</div>
            </div>
            <div className="mc-actions">
              <button className={usageRange === 'day' ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setUsageRange('day')}>day</button>
              <button className={usageRange === 'week' ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setUsageRange('week')}>week</button>
              <button className={usageRange === 'month' ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setUsageRange('month')}>month</button>
              <button className="mc-btn" onClick={() => void refreshAll()}>Reload</button>
            </div>
          </div>
          <div className="mc-detail">
            {(usage?.byDay || []).map((d) => (
              <div key={d.date} className="mc-usage-row">
                <span>{d.date}</span>
                <div className="mc-usage-bar"><span style={{ width: `${Math.min(100, (safeNum(d.local) / Math.max(1, safeNum(d.tokens))) * 100)}%` }} /><em>{safeNum(d.local)} local / {safeNum(d.cloud)} cloud · {safeNum(d.tokens)} tokens · ${safeNum(d.costEstimate).toFixed(4)}</em></div>
              </div>
            ))}
          </div>
        </article>

        <article className="mc-pane">
          <div className="mc-pane-header">
            <div>
              <div className="mc-h1">Usage by Agent</div>
              <div className="mc-subtle">Tokens, runs, avg duration by agent</div>
            </div>
          </div>
          <div className="mc-detail">
            {(usage?.byAgent || []).slice(0, 12).map((a) => (
              <div key={a.agentId} className="mc-usage-row">
                <span>{a.agentId}</span>
                <div className="mc-usage-bar"><span style={{ width: `${Math.min(100, a.tokens / Math.max(1, (usage?.byAgent?.[0]?.tokens || 1)) * 100)}%` }} /><em>{a.tokens} tokens · {a.runs} runs · avg {a.avgDurationSec}s</em></div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
