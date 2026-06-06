import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllUsers, setUserRole, banUser } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersPage });

function UsersPage() {
  const fetchUsers = useServerFn(listAllUsers);
  const setRole = useServerFn(setUserRole);
  const ban = useServerFn(banUser);
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = () => fetchUsers().then(setUsers);
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u => !q || (u.email || "").toLowerCase().includes(q.toLowerCase()) || (u.full_name || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{users.length} total</p>
        </div>
        <Input placeholder="Search email or name" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2">User</th><th className="px-4 py-2">Roles</th><th className="px-4 py-2">Last sign-in</th><th className="px-4 py-2 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{u.full_name || u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3 space-x-1">
                  {u.roles.length === 0 ? <Badge variant="outline">none</Badge> : u.roles.map((r: string) => <Badge key={r}>{r}</Badge>)}
                  {u.banned_until && <Badge variant="destructive">banned</Badge>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "never"}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {u.roles.includes("admin") ? (
                    <Button size="sm" variant="outline" onClick={async () => { await setRole({ data: { userId: u.id, role: "admin", grant: false } }); toast.success("Admin revoked"); load(); }}>Revoke admin</Button>
                  ) : (
                    <Button size="sm" onClick={async () => { await setRole({ data: { userId: u.id, role: "admin", grant: true } }); toast.success("Admin granted"); load(); }}>Make admin</Button>
                  )}
                  <Button size="sm" variant={u.banned_until ? "outline" : "destructive"} onClick={async () => { await ban({ data: { userId: u.id, ban: !u.banned_until } }); toast.success(u.banned_until ? "Unbanned" : "Banned"); load(); }}>
                    {u.banned_until ? "Unban" : "Ban"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
