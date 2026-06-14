# Bookkeeper Portal - Transaction Categorization Swipe App

## PRD v1.2 (MVP — Overnight Build) — June 14, 2026

**Problem ID:** PROB-037  
**Score:** 11.0/10 (top discovery, zero direct competition)  
**Estimated Build Time:** 5 hours  
**Validation Status:** PENDING

---

## 1. Problem Statement

Bookkeepers chase clients monthly to categorize uncategorized transactions. Emails get ignored, spreadsheets get lost, month-end close gets delayed. A simple swipe/tap interface for clients to categorize transactions would solve this — with zero direct competition.

---

## 2. MVP Scope (3 Core Features)

### Core Feature 1: Bookkeeper Dashboard
- View clients with uncategorized transaction counts
- Push transactions to a client (generates shareable link)
- See categorization progress per client
- Add/remove clients (name, email)
- Import transactions via CSV upload with column mapping

### Core Feature 2: Client Categorization Interface (Mobile-First)
- Each transaction shown as a card (date, description, amount)
- Tap to categorize → pick category → next card
- Progress bar showing completion
- Accessible via unique shareable link (no login/signup needed)
- "All done!" completion screen

### Core Feature 3: Email Reminders + CSV Export
- Send reminder emails to clients who haven't started
- 48-hour auto-reminder via Resend
- Export categorized transactions as CSV (QBO/Xero format)

---

## 3. Out of Scope (Post-MVP)

- ❌ User signup or login pages (shareable links instead)
- ❌ Direct QBO/Xero sync (CSV export/import)
- ❌ Payment or subscription system
- ❌ Mobile native app (responsive web only)
- ❌ AI auto-categorization
- ❌ Team features
- ❌ Audit trail

---

## 4. Technical Architecture

### Frontend
- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** for styling
- Tap buttons for categorization (swipe gestures = V2)

### Backend
- **Next.js API Routes** (serverless)
- **SQLite** via better-sqlite3 (single-file local store, no external server)
- **Resend** for sending reminder emails

### Data Model (SQLite — single-file, no external server)
```
clients: id, name, email, shareable_uuid, created_at
transactions: id, client_id, date, description, amount, category, status, categorized_at
```

### Access Model (No signup or login pages)
- Bookkeeper: accesses `/dashboard` directly
- Clients: access `/categorize/{uuid}` via unique shareable link
- Simple and secure enough for MVP

### Hosting
- **Vercel** free tier

---

## 5. User Flows

### Flow 1: Bookkeeper Sets Up
1. Open app → Dashboard
2. Add client (name + email)
3. Import CSV → map columns (date, description, amount)
4. Assign transactions to client
5. Click "Send to Client" → email sent with shareable link

### Flow 2: Client Categorizes
1. Open shareable link on phone
2. See first uncategorized transaction card
3. Tap "Categorize" → pick category → next card
4. Repeat until done → see "All done!"

### Flow 3: Bookkeeper Reviews
1. Open dashboard → see client progress
2. Export categorized CSV
3. Import into their existing bookkeeping software

---

## 6. Build Estimate: 5 hours

| Phase | Hours |
|-------|-------|
| Project setup + data schema | 0.5 |
| Dashboard (client list, import, progress) | 1.5 |
| Client categorization page | 1.5 |
| Email reminders via Resend | 0.5 |
| CSV export | 0.5 |
| Deploy + testing | 0.5 |

**Total: 5 hours** — well within overnight build constraint

---

*PRD v1.2 — BotFather Product Owner (Phase 2)*  
*Source: PROB-037 from Problem Scout*