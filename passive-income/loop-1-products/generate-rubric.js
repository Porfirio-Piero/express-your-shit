const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

async function generateRubric() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Piero Porfirio";
  workbook.created = new Date();

  // Sheet 1: Scoring Rubric
  const ws = workbook.addWorksheet("Use-Case Scoring Rubric", {
    views: [{ state: "frozen", ySplit: 1 }]
  });

  // Headers
  ws.columns = [
    { header: "Project Name", key: "name", width: 25 },
    { header: "Business Unit", key: "unit", width: 18 },
    { header: "Impact (1-5)", key: "impact", width: 14 },
    { header: "Feasibility (1-5)", key: "feasibility", width: 16 },
    { header: "Data Readiness (1-5)", key: "data", width: 18 },
    { header: "Risk (1-5, inverted)", key: "risk", width: 20 },
    { header: "Weighted Score", key: "weighted", width: 16 },
    { header: "Priority Rank", key: "rank", width: 14 },
    { header: "Notes", key: "notes", width: 30 },
  ];

  // Style header row
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "06B6D4" } };
  ws.getRow(1).alignment = { horizontal: "center", vertical: "middle" };

  // Sample data rows
  const samples = [
    { name: "Customer Support Chatbot", unit: "Operations", impact: 4, feasibility: 4, data: 3, risk: 3 },
    { name: "Invoice Processing Automation", unit: "Finance", impact: 5, feasibility: 3, data: 4, risk: 4 },
    { name: "Predictive Maintenance", unit: "Engineering", impact: 5, feasibility: 2, data: 2, risk: 2 },
    { name: "Content Generation Assistant", unit: "Marketing", impact: 2, feasibility: 5, data: 4, risk: 5 },
    { name: "Fraud Detection Model", unit: "Risk", impact: 5, feasibility: 3, data: 3, risk: 2 },
  ];

  samples.forEach((s, i) => {
    const row = ws.addRow([s.name, s.unit, s.impact, s.feasibility, s.data, s.risk, null, null, ""]);
    // Weighted score formula: Impact*0.3 + Feasibility*0.25 + Data*0.25 + Risk*0.2
    row.getCell(7).value = { formula: `C${i+2}*0.3 + D${i+2}*0.25 + E${i+2}*0.25 + F${i+2}*0.2` };
    row.getCell(8).value = { formula: `RANK(G${i+2},G$2:G$6,0)` };
  });

  // Sheet 2: Weight Configuration
  const ws2 = workbook.addWorksheet("Weight Configuration", { views: [{ state: "frozen", ySplit: 1 }] });
  ws2.columns = [
    { header: "Dimension", key: "dim", width: 25 },
    { header: "Default Weight", key: "weight", width: 16 },
    { header: "Your Weight", key: "custom", width: 16 },
    { header: "Description", key: "desc", width: 50 },
  ];
  ws2.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  ws2.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "06B6D4" } };
  ws2.addRow(["Impact", "30%", "", "Revenue impact, cost savings, strategic value"]);
  ws2.addRow(["Feasibility", "25%", "", "Technical complexity, organizational readiness"]);
  ws2.addRow(["Data Readiness", "25%", "", "Data quality, volume, accessibility, governance"]);
  ws2.addRow(["Risk (inverted)", "20%", "", "Regulatory, bias, reputational — higher = lower risk"]);

  // Sheet 3: Scoring Guide
  const ws3 = workbook.addWorksheet("Scoring Guide");
  ws3.columns = [
    { header: "Score", key: "score", width: 10 },
    { header: "Impact Meaning", key: "impact", width: 35 },
    { header: "Feasibility Meaning", key: "feas", width: 35 },
    { header: "Data Readiness Meaning", key: "data", width: 35 },
    { header: "Risk Meaning (inverted)", key: "risk", width: 35 },
  ];
  ws3.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  ws3.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "06B6D4" } };
  ws3.addRow(["1", "Minimal revenue/cost impact", "Requires significant new infrastructure", "Data does not exist", "High risk — regulatory scrutiny"]);
  ws3.addRow(["2", "Minor impact ($10-50K/yr)", "Major effort, some existing capability", "Data exists, mostly inaccessible", "Moderate-high risk"]);
  ws3.addRow(["3", "Moderate impact ($50-500K/yr)", "Moderate effort, some existing capability", "Data exists, needs preparation", "Moderate risk, manageable"]);
  ws3.addRow(["4", "Significant impact ($500K-1M/yr)", "Minor effort, good capability match", "Data is mostly ready", "Low risk, few concerns"]);
  ws3.addRow(["5", "Transformational ($1M+/yr)", "Can implement with current team/tools", "Data is clean, accessible, governed", "Very low risk"]);

  const filePath = path.join(__dirname, "ai-enablement-kit", "AI_Enablement_Scoring_Rubric.xlsx");
  await workbook.xlsx.writeFile(filePath);
  console.log("Scoring Rubric XLSX generated:", filePath);
}

generateRubric().catch(console.error);