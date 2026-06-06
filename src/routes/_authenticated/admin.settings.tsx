import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminConfig } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as Cog, ShieldCheck, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const fetchCfg = useServerFn(getAdminConfig);
  const [cfg, setCfg] = useState<any>(null);
  useEffect(() => { fetchCfg().then(setCfg); }, []);
  if (!cfg) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-3"><Cog className="h-7 w-7 text-primary" /><h1 className="font-display text-3xl font-bold">Settings</h1></div>

      <div className="grid gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">KYC provider</h3>
                <p className="mt-1 text-sm text-muted-foreground">Real identity verification via Dojah (NIN + selfie face match).</p>
                <p className="mt-2 text-xs text-muted-foreground">To enable: add <code>DOJAH_APP_ID</code> and <code>DOJAH_SECRET_KEY</code> in project secrets.</p>
              </div>
            </div>
            {cfg.kycConfigured ? <Badge className="bg-success">configured</Badge> : <Badge variant="outline">not set</Badge>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Stripe billing</h3>
                <p className="mt-1 text-sm text-muted-foreground">Recurring subscriptions for vendor plans.</p>
                <p className="mt-2 text-xs text-muted-foreground">Enable Lovable's seamless Stripe integration when ready.</p>
              </div>
            </div>
            {cfg.stripeConfigured ? <Badge className="bg-success">configured</Badge> : <Badge variant="outline">not set</Badge>}
          </div>
        </Card>
      </div>
    </div>
  );
}
