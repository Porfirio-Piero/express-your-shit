# Product Requirements Document: InvoiceChaser Lite

**Product Name:** InvoiceChaser Lite  
**Version:** 1.0 MVP  
**Date:** 2026-04-05  
**Author:** Overnight Product Owner (BotFather)  
**Status:** Validated - Ready for Build

---

## Executive Summary

InvoiceChaser Lite is a simple invoice follow-up tracker for freelancers and small businesses. Users manually add invoices, and the app generates reminder schedules with copy-paste email templates. Simple local storage - no accounts needed.

**Build Time Estimate:** 3 hours  
**Target Launch:** Overnight (single session)  
**Monetization:** Free with optional tip jar

---

## Problem Statement

### User Pain Points
- Freelancers forget to chase overdue invoices until cash flow is tight
- Manual follow-up is time-consuming and emotionally draining
- Average payment time is 34 days without reminders

### Target Users
- Freelancers
- Consultants
- Small service businesses (1-10 employees)

### Evidence
- **Reddit r/SaaS:** "My average days-to-payment dropped from 34 to 19 with reminder sequences"
- **Finance Digest:** "Most unpaid invoices are never formally pursued"

---

## MVP Scope

### P0 Features (Must Have - 3 max)

1. **Invoice Entry Form**
   - Client name
   - Client email
   - Invoice number
   - Amount
   - Due date
   - Notes (optional)
   - Saved to browser local storage

2. **Dashboard with Reminder Schedule**
   - List of all invoices with status (pending/overdue/paid)
   - Days overdue calculation
   - Reminder schedule generator (Day 7, 14, 21)
   - Visual timeline showing when reminders should go out
   - Mark as paid button

3. **Email Template Generator**
   - Copy-paste email templates for Day 7, 14, 21
   - Auto-fill with invoice details
   - One-click copy to clipboard
   - Mobile-friendly for on-the-go use

### P1 Features (Nice to Have - Deferred)
- Export functionality
- Invoice creation (generate PDF)
- Integration with accounting tools

### P2 Features (Future - Not in MVP)
- Payment links
- Team accounts
- Mobile app

---

## Technical Architecture

### Stack - SIMPLE
- **Frontend:** Next.js 14 (App Router) - Static Export
- **Styling:** Tailwind CSS + shadcn/ui components
- **Storage:** Browser local storage (nothing external)
- **Accounts:** None (local device only)
- **Deployment:** Vercel or GitHub Pages

### Why This Works for Overnight
- No external storage setup
- No sign-in flow complexity
- No backend routes needed (all client-side)
- Fast build, fast deployment
- Still delivers core value: reminder schedule + templates

---

## Data Model (Browser Storage)

```typescript
interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  notes?: string;
  status: 'pending' | 'overdue' | 'paid';
  createdAt: string;
  paidAt?: string;
}

interface Settings {
  reminderDay7Enabled: boolean;
  reminderDay14Enabled: boolean;
  reminderDay21Enabled: boolean;
  customTemplateDay7?: string;
  customTemplateDay14?: string;
  customTemplateDay21?: string;
}
```

---

## User Flows

### Flow 1: Add Invoice
1. Open app
2. Click "Add Invoice"
3. Fill in client name, email, invoice #, amount, due date
4. Click Save
5. Invoice appears in dashboard with reminder schedule

### Flow 2: Send Reminder
1. Open dashboard
2. See invoice with "Day 7 reminder due" status
3. Click invoice to expand
4. Copy email template (pre-filled with details)
5. Open email client, paste, send
6. Mark reminder as sent (optional)

### Flow 3: Mark Paid
1. Open dashboard
2. Find invoice
3. Click "Mark as Paid"
4. Invoice moves to "Paid" section
5. Reminder schedule stops

---

## Email Templates (Copy-Paste Ready)

### Day 7 - Friendly Reminder
```
Subject: Quick reminder: Invoice #{invoice_number}

Hi {client_name},

Just a friendly reminder that invoice #{invoice_number} for {amount} is now overdue.

Let me know if you have any questions!

Best,
{your_name}
```

### Day 14 - Firm Reminder
```
Subject: Payment needed: Invoice #{invoice_number}

Hi {client_name},

Following up on invoice #{invoice_number} for {amount}, which is now 14 days overdue.

Please let me know if there's an issue with the invoice or if you need more time.

Amount: {amount}
Due date: {due_date}

Best,
{your_name}
```

### Day 21 - Final Notice
```
Subject: URGENT: Invoice #{invoice_number} - Final notice

Hi {client_name},

Invoice #{invoice_number} for {amount} is now 21 days overdue.

Please contact me to arrange payment. I'm happy to discuss payment options if needed.

Amount: {amount}
Due date: {due_date}
Days overdue: {days_overdue}

Best,
{your_name}
```

---

## Success Metrics

### MVP Success Criteria
- User can add invoice in < 30 seconds
- Reminder schedule auto-generates correctly
- Email templates copy to clipboard with one click
- Mobile-responsive for on-the-go use

### Business Metrics
- Time saved: ~15 min/invoice vs manual tracking
- Payment acceleration: Estimated 10-15 day reduction

---

## Competitive Positioning

| Feature | InvoiceChaser Lite | FreshBooks | QuickBooks |
|---------|-------------------|------------|------------|
| Price | Free | $19/mo | $30/mo |
| Setup Time | 0 min | 30 min | 45 min |
| Sign-in Required | No | Yes | Yes |
| External Storage | No | Yes | Yes |
| Reminder Schedule | Visual | Basic | Basic |
| Copy-Paste Templates | Yes | Yes | Yes |

**Differentiation:** Zero setup, no account needed, works offline. Perfect for freelancers who just want a quick reminder system without committing to an accounting platform.

---

## Launch Checklist

- [x] Problem identified and validated
- [x] PRD created and downscoped
- [ ] GitHub repo created
- [ ] Next.js 14 project scaffolded
- [ ] Invoice form component
- [ ] Dashboard with invoice list
- [ ] Reminder schedule generator
- [ ] Email template copy buttons
- [ ] Browser storage persistence
- [ ] Mobile-responsive design
- [ ] Vercel deployment
- [ ] Basic testing

---

## Validation Results

**Build Estimate:** 3 hours  
**P0 Features:** 3  
**Complexity Flags:** None  
**Suitable for Overnight:** YES

---

*Generated by Overnight Product Owner Agent*  
*Phase 2 Complete - Ready for Developer Handoff*