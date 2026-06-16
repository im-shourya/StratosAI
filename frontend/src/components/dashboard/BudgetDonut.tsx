"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchApi } from "@/lib/api";

interface BudgetItem {
  name: string;
  value: number;
  color: string;
}

export function BudgetDonut({ initialData }: { initialData?: BudgetItem[] }) {
  const [data, setData] = useState<BudgetItem[]>(initialData || []);

  useEffect(() => {
    if (!initialData) {
      fetchApi('/api/dashboard/budget')
        .then(res => setData(res))
        .catch(console.error);
    } else {
      setData(initialData);
    }
  }, [initialData]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) return <GlassCard tint="budget" className="h-48 animate-pulse"><div /></GlassCard>;

  return (
    <GlassCard tint="budget">
      <h3 className="text-h3 font-display font-semibold mb-4" style={{ color: "var(--color-navy)" }}>
        Budget Allocation
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-body-sm flex-1" style={{ color: "var(--color-text-secondary)" }}>
                {item.name}
              </span>
              <span className="text-body-sm font-mono font-medium">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
