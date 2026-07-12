"use client";

export default function PrioritiesContent() {
  const priorities = [
    {
      rank: 1,
      title: "Consiglio Dashboard — Polish & Ship",
      urgency: "High",
      type: "active_build",
      owner: "BotFather",
      status: "In Progress",
      reasoning: "Command Center is live with agent fleet, mob names, specialist profiles, approval system, and real-time status. Needs final polish, auth hardening, and mobile optimization.",
      impact: "Single pane of glass for the entire famiglia — fleet status, cron jobs, approvals, platform health.",
      borderColor: "border-l-[#e94560]",
      badgeBg: "bg-red-500/20",
      badgeText: "text-red-400",
      badgeBg2: "bg-[#e94560]",
    },
    {
      rank: 2,
      title: "Platform v1.2.3 — Verify & Validate",
      urgency: "High",
      type: "verification",
      owner: "BotFather",
      status: "Installed",
      reasoning: "AI Engineering Platform v1.2.3 selective overlay installed: 11 engineering + personality standards, 14 platform skills, 10 Italian-American agent personalities (1 active Mikey Models, 9 reference-on-demand). Voice test complete. Needs runtime validation.",
      impact: "Full personality system for the famiglia. Every agent has distinct voice, profanity scaling, and risk-adjusted behavior.",
      borderColor: "border-l-purple-500",
      badgeBg: "bg-purple-500/20",
      badgeText: "text-purple-400",
      badgeBg2: "bg-purple-500",
    },
    {
      rank: 3,
      title: "Revenue Pipeline — Land First Customer",
      urgency: "High",
      type: "revenue",
      owner: "Piero",
      status: "Active",
      reasoning: "Multiple validated SaaS ideas in pipeline (RetainBurn, CategorEase, MatchFlow). CategorEase is furthest along (Grade A, client-facing transaction categorization). Need to ship and get first paying customer. Hard KPI: time-to-first-revenue < 14 days.",
      impact: "Proves the autonomous company model. First dollar validates everything.",
      borderColor: "border-l-green-500",
      badgeBg: "bg-green-500/20",
      badgeText: "text-green-400",
      badgeBg2: "bg-green-500",
    },
    {
      rank: 4,
      title: "SaaS Products — Ship MVPs",
      urgency: "Medium",
      type: "product",
      owner: "Dapper Dan",
      status: "Queued",
      reasoning: "RetainBurn (freelancer retainer burn-down), CategorEase (client-facing categorization), MatchFlow (invoice matching) all have PRDs validated Grade A/B. Ready for overnight build cycles. Each needs deployment, Stripe integration, and landing page.",
      impact: "Three revenue-generating products in market within 2 weeks.",
      borderColor: "border-l-cyan-500",
      badgeBg: "bg-cyan-500/20",
      badgeText: "text-cyan-400",
      badgeBg2: "bg-cyan-500",
    },
    {
      rank: 5,
      title: "Security Monitoring — 24/7 Armed",
      urgency: "Ongoing",
      type: "operations",
      owner: "BotFather",
      status: "Running",
      reasoning: "OBSBOT Tiny 4K always armed. Motion detection + YOLO running. Alert thresholds set (2-3 people = household, 5+ unknown = unusual). Periodic snaps every 45 min. Timelapse compiler running. Never reboot the machine.",
      impact: "Continuous security coverage for the household.",
      borderColor: "border-l-amber-500",
      badgeBg: "bg-amber-500/20",
      badgeText: "text-amber-400",
      badgeBg2: "bg-amber-500",
    },
    {
      rank: 6,
      title: "Business Website Pipeline — Recon & Build",
      urgency: "Medium",
      type: "pipeline",
      owner: "BotFather",
      status: "On Hold",
      reasoning: "Validated workflow for finding local businesses, scraping Instagram for real images, building professional sites with brand colors, deploying to Vercel, and reaching out via email/DM. Multiple completed sites in portfolio. Ready to resume when Piero greenlights.",
      impact: "Low-effort revenue. Each site = $200-500. Volume play.",
      borderColor: "border-l-blue-400",
      badgeBg: "bg-blue-500/20",
      badgeText: "text-blue-400",
      badgeBg2: "bg-blue-400",
    },
    {
      rank: 7,
      title: "Specialist Activation — Register in openclaw.json",
      urgency: "Low",
      type: "infrastructure",
      owner: "Piero",
      status: "Awaiting Approval",
      reasoning: "9 reference-on-demand specialists (Tony, Bella, Vinny, Nico, Joey, Sal, Frankie, Rocco, Connie) have full personality profiles but are NOT registered in openclaw.json. Need approval to activate them as sub-agents for on-demand delegation.",
      impact: "Full specialist fleet available for BotFather to delegate to on demand.",
      borderColor: "border-l-gray-500",
      badgeBg: "bg-gray-500/20",
      badgeText: "text-gray-400",
      badgeBg2: "bg-gray-500",
    },
  ]

  const metrics = [
    { value: priorities.filter(p => p.urgency === "High").length, label: "High Priority", color: "text-red-400" },
    { value: priorities.filter(p => p.status === "Running" || p.status === "In Progress" || p.status === "Installed").length, label: "Active", color: "text-green-400" },
    { value: "6", label: "Fleet Agents", color: "text-blue-400" },
    { value: "9", label: "Specialists", color: "text-purple-400" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">La Famiglia — Active Priorities</h2>
          <p className="text-sm text-gray-400 mt-1">What we&apos;re building, shipping, and protecting right now</p>
        </div>
        <div className="text-xs text-gray-500">Updated July 12, 2026</div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-[#16162a] rounded-xl border border-[#252542] p-4 text-center">
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-gray-400 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Priority Cards */}
      <div className="space-y-4">
        {priorities.map((p) => (
          <div
            key={p.rank}
            className={`bg-[#16162a] rounded-xl border border-[#252542] p-5 border-l-4 ${p.borderColor} hover:border-[#3a3a5a] transition-all`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${p.badgeBg2} shrink-0`}>
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-white text-lg">{p.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${p.badgeBg} ${p.badgeText}`}>
                    {p.urgency}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#252542] text-gray-300">
                    {p.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 text-sm text-gray-400 mb-3 ml-11">
              <span>📋 {p.type}</span>
              <span>👤 {p.owner}</span>
            </div>

            <div className="text-sm text-gray-300 leading-relaxed mb-3 ml-11">
              {p.reasoning}
            </div>

            <div className="text-sm text-green-400 italic ml-11">
              💡 Impact: {p.impact}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 pt-6 border-t border-[#252542] text-gray-500 text-sm">
        Consiglio Command Center • La Famiglia • All Cloud Models • <span className="text-green-500">●</span> Systems Nominal
      </div>
    </div>
  )
}