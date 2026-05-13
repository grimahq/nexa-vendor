import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — Nexa" }] }),
  component: () => (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Customers</h1>
      <div className="mt-12 rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
        <Users className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 font-display text-xl font-semibold">No customers yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Buyers who order from you will appear here for easy WhatsApp follow-up.</p>
      </div>
    </div>
  ),
});
