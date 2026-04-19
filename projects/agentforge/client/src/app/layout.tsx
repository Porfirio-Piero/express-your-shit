import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";
import { Search, PlusCircle, LayoutDashboard, Menu, X } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentForge | AI Agent Marketplace",
  description: "Share, discover, and monetize AI agents. The home for agentic workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-background`}>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                    AgentForge
                  </span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 ml-8">
                  <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Browse
                  </Link>
                  <Link href="/agents/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Upload
                  </Link>
                  <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </nav>
              </div>
              
              <div className="flex items-center gap-4">
                <Link href="/browse" className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Link>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-3">
                  <SignedIn>
                    <Link href="/agents/new" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                      <PlusCircle className="w-4 h-4" />
                      <span>Publish</span>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                        Get Started
                      </button>
                    </SignUpButton>
                  </SignedOut>
                </div>
              </div>
            </div>
          </header>
          
          <main>{children}</main>
          
          <footer className="border-t bg-muted/50">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded hero-gradient flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <span className="font-semibold">AgentForge</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The home for AI agents. Share, discover, and monetize.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Platform</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/browse" className="hover:text-foreground">Browse Agents</Link></li>
                    <li><Link href="/browse?pricing=free" className="hover:text-foreground">Free Agents</Link></li>
                    <li><Link href="/browse?sort=popular" className="hover:text-foreground">Popular</Link></li>
                    <li><Link href="/agents/new" className="hover:text-foreground">Publish</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                    <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
                    <li><Link href="#" className="hover:text-foreground">x402 Protocol</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-foreground">About</Link></li>
                    <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                    <li><Link href="#" className="hover:text-foreground">GitHub</Link></li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                © 2026 AgentForge. Built with ❤️ for the agentic future.
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}

// Import for Client Components
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";