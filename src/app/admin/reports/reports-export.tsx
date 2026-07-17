"use client";

import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "@/lib/export";

export function ReportsExport({
  revenueByDay,
  topProducts,
}: {
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}) {
  function exportRevenue() {
    const csv = toCsv(revenueByDay, ["date", "revenue"]);
    downloadCsv("sales-revenue.csv", csv);
  }
  function exportProducts() {
    const csv = toCsv(topProducts, ["name", "quantity", "revenue"]);
    downloadCsv("top-products.csv", csv);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportRevenue}>
        Export revenue CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportProducts}>
        Export products CSV
      </Button>
    </div>
  );
}
