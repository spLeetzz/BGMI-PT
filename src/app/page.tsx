import Link from "next/link";
import YourTournaments from "@/components/YourTournaments";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 w-full flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 animate-pulse">
            <span>✨</span> No Authentication Required
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
            Manage BGMI Tournaments{" "}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create custom points tables, upload team rosters via CSV, track match-by-match placements and kills, and export overall standings instantly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/tournament/new"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5"
            >
              Create Tournament
            </Link>
            <Link
              href="/tournaments"
              className="px-6 py-3 rounded-xl border border-border bg-surface/50 hover:bg-surface text-foreground font-semibold transition-all hover:-translate-y-0.5"
            >
              🏆 Browse All Tournaments
            </Link>
            <Link
              href="/how-it-works"
              className="px-6 py-3 rounded-xl border border-border/50 bg-transparent hover:bg-surface/30 text-muted hover:text-foreground font-semibold transition-all hover:-translate-y-0.5"
            >
              How it Works
            </Link>
          </div>
        </div>

        {/* Local Storage Tournaments Section */}
        <div className="max-w-xl mx-auto w-full">
          <YourTournaments />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted">
        <div className="max-w-7xl mx-auto px-6">
          BGMI Points Table Manager — Sleek, Serverless, and Instant.
        </div>
      </footer>
    </div>
  );
}
