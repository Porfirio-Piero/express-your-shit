import { api } from "@/lib/api";
import { Package, Users, Play, Wallet } from "lucide-react";

export default async function Stats() {
  try {
    const stats = await api.getStats();
    
    const items = [
      { icon: Package, label: "Agents Published", value: stats?.total_agents || 0 },
      { icon: Users, label: "Active Users", value: stats?.total_users || 0 },
      { icon: Play, label: "Executions", value: stats?.total_executions?.toLocaleString() || 0 },
      { icon: Wallet, label: "Paid to Creators", value: `$${stats?.total_revenue?.toLocaleString() || 0}` },
    ];
    
    return (
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="w-6 h-6 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
