"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

export function SearchBar({ className = "", placeholder = "Search agents...", size = "md" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/browse");
    }
  };
  
  const sizeClasses = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-16 text-lg"
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className={`${iconSizes[size]} absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`
            ${sizeClasses[size]} w-full pl-12 pr-4 
            rounded-xl border bg-background
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            placeholder:text-muted-foreground
          `}
        />
        <button
          type="submit"
          className={`
            ${size === "lg" ? "h-12 px-6" : size === "md" ? "h-8 px-4" : "h-6 px-3"}
            absolute right-2 top-1/2 -translate-y-1/2
            bg-primary text-primary-foreground rounded-lg
            hover:bg-primary/90 font-medium
            ${size === "lg" ? "text-base" : "text-sm"}
          `}
        >
          Search
        </button>
      </div>
    </form>
  );
}
