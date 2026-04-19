import React from 'react'
import {
  fetchOperationsOverview,
  fetchCronRegistry,
  runCronJob,
  runOperationsAction,
  saveCronRegistry,
  updateHeartbeatSchedule,
} from '../api'
import type {
  ActivityEvent,
  AgentRun,
  CronJob,
  GatewayStatus,
  HeartbeatSchedule,
  ModelUsageRecord,
} from '../types'

type OpsData = {
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
}

type Focus = 'gateways' | 'running' | 'heartbeats' | 'cron' | null

function statusBadgeClass(status: string) {
  const s = status.toLowerCase()
  if (s.includes('connected') || s.includes('running') || s.includes('ok') || s.includes('healthy')) return 'mc-badge-good'
  if (s.includes('degraded') || s.includes('warn')) return 'mc-badge-warn'
  return 'mc-badge-bad'
}

function safeNum(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}m ${r}s`
}

function shortTs(ts?: string | null) {
  if (!ts) return 'n/a'
  return new Date(ts).toLocaleString()
}

export function DependenciesView() {
  const [data, setData] = React.useState<OpsData | null>(null)
  const [cronJobs, setCronJobs] = React.useState<CronJob[]>([])
  const [err, setErr] = React.useState<string | null>(null)
  const [busyAction, setBusyAction] = React.useState<string | null>(null)
  const [toast, setToast] = React.useState<string | null>(null)
  const [focus, setFocus] = React.useState<Focus>(null)
  const [search, setSearch] = React.useState('')
  const [selectedGateway, setSelectedGateway] = React.useState<GatewayStatus | null>(null)
  const [selectedRun, setSelectedRun] = React.useState<AgentRun | null>(null)
  const [selectedHeartbeat, setSelectedHeartbeat] = React.useState<HeartbeatSchedule | null>(null)
  const [heartbeatDraft, setHeartbeatDraft] = React.useState({ schedule: 'every 15m', enabled: true })
  const [selectedCron, setSelectedCron] = React.useState<CronJob | null>(null)
  const [cronDraft, setCronDraft] = React.useState<CronJob | null>(null)
  const [usageRange, setUsageRange] = React.useState<'today' | 'week' | 'month'>('today')
  const [quickAction, setQuickAction] = React.useState('')

  const refresh = React.useCallback(async () => {
    try {
      const [ops, cron] = await Promise.all([fetchOperationsOverview(), fetchCronRegistry()])
      setData(ops)
      setCronJobs((cron.registry?.jobs || []) as CronJob[])
      setErr(null)
    } catch (e) {
      setErr(String(e))
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  React.useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  async function runAction(action: string, metadata?: Record<string, unknown>) {
    try {
      setBusyAction(action)
      const result = await runOperationsAction(action, 'operator', metadata)
      const message = String((result.result?.message as string) || 'Action complete')
      setToast(message)
      await refresh()
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusyAction(null)
    }
  }

  const filteredCron = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cronJobs
    return cronJobs.filter((j) => {
      return (
        j.name.toLowerCase().includes(q) ||
        j.ownerAgent.toLowerCase().includes(q) ||
        j.purpose.toLowerCase().includes(q) ||
        j.schedule.toLowerCase().includes(q)
      )
    })
  }, [cronJobs, search])

  const envChip = data?.environment || 'Local'
  const kpis = data?.kpis || {}

  const gatewayRuntime = data?.runtime?.processes?.gateway
  const ollamaRuntime = data?.runtime?.processes?.ollama

  return (
    <div className="mc-pane">
      <div className="mc-pane-header mc-ops-header">
        <div>
          <div className="mc-mission-title">Operations</div>
          <div className="mc-mission-subtitle">Runtime cockpit for OpenClaw + Ollama (live state)</div>
          <span className={`mc-badge ${envChip === 'Local' ? 'mc-badge-good' : envChip === 'Mixed' ? 'mc-badge-warn' : 'mc-badge-bad'}`}>{envChip}</span>
        </div>
        <div className="mc-actions">
          <button className="mc-btn mc-btn-outline" onClick={() => runAction('operations_refresh')} disabled={busyAction !== null}>{busyAction === 'operations_refresh' ? 'Refreshing...' : 'Refresh'}</button>
          <button className="mc-btn mc-btn-outline" onClick={() => runAction('runtime_resync')} disabled={busyAction !== null}>{busyAction === 'runtime_resync' ? 'Resyncing...' : 'Resync Runtime'}</button>
          <span className="mc-badge">Ctrl + K</span>

          <div className="mc-runtime-group">
            <span className="mc-subtle">Gateway</span>
            <span className={`mc-badge ${statusBadgeClass(gatewayRuntime?.status || 'stopped')}`}>{gatewayRuntime?.status || 'stopped'}</span>
            <span className="mc-subtle">{shortTs(gatewayRuntime?.lastActionAt)}</span>
            <button className="mc-btn" onClick={() => runAction('gateway_start')} disabled={busyAction !== null}>{busyAction === 'gateway_start' ? 'Starting...' : 'Start'}</button>
            <button className="mc-btn" onClick={() => runAction('gateway_restart')} disabled={busyAction !== null}>{busyAction === 'gateway_restart' ? 'Restarting...' : 'Restart'}</button>
            <button className="mc-btn" onClick={() => { if (window.confirm('Stop Gateway?')) void runAction('gateway_stop') }} disabled={busyAction !== null}>{busyAction === 'gateway_stop' ? 'Stopping...' : 'Stop'}</button>
          </div>

          <div className="mc-runtime-group">
            <span className="mc-subtle">Ollama</span>
            <span className={`mc-badge ${statusBadgeClass(ollamaRuntime?.status || 'stopped')}`}>{ollamaRuntime?.status || 'stopped'}</span>
            <span className="mc-subtle">{shortTs(ollamaRuntime?.lastActionAt)}</span>
            <button className="mc-btn" onClick={() => runAction('ollama_start')} disabled={busyAction !== null}>{busyAction === 'ollama_start' ? 'Starting...' : 'Start'}</button>
            <button className="mc-btn" onClick={() => runAction('ollama_restart')} disabled={busyAction !== null}>{busyAction === 'ollama_restart' ? 'Restarting...' : 'Restart'}</button>
            <button className="mc-btn" onClick={() => { if (window.confirm('Stop Ollama?')) void runAction('ollama_stop') }} disabled={busyAction !== null}>{busyAction === 'ollama_stop' ? 'Stopping...' : 'Stop'}</button>
          </div>

          <div className="mc-runtime-group">
            <select value={quickAction} onChange={(e) => setQuickAction(e.target.value)}>
              <option value="">Quick Actions</option>
              <option value="runtime_restart_all">Restart All (Safe Sequence)</option>
              <option value="runtime_health_check">Health Check Now</option>
              <option value="clear_stale_runs">Clear Stale Runs</option>
              <option value="open_latest_logs">Open Latest Logs</option>
            </select>
            <button
              className="mc-btn mc-btn-primary-glow"
              disabled={!quickAction || busyAction !== null}
              onClick={() => {
                if (!quickAction) return
                if (quickAction === 'open_latest_logs') {
                  void runAction('open_latest_logs')
                  window.location.hash = '/logs?event=runtime'
                  return
                }
                if (quickAction === 'runtime_restart_all' && !window.confirm('Restart all with safe sequence?')) return
                void runAction(quickAction)
              }}
            >
              Execute
            </button>
          </div>
        </div>
      </div>

      {err ? <div className="mc-error">{err}</div> : null}

      <div className="mc-metric-grid">
        <article className="mc-metric-card" onClick={() => setFocus('gateways')}>
          <div className="mc-metric-top"><span className="mc-metric-icon">GW</span><span className={`mc-badge ${safeNum(kpis.gatewaysConnected) > 0 ? 'mc-badge-good' : 'mc-badge-bad'}`}>{safeNum(kpis.gatewaysConnected) > 0 ? 'Healthy' : 'Down'}</span></div>
          <div className="mc-metric-value">{safeNum(kpis.gatewaysConnected)}/{safeNum(kpis.gatewaysTotal)}</div>
          <div className="mc-metric-label">Gateways</div>
        </article>
        <article className="mc-metric-card" onClick={() => setFocus('running')}>
          <div className="mc-metric-top"><span className="mc-metric-icon">RUN</span><span className="mc-badge mc-badge-good">Live</span></div>
          <div className="mc-metric-value">{safeNum(kpis.activeAgents)} + {safeNum(kpis.activeSubagents)}</div>
          <div className="mc-metric-label">Running</div>
        </article>
        <article className="mc-metric-card" onClick={() => setFocus('heartbeats')}>
          <div className="mc-metric-top"><span className="mc-metric-icon">HB</span><span className={`mc-badge ${safeNum(kpis.heartbeatFailures24h) ? 'mc-badge-bad' : 'mc-badge-good'}`}>{safeNum(kpis.heartbeatFailures24h) ? 'Issues' : 'Healthy'}</span></div>
          <div className="mc-metric-value">{safeNum(kpis.heartbeatFailures24h)}</div>
          <div className="mc-metric-label">Heartbeat failures (24h)</div>
        </article>
        <article className="mc-metric-card" onClick={() => setFocus('cron')}>
          <div className="mc-metric-top"><span className="mc-metric-icon">CRON</span><span className={`mc-badge ${safeNum(kpis.cronFailures24h) ? 'mc-badge-warn' : 'mc-badge-good'}`}>{safeNum(kpis.cronFailures24h) ? 'Degraded' : 'Healthy'}</span></div>
          <div className="mc-metric-value">{safeNum(kpis.cronEnabled)}</div>
          <div className="mc-metric-label">Cron jobs enabled</div>
        </article>
      </div>

      <div className="mc-ops-grid">
        <section className={`mc-pane ${focus === 'gateways' ? 'mc-focus' : ''}`}>
          <div className="mc-pane-header"><div className="mc-h1">Gateways</div></div>
          <div className="mc-ops-list">
            {(data?.gateways || []).map((g) => (
              <article key={g.id} className="mc-ops-card" onClick={() => setSelectedGateway(g)}>
                <div className="mc-ops-card-head">
                  <div><strong>{g.name}</strong> <span className="mc-subtle">({g.location})</span></div>
                  <span className={`mc-badge ${statusBadgeClass(g.status)}`}>{g.status}</span>
                </div>
                <div className="mc-subtle">latency: {g.latencyMs ?? '--'}ms · last check: {g.lastCheckAt ? new Date(g.lastCheckAt).toLocaleTimeString() : 'n/a'}</div>
                <div className="mc-subtle">active sessions: {g.activeRuns}</div>
                <div className="mc-card-meta" style={{ marginTop: 6 }}>{(g.models || []).map((m) => <span key={m} className="mc-pill">{m}</span>)}</div>
                {g.lastError ? <div className="mc-error" style={{ margin: '8px 0 0 0' }}>{g.lastError}</div> : null}
                <div className="mc-actions" style={{ marginTop: 8 }}>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); void runAction('runtime_health_check') }}>Ping</button>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); window.location.hash = '/logs?event=gateway' }}>View Logs</button>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); void runAction('gateway_restart') }}>Restart</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`mc-pane ${focus === 'running' ? 'mc-focus' : ''}`}>
          <div className="mc-pane-header"><div className="mc-h1">Running Agents & Sub-Agents</div></div>
          <div className="mc-ops-list">
            {(data?.runningAgents || []).length === 0 ? (
              <div className="mc-detail">
                <div className="mc-subtle">No active runs</div>
                <div className="mc-actions" style={{ marginTop: 8 }}>
                  <button className="mc-btn" onClick={() => void runAction('heartbeat_run')}>Run Heartbeat</button>
                  <button className="mc-btn" onClick={() => { window.location.hash = '/mission' }}>Open Kanban</button>
                </div>
              </div>
            ) : (data?.runningAgents || []).map((run) => (
              <article key={run.runId} className="mc-ops-card" onClick={() => setSelectedRun(run)}>
                <div className="mc-ops-card-head">
                  <div><strong>{run.agentId}</strong> <span className="mc-pill">{run.role}</span></div>
                  <span className={`mc-badge ${statusBadgeClass(run.status)}`}>{run.status}</span>
                </div>
                <div className="mc-subtle">Task: {run.taskTitle} ({run.taskId})</div>
                <div className="mc-subtle">Action: {run.action}</div>
                <div className="mc-card-meta" style={{ marginTop: 6 }}>
                  <span className="mc-pill">{formatDuration(run.durationSec)}</span>
                  <span className="mc-pill">{run.model}</span>
                  <span className="mc-pill">{run.tokens} tokens</span>
                </div>
                {(run.subagents || []).length ? <div className="mc-subtle" style={{ marginTop: 6 }}>Sub-agents: {(run.subagents || []).map((s) => s.id).join(', ')}</div> : null}
                <div className="mc-actions" style={{ marginTop: 8 }}>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); void runAction('agent_stop', { runId: run.runId }) }}>Stop</button>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); if (window.confirm('Hard kill this run?')) void runAction('agent_kill', { runId: run.runId }) }}>Kill</button>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); window.location.hash = `/logs?event=${encodeURIComponent(run.runId)}` }}>Run Trace</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`mc-pane ${focus === 'heartbeats' ? 'mc-focus' : ''}`}>
          <div className="mc-pane-header"><div className="mc-h1">Heartbeats</div></div>
          <div className="mc-ops-list">
            {(data?.heartbeats || []).map((h) => (
              <article key={h.agentId} className="mc-ops-card" onClick={() => { setSelectedHeartbeat(h); setHeartbeatDraft({ schedule: h.schedule, enabled: h.enabled }) }}>
                <div className="mc-ops-card-head">
                  <div><strong>{h.agentId}</strong></div>
                  <span className={`mc-badge ${statusBadgeClass(h.lastStatus)}`}>{h.lastStatus}</span>
                </div>
                <div className="mc-subtle">next: {h.nextRun ? new Date(h.nextRun).toLocaleString() : 'n/a'}</div>
                <div className="mc-subtle">last: {h.lastRunAt ? new Date(h.lastRunAt).toLocaleString() : 'n/a'} · fail24h: {h.fail24h}</div>
                <div className="mc-actions" style={{ marginTop: 8 }}>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); void runAction('heartbeat_run', { agentId: h.agentId }) }}>Run Now</button>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); setSelectedHeartbeat(h) }}>Edit</button>
                  <button className="mc-btn" onClick={(e) => { e.stopPropagation(); window.location.hash = '/logs?event=heartbeat' }}>Logs</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className={`mc-pane ${focus === 'cron' ? 'mc-focus' : ''}`} style={{ marginTop: 12 }}>
        <div className="mc-pane-header">
          <div>
            <div className="mc-h1">Cron Jobs Registry</div>
            <div className="mc-subtle">Sortable searchable registry with run controls</div>
          </div>
          <div className="mc-actions">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by owner, job, purpose..." />
            <button className="mc-btn" onClick={async () => { await saveCronRegistry({ jobs: cronJobs }); await refresh() }}>Save</button>
          </div>
        </div>
        <div className="mc-table-wrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Job</th><th>Owner</th><th>Purpose</th><th>Schedule</th><th>Enabled</th><th>Last</th><th>Next</th><th>Fail24h</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCron.map((j) => (
                <tr key={j.id}>
                  <td>{j.name}</td>
                  <td>{j.ownerAgent}</td>
                  <td>{j.purpose}</td>
                  <td><span className="mc-pill">{j.human}</span><div className="mc-subtle">{j.schedule}</div></td>
                  <td>
                    <input
                      type="checkbox"
                      checked={j.enabled}
                      onChange={(e) => setCronJobs((prev) => prev.map((row) => row.id === j.id ? { ...row, enabled: e.target.checked } : row))}
                    />
                  </td>
                  <td>{j.lastRunStatus} · {j.lastRunTime || 'n/a'}</td>
                  <td>{j.nextRunTime || 'n/a'}</td>
                  <td>{j.fail24h}</td>
                  <td>
                    <div className="mc-actions">
                      <button className="mc-btn" onClick={() => runCronJob(j.id)}>Run Now</button>
                      <button className="mc-btn" onClick={() => { setSelectedCron(j); setCronDraft({ ...j }) }}>Edit</button>
                      <button className="mc-btn" onClick={() => setCronJobs((prev) => prev.map((row) => row.id === j.id ? { ...row, enabled: false } : row))}>Disable</button>
                      <button className="mc-btn" onClick={() => { window.location.hash = '/logs?event=cron' }}>Logs</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mc-ops-usage" style={{ marginTop: 12 }}>
        <article className="mc-pane">
          <div className="mc-pane-header">
            <div>
              <div className="mc-h1">Usage by Agent</div>
              <div className="mc-subtle">Local vs cloud split and token trends</div>
            </div>
            <div className="mc-actions">
              {(['today', 'week', 'month'] as const).map((range) => (
                <button key={range} className={usageRange === range ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setUsageRange(range)}>{range}</button>
              ))}
            </div>
          </div>
          <div className="mc-ops-list">
            {(data?.usage?.byAgent || []).map((u) => {
              const label = u.agentId || 'unknown'
              const tokens = Number(u.tokens || 0)
              const local = Number(u.local || 0)
              const cloud = Number(u.cloud || 0)
              return (
                <article key={label} className="mc-ops-card" onClick={() => {
                  const match = (data?.runningAgents || []).find((r) => r.agentId === label)
                  if (match) setSelectedRun(match)
                }}>
                  <div className="mc-ops-card-head"><div><strong>{label}</strong></div><span className="mc-pill">{u.runs} runs</span></div>
                  <div className="mc-subtle">tokens: {tokens}</div>
                  <div className="mc-usage-bar"><span style={{ width: `${Math.min(100, (local / Math.max(1, tokens)) * 100)}%` }} /><em>{local} local / {cloud} cloud</em></div>
                </article>
              )
            })}
          </div>
        </article>

        <article className="mc-pane">
          <div className="mc-pane-header">
            <div>
              <div className="mc-h1">Usage by Model</div>
              <div className="mc-subtle">Tokens, runs, average duration, estimated cost</div>
            </div>
          </div>
          <div className="mc-ops-list">
            {(data?.usage?.byModel || []).map((m) => {
              const model = m.model || 'unknown-model'
              return (
                <article key={model} className="mc-ops-card">
                  <div className="mc-ops-card-head"><div><strong>{model}</strong></div><span className="mc-pill">{m.runs} runs</span></div>
                  <div className="mc-subtle">tokens: {m.tokens} · avg: {m.avgDurationSec || 0}s · est cost: ${Number(m.costEstimate || 0).toFixed(4)}</div>
                </article>
              )
            })}
          </div>
        </article>
      </section>

      {selectedGateway ? (
        <div className="mc-drawer-overlay" onClick={() => setSelectedGateway(null)}>
          <aside className="mc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mc-pane-header"><div className="mc-h1">Gateway Details</div><button className="mc-btn" onClick={() => setSelectedGateway(null)}>Close</button></div>
            <div className="mc-detail">
              <div className="mc-block-title">{selectedGateway.name}</div>
              <div className="mc-subtle">status: {selectedGateway.status} · active runs: {selectedGateway.activeRuns}</div>
              <details>
                <summary>Raw Metadata JSON</summary>
                <pre className="mc-notes">{JSON.stringify(selectedGateway, null, 2)}</pre>
              </details>
            </div>
          </aside>
        </div>
      ) : null}

      {selectedRun ? (
        <div className="mc-drawer-overlay" onClick={() => setSelectedRun(null)}>
          <aside className="mc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mc-pane-header"><div className="mc-h1">Run Trace</div><button className="mc-btn" onClick={() => setSelectedRun(null)}>Close</button></div>
            <div className="mc-detail"><pre className="mc-notes">{JSON.stringify(selectedRun, null, 2)}</pre></div>
          </aside>
        </div>
      ) : null}

      {selectedHeartbeat ? (
        <div className="mc-drawer-overlay" onClick={() => setSelectedHeartbeat(null)}>
          <aside className="mc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mc-pane-header"><div className="mc-h1">Edit Heartbeat</div><button className="mc-btn" onClick={() => setSelectedHeartbeat(null)}>Close</button></div>
            <div className="mc-detail">
              <div className="mc-inline-form" style={{ gridTemplateColumns: '1fr' }}>
                <select value={heartbeatDraft.schedule} onChange={(e) => setHeartbeatDraft((s) => ({ ...s, schedule: e.target.value }))}>
                  <option value="every 15m">every 15m</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                </select>
                <label><input type="checkbox" checked={heartbeatDraft.enabled} onChange={(e) => setHeartbeatDraft((s) => ({ ...s, enabled: e.target.checked }))} /> enabled</label>
                <button className="mc-btn" onClick={async () => {
                  await updateHeartbeatSchedule(selectedHeartbeat.agentId, heartbeatDraft.schedule, heartbeatDraft.enabled)
                  await refresh()
                  setSelectedHeartbeat(null)
                }}>Save</button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {selectedCron && cronDraft ? (
        <div className="mc-drawer-overlay" onClick={() => { setSelectedCron(null); setCronDraft(null) }}>
          <aside className="mc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mc-pane-header"><div className="mc-h1">Edit Cron Job</div><button className="mc-btn" onClick={() => { setSelectedCron(null); setCronDraft(null) }}>Close</button></div>
            <div className="mc-detail">
              <div className="mc-inline-form" style={{ gridTemplateColumns: '1fr' }}>
                <input value={cronDraft.name} onChange={(e) => setCronDraft({ ...cronDraft, name: e.target.value })} />
                <input value={cronDraft.ownerAgent} onChange={(e) => setCronDraft({ ...cronDraft, ownerAgent: e.target.value })} />
                <input value={cronDraft.purpose} onChange={(e) => setCronDraft({ ...cronDraft, purpose: e.target.value })} />
                <input value={cronDraft.human} onChange={(e) => setCronDraft({ ...cronDraft, human: e.target.value })} />
                <input value={cronDraft.schedule} onChange={(e) => setCronDraft({ ...cronDraft, schedule: e.target.value })} />
                <label><input type="checkbox" checked={cronDraft.enabled} onChange={(e) => setCronDraft({ ...cronDraft, enabled: e.target.checked })} /> enabled</label>
                <button className="mc-btn" onClick={async () => {
                  const nextJobs = cronJobs.map((j) => j.id === cronDraft.id ? cronDraft : j)
                  setCronJobs(nextJobs)
                  await saveCronRegistry({ jobs: nextJobs })
                  await refresh()
                  setSelectedCron(null)
                  setCronDraft(null)
                }}>Save</button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {toast ? <div className="mc-toast">{toast}</div> : null}
    </div>
  )
}

