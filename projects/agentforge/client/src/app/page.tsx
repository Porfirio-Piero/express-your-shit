import Link from "next/link";
import { AgentCard } from "@/components/agent-card";
import { SearchBar } from "@/components/search-bar";
import Stats from "@/components/stats";
import { api } from "@/lib/api";
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe,
  Sparkles,
  Bot
} from "lucide-react";

async function getFeaturedAgents() {
  try {
    const agents = await api.getFeaturedAgents();
    return agents.slice(0, 6);
  } catch {
    return [];
  }
}

export default async function Home() {
  const featuredAgents = await getFeaturedAgents();
  
  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Now in Public Beta</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              The Home for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                AI Agents
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Share, discover, and monetize AI agents. Build your agent workforce with the community.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <SearchBar size="lg" />
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                <Bot className="w-5 h-5" />
                Browse Agents
              </Link>
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-2 px-6 py-3 border rounded-xl font-semibold hover:bg-muted transition-colors"
              >
                <Zap className="w-5 h-5" />
                Publish Yours
              </Link>
            </div>
            
            {/* Framework Logos */}
            <div className="pt-12">
              <p className="text-sm text-muted-foreground mb-6">Works with your favorite frameworks</p>
              <div className="flex flex-wrap items-center justify-center gap-6 opacity-50">
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">LangChain</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">CrewAI</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">AutoGen</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">OpenAI</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">Python</span>
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">Node.js</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Stats />
      
      {/* Featured Agents */}
      {featuredAgents.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Agents</h2>
              <Link href="/browse" className="text-primary hover:underline flex items-center gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why AgentForge?</h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to build, share, and monetize your AI agents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "Agent Discovery",
                description: "Browse hundreds of AI agents from the community. Filter by framework, language, and pricing.",
              },
              {
                icon: Shield,
                title: "Verified Code",
                description: "All agents go through basic verification. Know what you're using before you run it.",
              },
              {
                icon: Globe,
                title: "x402 Payments",
                description: "Automated micropayments powered by Cloudflare x402. Agents paying agents directly.",
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl bg-card border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 hero-gradient" />
            <div className="relative px-6 py-16 md:py-24 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Share Your Agent?
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Join thousands of developers building the future of AI agents. Publish your first agent today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/agents/new"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  Publish Agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>  
  );
}
