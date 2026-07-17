import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata = { title: "FAQ" };

const FAQ = [
  { q: "What are your shipping options?", a: "We offer Standard (5-7 days), Express (2-3 days), and Same-Day delivery. Free standard shipping is available on select products — check each item's details page to see if it qualifies." },
  { q: "What is your return policy?", a: "Unopened items can be returned within 30 days of delivery for a full refund. See our Terms page for details." },
  { q: "How can I track my order?", a: "Once shipped, you'll receive an email with tracking information. You can also view status under your account dashboard." },
  { q: "Which payment methods do you accept?", a: "We accept all major credit cards via Stripe, as well as Cash on Delivery in supported regions." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled from your dashboard while they are still Pending or Confirmed." },
];

export default function FaqPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="mt-6">
        {FAQ.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
