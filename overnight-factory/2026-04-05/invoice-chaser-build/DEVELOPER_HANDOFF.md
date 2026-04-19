# Developer Handoff: InvoiceChaser Lite

## Project Status

**Phase:** Ready for Development  
**Validation Grade:** B  
**Build Estimate:** 3 hours  
**Repo:** https://github.com/Porfirio-Piero/InvoiceChaser-Lite

---

## Context

This project was created by the Overnight Product Owner agent. The problem was discovered by Problem Scout on 2026-04-04:

**Top Problem:** Invoice follow-up automation for small businesses  
**Score:** 11.5/14  
**Evidence:** r/SaaS user reported "average days-to-payment dropped from 34 to 19" with reminder sequences

---

## What to Build

### P0 Features (3 max)

1. **Invoice Entry Form**
   - Fields: clientName, clientEmail, invoiceNumber, amount, dueDate, notes
   - Save to browser local storage
   - Generate unique ID

2. **Dashboard with Reminder Schedule**
   - List invoices by status (pending/overdue/paid)
   - Calculate days overdue
   - Show reminder schedule (Day 7, 14, 21)
   - Mark as paid button

3. **Email Template Generator**
   - Three templates: Day 7 (friendly), Day 14 (firm), Day 21 (final)
   - Auto-fill with invoice details
   - One-click copy to clipboard

### Technical Constraints

- **No backend** - all client-side
- **No auth** - local device only
- **No external storage** - browser local storage
- **Static deployment** - Vercel or GitHub Pages

---

## Getting Started

```bash
cd InvoiceChaser-Lite
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install @radix-ui/react-dialog @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node
```

### File Structure

```
src/
├── app/
│   ├── page.tsx          # Main dashboard
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Tailwind imports
├── components/
│   ├── InvoiceForm.tsx   # Add invoice form
│   ├── InvoiceList.tsx   # Dashboard list
│   ├── InvoiceCard.tsx   # Single invoice
│   └── EmailTemplate.tsx # Copy-paste template
├── lib/
│   ├── storage.ts        # Local storage helpers
│   └── utils.ts          # Utility functions
└── types/
    └── invoice.ts        # TypeScript types
```

---

## Playwright Test Requirements

Create tests for:
1. Add invoice → appears in list
2. Mark as paid → moves to paid section
3. Copy email template → clipboard contains expected text
4. Delete invoice → removed from list
5. Reminder schedule → correct dates shown

---

## Deployment

1. Push to main branch
2. Vercel auto-deploys from GitHub
3. Verify deployment at `invoice-chaser-lite.vercel.app`

---

## Success Criteria

- [ ] User can add invoice in < 30 seconds
- [ ] Reminder schedule generates correctly
- [ ] Email templates copy to clipboard
- [ ] Mobile responsive
- [ ] Deployed to Vercel

---

## Notes

- Original PRD had auth + database, but was downscoped to Grade B
- Keep it simple - no external dependencies beyond Next.js + Tailwind
- Focus on core value: reminder schedule + copy-paste templates

---

*Handoff by Overnight Product Owner*  
*Ready for Developer to build*