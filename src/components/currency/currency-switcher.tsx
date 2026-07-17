"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "./currency-provider";

export function CurrencySwitcher({ align = "end" }: { align?: "start" | "end" }) {
  const { currency, setCurrency, currencies } = useCurrency();
  const current = currencies.find((c) => c.code === currency) ?? currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1" aria-label="Select currency">
          <Globe className="h-4 w-4" />
          <span className="font-medium">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-44">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={c.code === currency ? "bg-secondary font-medium" : ""}
          >
            <span className="mr-2">{c.symbol}</span>
            {c.code} · {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
