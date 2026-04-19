import React from 'react'
import { TopBar, type Route } from './components/TopBar'
import { CommandBar } from './components/CommandBar'
import { MissionView } from './views/MissionView'
import { OrgView } from './views/OrgView'
import { WorkspacesView } from './views/WorkspacesView'
import { DependenciesView } from './views/DependenciesView'
import { LogsView } from './views/LogsView'
import { SitdownView } from './views/SitdownView'
import { McpView } from './views/McpView'

function getRouteFromHash(): Route {
  const h = window.location.hash.replace('#', '')
  const routeRaw = h.startsWith('/') ? h.slice(1) : h
  const route = routeRaw.split('?')[0]
  if (route === 'dependencies') {
    const suffix = routeRaw.includes('?') ? `?${routeRaw.split('?')[1]}` : ''
    window.location.hash = `/operations${suffix}`
    return 'operations'
  }
  if (route === 'tasks') {
    const suffix = routeRaw.includes('?') ? `?${routeRaw.split('?')[1]}` : ''
    window.location.hash = `/mission${suffix}`
    return 'mission'
  }
  const allowed: Route[] = ['mission', 'org', 'workspaces', 'operations', 'logs', 'sitdown', 'mcp']
  return (allowed.includes(route as Route) ? route : 'mission') as Route
}

export function App() {
  const [route, setRoute] = React.useState<Route>(() => getRouteFromHash())
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [notice, setNotice] = React.useState<string | null>(null)

  React.useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const mod = isMac ? e.metaKey : e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  React.useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 2200)
    return () => clearTimeout(t)
  }, [notice])

  const navigate = React.useCallback((r: Route) => {
    window.location.hash = `/${r}`
  }, [])

  return (
    <div className="mc-root">
      <div className="mc-wallpaper" />
      <TopBar route={route} onNavigate={navigate} onOpenCommandBar={() => setCommandOpen(true)} />

      <main className="mc-main">
        {route === 'mission' ? <MissionView /> : null}
        {route === 'org' ? <OrgView /> : null}
        {route === 'workspaces' ? <WorkspacesView /> : null}
        {route === 'operations' ? <DependenciesView /> : null}
        {route === 'logs' ? <LogsView /> : null}
        {route === 'sitdown' ? <SitdownView /> : null}
        {route === 'mcp' ? <McpView /> : null}
      </main>

      <CommandBar
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={navigate}
        onNotify={(message) => setNotice(message)}
      />

      {notice ? <div className="mc-toast">{notice}</div> : null}
    </div>
  )
}
