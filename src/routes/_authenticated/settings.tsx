import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Nexa" }] }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-2 text-muted-foreground">Brand, payments and KYC settings will live here.</p>
      <div className="mt-10 rounded-3xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
        <SettingsIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Coming next: store branding, Moniepoint, KYC verification.</p>
      </div>
    </div>
  ),
});
