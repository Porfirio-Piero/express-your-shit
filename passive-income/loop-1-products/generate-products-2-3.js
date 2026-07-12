const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");
const CYAN = "06B6D4";

async function generateProduct2() {
  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        // Title
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "AZURE COST CLEANUP", bold: true, size: 56, color: CYAN })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "PLAYBOOK", bold: true, size: 56, color: CYAN })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "11 PowerShell Scripts + Checklists + Exec Summary", size: 24, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Find and eliminate Azure waste in one afternoon.", size: 22, color: "999999", italics: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "© 2026 Piero Porfirio. All rights reserved.", size: 16, color: "999999" })] }),
        new Paragraph({ children: [new TextRun({ break: 1 })] }),

        // Scripts Section
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "PowerShell Audit Scripts", bold: true, size: 32, color: CYAN })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "All scripts are READ-ONLY. They audit and report. The only changes happen when you decide to act on the findings.", size: 22, italics: true, color: "666666" })] }),

        ...[
          { title: "Script 1: Orphaned Disk Finder", desc: "Finds all unattached managed disks and estimates monthly cost. Each disk that is not attached to a VM is wasting money. Output includes resource group, disk name, SKU, size in GB, and estimated monthly cost." },
          { title: "Script 2: Oversized VM Detector", desc: "Checks all running VMs against their CPU/memory utilization over the last 7 days. Flags VMs with <15% average CPU for downsizing recommendation. Includes current SKU, recommended SKU, and estimated savings." },
          { title: "Script 3: Idle App Services", desc: "Identifies App Services with no traffic in the last 30 days. Checks both running and stopped apps. For running apps, provides average request count and recommends stopping or downgrading." },
          { title: "Script 4: Unused Public IPs", desc: "Finds all public IP addresses not associated with any resource. Each unused static IP costs approximately $3.65/month. Includes IP name, SKU, resource group, and associated resource (null if orphaned)." },
          { title: "Script 5: Unattached NICs", desc: "Lists all network interfaces not attached to any virtual machine. Unattached NICs are often left over from deleted VMs and continue to accrue minor costs. Includes NIC name, resource group, and associated NSG." },
          { title: "Script 6: Stale Storage Accounts", desc: "Identifies storage accounts with no access in the last 90 days. Checks last modification time and blob count. Flags accounts that may be candidates for deletion or archival." },
          { title: "Script 7: Expensive SKU Downgrade Recommendations", desc: "Analyzes current VM SKUs against actual utilization. For each VM, compares current cost against recommended SKU cost. Prioritizes by potential monthly savings." },
          { title: "Script 8: Reservation Opportunity Finder", desc: "Finds VMs running for more than 30 consecutive days that would benefit from Azure Reserved VM Instances. Calculates break-even point and estimated annual savings." },
          { title: "Script 9: Resource Group Cost Anomaly Detector", desc: "Compares current month's cost per resource group against the 3-month average. Flags groups where cost has increased more than 25% month-over-month." },
          { title: "Script 10: Tag Compliance Auditor", desc: "Checks all resources for required tags (Environment, Owner, CostCenter, Project). Reports compliance percentage by resource type and lists non-compliant resources." },
          { title: "Script 11: Full Environment Summary", desc: "Generates a comprehensive report: total resources by type, cost by resource group, top 10 most expensive resources, overall waste estimate, and prioritized action items." },
        ].flatMap(s => [
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text: s.title, bold: true, size: 24, color: "333333" })] }),
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: s.desc, size: 20 })] }),
        ]),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Azure Waste Checklist (28 Items)", bold: true, size: 32, color: CYAN })] }),

        ...["Data Privacy & Security", "Model Risk & Bias", "Vendor Management", "Regulatory Compliance", "Change Management", "Incident Response", "Monitoring & Reporting", "Training & Awareness"].map(domain =>
          new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: domain, bold: true, size: 22 })] })
        ),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Executive Summary Template", bold: true, size: 32, color: CYAN })] }),
        ...[
          "Azure Cost Audit — Executive Summary",
          "",
          "Date: [DATE]",
          "Auditor: [NAME]",
          "Subscription: [SUBSCRIPTION NAME]",
          "",
          "FINDINGS SUMMARY",
          "Total monthly waste identified: $[X]",
          "Total annual savings potential: $[X × 12]",
          "Number of waste categories: [N]",
          "Top 3 waste categories:",
          "  1. [CATEGORY] — $[X]/month",
          "  2. [CATEGORY] — $[X]/month",
          "  3. [CATEGORY] — $[X]/month",
          "",
          "RECOMMENDED ACTIONS",
          "1. [Immediate action — low risk, high savings]",
          "2. [Short-term action — moderate risk, moderate savings]",
          "3. [Long-term action — requires planning]",
          "",
          "NEXT STEPS",
          "1. Approve waste elimination plan",
          "2. Schedule monthly re-audit",
          "3. Set up automated cost alerts",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Monthly Audit Loop Guide", bold: true, size: 32, color: CYAN })] }),
        ...[
          "Week 1: Run all 11 scripts, compile findings",
          "Week 2: Review findings with team, prioritize actions",
          "Week 3: Execute approved changes (delete, resize, stop)",
          "Week 4: Verify changes, update tracking spreadsheet",
          "",
          "Monthly KPIs to track:",
          "  - Total Azure spend vs. previous month",
          "  - Waste percentage (waste / total spend)",
          "  - Number of waste items found",
          "  - Number of items resolved",
          "  - Cumulative savings",
          "",
          "Escalation triggers:",
          "  - Waste exceeds 35% of total spend",
          "  - Monthly spend increases >10% without new resources",
          "  - Any single waste item >$500/month",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "© 2026 Piero Porfirio. All rights reserved. For personal and organizational use only.", size: 16, color: "999999" })] }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(__dirname, "azure-cost-cleanup", "Azure_Cost_Cleanup_Playbook.docx"), buffer);
  console.log("Product 2 DOCX generated");
}

