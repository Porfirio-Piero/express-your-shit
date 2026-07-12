const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

async function generateDeck() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Piero Porfirio";
  pptx.title = "AI Enablement Program - Executive Briefing";

  const CYAN = "06B6D4";
  const DARK = "0A0A14";
  const WHITE = "FFFFFF";
  const GRAY = "94A3B8";

  const slides = [
    { title: "AI Enablement Program", subtitle: "Executive Briefing" },
    { title: "Why Now", body: "• AI adoption is accelerating across all industries\n• Competitors are investing in AI programs\n• Without governance, shadow AI creates risk\n• The cost of waiting exceeds the cost of acting" },
    { title: "Use-Case Pipeline", body: "• 12 proposals received via intake form\n• Scored on: Impact, Feasibility, Data Readiness, Risk\n• Top 3 ready for pilot: Customer Support, Invoice Processing, Content Generation\n• Pipeline value: $2.1M estimated annual impact" },
    { title: "Governance Framework", body: "• 47-item governance checklist across 8 domains\n• Data privacy, model risk, vendor management, compliance\n• Change management, incident response, monitoring, training\n• Monthly review cadence with steering committee" },
    { title: "Risk Assessment", body: "• 3 high-risk proposals flagged for additional review\n• 2 require legal/compliance sign-off before proceeding\n• 1 vendor security review pending\n• All risks documented and mitigations identified" },
    { title: "Metrics Dashboard", body: "• AI program KPIs tracked monthly\n• Adoption rate, use-case throughput, time-to-value\n• Cost per successful implementation\n• Governance compliance score\n• Business impact (revenue, cost savings)" },
    { title: "90-Day Roadmap", body: "Weeks 1-2: Foundation — governance setup, intake form\nWeeks 3-4: First Wave — pilot selection, data assessment\nWeeks 5-8: Execution — pilot launch, monitoring\nWeeks 9-12: Scale — results reporting, pipeline expansion" },
    { title: "Team & Responsibilities", body: "• Program Sponsor: [Executive Name]\n• Program Lead: [IT Director]\n• Governance Lead: [Compliance/Risk]\n• Data Lead: [Data Engineering]\n• Business Liaisons: [Per business unit]" },
    { title: "Budget & Resources", body: "• Pilot budget: $50K (tools, compute, training)\n• Staff: 2 FTEs (program lead + data engineer)\n• Vendor evaluation: 3 AI platforms under review\n• Training: Organization-wide AI awareness (Q2)\n• ROI projection: 3-6 month payback on top use cases" },
    { title: "Quick Wins", body: "• Content generation assistant (Marketing) — 2 weeks to deploy\n• Invoice processing automation (Finance) — 4 weeks\n• Customer support chatbot (Operations) — 6 weeks\n• Estimated first-year savings: $340K" },
    { title: "Timeline", body: "[Gantt chart placeholder — customize with your dates]\n\nQ1: Foundation + Pilot Selection\nQ2: Pilot Execution + Training\nQ3: Scale + Governance Refinement\nQ4: Organization-wide Rollout" },
    { title: "Questions & Next Steps", body: "• Approve pilot budget ($50K)\n• Assign program sponsor\n• Schedule steering committee kickoff\n• Begin intake form distribution\n\nContact: [Your Name]\n[Your Email]\n[Your Phone]" },
  ];

  slides.forEach(slide => {
    const s = pptx.addSlide();
    s.background = { color: DARK };
    
    if (slide.subtitle) {
      // Title slide
      s.addText(slide.title, { x: 0.8, y: 2.0, w: 11.2, h: 1.2, fontSize: 36, color: WHITE, bold: true, fontFace: "Calibri" });
      s.addText(slide.subtitle, { x: 0.8, y: 3.3, w: 11.2, h: 0.6, fontSize: 20, color: CYAN, fontFace: "Calibri" });
    } else if (slide.body) {
      // Content slide
      s.addText(slide.title, { x: 0.8, y: 0.4, w: 11.2, h: 0.8, fontSize: 28, color: CYAN, bold: true, fontFace: "Calibri" });
      s.addText(slide.body, { x: 0.8, y: 1.5, w: 11.2, h: 5.5, fontSize: 16, color: GRAY, fontFace: "Calibri", lineSpacingMultiple: 1.3 });
    }
  });

  const filePath = path.join(__dirname, "ai-enablement-kit", "AI_Enablement_Executive_Briefing.pptx");
  await pptx.writeFile({ fileName: filePath });
  console.log("Executive Briefing PPTX generated:", filePath);
}

generateDeck().catch(console.error);