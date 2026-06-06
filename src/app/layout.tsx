import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BGMI Points Table",
  description: "Tournament points table manager for BGMI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
              >
                BGMI Points
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/points-systems"
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Points Systems
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  How it Works
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/tournament/new"
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5"
              >
                New Tournament
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
