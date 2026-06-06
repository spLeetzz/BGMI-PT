"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTournaments, removeTournament } from "@/lib/storage";

export default function YourTournaments() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [searchSlug, setSearchSlug] = useState("");
  const router = useRouter();

  useEffect(() => {
    setSlugs(getTournaments());
  }, []);

  function remove(slug: string) {
    removeTournament(slug);
    setSlugs(getTournaments());
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = searchSlug.trim();
    if (!clean) return;
    router.push(`/tournament/${clean}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search/Access Widget */}
      <div className="glass-card rounded-2xl p-6 border border-border/80 shadow-xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3.5 flex items-center gap-2">
          <span>🔍</span> Find & View Tournament
        </h2>
        <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
          <input
            type="text"
            value={searchSlug}
            onChange={(e) => setSearchSlug(e.target.value)}
            placeholder="Enter Tournament ID (e.g. XfMjBkRk)"
            className="flex-1 px-3.5 py-2 rounded-xl border border-border text-sm bg-background/50 focus:bg-background"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-md shadow-primary-dim hover:-translate-y-0.5"
          >
            Open
          </button>
        </form>
      </div>

      {/* Local list (if any) */}
      {slugs.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-border/80 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Recently Viewed / Managed
          </h2>
          <div className="flex flex-col gap-3">
            {slugs.map((slug) => (
              <div
                key={slug}
                className="group flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-background/40 hover:border-primary/30 hover:bg-background/80 transition-all duration-200"
              >
                <div className="flex flex-col gap-0.5">
                  <Link
                    href={`/tournament/${slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    Tournament
                    <span className="text-xs font-mono text-muted bg-surface px-1.5 py-0.5 rounded border border-border">
                      {slug}
                    </span>
                  </Link>
                </div>
                <button
                  onClick={() => remove(slug)}
                  className="text-xs text-muted hover:text-red-500 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-500/25 transition-all duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
