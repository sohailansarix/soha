import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleEditor } from "./role-editor";

export default async function AdminCustomersPage() {
  const session = await auth();
  const customers = await db.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customers</h1>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Orders</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const isSelf = c.id === session?.user?.id;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name ?? "—"}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    {isSelf ? (
                      <Badge variant="secondary">{c.role}</Badge>
                    ) : (
                      <RoleEditor userId={c.id} currentRole={c.role} isSelf={isSelf} />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(c.createdAt)}</TableCell>
                  <TableCell className="text-right">{c._count.orders}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
