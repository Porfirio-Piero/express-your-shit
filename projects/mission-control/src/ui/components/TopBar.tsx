import React from 'react'

export type Route = 'mission' | 'org' | 'workspaces' | 'operations' | 'logs' | 'sitdown' | 'mcp'

const NAV_ITEMS: Array<{ key: Route; label: string }> = [
  { key: 'mission', label: 'Mission Control' },
  { key: 'org', label: 'The Family' },
  { key: 'workspaces', label: 'Workspaces' },
  { key: 'operations', label: 'Operations' },
  { key: 'logs', label: 'Logs' },
  { key: 'sitdown', label: 'Sitdown' },
  { key: 'mcp', label: 'MCP' },
]

export function TopBar(props: {
  route: Route
  onNavigate: (r: Route) => void
  onOpenCommandBar: () => void
}) {
  return (
    <header className="mc-topbar">
      <div className="mc-topbar-left">
        <div className="mc-brand">Consiglio</div>
        <nav className="mc-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={props.route === item.key ? 'mc-tab mc-tab-active' : 'mc-tab'}
              onClick={() => props.onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mc-topbar-right">
        <button className="mc-command-pill" onClick={props.onOpenCommandBar}>
          <span className="mc-command-pill-kbd">Ctrl</span>
          <span className="mc-command-pill-kbd">K</span>
          <span className="mc-command-pill-text">Command</span>
        </button>
      </div>
    </header>
  )
}
