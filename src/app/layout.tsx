import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VivahSthal - Find Your Dream Wedding Venue",
  description:
    "Discover and book the perfect wedding venue. Banquet halls, farmhouses, resorts & more with real-time availability and auspicious date filtering.",
  keywords: [
    "wedding venue",
    "banquet hall",
    "marriage hall",
    "vivah",
    "mandap",
    "wedding booking",
    "shaadi venue",
  ],
  openGraph: {
    title: "VivahSthal - Premium Wedding Venue Marketplace",
    description: "Find and book your dream wedding venue with AI-powered search",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[var(--color-cream)] text-[var(--color-charcoal)]">
        {children}
      </body>
    </html>
  );
}
