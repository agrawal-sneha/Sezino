import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // The server config is required by the type but we override sendVerificationRequest
      // entirely, so this is a placeholder that's never used.
      server: {
        host: "noop",
        port: 587,
        auth: { user: "noop", pass: "noop" },
      },
      from: process.env.EMAIL_FROM ?? "noreply@sezino.com",
      async sendVerificationRequest({ identifier, url }) {
        const isProd = process.env.NODE_ENV === "production";
        const apiKey = process.env.RESEND_API_KEY;

        if (!isProd || !apiKey) {
          // Dev-mode magic link: log to terminal so the user can click.
          // Bright divider so it's findable in noisy dev output.
          console.log(
            "\n" +
              "═".repeat(72) +
              `\n🔗 Sezino magic link for ${identifier}:\n${url}\n` +
              "═".repeat(72) +
              "\n",
          );
          return;
        }

        // Prod: send via Resend's HTTP API (no nodemailer needed at runtime).
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM ?? "Sezino <hello@sezino.com>",
            to: identifier,
            subject: "Your Sezino sign-in link",
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h1 style="font-size: 22px; margin-bottom: 16px;">Sign in to Sezino</h1>
                <p>Click the button below to sign in. This link is valid for 24 hours.</p>
                <p style="margin: 24px 0;">
                  <a href="${url}" style="background: #d946ef; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Sign in</a>
                </p>
                <p style="color: #666; font-size: 13px;">If you didn't request this, you can ignore this email.</p>
              </div>
            `,
          }),
        });
        if (!res.ok) {
          throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
