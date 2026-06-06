import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listKycSubmissions, runDojahVerification, decideKyc, getAdminConfig } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Sparkles, FileText, Image as ImgIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/kyc")({ component: KycPage });

function KycPage() {
  const fetchList = useServerFn(listKycSubmissions);
  const runDojah = useServerFn(runDojahVerification);
  const decide = useServerFn(decideKyc);
  const fetchCfg = useServerFn(getAdminConfig);
  const [rows, setRows] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [cfg, setCfg] = useState<any>(null);

  const load = () => fetchList().then(setRows);
  useEffect(() => { load(); fetchCfg().then(setCfg); }, []);

  async function openFile(path: string) {
    const { data } = await supabase.storage.from("kyc-docs").createSignedUrl(path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function verify(id: string) {
    setBusy(id);
    const r = await runDojah({ data: { submissionId: id } });
    setBusy(null);
    if (!r.ok) toast.error(r.error || "Verification failed");
    else toast.success(r.matched ? `Verified (score ${r.score})` : `Needs review (score ${r.score ?? "n/a"})`);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold">KYC review queue</h1>
      </div>

      {cfg && !cfg.kycConfigured && (
        <Alert className="mb-6 border-warning/40 bg-warning/5">
          <AlertDescription>
            <strong>Dojah is not configured.</strong> Add <code>DOJAH_APP_ID</code> and <code>DOJAH_SECRET_KEY</code> to enable automatic NIN + selfie verification. Until then, review submissions manually below.
          </AlertDescription>
        </Alert>
      )}

      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No submissions yet.</p> : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-lg">{r.stores?.name || "Unknown store"}</CardTitle>
                  <div className="flex items-center gap-2">
                    {r.face_match_score != null && <Badge variant="outline">match {r.face_match_score}</Badge>}
                    {r.provider && <Badge variant="outline">{r.provider}</Badge>}
                    <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-1">
                  <div><span className="text-muted-foreground">Name:</span> {r.full_name}</div>
                  <div><span className="text-muted-foreground">NIN:</span> <code>{r.nin}</code></div>
                  <div className="text-xs text-muted-foreground">Submitted {new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.selfie_url && <Button size="sm" variant="outline" onClick={() => openFile(r.selfie_url)}><ImgIcon className="mr-1 h-3.5 w-3.5" />Selfie</Button>}
                  {r.business_doc_url && <Button size="sm" variant="outline" onClick={() => openFile(r.business_doc_url)}><FileText className="mr-1 h-3.5 w-3.5" />Document</Button>}
                  <Button size="sm" variant="secondary" disabled={busy === r.id} onClick={() => verify(r.id)}>
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    {busy === r.id ? "Verifying…" : "Run Dojah verify"}
                  </Button>
                </div>
                {r.status === "pending" && (
                  <>
                    <Textarea placeholder="Reviewer notes (sent on rejection)" value={notes[r.id] || ""} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-success text-success-foreground hover:opacity-90" onClick={async () => { await decide({ data: { submissionId: r.id, decision: "approved", notes: notes[r.id] } }); toast.success("Approved"); load(); }}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={async () => { await decide({ data: { submissionId: r.id, decision: "rejected", notes: notes[r.id] } }); toast.success("Rejected"); load(); }}>Reject</Button>
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
