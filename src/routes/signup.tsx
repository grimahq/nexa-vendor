import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthCard } from "@/components/AuthCard";
import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({ meta: [{ title: "Start selling — Nexa Vendors" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
        data: { full_name: fullName },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    if (data.session) {
      // Re-validate so layout sees the authenticated user
      const { data: u } = await supabase.auth.getUser();
      setLoading(false);
      if (!u.user) return toast.error("Couldn't confirm your account. Try signing in.");
      toast.success("Account created — let's set up your store");
      nav({ to: "/onboarding", replace: true });
    } else {
      setLoading(false);
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
          <Input id="name" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Use at least 6 characters — letters or numbers are fine.</p>
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
