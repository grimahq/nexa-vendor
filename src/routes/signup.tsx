import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Start selling — Nexa Vendors" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Account created");
      nav({ to: "/onboarding" });
    } else {
      toast.success("Check your email to confirm your account");
    }
  }

  return (
    <AuthCard
      title="Claim your store"
      subtitle="Set up your Nexa storefront in under a minute."
      footer={<>Already have an account? <Link to="/login" className="text-foreground underline">Sign in</Link></>}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton label="Sign up with Google" />
    </AuthCard>
  );
}
