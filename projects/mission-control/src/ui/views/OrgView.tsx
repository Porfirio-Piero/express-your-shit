import React from 'react'
import {
  fetchDailyReport,
  fetchOrg,
  readWorkspaceFile,
  requestBrainUpdate,
  rebuildOrg,
  retireAgent,
  spawnAgent,
  spawnSubAgentBrief,
  writeWorkspaceFile,
} from '../api'
import type { Agent } from '../types'

const EDITABLE_FILES = ['skill.md', 'MEMORY.md', 'SOUL.md', 'IDENTITY.md', 'TOOLS.md', 'AGENTS.md', 'HEARTBEAT.md']

function buildTree(agents: Agent[]) {
  const byManager = new Map<string, Agent[]>()
  for (const agent of agents) {
    const key = agent.reportsTo || 'Piero'
    const arr = byManager.get(key) || []
    arr.push(agent)
    byManager.set(key, arr)
  }
  for (const list of byManager.values()) list.sort((a, b) => a.id.localeCompare(b.id))
  return byManager
}

function statusClass(status?: string) {
  if (status === 'green') return 'mc-badge-good'
  if (status === 'yellow') return 'mc-badge-warn'
  if (status === 'red') return 'mc-badge-bad'
  return ''
}

function validateSkill(content: string): string | null {
  const required = [
    'Mission:',
    'Specialized Strengths & Blind Spots:',
    'Tooling & MCP Stack:',
    'Operating Rules',
    'Sub-Agent Spawn Policy',
  ]
  const missing = required.filter((h) => !content.includes(h))
  return missing.length ? `Missing required sections: ${missing.join(', ')}` : null
}

