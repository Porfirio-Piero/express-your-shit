# Consiglio Mission Control patch

Target repository: `Porfirio-Piero/express-your-shit`
Target branch base: `main`
Target app: `consiglio-dashboard/`
Suggested branch: `agent/mission-control-overhaul`

## Files

- Replace `consiglio-dashboard/src/app/dashboard/command-center/CommandCenterClient.tsx`
- Add `consiglio-dashboard/src/app/api/command/route.ts`

## Behavior preserved

- NextAuth server-side protection remains in `page.tsx`
- `/api/status` remains the source of truth
- 15-second refresh remains enabled
- `/api/approve` remains the approval audit endpoint

## New capability

- Operational overview and fleet topology
- Agent inspector drawer
- Mission portfolio
- Automation control view
- Approval queue
- Infrastructure pulse and live activity
- Universal command bar
- Guarded `/api/command` queue with audit logging and approval detection
