import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleEditor } from "../customers/role-editor";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const session = await auth();
  const staff = await db.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Staff</h1>
      <p className="text-sm text-muted-foreground">
        Admins and super admins with backend access. Promote users from the Customers page.
      </p>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => {
              const isSelf = s.id === session?.user?.id;
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name ?? "—"}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    {isSelf ? (
                      <Badge variant="secondary">{s.role}</Badge>
                    ) : (
                      <RoleEditor userId={s.id} currentRole={s.role} isSelf={isSelf} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                </TableRow>
              );
            })}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No staff found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
