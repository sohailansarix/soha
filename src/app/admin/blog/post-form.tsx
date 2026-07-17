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

const schema = z.object({
  title: z.string().min(1, "Title required"),
  slug: z.string().min(1, "Slug required"),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content required"),
  coverImage: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  relatedProductIds: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PostForm({
  categories,
  products,
  defaultValues,
  id,
}: {
  categories: { id: string; name: string }[];
  products: { id: string; name: string }[];
  defaultValues?: Partial<FormValues>;
  id?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saveDraft, setSaveDraft] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { isPublished: false, isFeatured: false, ...defaultValues },
  });

  const isPublished = watch("isPublished");
  const isFeatured = watch("isFeatured");

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const payload = {
      ...values,
      isPublished: saveDraft ? false : Boolean(values.isPublished),
      publishedAt: values.publishedAt || (saveDraft ? null : new Date().toISOString().slice(0, 10)),
    };
    const res = await fetch(id ? `/api/admin/blog/${id}` : "/api/admin/blog", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      toast({ title: saveDraft ? "Draft saved" : id ? "Article updated" : "Article created" });
      router.push("/admin/blog");
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" {...register("subtitle")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" {...register("excerpt")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea id="content" rows={16} {...register("content")} />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
        <p className="text-xs text-muted-foreground">
          Supports ## headings, **bold**, *italic*, lists, `code`, images: !["alt"](url) *caption*, videos: @video(url) *caption*.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover image URL</Label>
          <Input id="coverImage" {...register("coverImage")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" className="h-10 w-full rounded-md border bg-background px-3" {...register("categoryId")}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" {...register("tags")} placeholder="fashion, style, guide" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="relatedProductIds">Related products (comma separated IDs)</Label>
        <Input id="relatedProductIds" {...register("relatedProductIds")} placeholder="product id, product id" />
        <p className="text-xs text-muted-foreground">{products.length} products available.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta title (SEO)</Label>
          <Input id="metaTitle" {...register("metaTitle")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta description (SEO)</Label>
          <Input id="metaDescription" {...register("metaDescription")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords</Label>
          <Input id="keywords" {...register("keywords")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="canonicalUrl">Canonical URL</Label>
          <Input id="canonicalUrl" {...register("canonicalUrl")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="publishedAt">Publish date (schedule)</Label>
        <Input id="publishedAt" type="date" {...register("publishedAt")} />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isPublished} onCheckedChange={(v) => setValue("isPublished", Boolean(v))} /> Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", Boolean(v))} /> Featured
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} onClick={() => setSaveDraft(false)}>
          {loading ? "Saving…" : id ? "Update" : "Publish"}
        </Button>
        <Button type="submit" variant="outline" disabled={loading} onClick={() => setSaveDraft(true)}>
          Save draft
        </Button>
      </div>
    </form>
  );
}
