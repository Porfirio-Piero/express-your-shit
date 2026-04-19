# Consiglio Mission Control

Consiglio is a local-first command center for OpenClaw operations. It provides a modern operator UI for mission oversight, agent org management, runtime operations, standups, logs, MCP governance, and a deeply integrated Kanban workflow.

## Status
- Local-first MVP with production-style UX patterns
- Backed by workspace files and JSONL event logs
- Designed to run fully on localhost with OpenClaw

## Key Capabilities
- Mission Control dashboard with live operational KPIs
- Integrated Kanban workflow with inline editing and assignment
- The Family org chart with agent profile + skill editing hooks
- Workspaces file browser/editor for agent docs
- Operations cockpit for runtime health, heartbeats, cron, and usage
- Logs ledger with timeline, filters, and event drilldowns
- Sitdown daily coordination room with structured contributions
- MCP control plane for tool governance and routing

## Tech Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express (local API + file adapters)
- Styling: custom dark OS theme (glass/gradient command-center aesthetic)
- Persistence: local workspace files (`workspace/**`) and JSONL event logs

## Repository Layout
```text
projects/mission-control/
  server/
    index.mjs                # Local API + file integration layer
  src/
    main.tsx
    ui/
      App.tsx                # Router + view composition
      api.ts                 # Frontend API bindings
      styles.css             # Global theme + layout system
      components/
        TopBar.tsx
        CommandBar.tsx
      views/
        MissionView.tsx
        TasksView.tsx
        OrgView.tsx
        WorkspacesView.tsx
        DependenciesView.tsx # Route compatibility (legacy -> Operations)
        LogsView.tsx
        SitdownView.tsx
        McpView.tsx
        SessionsView.tsx
```

## Local Run
```powershell
cd C:\Users\devpi\.openclaw\workspace\projects\mission-control
npm install
npm run dev
```

Default local endpoints:
- UI: `http://localhost:5173`
- API: `http://localhost:5174`

## OpenClaw Integration Paths
Consiglio reads/writes OpenClaw-local artifacts, including:
- `C:\Users\devpi\.openclaw\workspace\memory\taskmaster.json`
- `C:\Users\devpi\.openclaw\workspace\logs\events\YYYY-MM-DD.jsonl`
- `C:\Users\devpi\.openclaw\workspace\reports\**`
- `C:\Users\devpi\.openclaw\workspace\brain\**`
- `C:\Users\devpi\.openclaw\workspace\agents\**`

## Feature Tour
### 1) Mission Control
- KPI cards (Agents, In Progress, Approvals, Blocked)
- Heartbeat status panel with detections/actions summaries
- Integrated Kanban board for day-to-day execution

### 2) Kanban (Primary Task Surface)
- Backlog / In Progress / Blocked / Completed swimlanes
- Drag/move workflow + inline card editing
- Card assignment, priority, status, notes, and lifecycle controls
- Supports double-click focused card editing window

### 3) The Family (Org)
- Hierarchical org chart
- Agent selection with metadata and role context
- Hooks for editing `skill.md`, `brain.md`, and workspace files

### 4) Operations
- Runtime cockpit for gateway/Ollama lifecycle
- Heartbeat and cron visibility
- Usage and model routing summaries

### 5) Logs
- System ledger and activity timeline
- Category filters + deep context inspection
- Designed for debugging and auditability

### 6) Sitdown
- Daily structured standup workflow
- Agent participation + executive summary generation
- Cross-links to tasks, blockers, and logs

### 7) MCP
- Tool governance surface
- Registry, routing, permissions, and usage context

## Screenshots
Add screenshots under:
- `projects/mission-control/docs/screenshots/`

Suggested image set:
1. `mission-control-overview.png`
2. `kanban-inline-edit.png`
3. `org-chart-family.png`
4. `operations-cockpit.png`
5. `logs-ledger.png`
6. `sitdown-session.png`
7. `mcp-registry.png`

Then reference them in this README:
```md
![Mission Control](docs/screenshots/mission-control-overview.png)
![Kanban](docs/screenshots/kanban-inline-edit.png)
![Org](docs/screenshots/org-chart-family.png)
![Operations](docs/screenshots/operations-cockpit.png)
![Logs](docs/screenshots/logs-ledger.png)
![Sitdown](docs/screenshots/sitdown-session.png)
![MCP](docs/screenshots/mcp-registry.png)
```

## Packaging + GitHub Publish Workflow
```powershell
cd C:\Users\devpi\.openclaw\workspace

git add projects/mission-control

git commit -m "feat(consiglio): publish mission-control app with docs and local-first runtime integration"

git push origin master
```

## Notes for Production Hardening
- Add auth for remote/multi-user deployments
- Add schema validation + migration versioning for all JSON artifacts
- Add automated UI/API smoke tests in CI
- Add backup/restore for workspace file stores

## License
Private/internal unless explicitly relicensed.
