import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

function formatGoogleError(error: unknown) {
  if (!error) return "Google sign-in did not complete. Please try again.";
  const err = error as { message?: string; name?: string; code?: string; status?: number; stack?: string };
  const message = err.message ?? String(error);
  const details = [err.code && `Code: ${err.code}`, err.status && `Status: ${err.status}`, `Domain: ${window.location.origin}`]
    .filter(Boolean)
    .join(" · ");

  if (/unsupported provider|provider is not enabled/i.test(message)) {
    return `Google sign-in is not enabled for this app yet. ${details}`;
  }
  if (/redirect|origin|domain|callback|url/i.test(message)) {
    return `Google rejected this domain or redirect URL. ${details}`;
  }
  if (/popup|closed|cancel/i.test(message)) {
    return `Google sign-in was cancelled or blocked by the browser. ${details}`;
  }
  return `${message}${details ? ` · ${details}` : ""}`;
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  async function startGoogleSignIn() {
    setLoading(true);
    setLastError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/dashboard",
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        const message = formatGoogleError(result.error);
        setLastError(message);
        toast.error("Google sign-in failed", { description: message, duration: 9000 });
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = "/dashboard";
    } catch (error) {
      const message = formatGoogleError(error);
      setLastError(message);
      toast.error("Google sign-in failed", { description: message, duration: 9000 });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        key={attempt}
        type="button"
        variant="outline"
        className="h-11 w-full rounded-2xl border-border/60 bg-card/60 shadow-soft backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-elevated"
        disabled={loading}
        onClick={startGoogleSignIn}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
        </svg>
        {loading ? "Connecting to Google…" : label}
      </Button>
      {lastError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-left text-xs text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{lastError}</p>
          </div>
          <button type="button" onClick={() => { setAttempt((v) => v + 1); startGoogleSignIn(); }} className="mt-3 inline-flex items-center gap-1 font-semibold text-destructive underline-offset-4 hover:underline">
            <RotateCcw className="h-3 w-3" /> Retry Google sign-in
          </button>
        </div>
      )}
    </div>
  );
}
