import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sezino — swipe through the best events near you",
  description:
    "One feed for Luma, Eventbrite, and Meetup. Swipe right to RSVP, left to skip.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
