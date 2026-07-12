"use client";

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function DashboardNav({ user }: { user: any }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: "Mission Control", icon: "🚀" },
    { href: "/dashboard/command-center", label: "Command Center", icon: "⚡" },
    { href: "/dashboard/agents", label: "Agents", icon: "🤖" },
    { href: "/dashboard/priorities", label: "Priorities", icon: "🎯" },
  ]

  return (
    <nav className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b-2 border-[#0f3460] px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#e94560] to-[#ff6b6b] bg-clip-text text-transparent">
              Consiglio
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[#252542] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1e1e3a]"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span className="text-sm text-gray-400">
            👤 {user?.email || "Admin"}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1e1e3a] transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 text-gray-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="sm:hidden mt-4 pt-4 border-t border-[#252542]">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[#252542] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#1e1e3a]"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#252542] flex items-center justify-between">
            <span className="text-sm text-gray-400">
              👤 {user?.email || "Admin"}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1e1e3a] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}