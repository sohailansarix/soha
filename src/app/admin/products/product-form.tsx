"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CURRENCIES } from "@/lib/currency";

const INR_RATE = CURRENCIES.INR.rate;
// Prices are entered in INR and stored as USD base.
const inrToUsd = (n: number) => n / INR_RATE;

interface ImageInput {
  url: string;
  alt?: string;
}

interface AttributeInput {
  key: string;
  value: string;
}

interface OptionInput {
  name: string;
  values: string[];
}

interface VariantInput {
  id?: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
  price?: number;
  compareAtPrice?: number;
}

// Signature of an attribute combination, used to preserve variant data across
// regeneration when options/values change.
function variantSignature(attrs: Record<string, string>): string {
  return JSON.stringify(Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b)));
}

// Build the cartesian product of option values into variant attribute maps.
function buildVariants(
  opts: OptionInput[],
  existing: VariantInput[],
  baseSku: string,
): VariantInput[] {
  const clean = opts
    .map((o) => ({ name: o.name.trim(), values: o.values.map((v) => v.trim()).filter(Boolean) }))
    .filter((o) => o.name && o.values.length > 0);
  let combos: Record<string, string>[] = [{}];
  for (const o of clean) {
    const next: Record<string, string>[] = [];
    for (const c of combos) for (const v of o.values) next.push({ ...c, [o.name]: v });
    combos = next;
  }
  const bySig = new Map(existing.map((e) => [variantSignature(e.attributes), e]));
  const base = baseSku.trim() || "VAR";
  return combos.map((attrs) => {
    const prev = bySig.get(variantSignature(attrs));
    if (prev) return prev;
    const comboValues = Object.values(attrs);
    const sku =
      comboValues.length > 0 ? `${base}-${comboValues.join("-").toUpperCase().replace(/\s+/g, "")}` : `${base}-DEFAULT`;
    return { sku, attributes: attrs, stock: 0, price: undefined, compareAtPrice: undefined };
  });
}

