"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { categories, frameworks } from "../browse/filters";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function NewAgentPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    readme: "",
    framework: "",
    language: "python",
    pricing_type: "free",
    price: 0,
    pricing_unit: "request",
    tags: "",
    is_public: true,
  });
  
  if (!isSignedIn && typeof window !== "undefined") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
        <p className="text-muted-foreground">
          Please sign in to publish your agent.
        </p>
      </div>
    );
  }
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const slug = formData.slug || generateSlug(formData.name);
      const agentData = {
        ...formData,
        slug,
      };
      
      const response = await api.createAgent(agentData);
      setCreatedAgent(response);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🎉</div>
          
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Agent Published!</h1>
          
          <p className="text-muted-foreground mb-6">
            Your agent has been successfully published and is now live.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link
              href={`/agents/${createdAgent?.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
            >
              View Your Agent
              <ChevronRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border rounded-lg font-medium hover:bg-muted"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold">Publish New Agent</h1>
          <p className="text-muted-foreground">
            Share your AI agent with the community
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className="w-12 h-1 bg-muted mx-2" />
                )}
              </div>
            ))}
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium">Step 1: Basic Information</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start by providing the basic details about your agent.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., PDF Parsing Agent"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug || generateSlug(formData.name)}
                    onChange={handleChange}
                    placeholder="my-awesome-agent"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to auto-generate from name
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Short Description *
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="Brief description (shown in search results)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.short_description.length}/200 characters
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Detailed description of your agent..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Framework</label>
                    <select
                      name="framework"
                      value={formData.framework}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select framework...</option>
                      {frameworks.map((fw) => (
                        <option key={fw.value} value={fw.value}>{fw.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Language</label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="nlp, extraction, pdf (comma separated)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                >
                  Continue to Pricing
                </button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium">Step 2: Pricing</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set how users will pay to use your agent.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "free", label: "Free", desc: "Anyone can use it" },
                    { value: "paid", label: "Pay Per Use", desc: "Charge per request" },
                    { value: "subscription", label: "Subscription", desc: "Monthly access" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.pricing_type === option.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pricing_type"
                        value={option.value}
                        checked={formData.pricing_type === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.desc}</div>
                    </label>
                  ))}
                </div>
                
                {formData.pricing_type !== "free" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Unit</label>
                      <select
                        name="pricing_unit"
                        value={formData.pricing_unit}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="request">Request</option>
                        <option value="page">Page</option>
                        <option value="token">Token</option>
                        <option value="month">Month</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border rounded-lg font-medium hover:bg-muted"
                  >
                    Back
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                  >
                    Continue to Documentation
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium">Step 3: Documentation</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add a README to help others understand and use your agent.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">README</label>
                  <textarea
                    name="readme"
                    value={formData.readme}
                    onChange={handleChange}
                    rows={12}
                    placeholder={`# ${formData.name || "My Agent"}

## Description
Describe what your agent does...

## Installation
\`\`\`bash
pip install your-agent
\`\`\`

## Usage
\`\`\`python
from your_agent import Agent

agent = Agent()
result = agent.run()
\`\`\`

## API
Document the API endpoints or methods...

## Configuration
List configuration options...
`}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    id="is_public"
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_public" className="text-sm">
                    Make this agent public (visible to everyone)
                  </label>
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border rounded-lg font-medium hover:bg-muted"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>Publishing...</>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Publish Agent
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
