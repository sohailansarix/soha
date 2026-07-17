import { SectionHeading } from "@/components/product/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";

const TESTIMONIALS = [
  {
    name: "Amara O.",
    role: "Verified Buyer",
    rating: 5,
    text: "The quality exceeded my expectations and delivery was lightning fast. SOHA is now my go-to store.",
  },
  {
    name: "Liam K.",
    role: "Verified Buyer",
    rating: 5,
    text: "Beautiful, minimal packaging and a seamless checkout. The whole experience feels premium.",
  },
  {
    name: "Sofia R.",
    role: "Verified Buyer",
    rating: 4,
    text: "Great curation and the wishlist feature keeps me coming back. Customer support was helpful too.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading title="What Customers Say" />
      <div className="grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name}>
            <CardContent className="space-y-4 p-6">
              <Rating value={t.rating} />
              <p className="text-sm text-muted-foreground">“{t.text}”</p>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
