import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you!</h1>
        <p className="mt-2 text-muted-foreground">
          Your order {order ? <span className="font-medium text-foreground">{order}</span> : ""} has been placed
          successfully. We&apos;ll send you updates by email.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/orders">View orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
