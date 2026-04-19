"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, Agent } from "@/lib/api";
import {
  Star,
  Download,
  GitFork,
  Share2,
  ExternalLink,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("readme");
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (slug) {
      fetchAgent();
    }
  }, [slug]);
  
  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await api.getAgentBySlug(slug);
      setAgent(data);
    } catch (err) {
      setError("Failed to load agent");
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const formatPrice = () => {
    if (!agent) return "";
    if (agent.pricing_type === "free") return "Free";
    if (agent.pricing_type === "subscription") {
      return `$${agent.price}/month`;
    }
    return `$${agent.price} per ${agent.pricing_unit || "request"}`;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The agent you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse all agents
        </Link>
      </div>
    );
  }
  
  const tabs = [
    { id: "readme", label: "README" },
    { id: "usage", label: "Usage" },
    { id: "pricing", label: "Pricing" },
    { id: "versions", label: "Versions" },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/browse" className="hover:text-foreground">Agents</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{agent.name}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{agent.name}</h1>
                  <span className="px-2 py-1 bg-muted rounded text-sm font-mono">
                    v{agent.version || "1.0.0"}
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-2">
                  {agent.short_description || agent.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {agent.author && (
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {(agent.author.display_name || agent.author.username || "?").charAt(0).toUpperCase()}
                      </div>
                      {agent.author.display_name || agent.author.username}
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {agent.rating_average?.toFixed(1) || "0.0"} ({agent.rating_count} ratings)
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {agent.download_count?.toLocaleString()} downloads
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    {agent.view_count?.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 lg:ml-auto">
              <button className="p-2 border rounded-lg hover:bg-muted">
                <Share2 className="w-5 h-5" />
              </button>
              
              <button className="p-2 border rounded-lg hover:bg-muted">
                <GitFork className="w-5 h-5" />
              </button>
              
              <button
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  agent.pricing_type === 'free'
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90"
                }`}
              >
                <Download className="w-5 h-5" />
                {agent.pricing_type === 'free' ? 'Download' : 'Purchase'}
              </button>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {agent.framework && (
              <span className="px-3 py-1 bg-muted rounded-full text-sm">
                {agent.framework}
              </span>
            )}
            <span className="px-3 py-1 bg-muted rounded-full text-sm">
              {agent.language}
            </span>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${agent.pricing_type === 'free'
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
              }
            `}>
              {formatPrice()}
            </span>
            
            {agent.tags?.split(",").map((tag) => (
              <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="border-b mb-6">
              <div className="flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="prose dark:prose-invert max-w-none">
              {activeTab === "readme" && (
                <div>
                  {agent.readme ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap">{agent.readme}</pre>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      📝 No README provided for this agent.
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "usage" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Installation</h3>
                    <div className="relative">
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto">
                        <code>pip install agentforge-client</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard("pip install agentforge-client")}
                        className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Usage Example</h3>
                    <div className="relative">
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto">
                        <code>{
                          `from agentforge import Agent

# Load the agent
agent = Agent.load("${agent.slug}")

# Run the agent
result = agent.run(inputs={"prompt": "Hello"})
print(result)`
                        }
</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(``)}
                        className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {agent.docker_image && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Docker</h3>
                      <div className="relative">
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto">
                          <code>{`docker pull ${agent.docker_image}\ndocker run -p 8000:8000 ${agent.docker_image}`}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(``)}
                          className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-muted">
                    <h3 className="text-xl font-semibold mb-4">Pricing Details</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b">
                        <span>Base Price</span>
                        <span className="font-semibold">{formatPrice()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span>Pricing Model</span>
                        <span className="font-semibold capitalize">{agent.pricing_type}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b">
                        <span>Unit</span>
                        <span className="font-semibold capitalize">{agent.pricing_unit || "request"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-400">
                        💡 Pay directly with x402 protocol. Your funds go straight to the creator.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "versions" && (
                <div>
                  <div className="space-y-2">
                    {[
                      { version: agent.version || "1.0.0", date: agent.updated_at || agent.created_at, isCurrent: true },
                    ].map((version) => (
                      <div
                        key={version.version}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-mono font-medium">v{version.version}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(version.date).toLocaleDateString()}
                          </div>
                          {version.isCurrent && (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        
                        <button className="text-primary hover:underline text-sm">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="p-6 border rounded-xl">
              <h3 className="font-semibold mb-4">Agent Info</h3>
              
              <div className="space-y-3 text-sm">
                {agent.categories?.map((cat) => (
                  <div key={cat.id} className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span>{cat.name}</span>
                  </div>
                ))}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework</span>
                  <span>{agent.framework || "Custom"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="capitalize">{agent.language}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License</span>
                  <span>MIT</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{agent.updated_at ? new Date(agent.updated_at).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border rounded-xl">
              <h3 className="font-semibold mb-4">Try This Agent</h3>
              
              <div className="space-y-3">
                <textarea
                  placeholder="Enter your prompt here..."
                  className="w-full h-24 p-3 border rounded-lg resize-none text-sm"
                />
                
                <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                  Run Agent
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                This is a simplified demo. Full execution requires API integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
