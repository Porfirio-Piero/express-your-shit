import React from 'react'
import {
  convertSitdownToActionPlan,
  excludeSitdownParticipant,
  fetchSitdownSession,
  fetchSitdownSessions,
  forceSitdownAgentUpdate,
  generateSitdownSummary,
  postSitdownComment,
  postSitdownContribution,
  publishSitdownSummary,
  runSitdown,
} from '../api'
import type { SitdownContribution, SitdownSession } from '../types'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function statusClass(status: string) {
  const s = (status || '').toLowerCase()
  if (s.includes('posted')) return 'mc-badge-good'
  if (s.includes('blocked')) return 'mc-badge-bad'
  if (s.includes('waiting')) return 'mc-badge-warn'
  if (s.includes('excluded')) return 'mc-badge'
  return 'mc-badge-warn'
}

function riskClass(risk: string) {
  const r = (risk || '').toLowerCase()
  if (r === 'critical') return 'mc-badge-bad'
  if (r === 'elevated') return 'mc-badge-warn'
  if (r === 'moderate') return 'mc-badge-warn'
  return 'mc-badge-good'
}

export function SitdownView() {
  const [session, setSession] = React.useState<SitdownSession | null>(null)
  const [sessions, setSessions] = React.useState<string[]>([])
  const [selectedDate, setSelectedDate] = React.useState(todayDate())
  const [err, setErr] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [toast, setToast] = React.useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState('')
  const [actor, setActor] = React.useState('operator')
  const [commentDraft, setCommentDraft] = React.useState<Record<string, string>>({})
  const [drafts, setDrafts] = React.useState<Record<string, SitdownContribution>>({})
  const [showFormFor, setShowFormFor] = React.useState<string | null>(null)
  const [yesterday, setYesterday] = React.useState<SitdownSession | null>(null)

  const loadSession = React.useCallback(async (date: string) => {
    try {
      setLoading(true)
      const [sessList, current] = await Promise.all([fetchSitdownSessions(), fetchSitdownSession(date)])
      setSessions(sessList.sessions || [])
      setSession(current.session)
      setErr(null)
      const y = new Date(date)
      y.setDate(y.getDate() - 1)
      const yDate = y.toISOString().slice(0, 10)
      if ((sessList.sessions || []).includes(yDate)) {
        const ySess = await fetchSitdownSession(yDate)
        setYesterday(ySess.session)
      } else {
        setYesterday(null)
      }
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSession(selectedDate)
  }, [loadSession, selectedDate])

  React.useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const byAgent = React.useMemo(() => {
    const map = new Map<string, SitdownContribution>()
    for (const c of session?.contributions || []) map.set(c.agentId, c)
    return map
  }, [session])

  const filteredParticipants = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return session?.participants || []
    return (session?.participants || []).filter((p) => {
      const hay = `${p.agentId} ${p.role} ${p.status}`.toLowerCase()
      return hay.includes(q)
    })
  }, [search, session])

  const recurringBlockers = React.useMemo(() => {
    if (!session || !yesterday) return []
    const today = new Set((session.summary?.topBlockers || []).map((x) => String(x).toLowerCase()))
    return (yesterday.summary?.topBlockers || []).filter((b) => today.has(String(b).toLowerCase()))
  }, [session, yesterday])

  async function handleRunSitdown() {
    const res = await runSitdown(selectedDate, actor)
    setSession(res.session)
    setToast('Sitdown triggered')
  }

  async function handleSaveContribution(agentId: string) {
    const d = drafts[agentId]
    if (!d) return
    const res = await postSitdownContribution(selectedDate, agentId, d)
    setSession(res.session)
    setShowFormFor(null)
    setToast(`Contribution saved for ${agentId}`)
  }

  function startContribution(agentId: string) {
    const existing = byAgent.get(agentId)
    setDrafts((s) => ({
      ...s,
      [agentId]: existing || {
        agentId,
        role: session?.participants.find((p) => p.agentId === agentId)?.role || 'Agent',
        model: 'local/ollama',
        workedOn: [],
        next: [],
        blockers: [],
        approvalRequests: [],
        opportunities: [],
        comments: [],
      },
    }))
    setShowFormFor(agentId)
  }

  async function addComment(agentId: string) {
    const text = (commentDraft[agentId] || '').trim()
    if (!text) return
    const res = await postSitdownComment(selectedDate, agentId, actor, text)
    setSession(res.session)
    setCommentDraft((s) => ({ ...s, [agentId]: '' }))
    setToast('Comment posted')
  }

  async function runAgentUpdate(agentId: string) {
    const res = await forceSitdownAgentUpdate(selectedDate, agentId)
    setSession(res.session)
    setToast(`Forced update posted for ${agentId}`)
  }

  async function toggleExclude(agentId: string, excluded: boolean) {
    const res = await excludeSitdownParticipant(selectedDate, agentId, excluded, actor)
    setSession(res.session)
    setToast(`${excluded ? 'Excluded' : 'Included'} ${agentId}`)
  }

  const anchorMap = React.useRef<Record<string, HTMLElement | null>>({})

  return (
    <div className="mc-pane mc-sit-shell">
      <div className="mc-pane-header">
        <div>
          <div className="mc-mission-title">Sitdown</div>
          <div className="mc-mission-subtitle">Daily Standup • Coordination Room • Decision Log</div>
        </div>
        <div className="mc-actions">
          <span className="mc-badge mc-badge-good">Today's Session: {todayDate()}</span>
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
            {[...new Set([todayDate(), ...sessions])].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="actor" />
          <button className="mc-btn" onClick={() => loadSession(selectedDate)}>Refresh</button>
          <button className="mc-btn mc-btn-primary-glow" onClick={() => void handleRunSitdown()}>Run Sitdown</button>
        </div>
      </div>

      {err ? <div className="mc-error">{err}</div> : null}
      {!session && !loading ? <div className="mc-detail"><div className="mc-subtle">No activity today. Trigger Sitdown or wait for heartbeat.</div></div> : null}

      {session ? (
        <div className="mc-sit-grid">
          <aside className="mc-pane mc-sit-left">
            <div className="mc-pane-header">
              <div>
                <div className="mc-h1">Crew</div>
                <div className="mc-subtle">Active in 24h, open work, approvals, scheduled</div>
              </div>
            </div>
            <div className="mc-detail">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agent / task / blocker / risk" />
            </div>
            <div className="mc-ops-list">
              {filteredParticipants.map((p) => (
                <article key={p.agentId} className={`mc-ops-card ${p.status === 'Not Posted' ? 'mc-focus' : ''}`}>
                  <div className="mc-ops-card-head">
                    <div><strong>{p.agentId}</strong><div className="mc-subtle">{p.role}</div></div>
                    <span className={`mc-badge ${statusClass(p.status)}`}>{p.status}</span>
                  </div>
                  <div className="mc-subtle">tasks: {p.activeTasks} · blockers: {p.blockers} · approvals: {p.waitingApproval}</div>
                  <div className="mc-actions" style={{ marginTop: 8 }}>
                    <button className="mc-btn mc-btn-xs" onClick={() => {
                      setSelectedAgent(p.agentId)
                      anchorMap.current[p.agentId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}>Open</button>
                    <button className="mc-btn mc-btn-xs" onClick={() => void runAgentUpdate(p.agentId)}>Run Update</button>
                    <button className="mc-btn mc-btn-xs" onClick={() => void toggleExclude(p.agentId, !p.excluded)}>{p.excluded ? 'Include' : 'Exclude'}</button>
                  </div>
                </article>
              ))}
            </div>
          </aside>

          <section className="mc-pane mc-sit-center">
            <div className="mc-pane-header">
              <div>
                <div className="mc-h1">Structured Contributions</div>
                <div className="mc-subtle">Strict standup template with linked tasks, blockers, approvals, and opportunities.</div>
              </div>
            </div>
            <div className="mc-ops-list">
              {session.participants.filter((p) => !p.excluded).map((p) => {
                const c = byAgent.get(p.agentId)
                const editing = showFormFor === p.agentId
                const draft = drafts[p.agentId]
                return (
                  <article key={p.agentId} className={`mc-ops-card ${selectedAgent === p.agentId ? 'mc-focus' : ''}`} ref={(el) => { anchorMap.current[p.agentId] = el }}>
                    <div className="mc-ops-card-head">
                      <div>
                        <strong>{p.agentId}</strong>
                        <div className="mc-subtle">{p.role} {c?.model ? `• ${c.model}` : ''}</div>
                      </div>
                      <div className="mc-actions">
                        <span className={`mc-badge ${statusClass(p.status)}`}>{p.status}</span>
                        <button className="mc-btn mc-btn-xs" onClick={() => startContribution(p.agentId)}>{editing ? 'Editing' : 'Edit'}</button>
                      </div>
                    </div>

                    {!editing ? (
                      <>
                        <div className="mc-block"><div className="mc-block-title">1. What I worked on</div><div className="mc-subtle">{(c?.workedOn || []).length ? c?.workedOn.join(' | ') : 'No update yet'}</div></div>
                        <div className="mc-block"><div className="mc-block-title">2. What I’m working on next</div><div className="mc-subtle">{(c?.next || []).length ? c?.next.join(' | ') : 'No update yet'}</div></div>
                        <div className="mc-block"><div className="mc-block-title">3. Blockers</div><div className="mc-subtle">{(c?.blockers || []).length ? c?.blockers.map((b) => `${b.severity}:${b.text}${b.taskId ? `(${b.taskId})` : ''}`).join(' | ') : 'None'}</div></div>
                        <div className="mc-block"><div className="mc-block-title">4. Approval Requests</div><div className="mc-subtle">{(c?.approvalRequests || []).length ? c?.approvalRequests.map((a) => `${a.type}:${a.text}`).join(' | ') : 'None'}</div></div>
                        <div className="mc-block"><div className="mc-block-title">5. Proposed Opportunities</div><div className="mc-subtle">{(c?.opportunities || []).length ? c?.opportunities.join(' | ') : 'None'}</div></div>
                      </>
                    ) : draft ? (
                      <div className="mc-inline-form" style={{ gridTemplateColumns: '1fr' }}>
                        <input value={draft.model} onChange={(e) => setDrafts((s) => ({ ...s, [p.agentId]: { ...draft, model: e.target.value } }))} placeholder="Model used" />
                        <textarea className="mc-editor" style={{ minHeight: 80 }} value={draft.workedOn.join('\n')} onChange={(e) => setDrafts((s) => ({ ...s, [p.agentId]: { ...draft, workedOn: e.target.value.split(/\r?\n/).filter(Boolean) } }))} placeholder="Worked on (one per line)" />
                        <textarea className="mc-editor" style={{ minHeight: 80 }} value={draft.next.join('\n')} onChange={(e) => setDrafts((s) => ({ ...s, [p.agentId]: { ...draft, next: e.target.value.split(/\r?\n/).filter(Boolean) } }))} placeholder="Working on next (one per line)" />
                        <textarea className="mc-editor" style={{ minHeight: 80 }} value={(draft.blockers || []).map((b) => `${b.severity}|${b.text}|${b.taskId || ''}|${b.escalateTo || ''}`).join('\n')} onChange={(e) => {
                          const blockers = e.target.value.split(/\r?\n/).filter(Boolean).map((line) => {
                            const [severity, text, taskId, escalateTo] = line.split('|')
                            return { severity: severity || 'med', text: text || '', taskId: taskId || undefined, escalateTo: escalateTo || undefined }
                          })
                          setDrafts((s) => ({ ...s, [p.agentId]: { ...draft, blockers } }))
                        }} placeholder="Blockers: severity|text|taskId|escalateTo" />
                        <textarea className="mc-editor" style={{ minHeight: 80 }} value={(draft.approvalRequests || []).map((a) => `${a.type}|${a.text}`).join('\n')} onChange={(e) => {
                          const approvalRequests = e.target.value.split(/\r?\n/).filter(Boolean).map((line) => {
                            const [type, text] = line.split('|')
                            return { type: type || 'Approval', text: text || '' }
                          })
                          setDrafts((s) => ({ ...s, [p.agentId]: { ...draft, approvalRequests } }))
                        }} placeholder="Approvals: type|text" />
                        <textarea className="mc-editor" style={{ minHeight: 80 }} value={draft.opportunities.join('\n')} onChange={(e) => setDrafts((s) => ({ ...s, [p.agentId]: { ...draft, opportunities: e.target.value.split(/\r?\n/).filter(Boolean) } }))} placeholder="Opportunities (one per line)" />
                        <div className="mc-actions">
                          <button className="mc-btn mc-btn-primary-glow" onClick={() => void handleSaveContribution(p.agentId)}>Save Contribution</button>
                          <button className="mc-btn" onClick={() => setShowFormFor(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : null}

                    <div className="mc-block">
                      <div className="mc-block-title">Discussion</div>
                      <div className="mc-subtle">Mention agent with @agent-id.</div>
                      {(c?.comments || []).map((m) => (
                        <div key={m.id} className="mc-subtle" style={{ marginTop: 4 }}><strong>{m.actor}</strong>: {m.text}</div>
                      ))}
                      <div className="mc-actions" style={{ marginTop: 8 }}>
                        <input value={commentDraft[p.agentId] || ''} onChange={(e) => setCommentDraft((s) => ({ ...s, [p.agentId]: e.target.value }))} placeholder="Add structured comment / question" />
                        <button className="mc-btn" onClick={() => void addComment(p.agentId)}>Post</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside className="mc-pane mc-sit-right">
            <div className="mc-pane-header">
              <div>
                <div className="mc-h1">BotFather Executive Summary</div>
                <div className="mc-subtle">Top risks, blockers, approvals, and priorities</div>
              </div>
              <span className={`mc-badge ${riskClass(session.summary?.riskLevel || 'Moderate')}`}>{session.summary?.riskLevel || 'Moderate'}</span>
            </div>
            <div className="mc-detail">
              <div className="mc-block"><div className="mc-block-title">Top Blockers</div><div className="mc-subtle">{(session.summary?.topBlockers || []).length ? session.summary.topBlockers.join(' | ') : 'None'}</div></div>
              <div className="mc-block"><div className="mc-block-title">Approvals Needed</div><div className="mc-subtle">{(session.summary?.approvalsNeeded || []).length ? session.summary.approvalsNeeded.join(' | ') : 'None'}</div></div>
              <div className="mc-block"><div className="mc-block-title">Deployment Risks</div><div className="mc-subtle">{(session.summary?.deploymentRisks || []).length ? session.summary.deploymentRisks.join(' | ') : 'None'}</div></div>
              <div className="mc-block"><div className="mc-block-title">Security Flags</div><div className="mc-subtle">{(session.summary?.securityFlags || []).length ? session.summary.securityFlags.join(' | ') : 'None'}</div></div>
              <div className="mc-block"><div className="mc-block-title">Performance Concerns</div><div className="mc-subtle">{(session.summary?.performanceConcerns || []).length ? session.summary.performanceConcerns.join(' | ') : 'None'}</div></div>
              <div className="mc-block"><div className="mc-block-title">Suggested Priorities</div><div className="mc-subtle">{(session.summary?.suggestedPriorities || []).length ? session.summary.suggestedPriorities.join(' | ') : 'None'}</div></div>
              <div className="mc-block"><div className="mc-block-title">Suggested Escalations</div><div className="mc-subtle">{(session.summary?.suggestedEscalations || []).length ? session.summary.suggestedEscalations.join(' | ') : 'None'}</div></div>

              {recurringBlockers.length ? (
                <div className="mc-block">
                  <div className="mc-block-title">Recurring blockers vs yesterday</div>
                  <div className="mc-subtle">{recurringBlockers.join(' | ')}</div>
                </div>
              ) : null}

              <div className="mc-actions" style={{ marginTop: 10 }}>
                <button className="mc-btn" onClick={async () => { const res = await generateSitdownSummary(selectedDate); setSession(res.session); setToast('Summary regenerated') }}>Generate Summary</button>
                <button className="mc-btn" onClick={async () => { await publishSitdownSummary(selectedDate); setToast('Summary published to logs') }}>Publish Summary to Logs</button>
                <button className="mc-btn mc-btn-primary-glow" onClick={async () => { await convertSitdownToActionPlan(selectedDate); setToast('Action plan tasks created'); window.location.hash = '/mission' }}>Convert to Action Plan</button>
              </div>

              <div className="mc-actions" style={{ marginTop: 10 }}>
                <button className="mc-btn" onClick={() => { window.location.hash = '/operations' }}>Open Operations</button>
                <button className="mc-btn" onClick={() => { window.location.hash = '/logs' }}>Open Logs</button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {toast ? <div className="mc-toast">{toast}</div> : null}
    </div>
  )
}
