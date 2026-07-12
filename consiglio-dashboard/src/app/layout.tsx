import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mission Control OS - Consiglio Dashboard",
  description: "Secure Consiglio dashboard for strategic execution",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0a0a0f] text-[#e0e0e0]">{children}</body>
    </html>
  )
}
