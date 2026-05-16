import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/kyc")({
  component: AdminKycPage,
});

type Row = {
  id: string;
  store_id: string;
  full_name: string;
  nin: string;
  status: string;
  business_doc_url: string | null;
  selfie_url: string | null;
  created_at: string;
  reviewer_notes: string | null;
  stores?: { name: string; slug: string } | null;
};

function AdminKycPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
      if (data) load();
    })();
  }, [user]);

  async function load() {
    const { data } = await supabase
      .from("kyc_submissions")
      .select("*, stores(name, slug)")
      .order("created_at", { ascending: false });
    setRows((data as Row[]) || []);
  }

  async function review(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("kyc_submissions")
      .update({ status, reviewer_notes: notes[id] || null })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Submission ${status}`);
    load();
  }

  async function signedUrl(path: string) {
    const { data } = await supabase.storage.from("kyc-docs").createSignedUrl(path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  if (isAdmin === null) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-2xl p-10 text-center">
      <ShieldX className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="mt-4 font-display text-2xl font-bold">Admins only</h1>
      <p className="mt-2 text-sm text-muted-foreground">This area is restricted.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary-glow" />
        <h1 className="font-display text-3xl font-bold">KYC Review Queue</h1>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id} className="glass">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{r.stores?.name || "Unknown store"}</CardTitle>
                  <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                    {r.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-1">
                  <div><span className="text-muted-foreground">Name:</span> {r.full_name}</div>
                  <div><span className="text-muted-foreground">NIN:</span> {r.nin}</div>
                  <div><span className="text-muted-foreground">Submitted:</span> {new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.selfie_url && <Button size="sm" variant="outline" onClick={() => signedUrl(r.selfie_url!)}>View selfie</Button>}
                  {r.business_doc_url && <Button size="sm" variant="outline" onClick={() => signedUrl(r.business_doc_url!)}>View doc</Button>}
                </div>
                {r.status === "pending" && (
                  <>
                    <Textarea
                      placeholder="Reviewer notes (sent to vendor if rejected)"
                      value={notes[r.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-success text-success-foreground hover:opacity-90" onClick={() => review(r.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => review(r.id, "rejected")}>Reject</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
