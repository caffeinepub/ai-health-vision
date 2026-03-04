import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile } from "../hooks/useQueries";

export default function LoginPage() {
  const { login, identity, isLoggingIn, isLoginSuccess, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isFetching: profileFetching } = useCallerUserProfile();

  useEffect(() => {
    if (!identity) return;
    if (profileFetching) return;
    if (profile) {
      navigate({ to: "/dashboard" });
    } else if (isLoginSuccess || identity) {
      navigate({ to: "/onboarding" });
    }
  }, [identity, profile, profileFetching, isLoginSuccess, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          data-ocid="auth.link"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border shadow-card-hover p-8"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl medical-gradient flex items-center justify-center shadow-glow mb-4">
              <Heart size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              AI Health Vision
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              Sign in to access your health dashboard
            </p>
          </div>

          {/* Login Button */}
          <div className="space-y-4">
            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full medical-gradient text-white border-0 shadow-sm h-12 text-base gap-2"
              data-ocid="auth.primary_button"
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Sign In Securely
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy
              Policy. Your medical data is encrypted and secure.
            </p>
          </div>

          {/* Security badges */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-6">
              {[
                { label: "Encrypted" },
                { label: "HIPAA Ready" },
                { label: "Secure" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <ShieldCheck size={12} className="text-primary" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
