"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/discover",
      });
      if (res?.error) {
        setError("Couldn't send the magic link. Try again?");
        setSubmitting(false);
      } else {
        router.push("/auth/verify");
      }
    } catch {
      setError("Something went wrong. Try again?");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="absolute top-6 left-6 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </Link>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Sezino</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email — we'll send you a magic link.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-lg bg-card border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || !email}
          >
            {submitting ? "Sending…" : "Send magic link"}
          </Button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-danger text-center">{error}</p>
        )}

        <p className="mt-8 text-xs text-muted-foreground text-center">
          By signing in you agree to be a beta tester. We don't sell your data
          and we don't email you junk.
        </p>
      </div>
    </main>
  );
}
