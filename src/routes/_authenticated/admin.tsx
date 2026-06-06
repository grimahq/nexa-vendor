import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, Store, ShieldCheck, ShoppingBag, CreditCard,
  Repeat, TrendingUp, Tag, Megaphone, ScrollText, Settings as Cog,
  Crown, LogOut, ArrowLeft, BadgePercent,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { group: "Operations", items: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/vendors", label: "Vendors", icon: Store },
    { to: "/admin/kyc", label: "KYC queue", icon: ShieldCheck },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  ]},
  { group: "Finance", items: [
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/subscriptions", label: "Subscriptions", icon: Repeat },
    { to: "/admin/revenue", label: "Revenue", icon: TrendingUp },
    { to: "/admin/plans", label: "Plans", icon: BadgePercent },
  ]},
  { group: "Growth", items: [
    { to: "/admin/coupons", label: "Coupons", icon: Tag },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  ]},
  { group: "System", items: [
    { to: "/admin/audit", label: "Audit log", icon: ScrollText },
    { to: "/admin/settings", label: "Settings", icon: Cog },
  ]},
] as const;

function AdminLayout() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (isAdmin === false) nav({ to: "/dashboard", replace: true });
  }, [isAdmin, nav]);

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <div className="h-2 w-2 mr-3 animate-pulse rounded-full bg-primary" /> Verifying access…
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/50 bg-card/40 p-4 backdrop-blur md:flex md:flex-col">
          <div className="flex items-center gap-2 px-1 py-2">
            <Logo />
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
            <Crown className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold tracking-wide">Super Admin</span>
          </div>
          <nav className="mt-6 flex flex-col gap-5 overflow-y-auto pb-4">
            {NAV.map((section) => (
              <div key={section.group}>
                <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{section.group}</p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      activeOptions={{ exact: n.exact }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
                      activeProps={{ className: "bg-gradient-primary text-primary-foreground shadow-glow" }}
                    >
                      <n.icon className="h-4 w-4" />
                      {n.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => nav({ to: "/dashboard" })}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to vendor app
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => nav({ to: "/" }))}>
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </aside>

        <main className="min-h-screen flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/70 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Admin</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => nav({ to: "/dashboard" })}><ArrowLeft className="h-4 w-4" /></Button>
          </header>
          <Outlet />
          <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-border/50 bg-background/80 px-2 py-2 backdrop-blur md:hidden">
            {NAV[0].items.slice(0, 5).map((n) => (
              <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: (n as any).exact }}>
                <n.icon className="h-5 w-5" />
                {n.label}
              </Link>
            ))}
          </nav>
        </main>
      </div>
    </div>
  );
}
