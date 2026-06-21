# ScopeGuard — PRD

## Problem
57% of freelancers lose $1K+/month to scope creep. Clients request "small changes" that balloon projects beyond the original agreement. There is ZERO direct competition for a dedicated scope creep tracker + change order generator. Freelancers currently use Google Docs, email threads, or nothing at all.

## Solution
ScopeGuard — A freelancer scope creep tracker + change order generator. Define your project scope upfront, share a client-facing link for approval, and when requests fall outside scope, generate professional change orders with pricing in 2 clicks.

## Target User
- Freelancers (designers, developers, consultants, copywriters)
- Small agencies (1-5 people)
- Anyone billing by project who deals with client scope creep

## Validation
- MicroGaps validated TWICE independently (both A-grade)
- 57% of freelancers report losing $1K+/mo to scope creep
- Zero direct competitors (no one does client-facing scope approval + change orders)
- 7hr build estimate
- $19/mo pricing, 50:1 user ROI

## Core Features (MVP)

### 1. Project Scope Builder
- Create new project with name, client, and description
- Define deliverables line-by-line (what's IN scope)
- Define exclusions (what's OUT of scope) — this is the magic
- Set project budget and hourly rate for overages

### 2. Client-Facing Scope Approval Link
- Generate a unique shareable link (UUID-based, no login)
- Client views a clean, professional scope document
- Client approves with a click (name + checkbox confirmation)
- Approval timestamped and recorded
- Both parties get a "scope locked" confirmation

### 3. Change Order Generator
- When a client requests work outside scope, log it
- Select which scope item it relates to (or mark as "new request")
- Enter estimated hours + rate
- Auto-generate a professional change order document
- Client link for change order approval
- Change order PDF export

### 4. Dashboard
- All projects overview with scope status (draft/approved/active/completed)
- Scope creep tracker — visual indicator of how many change orders per project
- Quick stats: total original scope value, change order revenue, creep percentage
- Recent activity feed

### 5. Scope Creep Alert System
- Visual warnings when a project has >2 change orders
- "Creep score" showing percentage of original budget added via changes
- Color coding: green (<10%), yellow (10-25%), red (>25%)

## Technical Architecture

### Stack
- Next.js 16 + TypeScript
- Tailwind CSS v4
- localStorage for persistence (zero backend)
- UUID for shareable links
- html2canvas or jsPDF for PDF export

### Design
- Dark theme with amber/orange accent (scope = caution, guard = protection)
- Clean, professional aesthetic — this goes to clients
- Mobile-responsive (freelancers check on phone between meetings)
- Large typography for scope documents (client readability)

### Data Model
```
Project {
  id: string (UUID)
  name: string
  client: string
  description: string
  hourlyRate: number
  budget: number
  status: 'draft' | 'approved' | 'active' | 'completed'
  deliverables: Deliverable[]
  exclusions: string[]
  createdAt: timestamp
  approvedAt: timestamp | null
  approvedBy: string | null
}

Deliverable {
  id: string
  description: string
  estimatedHours: number
  completed: boolean
}

ChangeOrder {
  id: string
  projectId: string
  description: string
  relatedDeliverableId: string | null
  estimatedHours: number
  rate: number
  amount: number
  status: 'pending' | 'approved' | 'declined'
  approvedBy: string | null
  approvedAt: timestamp | null
  createdAt: timestamp
}

ApprovalLink {
  id: string
  projectId: string
  changeOrderId: string | null
  token: string (UUID)
  type: 'scope' | 'change-order'
  accessedAt: timestamp | null
  approvedAt: timestamp | null
}
```

### Pages
1. `/` — Dashboard (project list + stats)
2. `/project/new` — Create project
3. `/project/[id]` — Project detail (scope + change orders)
4. `/scope/[token]` — Client-facing scope approval (public)
5. `/change-order/[token]` — Client-facing change order approval (public)

## Pricing Page
- Free tier: 1 project, basic scope + 2 change orders
- Pro: $19/mo — Unlimited projects, PDF export, custom branding
- Page included but no payment integration (MVP)

## Success Metrics
- Aha moment: Create a project, add scope, share link, client approves — all in <5 minutes
- Core loop: Log out-of-scope request → generate change order → send to client → get approval
- Creep score visibility makes scope creep tangible and actionable

## Build Priority
1. Project scope builder (core)
2. Client-facing approval link (magic moment)
3. Change order generator (revenue protection)
4. Dashboard with creep scores (visibility)
5. PDF export (professionalism)
6. Pricing page (placeholder)

## NOT in MVP
- User authentication (localStorage)
- Payment integration
- Email notifications (link sharing only)
- Team/multi-user
- API/integrations
- Templates library