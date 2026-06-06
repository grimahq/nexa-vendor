import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAuditLog } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/audit")({ component: AuditPage });

function AuditPage() {
  const fetchLog = useServerFn(listAuditLog);
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetchLog().then(setRows); }, []);
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center gap-3"><ScrollText className="h-7 w-7 text-primary" /><h1 className="font-display text-3xl font-bold">Audit log</h1></div>
      <Card>
        <div className="divide-y divide-border/50">
          {rows.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No actions yet.</p> : rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{r.action}</Badge>
                <span className="text-xs text-muted-foreground">{r.target_table} {r.target_id?.slice(0,8)}</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
