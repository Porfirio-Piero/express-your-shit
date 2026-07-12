import DashboardContent from "./components/DashboardContent"
import LiveAgentsSection from "./components/LiveAgentsSection"

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mission Control OS</h1>
        <p className="text-gray-400 text-sm sm:text-base">Execution Control • Opportunity Discovery • Product Pipeline • Strategic Prioritization</p>
      </div>
      {/* Live Agents — TOP */}
      <div className="mb-8">
        <LiveAgentsSection />
      </div>
      {/* Existing Dashboard Content */}
      <DashboardContent />
    </div>
  )
}