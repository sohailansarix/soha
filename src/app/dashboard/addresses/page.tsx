import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await db.address.findMany({
    where: { userId: session!.user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Addresses</h2>
        <Button asChild size="sm">
          <Link href="/dashboard/addresses/new">
            <Plus className="h-4 w-4" /> Add address
          </Link>
        </Button>
      </div>
      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved addresses.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.fullName}</span>
                  {a.isDefault && <Badge variant="accent">Default</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {a.line1} {a.line2}
                  <br />
                  {a.city} {a.postalCode}
                  <br />
                  {a.country}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/addresses/${a.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
