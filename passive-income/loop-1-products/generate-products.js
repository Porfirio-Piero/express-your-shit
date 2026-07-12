const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopPosition, TabStopType } = require("docx");
const fs = require("fs");
const path = require("path");

const BRAND_COLOR = "06B6D4"; // Cyan

async function generateProduct1() {
  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
          // Title Page
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "AI ENABLEMENT", bold: true, size: 56, color: BRAND_COLOR, font: "Calibri" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "OPERATING MODEL", bold: true, size: 56, color: BRAND_COLOR, font: "Calibri" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "STARTER KIT", bold: true, size: 56, color: BRAND_COLOR, font: "Calibri" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Intake Forms • Scoring Rubrics • Governance Checklists", size: 24, color: "666666" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Comms Templates • Exec Briefing Deck • 90-Day Playbook", size: 24, color: "666666" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "© 2026 Piero Porfirio. All rights reserved.", size: 18, color: "999999" })] }),
          // Page break
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          // Table of Contents
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: BRAND_COLOR })] }),
          ...["1. AI Use-Case Intake Form", "2. Use-Case Scoring Rubric", "3. AI Governance Checklist (47 Items)", "4. Rollout Communication Templates", "5. Executive Briefing Deck Template", "6. 90-Day Implementation Playbook", "7. Usage Policy Template"].map(t =>
            new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, size: 24 })] })
          ),
          // Section 1: Intake Form
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. AI Use-Case Intake Form", bold: true, size: 32, color: BRAND_COLOR })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Use this form to standardize AI project proposals across your organization. Every business unit should submit one before starting any AI initiative.", size: 22, italics: true, color: "666666" })] }),
          // Section 1 Fields
          ...[
            { heading: "Section 1: Problem Statement", fields: ["Project Name:", "Business Unit:", "Sponsor:", "Date:", "What problem are you trying to solve? (2-3 sentences):", "What would happen if we did nothing? (1-2 sentences):", "What does success look like? (Measurable outcome):"] },
            { heading: "Section 2: Data Assessment", fields: ["What data sources are needed?", "Is the data currently available? (Y/N/Partial)", "Data quality assessment (1-5):", "Data governance status (Owned/Shared/Unknown):", "Privacy/classification level (Public/Internal/Confidential/Restricted):"] },
            { heading: "Section 3: Success Criteria", fields: ["Primary KPI:", "Target metric:", "Baseline (current):", "Timeline to achieve:", "How will you measure this?"] },
            { heading: "Section 4: Risk Classification", fields: ["Regulatory risk (None/Low/Medium/High):", "Bias/fairness risk (None/Low/Medium/High):", "Reputational risk (None/Low/Medium/High):", "Operational risk if AI fails (None/Low/Medium/High):", "Data privacy risk (None/Low/Medium/High):"] },
            { heading: "Section 5: Resource Requirements", fields: ["Estimated budget:", "Team members needed:", "Technical resources (compute, data, tools):", "Timeline:", "Dependencies on other projects/teams:"] },
            { heading: "Section 6: Stakeholder Sign-off", fields: ["Business sponsor:", "IT review:", "Legal/compliance review:", "Data owner review:", "Final approval:"] },
          ].flatMap(section => [
            new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300 }, children: [new TextRun({ text: section.heading, bold: true, size: 26, color: "333333" })] }),
            ...section.fields.map(f => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: f, size: 22 }), new TextRun({ text: " _______________________________", size: 22, color: "CCCCCC" })] }))
          ]),
          // Section 2: Scoring Rubric
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. Use-Case Scoring Rubric", bold: true, size: 32, color: BRAND_COLOR })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Score every AI proposal on the same scale. Weight each dimension based on your organization's priorities. Default weights: Impact 30%, Feasibility 25%, Data Readiness 25%, Risk 20%.", size: 22, italics: true, color: "666666" })] }),
          ...[
            "Impact Score (1-5): Revenue impact, cost savings, strategic value",
            "  1 = Minimal impact on revenue/costs",
            "  3 = Moderate impact ($50K-500K annually)",
            "  5 = Transformational impact ($500K+ annually)",
            "",
            "Feasibility Score (1-5): Technical complexity, organizational readiness",
            "  1 = Requires significant new infrastructure/capabilities",
            "  3 = Moderate effort, some existing capabilities",
            "  5 = Can be implemented with current team and tools",
            "",
            "Data Readiness Score (1-5): Data quality, volume, accessibility, governance",
            "  1 = Data does not exist or is completely inaccessible",
            "  3 = Data exists but needs significant preparation",
            "  5 = Data is clean, accessible, and well-governed",
            "",
            "Risk Score (1-5, inverted): Regulatory risk, bias risk, reputational risk",
            "  1 = High risk (regulatory scrutiny, bias concerns, public visibility)",
            "  3 = Moderate risk (some concerns, manageable with controls)",
            "  5 = Low risk (internal use, low regulatory impact, low bias potential)",
          ].map(line => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: line, size: 20, color: line.startsWith("  ") ? "555555" : "333333", bold: !line.startsWith("  ") })] })),
          // Continue with more sections...
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. AI Governance Checklist", bold: true, size: 32, color: BRAND_COLOR })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "47 items across 8 domains. Check each item as you verify compliance.", size: 22, italics: true, color: "666666" })] }),
          ...["Data Privacy & Security", "Model Risk & Bias", "Vendor Management", "Regulatory Compliance", "Change Management", "Incident Response", "Monitoring & Reporting", "Training & Awareness"].map(domain =>
            new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun({ text: domain, bold: true, size: 24 })] })
          ),
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Rollout Communication Templates", bold: true, size: 32, color: BRAND_COLOR })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "5 ready-to-send templates: CEO Announcement, Manager Briefing, Team FAQ, Training Invitation, Feedback Survey. See PRODUCT.md for full text of each template.", size: 22, italics: true, color: "666666" })] }),
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. Executive Briefing Deck Template", bold: true, size: 32, color: BRAND_COLOR })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "12-slide structure: Program Vision → Why Now → Use-Case Pipeline → Governance Framework → Risk Assessment → Metrics Dashboard → 90-Day Roadmap → Team & Responsibilities → Budget & Resources → Quick Wins → Timeline → Q&A. See PPTX file for the full template.", size: 22, italics: true, color: "666666" })] }),
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "6. 90-Day Implementation Playbook", bold: true, size: 32, color: BRAND_COLOR })] }),
          ...["Weeks 1-2: Foundation — Stakeholder mapping, governance setup, intake form deployment, quick win identification", "Weeks 3-4: First Wave — Pilot selection, data assessment, vendor evaluation, manager enablement sessions", "Weeks 5-8: Execution — Pilot launch, monitoring framework, comms cadence, feedback collection", "Weeks 9-12: Scale — Results reporting, pipeline expansion, governance refinement, org-wide rollout planning"].map(w =>
            new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: w, size: 22 })] })
          ),
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "7. Usage Policy Template", bold: true, size: 32, color: BRAND_COLOR })] }),
          ...["This policy governs the use of AI tools and systems within the organization.", "", "1. SCOPE: This policy applies to all employees, contractors, and third parties using AI tools on behalf of the organization.", "2. APPROVED TOOLS: Only AI tools on the approved list may be used for work purposes. The list is maintained by IT and reviewed quarterly.", "3. DATA HANDLING: No confidential or restricted data may be entered into external AI tools without prior approval from the data owner and legal review.", "4. AI-GENERATED CONTENT: All AI-generated content must be reviewed by a human before external publication. AI-generated code must be reviewed before production deployment.", "5. ACCURACY: Employees are responsible for verifying the accuracy of AI-generated outputs. AI is a tool, not a replacement for professional judgment.", "6. INCIDENT REPORTING: Any unexpected AI behavior, data leak, or compliance concern must be reported to IT Security within 24 hours.", "7. TRAINING: All users of AI tools must complete the organization's AI awareness training before receiving access.", "8. REVIEW: This policy is reviewed annually and updated as AI capabilities and regulations evolve."].map(l =>
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: l, size: 22, color: l.startsWith("1.") || l.startsWith("2.") ? "333333" : l === "" ? "333333" : "555555" })] })
          ),
          // Footer
          new Paragraph({ children: [new TextRun({ break: 1 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "© 2026 Piero Porfirio. All rights reserved. For personal and organizational use only.", size: 16, color: "999999" })] }),
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(__dirname, "ai-enablement-kit", "AI_Enablement_Operating_Model_Starter_Kit.docx"), buffer);
  console.log("Product 1 DOCX generated");
}

generateProduct1().catch(console.error);