# Consiglio Mission Control 2.0 Kanban PRD

## 1) Product Requirements
- Replace basic task lanes with engineering workflow columns.
- Keep current dark command-center theme and improve inline execution speed.
- Manage delivery metadata directly on Kanban cards.
- Enforce movement gates tied to PR, CI, QA, security, and deploy evidence.
- Provide GitHub and Vercel sync hooks without forcing page reloads.

## 2) UI Wireframe Description
- Header: Mission Control title, refresh, heartbeat, quick add.
- Metrics row: Agents, In Progress, Pending Approvals, Blocked.
- Filter row: Search, Agent, Repo, Status, Priority.
- Board row: 11 columns, horizontally scrollable.
- Card body:
  - Top: Task ID, title, owner, priority, PR status, CI status.
  - Metadata: repo, branch, PR URL, preview/prod URL, deployment timestamp.
  - Operational: acceptance criteria, QA notes, security notes, evidence links, subtasks, swarm logs.
  - Actions: Edit Inline, Sync GitHub/Vercel.

## 3) Data Model Schema
```ts
{
  id: string,
  title: string,
  description: string,
  owner_agent: string,
  priority: 'low'|'medium'|'high',
  status: 'Backlog'|'Intake'|'Approved'|'Planned'|'In Progress'|'QA'|'Security Review'|'Ready to Deploy'|'Deployed'|'Done'|'Blocked',
  repo: string,
  branch: string,
  pr_url: string,
  pr_status: 'Open'|'Approved'|'Merged'|'Closed',
  ci_status: 'Passing'|'Failing'|'Running'|'Unknown',
  preview_url: string,
  production_url: string,
  deployment_timestamp: string,
  qa_notes: string,
  security_notes: string,
  acceptance_criteria: string,
  evidence_links: string[],
  subtasks: string[],
  swarm_logs: string[],
  created_at: string,
  updated_at: string
}
```

## 4) API Design (GitHub + Vercel Sync)
- `GET /api/tasks`
- `POST /api/tasks/create`
- `POST /api/tasks/update`
- `POST /api/tasks/sync-metadata`
  - Reads `pr_url`
  - Uses `GITHUB_TOKEN`/`GH_TOKEN` for PR state and check-runs
  - Updates `pr_status`, `ci_status`
  - Auto-blocks task if CI is failing
- `POST /api/tasks/delete`
- `POST /api/tasks/dont-do`

## 5) State Transition Enforcement Logic
- Planned -> In Progress requires `branch`.
- In Progress -> QA requires `pr_url`.
- QA -> Security Review requires CI passing and QA notes.
- Security Review -> Ready to Deploy requires security notes.
- Ready to Deploy -> Deployed requires production URL.
- Deployed -> Done requires production URL and evidence links.
- Any status -> Blocked allowed.
- If CI becomes failing, auto-set status to Blocked.

## 6) Frontend Component Architecture
- `MissionView`
  - `MissionHeader`
  - `MissionMetrics`
  - `MissionFilters`
  - `MissionBoard`
    - `LaneColumn`
      - `TaskCard`
        - `InlineTaskEditor`

## 7) Example React Component Structure
- `MissionView.tsx` renders board-level state.
- Local memoized grouping by lane.
- Inline `onBlur` save for field edits.
- Drag/drop lane movement with backend gate checks.

## 8) GitHub Webhook/Event Strategy
- MVP: on-demand sync via `POST /api/tasks/sync-metadata`.
- Phase upgrade: webhook receiver for PR events and check runs.
- Event mapping:
  - `pull_request` -> update `pr_status`
  - `check_suite/check_run` -> update `ci_status`
  - `deployment_status` -> update `preview_url` or `production_url`

## 9) Security Model for Token Storage
- Store GitHub token only in server environment variables (`GITHUB_TOKEN`/`GH_TOKEN`).
- Never expose token to frontend.
- Only server performs external API calls.
- Redact sensitive metadata from UI errors and logs.

## 10) MVP Build Plan
- Phase 1: Core Kanban + inline metadata editing + gate enforcement.
- Phase 2: GitHub PR and CI sync API.
- Phase 3: Vercel preview and production sync actions.
- Phase 4: Swarm log and subtask structured controls.
- Phase 5: Automation and drift checks tied to heartbeat.
