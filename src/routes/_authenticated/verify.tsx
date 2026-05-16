import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, Clock, XCircle, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/verify")({
  component: VerifyPage,
});

type Submission = {
  id: string;
  status: "pending" | "approved" | "rejected" | "none";
  full_name: string;
  nin: string;
  reviewer_notes: string | null;
  created_at: string;
};

function VerifyPage() {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeVerified, setStoreVerified] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [nin, setNin] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: store } = await supabase
        .from("stores")
        .select("id, verified")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!store) { setLoading(false); return; }
      setStoreId(store.id);
      setStoreVerified(store.verified);
      const { data: sub } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sub) setSubmission(sub as Submission);
      setLoading(false);
    })();
  }, [user]);

  async function uploadFile(file: File, prefix: string) {
    const path = `${user!.id}/${prefix}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("kyc-docs").upload(path, file);
    if (error) throw error;
    return path;
  }

  async function submit() {
    if (!storeId) return;
    if (!fullName || !/^\d{11}$/.test(nin)) {
      toast.error("Enter your full name and a valid 11-digit NIN");
      return;
    }
    setSubmitting(true);
    try {
      const business_doc_url = docFile ? await uploadFile(docFile, "doc") : null;
      const selfie_url = selfieFile ? await uploadFile(selfieFile, "selfie") : null;
      const { error } = await supabase.from("kyc_submissions").insert({
        store_id: storeId,
        full_name: fullName,
        nin,
        business_doc_url,
        selfie_url,
      });
      if (error) throw error;
      toast.success("KYC submitted — we'll review within 24 hours");
      const { data: sub } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sub) setSubmission(sub as Submission);
    } catch (e) {
      const err = e as Error;
      toast.error(err.message || "Could not submit KYC");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Verified Vendor Badge</h1>
            <p className="text-sm text-muted-foreground">Earn buyer trust with a one-time KYC check.</p>
          </div>
        </div>

        {storeVerified ? (
          <Card className="border-success/40 bg-success/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <CardTitle>You're verified ✨</CardTitle>
              </div>
              <CardDescription>The blue check is now showing on your store and products.</CardDescription>
            </CardHeader>
          </Card>
        ) : submission && submission.status === "pending" ? (
          <Card className="border-warning/40 bg-warning/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-warning" />
                <CardTitle>Under review</CardTitle>
              </div>
              <CardDescription>Submitted on {new Date(submission.created_at).toLocaleDateString()}. We review within 24 hours.</CardDescription>
            </CardHeader>
          </Card>
        ) : submission && submission.status === "rejected" ? (
          <Card className="border-destructive/40 bg-destructive/10 mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Previous submission rejected</CardTitle>
              </div>
              <CardDescription>
                {submission.reviewer_notes || "Please re-submit with clearer documents."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {!storeVerified && submission?.status !== "pending" && (
          <Card className="glass mt-6">
            <CardHeader>
              <CardTitle>Submit KYC</CardTitle>
              <CardDescription>All data is encrypted. We only use it to verify your identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="full">Full legal name</Label>
                <Input id="full" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As on your government ID" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nin">NIN (11 digits)</Label>
                <Input id="nin" inputMode="numeric" maxLength={11} value={nin} onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))} placeholder="12345678901" />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Selfie holding ID (optional)</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
              </div>
              <div className="grid gap-2">
                <Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> Business doc (CAC / utility bill) — optional</Label>
                <Input type="file" accept="image/*,application/pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
              </div>
              <Button onClick={submit} disabled={submitting} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                {submitting ? "Submitting…" : "Submit for review"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Encrypted</Badge>
          <Badge variant="outline">24h review</Badge>
          <Badge variant="outline">Manual verification</Badge>
        </div>
      </motion.div>
    </div>
  );
}
