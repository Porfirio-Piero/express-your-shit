import SignInForm from "./components/SignInForm"
import { Suspense } from "react"

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  )
}

function SignInFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#16162a] border border-[#252542] shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#e94560] to-[#ff6b6b] bg-clip-text text-transparent">
            Mission Control
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Loading...</p>
        </div>
      </div>
    </div>
  )
}
