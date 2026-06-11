import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-6">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Check your email</h1>
        <p className="text-muted-foreground mb-8">
          We sent you a magic link. Click it to finish signing in.
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          Didn't get it? Check spam, or{" "}
          <Link href="/auth/signin" className="underline hover:text-foreground">
            try again
          </Link>
          .
        </p>
        <p className="text-xs text-muted-foreground italic">
          Dev tip: in development, the link is printed in your terminal.
        </p>
      </div>
    </main>
  );
}
