import { createFileRoute, Outlet, redirect, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AuthedLayout() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [hasStore, setHasStore] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(({ data }) => setHasStore(!!data));
  }, [user, loc.pathname]);

  useEffect(() => {
    if (hasStore === false && loc.pathname !== "/onboarding") {
      nav({ to: "/onboarding" });
    }
  }, [hasStore, loc.pathname, nav]);

  if (loading || hasStore === null) {
    return <div className="dark flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;
  }

  // Onboarding: render without sidebar
  if (loc.pathname === "/onboarding") {
    return (
      <div className="dark min-h-screen bg-background text-foreground">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/50 bg-card/30 p-4 backdrop-blur md:flex md:flex-col">
          <div className="px-2 py-2"><Logo /></div>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                activeProps={{ className: "bg-gradient-primary text-primary-foreground shadow-glow" }}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            <Button variant="ghost" className="w-full justify-start" onClick={() => signOut().then(() => nav({ to: "/" }))}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>
        <main className="min-h-screen flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/70 px-4 py-3 backdrop-blur md:hidden">
            <Logo />
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => nav({ to: "/" }))}>
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <Outlet />
          <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-border/50 bg-background/80 px-2 py-2 backdrop-blur md:hidden">
            {NAV.slice(0, 4).map((n) => (
              <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-muted-foreground" activeProps={{ className: "text-foreground" }}>
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
