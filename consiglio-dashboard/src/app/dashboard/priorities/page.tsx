import PrioritiesContent from "./components/PrioritiesContent"

export default function PrioritiesPage() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">What Should We Do Next?</h1>
        <p className="text-gray-400 text-sm sm:text-base">Strategic prioritization based on current execution state</p>
      </div>
      <PrioritiesContent />
    </div>
  )
}