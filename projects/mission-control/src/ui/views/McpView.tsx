import React from 'react'
import {
  bulkMcpAction,
  decideMcpApproval,
  fetchMcpControlPlane,
  importMcp,
  requestBrainUpdate,
  saveMcpRegistry,
  syncMcpToAgents,
  testMcp,
  updateMcpEntry,
  updateMcpRouting,
  validateMcpRegistry,
} from '../api'
import type { MCPControlPlaneResponse, MCPEntry } from '../types'

type ViewMode = 'grid' | 'table'

function riskBadge(risk: string) {
  const r = (risk || '').toLowerCase()
  if (r === 'critical') return 'mc-badge-bad'
  if (r === 'high') return 'mc-badge-warn'
  if (r === 'medium') return 'mc-badge'
  return 'mc-badge-good'
}

export function McpView() {
  const [data, setData] = React.useState<MCPControlPlaneResponse | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [view, setView] = React.useState<ViewMode>('grid')
  const [range, setRange] = React.useState<'24h' | '7d' | '30d'>('24h')
  const [search, setSearch] = React.useState('')
  const [risk, setRisk] = React.useState('')
  const [enabled, setEnabled] = React.useState('')
  const [approvalOnly, setApprovalOnly] = React.useState(false)
  const [category, setCategory] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [selectedDraft, setSelectedDraft] = React.useState<MCPEntry | null>(null)
  const [bulkSelected, setBulkSelected] = React.useState<string[]>([])
  const [routingText, setRoutingText] = React.useState('')
  const [toast, setToast] = React.useState<string | null>(null)
  const [showRaw, setShowRaw] = React.useState(false)

  const refresh = React.useCallback(async () => {
    try {
      const cp = await fetchMcpControlPlane(range)
      setData(cp)
      setErr(null)
    } catch (e) {
      setErr(String(e))
    }
  }, [range])

  React.useEffect(() => { refresh() }, [refresh])
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 1800); return () => clearTimeout(t) }, [toast])

  const mcps = data?.registry?.mcps || []
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return mcps.filter((m) => {
      if (q) {
        const hay = `${m.id} ${m.name} ${m.description} ${(m.tags || []).join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (risk && m.risk !== risk) return false
      if (enabled && String(m.enabled) !== enabled) return false
      if (approvalOnly && !m.approval_required) return false
      if (category && m.category !== category) return false
      return true
    })
  }, [mcps, search, risk, enabled, approvalOnly, category])

  React.useEffect(() => {
    if (!selectedId) return
    const found = mcps.find((m) => m.id === selectedId) || null
    setSelectedDraft(found)
    if (found) {
      const rules = (data?.registry?.routing_rules || []).filter((r: any) => r.mcpId === found.id)
      setRoutingText(rules.map((r: any) => `${r.description}|${r.when || ''}|${r.scope || 'global'}|${r.agentId || ''}|${r.requireApproval ? 'true' : 'false'}`).join('\n'))
    }
  }, [selectedId, mcps, data?.registry?.routing_rules])

  const unsaved = React.useMemo(() => {
    if (!selectedDraft || !selectedId) return false
    const orig = mcps.find((m) => m.id === selectedId)
    return JSON.stringify(orig) !== JSON.stringify(selectedDraft)
  }, [selectedDraft, selectedId, mcps])

  async function saveSelected() {
    if (!selectedDraft) return
    await updateMcpEntry(selectedDraft.id, selectedDraft, 'operator')
    await refresh()
    setToast('MCP saved')
  }

  async function saveRouting() {
    if (!selectedDraft) return
    const rules = routingText.split(/\r?\n/).filter(Boolean).map((line, i) => {
      const [description, when, scope, agentId, requireApproval] = line.split('|')
      return { id: `rr-${selectedDraft.id}-${i + 1}`, mcpId: selectedDraft.id, description, when, scope: scope || 'global', agentId: agentId || undefined, requireApproval: requireApproval === 'true' }
    })
    await updateMcpRouting(selectedDraft.id, rules as any, 'operator')
    setToast('Routing updated')
    await refresh()
  }

  async function quickImport(create = false) {
    const id = window.prompt(create ? 'New MCP id' : 'Import MCP id')
    if (!id) return
    const name = window.prompt('MCP display name', id) || id
    const category = window.prompt('Category', 'general') || 'general'
    const risk = (window.prompt('Risk: low|medium|high|critical', 'medium') || 'medium') as any
    await importMcp({ id, name, category, risk, description: `${create ? 'Created' : 'Imported'} by operator` }, 'operator')
    setToast('MCP added (disabled by default)')
    await refresh()
  }

  const categories = [...new Set(mcps.map((m) => m.category).filter(Boolean))]

  return (
    <div className="mc-pane mc-mcp-shell">
      <div className="mc-pane-header mc-mcp-header">
        <div>
          <div className="mc-mission-title">MCP Registry</div>
          <div className="mc-mission-subtitle">Governance • Routing • Safety-by-default</div>
          <div className="mc-subtle">v{data?.registry?.version || '1.0'} · updated {data?.registry?.updated_at || 'n/a'}</div>
        </div>
        <div className="mc-actions">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name/desc/tag" />
          <select value={risk} onChange={(e) => setRisk(e.target.value)}><option value="">Risk</option><option value="low">Low</option><option value="medium">Med</option><option value="high">High</option><option value="critical">Critical</option></select>
          <select value={enabled} onChange={(e) => setEnabled(e.target.value)}><option value="">Enabled?</option><option value="true">Enabled</option><option value="false">Disabled</option></select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Category</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <select value={range} onChange={(e) => setRange(e.target.value as any)}><option value="24h">24h</option><option value="7d">7d</option><option value="30d">30d</option></select>
          <label className="mc-subtle"><input type="checkbox" checked={approvalOnly} onChange={(e) => setApprovalOnly(e.target.checked)} /> approval required</label>
          <button className="mc-btn" onClick={refresh}>Refresh</button>
          <button className="mc-btn" onClick={async () => { const v = await validateMcpRegistry(); setToast(v.validation.status) }}>Validate</button>
          <button className="mc-btn" onClick={async () => { if (!data) return; await saveMcpRegistry(data.registry); setToast('Registry saved'); await refresh() }}>Save</button>
          <button className="mc-btn" onClick={async () => { const res = await syncMcpToAgents('operator'); setToast(`Synced ${res.changed.length} agents`) }}>Sync to Agents</button>
          <button className="mc-btn" onClick={() => void quickImport(false)}>Import MCP</button>
          <button className="mc-btn mc-btn-primary-glow" onClick={() => void quickImport(true)}>Create MCP</button>
          <span className={`mc-badge ${data?.validation?.status === 'Valid' ? 'mc-badge-good' : data?.validation?.status === 'Warnings' ? 'mc-badge-warn' : 'mc-badge-bad'}`}>{data?.validation?.status || 'Unknown'}</span>
          {unsaved ? <span className="mc-badge mc-badge-warn">Unsaved changes</span> : null}
        </div>
      </div>

      {err ? <div className="mc-error">{err}</div> : null}

      <div className="mc-pane" style={{ margin: '10px 12px' }}>
        <div className="mc-pane-header">
          <div>
            <div className="mc-h1">Brain Routing State</div>
            <div className="mc-subtle">Sources, routing rules, overrides, and permission requests</div>
          </div>
          <div className="mc-actions">
            <span className={`mc-badge ${data?.riskPosture === 'Safe' ? 'mc-badge-good' : data?.riskPosture === 'Caution' ? 'mc-badge-warn' : 'mc-badge-bad'}`}>Risk posture: {data?.riskPosture || 'n/a'}</span>
            <button className="mc-btn" onClick={() => setShowRaw((v) => !v)}>{showRaw ? 'Hide Raw' : 'View Raw'}</button>
          </div>
        </div>
        <div className="mc-detail">
          <div className="mc-subtle">Brain version: {data?.brainState?.version || 'n/a'} · last refresh: {data?.brainState?.lastRefresh || 'n/a'}</div>
          <div className="mc-subtle">Loaded sources: {(data?.brainState?.loadedSources || []).join(', ') || 'none'}</div>
          <div className="mc-subtle">Routing rules: {data?.brainState?.routingRuleCount || 0} · overrides: {data?.brainState?.overridesActive || 0} · pending permissions: {data?.brainState?.pendingPermissionRequests || 0}</div>
          <div className="mc-actions" style={{ marginTop: 8 }}>
            <button className="mc-btn" onClick={async () => { await requestBrainUpdate('operator', 'MCP routing/brain update requested from MCP tab'); setToast('Brain update permission requested') }}>Request Brain Update Permission</button>
            <button className="mc-btn" onClick={() => { window.location.hash = '/workspaces' }}>Show source files</button>
            <button className="mc-btn" onClick={() => { window.location.hash = '/operations' }}>Jump to Operations</button>
            <button className="mc-btn" onClick={() => { window.location.hash = '/logs?event=mcp' }}>Jump to Logs</button>
          </div>
          {showRaw ? <pre className="mc-notes">{JSON.stringify(data?.brainState?.raw || {}, null, 2)}</pre> : null}
        </div>
      </div>

      <div className="mc-mcp-layout">
        <section className="mc-pane">
          <div className="mc-pane-header">
            <div><div className="mc-h1">MCP Catalog</div><div className="mc-subtle">{filtered.length} tools</div></div>
            <div className="mc-actions">
              <button className={view === 'grid' ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setView('grid')}>Grid</button>
              <button className={view === 'table' ? 'mc-btn mc-tab-active' : 'mc-btn'} onClick={() => setView('table')}>Table</button>
              <button className="mc-btn" onClick={async () => { if (!bulkSelected.length) return; await bulkMcpAction(bulkSelected, 'enable'); setToast('Bulk enabled'); await refresh() }}>Bulk Enable</button>
              <button className="mc-btn" onClick={async () => { if (!bulkSelected.length) return; await bulkMcpAction(bulkSelected, 'disable'); setToast('Bulk disabled'); await refresh() }}>Bulk Disable</button>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="mc-org-grid">
              {filtered.map((m) => (
                <button key={m.id} className={selectedId === m.id ? 'mc-org-card active' : 'mc-org-card'} onClick={() => setSelectedId(m.id)}>
                  <div className="mc-org-id">{m.name || m.id}</div>
                  <div className="mc-org-role">{m.description || 'No description'}</div>
                  <div className="mc-card-meta" style={{ marginTop: 6 }}>
                    <span className="mc-pill">{m.category}</span>
                    <span className={`mc-badge ${riskBadge(m.risk)}`}>{m.risk}</span>
                    <span className={`mc-badge ${m.enabled ? 'mc-badge-good' : 'mc-badge-warn'}`}>{m.enabled ? 'Enabled' : 'Disabled'}</span>
                    <span className="mc-badge">{m.approval_required ? 'Approval Required' : 'No Approval'}</span>
                  </div>
                  <div className="mc-org-meta"><span>Agents: {m.allowedAgentsCount || 0}</span><span>Calls: {m.usage?.calls24h || 0}</span></div>
                  <div className="mc-org-report">fail {m.usage?.failPct || 0}% · avg {m.usage?.avgLatencyMs || 0}ms · last {m.usage?.lastUsed || 'n/a'}</div>
                  <div className="mc-actions" style={{ marginTop: 8 }}>
                    <label className="mc-subtle"><input type="checkbox" checked={bulkSelected.includes(m.id)} onChange={(e) => setBulkSelected((s) => e.target.checked ? [...new Set([...s, m.id])] : s.filter((x) => x !== m.id))} /> select</label>
                    <button className="mc-btn mc-btn-xs" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.hash = `/logs?event=${encodeURIComponent(m.id)}` }}>Logs</button>
                    <button className="mc-btn mc-btn-xs" onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await updateMcpEntry(m.id, { enabled: !m.enabled }, 'operator'); await refresh() }}>{m.enabled ? 'Disable' : 'Enable'}</button>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead><tr><th></th><th>Name</th><th>Category</th><th>Risk</th><th>Enabled</th><th>Approval</th><th>Allowed Agents</th><th>Calls(24h)</th><th>Fail%</th><th>Avg Latency</th><th>Last Used</th></tr></thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} onClick={() => setSelectedId(m.id)} style={{ cursor: 'pointer' }}>
                      <td><input type="checkbox" checked={bulkSelected.includes(m.id)} onChange={(e) => setBulkSelected((s) => e.target.checked ? [...new Set([...s, m.id])] : s.filter((x) => x !== m.id))} /></td>
                      <td>{m.name || m.id}</td><td>{m.category}</td><td><span className={`mc-badge ${riskBadge(m.risk)}`}>{m.risk}</span></td><td>{String(m.enabled)}</td><td>{m.approval_required ? 'Required' : 'None'}</td><td>{m.allowedAgentsCount || 0}</td><td>{m.usage?.calls24h || 0}</td><td>{m.usage?.failPct || 0}</td><td>{m.usage?.avgLatencyMs || 0}ms</td><td>{m.usage?.lastUsed || 'n/a'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="mc-pane mc-mcp-right">
          <div className="mc-pane-header"><div><div className="mc-h1">MCP Details</div><div className="mc-subtle">Governance, routing, safety, usage</div></div></div>
          {!selectedDraft ? <div className="mc-detail"><div className="mc-subtle">Select an MCP card to view details.</div></div> : (
            <div className="mc-detail">
              <div className="mc-block"><div className="mc-block-title">Overview</div>
                <div className="mc-inline-form" style={{ gridTemplateColumns: '1fr' }}>
                  <input value={selectedDraft.name} onChange={(e) => setSelectedDraft({ ...selectedDraft, name: e.target.value })} />
                  <textarea className="mc-editor" style={{ minHeight: 80 }} value={selectedDraft.description} onChange={(e) => setSelectedDraft({ ...selectedDraft, description: e.target.value })} />
                  <select value={selectedDraft.category} onChange={(e) => setSelectedDraft({ ...selectedDraft, category: e.target.value })}><option value="general">general</option><option value="filesystem">filesystem</option><option value="git">git</option><option value="browser">browser</option><option value="cloud">cloud</option></select>
                  <select value={selectedDraft.risk} onChange={(e) => setSelectedDraft({ ...selectedDraft, risk: e.target.value as any })}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option></select>
                  <label><input type="checkbox" checked={selectedDraft.enabled} onChange={(e) => setSelectedDraft({ ...selectedDraft, enabled: e.target.checked })} /> Enabled</label>
                </div>
              </div>

              <div className="mc-block"><div className="mc-block-title">Permissions & Governance</div>
                <div className="mc-inline-form" style={{ gridTemplateColumns: '1fr' }}>
                  <input value={(selectedDraft.allowed_agents || []).join(',')} onChange={(e) => setSelectedDraft({ ...selectedDraft, allowed_agents: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} placeholder="Allowed agents comma separated" />
                  <input value={(selectedDraft.denied_agents || []).join(',')} onChange={(e) => setSelectedDraft({ ...selectedDraft, denied_agents: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} placeholder="Denied agents comma separated" />
                  <label><input type="checkbox" checked={selectedDraft.approval_required} onChange={(e) => setSelectedDraft({ ...selectedDraft, approval_required: e.target.checked })} /> Approval required</label>
                  <input value={selectedDraft.approval_type} onChange={(e) => setSelectedDraft({ ...selectedDraft, approval_type: e.target.value })} placeholder="Approval type" />
                  <input type="number" value={selectedDraft.rate_limit_per_hour} onChange={(e) => setSelectedDraft({ ...selectedDraft, rate_limit_per_hour: Number(e.target.value || 0) })} placeholder="Rate limit calls/hour" />
                  <input value={(selectedDraft.scope_constraints?.paths || []).join(',')} onChange={(e) => setSelectedDraft({ ...selectedDraft, scope_constraints: { ...selectedDraft.scope_constraints, paths: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } })} placeholder="Path scopes" />
                </div>
              </div>

              <div className="mc-block"><div className="mc-block-title">Routing Rules (one per line: description|when|scope|agentId|requireApproval)</div>
                <textarea className="mc-editor" style={{ minHeight: 120 }} value={routingText} onChange={(e) => setRoutingText(e.target.value)} />
                <div className="mc-actions" style={{ marginTop: 8 }}>
                  <button className="mc-btn" onClick={() => void saveRouting()}>Save Routing</button>
                  <button className="mc-btn" onClick={() => setToast(`Preview: ${selectedDraft.allowed_agents.length} agents can call ${selectedDraft.id}`)}>Preview routing outcome</button>
                </div>
              </div>

              <div className="mc-block"><div className="mc-block-title">Usage Analytics</div>
                <div className="mc-subtle">Calls(24h): {selectedDraft.usage?.calls24h || 0} · Fail%: {selectedDraft.usage?.failPct || 0} · Avg: {selectedDraft.usage?.avgLatencyMs || 0}ms · P95: {selectedDraft.usage?.p95LatencyMs || 0}ms</div>
                <div className="mc-subtle">Top Agents: {(selectedDraft.usage?.topAgents || []).map((x) => `${x.agent}(${x.count})`).join(' | ') || 'none'}</div>
                <div className="mc-subtle">Top Tasks: {(selectedDraft.usage?.topTasks || []).map((x) => `${x.task}(${x.count})`).join(' | ') || 'none'}</div>
              </div>

              <div className="mc-block"><div className="mc-block-title">Audit Feed</div>
                {(data?.eventFeed || []).filter((e) => e.target_id === selectedDraft.id || String(e.metadata?.mcp_id || '') === selectedDraft.id).slice(0, 10).map((e) => (
                  <div key={e.event_id} className="mc-subtle">{e.event_type} · {e.summary}</div>
                ))}
              </div>

              <div className="mc-actions" style={{ marginTop: 10 }}>
                <button className="mc-btn mc-btn-primary-glow" onClick={() => void saveSelected()}>Save MCP</button>
                <button className="mc-btn" onClick={async () => { const res = await testMcp({ mcpId: selectedDraft.id, agentId: selectedDraft.allowed_agents[0] || 'the-botfather', actionType: selectedDraft.approval_required ? 'write' : 'read', actor: 'operator' }); setToast(res.ok ? 'Test passed' : `Blocked: ${res.reason}`); await refresh() }}>Test MCP</button>
                <button className="mc-btn" onClick={() => { window.location.hash = `/logs?event=${encodeURIComponent(selectedDraft.id)}` }}>View Logs</button>
                <button className="mc-btn" onClick={() => { window.location.hash = '/mission' }}>Open Kanban</button>
                <button className="mc-btn" onClick={() => { window.location.hash = '/org' }}>View Agent</button>
                <button className="mc-btn" onClick={() => { window.location.hash = '/operations' }}>Operations</button>
              </div>

              <details style={{ marginTop: 10 }}>
                <summary>Raw JSON</summary>
                <pre className="mc-notes">{JSON.stringify(selectedDraft, null, 2)}</pre>
              </details>
            </div>
          )}
        </aside>
      </div>

      <section className="mc-pane" style={{ margin: '10px 12px' }}>
        <div className="mc-pane-header"><div><div className="mc-h1">Approval Queue</div><div className="mc-subtle">Pending MCP approvals and decisions</div></div></div>
        <div className="mc-table-wrap">
          <table className="mc-table">
            <thead><tr><th>ID</th><th>MCP</th><th>Requestor</th><th>Task</th><th>Action</th><th>Status</th><th>Requested</th><th>Actions</th></tr></thead>
            <tbody>
              {(data?.approvals || []).map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td><td>{a.mcpId}</td><td>{a.requestor}</td><td>{a.taskId || 'n/a'}</td><td>{a.actionType}</td><td>{a.status}</td><td>{a.requestedAt}</td>
                  <td>
                    <div className="mc-actions">
                      <button className="mc-btn mc-btn-xs" disabled={a.status !== 'pending'} onClick={async () => { await decideMcpApproval(a.id, 'approve'); setToast('Approved'); await refresh() }}>Approve</button>
                      <button className="mc-btn mc-btn-xs" disabled={a.status !== 'pending'} onClick={async () => { await decideMcpApproval(a.id, 'deny'); setToast('Denied'); await refresh() }}>Deny</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast ? <div className="mc-toast">{toast}</div> : null}
    </div>
  )
}
