import React from 'react'
import { importTasks, rebuildGraph, runHeartbeat, spawnAgent } from '../api'
import type { Route } from './TopBar'

type Cmd = {
  id: string
  label: string
  run: () => Promise<void> | void
}

export function CommandBar(props: {
  open: boolean
  onClose: () => void
  onNavigate: (route: Route) => void
  onNotify: (message: string) => void
}) {
  const [q, setQ] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const cmds: Cmd[] = React.useMemo(
    () => [
      { id: 'mission', label: 'Go to Mission Control', run: () => props.onNavigate('mission') },
      { id: 'org', label: 'Go to Org', run: () => props.onNavigate('org') },
      { id: 'workspaces', label: 'Go to Workspaces', run: () => props.onNavigate('workspaces') },
      { id: 'operations', label: 'Go to Operations', run: () => props.onNavigate('operations') },
      { id: 'logs', label: 'Go to Logs', run: () => props.onNavigate('logs') },
      { id: 'sitdown', label: 'Go to Sitdown', run: () => props.onNavigate('sitdown') },
      { id: 'mcp', label: 'Go to MCP Registry', run: () => props.onNavigate('mcp') },
      {
        id: 'run-heartbeat',
        label: 'Run BotFather heartbeat now',
        run: async () => {
          await runHeartbeat()
          props.onNotify('Heartbeat executed')
        },
      },
      {
        id: 'rebuild-graph',
        label: 'Rebuild dependency graph',
        run: async () => {
          await rebuildGraph()
          props.onNotify('Dependency graph rebuilt')
        },
      },
      {
        id: 'import-tasks',
        label: 'Import existing TaskMaster tasks',
        run: async () => {
          const r = await importTasks()
          props.onNotify(`Imported ${r.imported} task(s)`) 
        },
      },
      {
        id: 'spawn-scout',
        label: 'Spawn agent: scout-01',
        run: async () => {
          await spawnAgent('scout-01', 'product')
          props.onNotify('Spawned scout-01')
        },
      },
      { id: 'reload', label: 'Reload page', run: () => window.location.reload() },
    ],
    [props]
  )

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return cmds
    return cmds.filter((c) => c.label.toLowerCase().includes(qq) || c.id.includes(qq))
  }, [cmds, q])

  React.useEffect(() => {
    if (!props.open) return
    setQ('')
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [props.open])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!props.open) return
      if (e.key === 'Escape') props.onClose()
      if (e.key === 'Enter') {
        void filtered[0]?.run()
        props.onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props.open, props.onClose, filtered])

  if (!props.open) return null

  return (
    <div className="mc-command-overlay" onMouseDown={props.onClose}>
      <div className="mc-command" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="mc-command-input"
          placeholder="Type a command..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mc-command-list">
          {filtered.map((c) => (
            <button
              key={c.id}
              className="mc-command-item"
              onClick={() => {
                void c.run()
                props.onClose()
              }}
            >
              {c.label}
            </button>
          ))}
          {filtered.length === 0 ? <div className="mc-command-empty">No matches</div> : null}
        </div>
      </div>
    </div>
  )
}
