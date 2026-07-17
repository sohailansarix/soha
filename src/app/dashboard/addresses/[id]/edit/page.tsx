import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { AddressForm } from "../../address-form";

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const address = await db.address.findUnique({ where: { id } });
  if (!address || address.userId !== session!.user.id) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Edit Address</h2>
      <AddressForm
        defaultValues={{
          fullName: address.fullName,
          line1: address.line1,
          line2: address.line2 ?? "",
          city: address.city,
          state: address.state ?? "",
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone ?? "",
          type: address.type === "BOTH" ? "SHIPPING" : address.type,
          isDefault: address.isDefault,
        }}
        id={id}
      />
    </div>
  );
}
