import React from 'react'
import { fetchWorkspaceFiles, fetchWorkspaces, readWorkspaceFile, writeWorkspaceFile } from '../api'
import type { WorkspaceFile } from '../types'

export function WorkspacesView() {
  const [workspaces, setWorkspaces] = React.useState<string[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<string | null>(null)
  const [files, setFiles] = React.useState<WorkspaceFile[]>([])
  const [selectedFile, setSelectedFile] = React.useState<string>('skill.md')
  const [content, setContent] = React.useState('')
  const [meta, setMeta] = React.useState('')
  const [err, setErr] = React.useState<string | null>(null)

  const refreshWorkspaces = React.useCallback(async () => {
    try {
      const data = await fetchWorkspaces()
      setWorkspaces(data.workspaces || [])
      const ws = selectedWorkspace || data.workspaces?.[0] || null
      setSelectedWorkspace(ws)
      if (ws) {
        const details = await fetchWorkspaceFiles(ws)
        setFiles(details.files || [])
        if (details.files?.[0]?.name) setSelectedFile(details.files[0].name)
      }
      setErr(null)
    } catch (e) {
      setErr(String(e))
    }
  }, [selectedWorkspace])

  React.useEffect(() => {
    refreshWorkspaces()
  }, [refreshWorkspaces])

  React.useEffect(() => {
    if (!selectedWorkspace || !selectedFile) return
    readWorkspaceFile(selectedWorkspace, selectedFile)
      .then((d) => {
        setContent(d.content || '')
        setMeta(`${d.path} · ${d.updatedAt || 'unknown'}`)
      })
      .catch((e) => setErr(String(e)))
  }, [selectedWorkspace, selectedFile])

  return (
    <div className="mc-split workspaces-layout">
      <section className="mc-pane">
        <div className="mc-pane-header">
          <div>
            <div className="mc-h1">Workspaces</div>
            <div className="mc-subtle">Edit skill.md, SOUL.md, MEMORY.md, brain.md and more in-place</div>
          </div>
          <button className="mc-btn" onClick={refreshWorkspaces}>Refresh</button>
        </div>

        {err ? <div className="mc-error">{err}</div> : null}

        <div className="mc-workspaces-shell">
          <aside className="mc-workspaces-left">
            <div className="mc-block-title">Workspaces</div>
            {workspaces.map((ws) => (
              <button
                key={ws}
                className={ws === selectedWorkspace ? 'mc-list-btn active' : 'mc-list-btn'}
                onClick={async () => {
                  setSelectedWorkspace(ws)
                  const details = await fetchWorkspaceFiles(ws)
                  setFiles(details.files || [])
                  if (details.files?.[0]?.name) setSelectedFile(details.files[0].name)
                }}
              >
                {ws}
              </button>
            ))}
          </aside>

          <aside className="mc-workspaces-middle">
            <div className="mc-block-title">Files</div>
            {files.map((file) => (
              <button
                key={file.name}
                className={file.name === selectedFile ? 'mc-list-btn active' : 'mc-list-btn'}
                onClick={() => setSelectedFile(file.name)}
              >
                {file.name}
              </button>
            ))}
          </aside>

          <div className="mc-workspaces-editor">
            <div className="mc-subtle">{meta}</div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mc-editor" />
            <div className="mc-actions">
              <button
                className="mc-btn"
                onClick={async () => {
                  if (!selectedWorkspace) return
                  const isBrain = selectedWorkspace === 'brain'
                  const result = await writeWorkspaceFile(selectedWorkspace, selectedFile, content, 'botfather', isBrain)
                  setMeta(`${result.path} · ${result.updatedAt || 'saved'}`)
                  const details = await fetchWorkspaceFiles(selectedWorkspace)
                  setFiles(details.files || [])
                }}
              >
                Save
              </button>
              <button
                className="mc-btn"
                onClick={async () => {
                  if (!selectedWorkspace) return
                  const d = await readWorkspaceFile(selectedWorkspace, selectedFile)
                  setContent(d.content || '')
                  setMeta(`${d.path} · ${d.updatedAt || 'reloaded'}`)
                }}
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
