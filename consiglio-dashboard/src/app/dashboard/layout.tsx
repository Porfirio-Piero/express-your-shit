import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardNav from "./components/DashboardNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0]">
      <DashboardNav user={session.user} />
      <main>{children}</main>
    </div>
  )
}
