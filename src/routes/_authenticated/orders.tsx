import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Nexa" }] }),
  component: () => (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Orders</h1>
      <div className="mt-12 rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
        <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 font-display text-xl font-semibold">No orders yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Once buyers place orders, they'll show up here in real time.</p>
      </div>
    </div>
  ),
});
