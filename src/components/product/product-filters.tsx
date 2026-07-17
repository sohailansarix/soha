"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Option {
  id: string;
  name: string;
  slug: string;
}

export function ProductFilters({ categories, brands }: { categories: Option[]; brands: Option[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [min, setMin] = React.useState("");
  const [max, setMax] = React.useState("");

  function applyParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function toggleInList(key: "category" | "brand", slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);
    if (current === slug) params.delete(key);
    else params.set(key, slug);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    applyParams({ min: min || null, max: max || null });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => router.push("/products")}>
          Clear all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["cat", "brand", "price"]}>
        <AccordionItem value="cat">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={searchParams.get("category") === c.slug}
                    onCheckedChange={() => toggleInList("category", c.slug)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {brands.map((b) => (
                <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={searchParams.get("brand") === b.slug}
                    onCheckedChange={() => toggleInList("brand", b.slug)}
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent>
            <form onSubmit={applyPrice} className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  aria-label="Minimum price"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  aria-label="Maximum price"
                />
              </div>
              <Button type="submit" size="sm" variant="outline" className="w-full">
                Apply
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sale">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={searchParams.get("onSale") === "1"}
                onCheckedChange={(c) => applyParams({ onSale: c ? "1" : null })}
              />
              On sale
            </label>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