async function generateProduct3() {
  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "COPILOT / M365 AI", bold: true, size: 56, color: CYAN })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "ROLLOUT COMMS PACK", bold: true, size: 56, color: CYAN })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "CEO Announcement • Manager Briefing • Team FAQ • Training Invite • Feedback Survey", size: 22, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Plus: Executive Briefing Deck + 30/60/90 Timeline + Usage Policy", size: 20, color: "999999", italics: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "© 2026 Piero Porfirio. All rights reserved.", size: 16, color: "999999" })] }),
        new Paragraph({ children: [new TextRun({ break: 1 })] }),

        // Template 1
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Template 1: CEO Announcement Email", bold: true, size: 32, color: CYAN })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Subject: We're bringing AI to your daily workflow — here's what to expect", size: 22, italics: true, color: "666666" })] }),
        ...[
          "",
          "Hi [Team],",
          "",
          "Starting [date], we're rolling out Microsoft Copilot across [organization/pilot group].",
          "",
          "Copilot is an AI assistant built into the Microsoft 365 tools you already use — Word, Excel, PowerPoint, Outlook, and Teams. It helps you draft documents faster, summarize long email threads, find information across your files, and create presentations from existing content.",
          "",
          "What Copilot is NOT: It's not a replacement for your expertise. It's a tool that handles the repetitive parts so you can focus on the work that requires your judgment.",
          "",
          "Over the next [30/60/90] days, you'll receive:",
          "  • A training invitation (coming [date])",
          "  • Access to Copilot in your Microsoft 365 apps",
          "  • A feedback channel to tell us what's working and what isn't",
          "",
          "Your manager has a briefing with more details. If you have questions, reply to this email or reach out to [contact].",
          "",
          "Looking forward to seeing what you do with this.",
          "",
          "[CEO Name]",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Template 2: Manager Briefing Email", bold: true, size: 32, color: CYAN })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Subject: What you need to know about the Copilot rollout", size: 22, italics: true, color: "666666" })] }),
        ...[
          "",
          "Hi [Manager Name],",
          "",
          "Your team will be receiving access to Microsoft Copilot as part of our AI rollout. Here's what you need to know:",
          "",
          "WHAT IS COPILOT?",
          "An AI assistant integrated into M365 apps. It helps with drafting, summarizing, data analysis, and content creation — but it's a tool, not a replacement for expertise.",
          "",
          "WHAT YOUR TEAM WILL RECEIVE:",
          "  • Access to Copilot in Word, Excel, PowerPoint, Outlook, and Teams",
          "  • A 30-minute training session (invitation coming separately)",
          "  • A FAQ document (attached)",
          "  • A feedback channel for questions and concerns",
          "",
          "YOUR ROLE AS MANAGER:",
          "  • Encourage experimentation — this is new for everyone",
          "  • Remind your team that AI outputs need human review",
          "  • Share what's working and what isn't",
          "  • Be patient — productivity gains typically appear after 2-4 weeks of regular use",
          "",
          "KEY DATES:",
          "  • [Date]: Access enabled",
          "  • [Date]: Training session",
          "  • [Date]: First feedback collection",
          "",
          "Questions? Reach out to [contact].",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Template 3: Team FAQ", bold: true, size: 32, color: CYAN })] }),
        ...[
          "",
          "COPILOT FAQ — What You Need to Know",
          "",
          "Q: What is Microsoft Copilot?",
          "A: An AI assistant built into Microsoft 365. It helps you draft documents, summarize emails, analyze data, and create presentations — all within the apps you already use.",
          "",
          "Q: Is Copilot watching everything I do?",
          "A: No. Copilot only accesses data you already have permission to see. It doesn't see anything you couldn't access yourself.",
          "",
          "Q: Can Copilot replace my job?",
          "A: No. Copilot is a tool that handles repetitive tasks. Your expertise, judgment, and creativity are still essential. Think of it as a very fast intern — helpful, but it needs your direction.",
          "",
          "Q: Is what I type into Copilot private?",
          "A: Your organization's data stays within your tenant. Copilot does not train on your data or share it with other organizations.",
          "",
          "Q: What if Copilot gives me wrong information?",
          "A: Always verify Copilot's outputs. It can make mistakes, especially with data analysis or factual claims. You are responsible for the final output.",
          "",
          "Q: Which apps does Copilot work in?",
          "A: Word, Excel, PowerPoint, Outlook, and Teams. Each app has different capabilities — your training session will cover the specifics.",
          "",
          "Q: Do I have to use it?",
          "A: It's available for you to try. We encourage experimentation but it's not mandatory. That said, most people find it saves 30-60 minutes per day after the learning curve.",
          "",
          "Q: How do I get help?",
          "A: Reach out to [contact] or post in [Teams channel]. We're collecting feedback to improve the experience.",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Template 4: Training Invitation", bold: true, size: 32, color: CYAN })] }),
        ...[
          "",
          "Subject: You're invited: Copilot training session",
          "",
          "Hi [Name],",
          "",
          "You now have access to Microsoft Copilot — and we want to make sure you get the most out of it.",
          "",
          "Join us for a 30-minute training session where you'll see Copilot in action and learn:",
          "  • How to use Copilot in Word, Outlook, and Teams",
          "  • Tips for getting better results",
          "  • What Copilot can and can't do",
          "",
          "📅 Date: [DATE]",
          "🕐 Time: [TIME]",
          "📍 Location: [TEAMS LINK / ROOM]",
          "",
          "Can't make it? We'll share a recording afterward.",
          "",
          "See you there,",
          "[Sender]",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Template 5: Feedback Survey", bold: true, size: 32, color: CYAN })] }),
        ...[
          "",
          "COPILOT FEEDBACK SURVEY",
          "",
          "1. How often are you using Copilot? (Daily / Several times a week / Once a week / Rarely / Never)",
          "2. Which Copilot features do you use most? (Word / Excel / PowerPoint / Outlook / Teams / Other)",
          "3. On a scale of 1-5, how useful is Copilot for your daily work? (1=Not useful, 5=Very useful)",
          "4. On a scale of 1-5, how accurate are Copilot's suggestions? (1=Rarely accurate, 5=Very accurate)",
          "5. How much time does Copilot save you per day? (0 / 15 min / 30 min / 1 hour / 2+ hours)",
          "6. What's the single best thing Copilot helps you with? (Open text)",
          "7. What's the single most frustrating thing about Copilot? (Open text)",
          "8. Would you recommend Copilot to a colleague? (Yes / No / Maybe)",
          "9. Any concerns about using AI at work? (Open text)",
          "10. What features or improvements would you like to see? (Open text)",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "30/60/90-Day Rollout Timeline", bold: true, size: 32, color: CYAN })] }),
        ...[
          "",
          "DAYS 1-30: PILOT",
          "  • Deploy to pilot group ([N] users)",
          "  • Run training sessions",
          "  • Collect feedback weekly",
          "  • Identify champions and use cases",
          "",
          "DAYS 31-60: EXPANSION",
          "  • Expand department by department",
          "  • Manager enablement sessions",
          "  • Refine comms based on pilot feedback",
          "  • Address technical issues",
          "",
          "DAYS 61-90: ORGANIZATION-WIDE",
          "  • Full rollout to all eligible users",
          "  • Finalize usage policy",
          "  • Publish results and ROI",
          "  • Establish ongoing feedback channel",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Copilot Usage Policy Template", bold: true, size: 32, color: CYAN })] }),
        ...[
          "",
          "MICROSOFT COPILOT USAGE POLICY",
          "",
          "1. SCOPE: This policy applies to all employees, contractors, and third parties using Copilot on behalf of the organization.",
          "",
          "2. APPROVED USE: Copilot may be used for work-related tasks within Microsoft 365 applications. Personal use is not permitted on company devices.",
          "",
          "3. DATA HANDLING: No confidential or restricted data (as defined in the Data Classification Policy) may be entered into Copilot without prior approval. When in doubt, do not paste sensitive data into Copilot.",
          "",
          "4. AI-GENERATED CONTENT: All AI-generated content must be reviewed by a human before external publication. AI-generated code must be reviewed before production deployment. AI-generated analysis must be verified before business decisions.",
          "",
          "5. ACCURACY: Employees are responsible for verifying the accuracy of Copilot outputs. Copilot is a tool, not a replacement for professional judgment. Errors in AI-generated content are the responsibility of the human who publishes them.",
          "",
          "6. INCIDENT REPORTING: Any unexpected Copilot behavior, data exposure concern, or compliance issue must be reported to IT Security within 24 hours via [incident reporting channel].",
          "",
          "7. TRAINING: All users must complete the organization's AI awareness training before receiving Copilot access. Refresher training is required annually.",
          "",
          "8. POLICY REVIEW: This policy is reviewed semi-annually and updated as AI capabilities and regulations evolve. Last reviewed: [DATE]",
        ].map(line => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, size: 20 })] })),

        new Paragraph({ children: [new TextRun({ break: 1 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "© 2026 Piero Porfirio. All rights reserved. For personal and organizational use only.", size: 16, color: "999999" })] }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(__dirname, "copilot-rollout-pack", "Copilot_M365_AI_Rollout_Comms_Pack.docx"), buffer);
  console.log("Product 3 DOCX generated");
}

Promise.all([generateProduct2(), generateProduct3()]).catch(console.error);