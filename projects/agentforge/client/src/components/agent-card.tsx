"use client";

import Link from "next/link";
import { Star, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: {
    id: number;
    name: string;
    slug: string;
    short_description?: string;
    framework?: string;
    language?: string;
    pricing_type: string;
    price: number;
    rating_average?: number;
    rating_count?: number;
    download_count?: number;
    author?: {
      display_name?: string;
      username?: string;
    };
    is_featured?: boolean;
  };
  className?: string;
}

export function AgentCard({ agent, className }: AgentCardProps) {
  const formatPrice = () => {
    if (agent.pricing_type === 'free') return 'Free';
    return `$${agent.price}`;
  };
  
  const getFrameworkBadge = () => {
    if (agent.framework?.toLowerCase().includes('langchain')) return 'LangChain';
    if (agent.framework?.toLowerCase().includes('crew')) return 'CrewAI';
    if (agent.framework?.toLowerCase().includes('autogen')) return 'AutoGen';
    return agent.framework || 'Custom';
  };
  
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={cn(
        "group block p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {agent.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
            {agent.is_featured && (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {agent.short_description || 'No description provided'}
          </p>
          
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
              {getFrameworkBadge()}
            </span>
            
            {agent.language && (
              <span className="px-2 py-1 bg-muted rounded text-xs">
                {agent.language}
              </span>
            )}
            
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              agent.pricing_type === 'free' 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
            )}>
              {formatPrice()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {agent.rating_count ? (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {agent.rating_average?.toFixed(1)} ({agent.rating_count})
            </span>
          ) : null}
          
          {agent.author && (
            <span className="max-w-[120px] truncate">
              by {agent.author.display_name || agent.author.username || 'Unknown'}
            </span>
          )}
        </div>
        
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Download className="w-4 h-4" />
          {agent.download_count?.toLocaleString() || 0}
        </span>
      </div>
    </Link>
  );
}
