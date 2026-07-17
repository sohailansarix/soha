"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} width={48} />
        <Tooltip
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }}
        />
        <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
