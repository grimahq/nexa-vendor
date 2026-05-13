import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useState } from "react";

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-border/60 bg-card/40 backdrop-blur"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin + "/dashboard",
        });
        if (result.error) {
          toast.error(result.error.message ?? "Could not sign in with Google");
          setLoading(false);
          return;
        }
        if (result.redirected) return;
        window.location.href = "/dashboard";
      }}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
      </svg>
      {label}
    </Button>
  );
}
