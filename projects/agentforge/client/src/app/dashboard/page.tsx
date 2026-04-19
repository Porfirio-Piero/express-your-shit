"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Package, 
  BarChart3, 
  DollarSign,
  Plus,
  Eye,
  Download,
  Settings,
  Clock,
  CheckCircle
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "agents", label: "My Agents", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "earnings", label: "Earnings", icon: DollarSign },
];

// Mock data for dashboard
const mockAgents = [
  {
    id: 1,
    name: "PDF Parser Pro",
    slug: "pdf-parser-pro",
    pricing_type: "paid",
    price: 0.01,
    view_count: 1234,
    download_count: 567,
    rating_average: 4.8,
    rating_count: 23,
    status: "published",
    created_at: "2026-02-20",
  },
  {
    id: 2,
    name: "Web Scraper Agent",
    slug: "web-scraper-agent",
    pricing_type: "free",
    view_count: 892,
    download_count: 234,
    rating_average: 4.5,
    rating_count: 12,
    status: "published",
    created_at: "2026-02-18",
  },
];

const mockAnalytics = [
  { date: "Feb 18", views: 120, downloads: 15, revenue: 0.25 },
  { date: "Feb 19", views: 145, downloads: 22, revenue: 0.35 },
  { date: "Feb 20", views: 180, downloads: 28, revenue: 0.42 },
  { date: "Feb 21", views: 210, downloads: 35, revenue: 0.58 },
  { date: "Feb 22", views: 195, downloads: 30, revenue: 0.48 },
  { date: "Feb 23", views: 240, downloads: 40, revenue: 0.65 },
  { date: "Feb 24", views: 280, downloads: 52, revenue: 0.82 },
];

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
        <p className="text-muted-foreground">
          Please sign in to view your dashboard.
        </p>
      </div>
    );
  }
  
  const stats = [
    { label: "Total Agents", value: mockAgents.length, icon: Package },
    { label: "Total Views", value: mockAgents.reduce((a, b) => a + b.view_count, 0).toLocaleString(), icon: Eye },
    { label: "Downloads", value: mockAgents.reduce((a, b) => a + b.download_count, 0).toLocaleString(), icon: Download },
    { label: "Revenue", value: "$1,234", icon: DollarSign },
  ];
  
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 space-y-1">
            <div className="p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                  {(user?.firstName || user?.username || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{user?.firstName || user?.username || "User"}</div>
                  <div className="text-xs text-muted-foreground">Creator</div>
                </div>
              </div>
            </div>
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                  <Link
                    href="/agents/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                    New Agent
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="p-4 bg-card border rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <stat.icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Recent Activity */}
                <div className="p-6 bg-card border rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Your Agents</h2>
                    <button 
                      onClick={() => setActiveTab("agents")}
                      className="text-primary hover:underline text-sm"
                    >
                      View all
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {mockAgents.slice(0, 2).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {agent.pricing_type === "free" ? "Free" : `$${agent.price}`}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {agent.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {agent.download_count}
                          </span>
                          <Link
                            href={`/agents/${agent.slug}`}
                            className="text-primary hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "agents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">My Agents</h1>
                  <Link
                    href="/agents/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                    New Agent
                  </Link>
                </div>
                
                <div className="bg-card border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Agent</th>
                        <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Price</th>
                        <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Views</th>
                        <th className="text-left p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAgents.map((agent) => (
                        <tr key={agent.id} className="border-t">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                                {agent.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{agent.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {agent.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {agent.pricing_type === "free" ? "Free" : `$${agent.price}`}
                          </td>
                          <td className="p-4 hidden md:table-cell">{agent.view_count.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/agents/${agent.slug}`}
                                className="p-2 hover:bg-muted rounded-lg text-primary"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground" title="Edit">
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Analytics</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Views", value: "4,351", change: "+12%" },
                    { label: "Downloads", value: "901", change: "+23%" },
                    { label: "Avg Rating", value: "4.7", change: "+0.2" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-card border rounded-xl">
                      <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <span className="text-sm text-green-600">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === "earnings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Earnings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Earnings", value: "$1,234.56", icon: DollarSign },
                    { label: "Pending Payout", value: "$234.56", icon: Clock },
                    { label: "Paid Out", value: "$1,000.00", icon: CheckCircle },
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-card border rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                          <div className="text-3xl font-bold">{stat.value}</div>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <stat.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-card border rounded-xl">
                  <p className="text-muted-foreground text-center py-8">
                    Connect your Stripe account to start receiving payments.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
