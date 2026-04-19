import React from 'react'
import type { TaskMasterTask } from '../../types'

function mdToPlain(md: string): string {
  // MVP: keep it safe/simple; render as preformatted text.
  return md
}

export function TaskDetail(props: { task: TaskMasterTask | null }) {
  const t = props.task
  if (!t)
    return (
      <div className="mc-detail-empty">
        <div className="mc-h1">Task</div>
        <div className="mc-subtle">Select a task</div>
      </div>
    )

  return (
    <div className="mc-detail">
      <div className="mc-detail-header">
        <div className="mc-h1">{t.title}</div>
        <div className="mc-detail-meta">
          <span className="mc-pill">{t.id}</span>
          {t.column ? <span className="mc-pill">{t.column}</span> : null}
          {t.status ? <span className="mc-pill">{t.status}</span> : null}
          {t.priority ? <span className="mc-pill">{t.priority}</span> : null}
          {t.tier ? <span className="mc-pill">{t.tier}</span> : null}
        </div>
      </div>

      {t.description ? (
        <div className="mc-block">
          <div className="mc-block-title">Description</div>
          <div className="mc-block-body">{t.description}</div>
        </div>
      ) : null}

      {t.checklist?.length ? (
        <div className="mc-block">
          <div className="mc-block-title">Checklist</div>
          <div className="mc-checklist">
            {t.checklist.map((c, idx) => (
              <label key={idx} className={c.done ? 'mc-check mc-check-done' : 'mc-check'}>
                <input type="checkbox" checked={c.done} readOnly />
                <span>{c.item}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {t.notes ? (
        <div className="mc-block">
          <div className="mc-block-title">Notes</div>
          <pre className="mc-notes">{mdToPlain(t.notes)}</pre>
        </div>
      ) : null}

      <div className="mc-actions">
        <button
          className="mc-btn"
          onClick={async () => {
            const res = await fetch('/api/actions/spawn', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskId: t.id })
            })
            const j = await res.json().catch(() => ({}))
            alert(`spawn: ${res.status}\n${JSON.stringify(j, null, 2)}`)
          }}
        >
          Spawn
        </button>
        <button
          className="mc-btn"
          onClick={async () => {
            const res = await fetch('/api/actions/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ kind: 'task', taskId: t.id })
            })
            const j = await res.json().catch(() => ({}))
            alert(`send: ${res.status}\n${JSON.stringify(j, null, 2)}`)
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
