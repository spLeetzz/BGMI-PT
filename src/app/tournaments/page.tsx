import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AllTournamentsPage() {
  const all = await db
    .select()
    .from(tournaments)
    .orderBy(desc(tournaments.id));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">🏆 All Tournaments</h1>
        <p className="text-sm text-muted">
          Browse every tournament hosted on this platform. Click any to view its standings.
        </p>
      </div>

      {all.length === 0 ? (
        <div className="glass-card rounded-2xl border border-border p-12 text-center text-muted flex flex-col gap-3">
          <span className="text-4xl">🎯</span>
          <p className="text-sm">No tournaments yet. Be the first to create one!</p>
          <Link
            href="/tournament/new"
            className="mt-2 inline-flex mx-auto px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all"
          >
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {all.map((t) => (
            <Link
              key={t.id}
              href={`/tournament/${t.slug}`}
              className="group glass-card rounded-2xl border border-border bg-card/60 hover:border-primary/40 hover:bg-card p-5 flex flex-col gap-3 transition-all duration-200 shadow-sm hover:shadow-primary/10 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                    {t.name}
                  </h2>
                  <p className="text-xs font-mono text-muted mt-0.5">{t.slug}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary shrink-0">
                  View →
                </span>
              </div>

              <div className="border-t border-border/40 pt-3 flex items-center justify-between text-xs text-muted">
                <span>
                  ID: <span className="font-mono text-foreground/70">{t.slug}</span>
                </span>
                {t.adminToken ? (
                  <span className="flex items-center gap-1 text-yellow-500/80">
                    🔒 Protected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-green-500/70">
                    🌐 Open
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
