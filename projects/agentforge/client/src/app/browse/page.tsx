"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AgentCard } from "@/components/agent-card";
import { SearchBar } from "@/components/search-bar";
import { api, Agent } from "@/lib/api";
import { categories, frameworks, pricingTypes } from "./filters";
import {
  ChevronDown,
  Grid,
  List,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const initialCategory = searchParams?.get("category") || "";
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    query: initialQuery,
    category: initialCategory,
    framework: "",
    pricing_type: "",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const pageSize = 20;
  
  useEffect(() => {
    fetchAgents();
  }, [page, filters]);
  
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.getAgents({
        page,
        page_size: pageSize,
        query: filters.query || undefined,
        category: filters.category || undefined,
      });
      setAgents(response.items || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      framework: "",
      pricing_type: "",
    });
    setPage(1);
  };
  
  const hasActiveFilters = Object.values(filters).some((v) => v !== "");
  const totalPages = Math.ceil(total / pageSize);
  
  // Filter agents locally based on framework and pricing
  const filteredAgents = agents.filter((agent) => {
    if (filters.framework && agent.framework !== filters.framework) {
      return false;
    }
    if (filters.pricing_type && agent.pricing_type !== filters.pricing_type) {
      return false;
    }
    return true;
  });
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">Browse Agents</h1>
          <div className="max-w-xl">
            <SearchBar placeholder="Search agents by name, description, or tags..." />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 space-y-6 ${
              showMobileFilters
                ? "fixed inset-0 z-50 bg-background p-4 overflow-auto"
                : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <button
                      onClick={() => handleFilterChange("category", cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category === cat.name
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Frameworks */}
            <div>
              <h3 className="font-semibold mb-3">Framework</h3>
              <select
                value={filters.framework}
                onChange={(e) => handleFilterChange("framework", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              >
                <option value="">All Frameworks</option>
                {frameworks.map((fw) => (
                  <option key={fw.value} value={fw.value}>{fw.label}</option>
                ))}
              </select>
            </div>
            
            {/* Pricing */}
            <div>
              <h3 className="font-semibold mb-3">Pricing</h3>
              <select
                value={filters.pricing_type}
                onChange={(e) => handleFilterChange("pricing_type", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              >
                {pricingTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-2 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, total)} of {total} agents
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {filters.query && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    Query: {filters.query}
                    <button
                      onClick={() => handleFilterChange("query", "")}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                    {filters.category}
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
            
            {/* Agents Grid/List */}
            {loading ? (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "space-y-4"
              }>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl border bg-card animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-muted rounded" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No agents found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    className={viewMode === "list" ? "flex-row items-center" : ""}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-lg disabled:opacity-50 hover:bg-muted"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50 hover:bg-muted"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
