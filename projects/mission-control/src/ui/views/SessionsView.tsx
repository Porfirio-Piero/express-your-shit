import React from 'react'
import { fetchHeartbeatState, runHeartbeat } from '../api'

export function SessionsView() {
  const [data, setData] = React.useState<any>(null)
  const [err, setErr] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    try {
      const d = await fetchHeartbeatState()
      setData(d)
      setErr(null)
    } catch (e) {
      setErr(String(e))
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="mc-pane">
      <div className="mc-pane-header">
        <div>
          <div className="mc-h1">Ops (Heartbeat + Cron)</div>
          <div className="mc-subtle">BotFather scheduler state every 15 minutes</div>
        </div>
        <div className="mc-actions">
          <button className="mc-btn" onClick={refresh}>Refresh</button>
          <button
            className="mc-btn"
            onClick={async () => {
              await runHeartbeat()
              await refresh()
            }}
          >
            Run Now
          </button>
        </div>
      </div>

      {err ? <div className="mc-error">{err}</div> : null}
      <div className="mc-block">
        <div className="mc-block-title">Heartbeat State</div>
        <pre className="mc-notes">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