const schema = z.object({
  name: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  description: z.string().optional(),
  sku: z.string().min(1),
  categoryId: z.string().min(1, "Category required"),
  brandId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isReturnable: z.boolean().optional(),
  returnWindow: z.coerce.number().int().min(0).optional(),
  shippingFee: z.coerce.number().min(0).optional(),
  freeShippingOver: z.coerce.number().min(0).optional(),
  // Dynamic option definitions (e.g. Color -> [Red, Blue]).
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string()).min(1),
      }),
    )
    .optional(),
  // Each variant owns its price + compareAtPrice.
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        sku: z.string().min(1, "Variant SKU required"),
        attributes: z.record(z.string(), z.string()).optional(),
        stock: z.coerce.number().int().min(0),
        price: z.coerce.number().min(0),
        compareAtPrice: z.coerce.number().min(0).optional(),
      }),
    )
    .min(1, "At least one variant is required"),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm({
  categories,
  brands,
  defaultValues,
  id,
  initialImages,
  initialAttributes,
  initialOptions,
  initialVariants,
  initialReturnable,
  initialReturnWindow,
  initialShippingFee,
  initialFreeShippingOver,
}: {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  defaultValues?: Partial<FormValues>;
  id?: string;
  initialImages?: ImageInput[];
  initialAttributes?: AttributeInput[];
  initialOptions?: OptionInput[];
  initialVariants?: VariantInput[];
  initialReturnable?: boolean;
  initialReturnWindow?: number | null;
  initialShippingFee?: number | null;
  initialFreeShippingOver?: number | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ImageInput[]>(initialImages ?? []);
  const [attributes, setAttributes] = useState<AttributeInput[]>(initialAttributes ?? []);
  const [options, setOptions] = useState<OptionInput[]>(initialOptions ?? []);
  const [variants, setVariants] = useState<VariantInput[]>(initialVariants ?? []);
  const [isReturnable, setIsReturnable] = useState(initialReturnable ?? true);
  const [returnWindow, setReturnWindow] = useState<string>(initialReturnWindow != null ? String(initialReturnWindow) : "");
  const [shippingFee, setShippingFee] = useState<string>(initialShippingFee != null ? String(initialShippingFee) : "");
  const [freeShippingOver, setFreeShippingOver] = useState<string>(initialFreeShippingOver != null ? String(initialFreeShippingOver) : "");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { isActive: true, isFeatured: false, ...defaultValues },
  });

  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");

  function updateImage(index: number, field: keyof ImageInput, value: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  }
  function addImage() {
    setImages((prev) => [...prev, { url: "", alt: "" }]);
  }
  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAttribute(index: number, field: keyof AttributeInput, value: string) {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }
  function addAttribute() {
    setAttributes((prev) => [...prev, { key: "", value: "" }]);
  }
  function removeAttribute(index: number) {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof VariantInput, value: string) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }
  function addVariant() {
    setVariants((prev) => [...prev, { sku: "", attributes: {}, stock: 0, price: undefined, compareAtPrice: undefined }]);
  }
  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // Option management -------------------------------------------------------
  function updateOptionName(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, name: value } : o)));
  }
  function updateOptionValue(index: number, vIndex: number, value: string) {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, values: o.values.map((v, vi) => (vi === vIndex ? value : v)) } : o)),
    );
  }
  function addOptionValue(index: number) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, values: [...o.values, ""] } : o)));
  }
  function removeOptionValue(index: number, vIndex: number) {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, values: o.values.filter((_, vi) => vi !== vIndex) } : o)));
  }
  function addOption() {
    setOptions((prev) => [...prev, { name: "", values: [""] }]);
  }
  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }
  // Regenerate the variant matrix from the current options, preserving any
  // existing variant data (sku/stock/price) that matches a combination.
  function regenerateVariants() {
    setVariants((prev) => buildVariants(options, prev, watch("sku")));
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    // Prices entered in INR; convert to USD base for storage.
    const payload = {
      ...values,
      isReturnable,
      returnWindow: returnWindow.trim() ? Number(returnWindow) : null,
      shippingFee: shippingFee.trim() ? inrToUsd(Number(shippingFee)) : null,
      freeShippingOver: freeShippingOver.trim() ? inrToUsd(Number(freeShippingOver)) : null,
      images: images.filter((i) => i.url.trim()).map((i, idx) => ({ url: i.url.trim(), alt: i.alt ?? "", position: idx })),
      attributes: attributes.filter((a) => a.key.trim() && a.value.trim()).map((a) => ({ key: a.key.trim(), value: a.value.trim() })),
      options: options
        .map((o) => ({ name: o.name.trim(), values: o.values.map((v) => v.trim()).filter(Boolean) }))
        .filter((o) => o.name && o.values.length > 0),
      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim(),
        attributes: v.attributes,
        stock: Number(v.stock) || 0,
        price: v.price != null ? inrToUsd(Number(v.price)) : 0,
        compareAtPrice: v.compareAtPrice != null ? inrToUsd(Number(v.compareAtPrice)) : undefined,
      })),
    };
    const res = await fetch(id ? `/api/admin/products/${id}` : "/api/admin/products", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: id ? "Product updated" : "Product created" });
      router.push("/admin/products");
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" className="h-10 w-full rounded-md border bg-background px-3" {...register("categoryId")}>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand</Label>
          <select id="brandId" className="h-10 w-full rounded-md border bg-background px-3" {...register("brandId")}>
            <option value="">None</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" {...register("sku")} />
      </div>

      {/* Images */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <Button type="button" variant="outline" size="sm" onClick={addImage}>Add image</Button>
        </div>
        {images.length === 0 && (
          <p className="text-sm text-muted-foreground">No images added. Add image URLs (e.g. from picsum.photos or your CDN).</p>
        )}
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Image URL"
                value={img.url}
                onChange={(e) => updateImage(idx, "url", e.target.value)}
              />
              <Input
                placeholder="Alt text (optional)"
                value={img.alt ?? ""}
                onChange={(e) => updateImage(idx, "alt", e.target.value)}
                className="w-48"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(idx)} aria-label="Remove image">
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isActive} onCheckedChange={(v) => setValue("isActive", Boolean(v))} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", Boolean(v))} />
          Featured
        </label>
      </div>

      {/* Specifications */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Specifications</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAttribute}>Add specification</Button>
        </div>
        {attributes.length === 0 && (
          <p className="text-sm text-muted-foreground">No specifications added. Add key/value pairs (e.g. Material: Cotton).</p>
        )}
        <div className="space-y-2">
          {attributes.map((attr, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder="Key (e.g. Material)"
                value={attr.key}
                onChange={(e) => updateAttribute(idx, "key", e.target.value)}
                className="w-48"
              />
              <Input
                placeholder="Value (e.g. Cotton)"
                value={attr.value}
                onChange={(e) => updateAttribute(idx, "value", e.target.value)}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeAttribute(idx)} aria-label="Remove specification">
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Options (define custom attributes like Color, Size, Storage) */}
      <div className="space-y-3 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <Label>Variant options</Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>Add option</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Define option names (e.g. Color, Storage) and their values. The variant list below is generated from every combination. Leave empty for a single default variant.
        </p>
        <div className="space-y-3">
          {options.map((opt, oi) => (
            <div key={oi} className="rounded-md border p-3">
              <div className="mb-2 flex items-center gap-2">
                <Input
                  placeholder="Option name (e.g. Color)"
                  value={opt.name}
                  onChange={(e) => updateOptionName(oi, e.target.value)}
                  className="w-48"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(oi)} aria-label="Remove option">
                  ✕
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {opt.values.map((val, vi) => (
                  <div key={vi} className="flex items-center gap-1">
                    <Input
                      placeholder="Value (e.g. Red)"
                      value={val}
                      onChange={(e) => updateOptionValue(oi, vi, e.target.value)}
                      className="w-32"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOptionValue(oi, vi)} aria-label="Remove value">
                      ✕
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addOptionValue(oi)}>Add value</Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={regenerateVariants}>
          Generate variants from options
        </Button>
      </div>

      {/* Variants: generated combinations with price / stock */}
      <div className="space-y-3 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <Label>Variants (price / stock per combination)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>Add variant manually</Button>
        </div>
        {variants.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No variants yet. Add options above and click “Generate variants”, or add one manually.
          </p>
        )}
        <div className="space-y-2">
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 rounded-md border p-2 sm:grid-cols-6">
              <div className="col-span-2 flex flex-wrap gap-1 text-xs text-muted-foreground sm:col-span-2">
                {Object.entries(v.attributes).length > 0
                  ? Object.entries(v.attributes).map(([k, val]) => (
                      <span key={k} className="rounded bg-secondary px-1.5 py-0.5">{k}: {val}</span>
                    ))
                  : <span className="rounded bg-secondary px-1.5 py-0.5">Default</span>}
              </div>
              <Input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(idx, "sku", e.target.value)}
              />
              <Input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(idx, "stock", e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="Price ₹"
                value={v.price ?? ""}
                onChange={(e) => updateVariant(idx, "price", e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="Compare ₹"
                value={v.compareAtPrice ?? ""}
                onChange={(e) => updateVariant(idx, "compareAtPrice", e.target.value)}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(idx)} aria-label="Remove variant">
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Returns */}
      <div className="space-y-3 rounded-md border p-4">
        <div className="flex items-center gap-2">
          <Checkbox checked={isReturnable} onCheckedChange={(v) => setIsReturnable(Boolean(v))} id="isReturnable" />
          <Label htmlFor="isReturnable">This product is returnable</Label>
        </div>
        {isReturnable && (
          <div className="space-y-2">
            <Label htmlFor="returnWindow">Return window (days)</Label>
            <Input
              id="returnWindow"
              type="number"
              min={0}
              value={returnWindow}
              onChange={(e) => setReturnWindow(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>
        )}
      </div>

      {/* Product-specific delivery charge */}
      <div className="space-y-3 rounded-md border p-4">
        <Label>Delivery charge</Label>
        <p className="text-sm text-muted-foreground">
          Set a product-specific delivery charge. If the order subtotal is at or above the threshold below, this product ships free. Leave blank to use the site default shipping fee.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shippingFee">Delivery charge (₹ INR)</Label>
            <Input
              id="shippingFee"
              type="number"
              step="0.01"
              min={0}
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              placeholder="e.g. 49"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freeShippingOver">Free shipping over (₹ INR)</Label>
            <Input
              id="freeShippingOver"
              type="number"
              step="0.01"
              min={0}
              value={freeShippingOver}
              onChange={(e) => setFreeShippingOver(e.target.value)}
              placeholder="e.g. 999"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save product"}
      </Button>
    </form>
  );
}