export function OrgView() {
  const [agents, setAgents] = React.useState<Agent[]>([])
  const [selected, setSelected] = React.useState<string>('the-botfather')
  const [err, setErr] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [department, setDepartment] = React.useState('all')
  const [zoom, setZoom] = React.useState(1)
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const [file, setFile] = React.useState('skill.md')
  const [content, setContent] = React.useState('')
  const [originalContent, setOriginalContent] = React.useState('')
  const [meta, setMeta] = React.useState('')
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [dailyReport, setDailyReport] = React.useState<Record<string, unknown> | null>(null)
  const [newAgent, setNewAgent] = React.useState('')
  const [newCrew, setNewCrew] = React.useState('Engineering')

  const refresh = React.useCallback(async () => {
    try {
      const data = await fetchOrg()
      const list = data.agents || []
      setAgents(list)
      if (!selected && list[0]?.id) setSelected(list[0].id)
      setErr(null)
    } catch (e) {
      setErr(String(e))
    }
  }, [selected])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const selectedAgent = agents.find((a) => a.id === selected) || null
  const departments = React.useMemo(() => ['all', ...Array.from(new Set(agents.map((a) => a.crew))).sort()], [agents])
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return agents.filter((a) => {
      const deptOk = department === 'all' || a.crew === department
      const textOk = !q || a.id.toLowerCase().includes(q) || (a.role || '').toLowerCase().includes(q) || (a.reportsTo || '').toLowerCase().includes(q)
      return deptOk && textOk
    })
  }, [agents, search, department])

  const visibleIds = new Set(filtered.map((a) => a.id))
  const byManager = React.useMemo(() => buildTree(agents), [agents])

  React.useEffect(() => {
    if (!selectedAgent) return
    readWorkspaceFile(selectedAgent.id, file)
      .then((r) => {
        setContent(r.content || '')
        setOriginalContent(r.content || '')
        setMeta(`${r.path} · ${r.updatedAt || 'unknown'}`)
        setValidationError(null)
      })
      .catch((e) => setErr(String(e)))
    fetchDailyReport(selectedAgent.id).then((r) => setDailyReport(r.report)).catch(() => setDailyReport(null))
  }, [selectedAgent, file])

  function TreeNode({ agentId, depth }: { agentId: string; depth: number }) {
    const agent = agents.find((a) => a.id === agentId)
    if (!agent || !visibleIds.has(agentId)) return null
    const kids = (byManager.get(agent.id) || []).filter((a) => visibleIds.has(a.id))
    const isCollapsed = !!collapsed[agent.id]
    return (
      <li className="mc-tree-node">
        <div className={agent.id === selected ? 'mc-tree-card active' : 'mc-tree-card'} style={{ marginLeft: depth * 18 }}>
          <button className="mc-tree-main" onClick={() => setSelected(agent.id)}>
            <div className="mc-tree-id">{agent.id}</div>
            <div className="mc-tree-role">{agent.role}</div>
            <div className="mc-tree-badges">
              <span className={`mc-badge ${statusClass(agent.status)}`}>{agent.status || 'unknown'}</span>
              <span className="mc-badge">blockers: {agent.blockers || 0}</span>
              {agent.missed ? <span className="mc-badge mc-badge-bad">missed</span> : null}
            </div>
          </button>
          {kids.length ? (
            <button className="mc-btn mc-btn-xs" onClick={() => setCollapsed((s) => ({ ...s, [agent.id]: !s[agent.id] }))}>
              {isCollapsed ? 'Expand' : 'Collapse'}
            </button>
          ) : null}
        </div>
        {kids.length && !isCollapsed ? (
          <ul className="mc-tree-list">
            {kids.map((kid) => (
              <TreeNode key={kid.id} agentId={kid.id} depth={depth + 1} />
            ))}
          </ul>
        ) : null}
      </li>
    )
  }

  return (
    <div className="mc-split">
      <section className="mc-pane">
        <div className="mc-pane-header">
          <div>
            <div className="mc-h1">Organization</div>
            <div className="mc-subtle">Interactive hierarchy with overlays, search, and inline file editing</div>
          </div>
          <div className="mc-actions">
            <button className="mc-btn" onClick={refresh}>Refresh</button>
            <button className="mc-btn" onClick={async () => { await rebuildOrg(); await refresh() }}>Generate/Repair</button>
          </div>
        </div>
        {err ? <div className="mc-error">{err}</div> : null}
        <div className="mc-org-toolbar">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agent or role..." />
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="mc-btn" onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}>-</button>
          <div className="mc-badge">{Math.round(zoom * 100)}%</div>
          <button className="mc-btn" onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}>+</button>
        </div>
        <div className="mc-org-tree-shell">
          <div className="mc-org-tree-stage" style={{ transform: `scale(${zoom})` }}>
            <ul className="mc-tree-list">
              <TreeNode agentId="the-botfather" depth={0} />
            </ul>
          </div>
        </div>
      </section>

      <aside className="mc-pane mc-pane-detail">
        <div className="mc-pane-header">
          <div>
            <div className="mc-h1">Agent Detail</div>
            <div className="mc-subtle">Skill editor, validation, diff check, and governance actions</div>
          </div>
        </div>
        <div className="mc-detail">
          {!selectedAgent ? (
            <div className="mc-detail-empty">Select an agent node.</div>
          ) : (
            <>
              <div className="mc-block">
                <div className="mc-block-title">Summary</div>
                <div className="mc-summary">
                  <div><strong>{selectedAgent.id}</strong></div>
                  <div>{selectedAgent.role}</div>
                  <div>reports to {selectedAgent.reportsTo}</div>
                  <div>direct reports: {(selectedAgent.directReports || []).length}</div>
                  <div>nickname: {selectedAgent.persona?.nickname || 'n/a'}</div>
                  <div>mcp profile: {selectedAgent.mcpAccessProfile || 'n/a'}</div>
                </div>
              </div>
              <div className="mc-block">
                <div className="mc-block-title">Strengths</div>
                <pre className="mc-notes">{(selectedAgent.primaryStrengths || []).length ? JSON.stringify(selectedAgent.primaryStrengths, null, 2) : 'No data yet'}</pre>
              </div>
              <div className="mc-block">
                <div className="mc-block-title">Latest Daily Report</div>
                <pre className="mc-notes">{dailyReport ? JSON.stringify(dailyReport, null, 2) : 'No data yet'}</pre>
              </div>
              <div className="mc-block">
                <div className="mc-block-title">Edit File</div>
                <div className="mc-org-toolbar">
                  <select value={file} onChange={(e) => setFile(e.target.value)}>
                    {EDITABLE_FILES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <button className="mc-btn" onClick={async () => {
                    if (!selectedAgent) return
                    const r = await readWorkspaceFile(selectedAgent.id, file)
                    setContent(r.content || '')
                    setOriginalContent(r.content || '')
                    setMeta(`${r.path} · ${r.updatedAt || 'unknown'}`)
                    setValidationError(null)
                  }}>Reload</button>
                  <button className="mc-btn" onClick={async () => {
                    if (!selectedAgent) return
                    if (file === 'skill.md') {
                      const issue = validateSkill(content)
                      if (issue) { setValidationError(issue); return }
                    }
                    const r = await writeWorkspaceFile(selectedAgent.id, file, content)
                    setOriginalContent(content)
                    setMeta(`${r.path} · ${r.updatedAt || 'saved'}`)
                    setValidationError(null)
                  }}>Save</button>
                </div>
                <div className="mc-subtle">{meta || 'No file selected'}</div>
                {validationError ? <div className="mc-error">{validationError}</div> : null}
                <div className="mc-block-title">Diff Preview</div>
                <pre className="mc-notes">{content === originalContent ? 'No pending changes.' : 'Modified content pending save.'}</pre>
                <textarea className="mc-editor" value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className="mc-block">
                <div className="mc-block-title">Actions</div>
                <div className="mc-actions">
                  <button className="mc-btn" onClick={async () => selectedAgent && spawnSubAgentBrief(selectedAgent.id, `Support ${selectedAgent.id} active goals`)}>Spawn Sub-Agent</button>
                  <button className="mc-btn" onClick={async () => selectedAgent && requestBrainUpdate(selectedAgent.id, `Request brain update permission from ${selectedAgent.id}`)}>Request Brain Update</button>
                  <button className="mc-btn" onClick={async () => { if (!selectedAgent) return; await retireAgent(selectedAgent.id); await refresh() }}>Retire</button>
                </div>
              </div>
            </>
          )}
          <div className="mc-block">
            <div className="mc-block-title">Add Agent</div>
            <div className="mc-inline-form">
              <input value={newAgent} onChange={(e) => setNewAgent(e.target.value)} placeholder="agent-id" />
              <input value={newCrew} onChange={(e) => setNewCrew(e.target.value)} placeholder="department" />
              <button className="mc-btn" onClick={async () => {
                if (!newAgent.trim()) return
                await spawnAgent(newAgent.trim(), newCrew.trim() || 'Engineering')
                setNewAgent('')
                await refresh()
              }}>Add</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
