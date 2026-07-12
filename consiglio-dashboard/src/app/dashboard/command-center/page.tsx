import { auth } from "@/auth"
import { redirect } from "next/navigation"
import CommandCenterClient from "./CommandCenterClient"

export default async function CommandCenterPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin")

  return <CommandCenterClient />
}