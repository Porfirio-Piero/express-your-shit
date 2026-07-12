"use client"

export default function DashboardContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* What Should We Do Next - Full Width */}
      <div className="lg:col-span-2 bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
        <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span>🎯</span> What Should We Do Next?
          </h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
            Medium Pressure
          </span>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Pressure Index</span>
            <span className="text-yellow-400 font-semibold">6.5 / 10</span>
          </div>
          <div className="w-full h-2 bg-[#252542] rounded-full overflow-hidden mb-6">
            <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: "65%" }} />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-[#1e1e3a] rounded-lg">
            {[
              { label: "Aging Blockers", value: "2", color: "text-red-400" },
              { label: "Active Incidents", value: "1", color: "text-yellow-400" },
              { label: "Dev Capacity", value: "70%", color: "text-green-400" },
              { label: "Drift Status", value: "Minor", color: "text-blue-400" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-gray-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {[
              {
                rank: 1,
                type: "Blocker Resolution",
                title: "Unblock TASK-045",
                reasoning: "Blocker aging 5 days, blocking 3 other tasks in current sprint",
                user: "dev-team-lead",
                time: "2 hours",
                urgency: "🔴 High Urgency",
                borderColor: "border-l-red-500",
              },
              {
                rank: 2,
                type: "Opportunity Pursuit",
                title: "Review PRD OPP-20260217-003",
                reasoning: "Tier A opportunity with score 7.55, strong B2B monetization potential ($5K+ MRR)",
                user: "head-of-product",
                time: "4 hours",
                urgency: "🟡 Medium Urgency",
                borderColor: "border-l-yellow-500",
              },
              {
                rank: 3,
                type: "Incident Response",
                title: "Address incident INC-001",
                reasoning: "Performance degradation affecting user experience, 15% slower response times",
                user: "devops-lead",
                time: "6 hours",
                urgency: "🟡 Medium Urgency",
                borderColor: "border-l-blue-400",
              },
            ].map((action) => (
              <li
                key={action.rank}
                className={`bg-[#1e1e3a] rounded-lg p-4 border-l-4 ${action.borderColor}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg">{action.rank}</span>
                  <span className="text-xs px-2 py-1 rounded bg-[#252542] text-gray-400 uppercase">
                    {action.type}
                  </span>
                </div>
                <div className="font-semibold text-white mb-1">{action.title}</div>
                <div className="text-sm text-gray-400 mb-2">{action.reasoning}</div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>👤 {action.user}</span>
                  <span>⏱️ {action.time}</span>
                  <span>{action.urgency}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Product Pipeline */}
      <div className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
        <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
          <h2 className="text-white font-semibold">📦 Product Pipeline</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
            Flowing
          </span>
        </div>
        <div className="p-5 space-y-3">
          {[
            { name: "Raw Opportunities", count: 12, color: "bg-gray-500" },
            { name: "Scored & Ranked", count: 8, color: "bg-blue-400" },
            { name: "Concepts", count: 2, color: "bg-purple-400" },
            { name: "PRDs Ready", count: 2, color: "bg-yellow-400" },
            { name: "Feasibility Review", count: 1, color: "bg-orange-400" },
            { name: "Approved for Dev", count: 1, color: "bg-green-400" },
          ].map((stage) => (
            <div key={stage.name} className="flex items-center py-2">
              <div className={`w-3 h-3 rounded-full mr-3 ${stage.color}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{stage.name}</div>
              </div>
              <div className="text-lg font-bold text-white">{stage.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Intelligence */}
      <div className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
        <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
          <h2 className="text-white font-semibold">📊 Market Intelligence</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-400">
            2 High Priority
          </span>
        </div>
        <div className="p-5">
          {[
            { label: "Total Signals", value: "8", color: "text-blue-400" },
            { label: "Opportunities", value: "5", color: "text-green-400" },
            { label: "Threats", value: "2", color: "text-red-400" },
          ].map((metric) => (
            <div key={metric.label} className="flex justify-between items-center py-3 border-b border-[#252542] last:border-0">
              <span className="text-gray-400 text-sm">{metric.label}</span>
              <span className={`font-semibold ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
          <div className="mt-4 p-3 bg-[#1e1e3a] rounded-lg">
            <div className="font-semibold text-sm mb-2">🔥 Top Signal</div>
            <div className="text-sm text-yellow-400">CompetitorX launched AI invoice feature</div>
            <div className="text-xs text-gray-400 mt-1">Impact: High | Response needed: Yes</div>
          </div>
        </div>
      </div>

      {/* Agent Schedule */}
      <div className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
        <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
          <h2 className="text-white font-semibold">⏰ Daily Agent Schedule</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
            8 Jobs
          </span>
        </div>
        <div className="p-5">
          {[
            { time: "06:00", agent: "problem-scout-agent" },
            { time: "06:30", agent: "trend-signal-analyzer" },
            { time: "07:00", agent: "opportunity-prioritizer" },
            { time: "08:00", agent: "concept-architect" },
            { time: "08:30", agent: "requirements-generator" },
            { time: "09:00", agent: "head-of-product" },
            { time: "09:30", agent: "head-of-marketing" },
            { time: "10:00", agent: "what-should-we-do-next" },
          ].map((item) => (
            <div key={item.time} className="flex justify-between items-center py-3 border-b border-[#252542] last:border-0">
              <span className="text-gray-400 text-sm font-mono">{item.time}</span>
              <span className="text-white">{item.agent}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Organization */}
      <div className="bg-[#16162a] rounded-xl border border-[#252542] overflow-hidden">
        <div className="bg-[#1e1e3a] px-5 py-4 border-b border-[#252542] flex items-center justify-between">
          <h2 className="text-white font-semibold">🏛️ Organization</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
            Active
          </span>
        </div>
        <div className="p-5">
          {[
            { label: "Mission Control", value: "System", color: "text-green-400" },
            { label: "├─ head-of-product", value: "4 agents" },
            { label: "├─ head-of-marketing", value: "1 agent" },
            { label: "└─ what-should-we-do-next", value: "Engine" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-3 border-b border-[#252542] last:border-0">
              <span className="text-gray-400 text-sm">{item.label}</span>
              <span className={`font-semibold ${item.color || ""}`}>{item.value}</span>
            </div>
          ))}
          <div className="mt-4 p-3 bg-[#1e1e3a] rounded-lg text-sm text-gray-400">
            <div>
              <strong>Reporting:</strong> Agents → Leads → Mission Control
            </div>
            <div>
              <strong>Schedule:</strong> Daily 06:00-10:00 ET
            </div>
            <div>
              <strong>Artifacts:</strong> opportunities/, ops/, dashboards/
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
