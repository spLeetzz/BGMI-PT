import { db } from "@/db";
import { tournaments, matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import CreateMatchForm from "@/components/CreateMatchForm";
import { checkIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function MatchesPage({ params }: Props) {
  const { slug } = await params;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);

  if (!tournament) notFound();

  const isAdmin = await checkIsAdmin(slug);

  const matchList = await db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, tournament.id))
    .orderBy(matches.order);

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          🎮 Matches Scoreboard
        </h1>
        <p className="text-sm text-muted">
          {isAdmin
            ? "View all matches in this tournament or create new ones."
            : "View scoreboards and individual results for each match."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {matchList.length === 0 && (
          <div className="glass-card rounded-2xl p-8 border border-border text-center text-muted">
            <p className="text-sm mb-1">No matches have been added yet.</p>
            {isAdmin && <p className="text-xs text-muted/60">Create your first match using the form below.</p>}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {matchList.map((m, idx) => (
            <Link
              key={m.id}
              href={`/tournament/${slug}/matches/${m.id}`}
              className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition-all duration-200 shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Match #{idx + 1}
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {m.name}
                </span>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white px-3 py-1.5 rounded-xl transition-all duration-200">
                {isAdmin ? "Enter Results" : "View Results"}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="glass-card rounded-2xl p-6 border border-border shadow-xl mt-4">
          <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            ➕ Create New Match
          </h2>
          <CreateMatchForm
            tournamentId={tournament.id}
            nextOrder={matchList.length}
            slug={slug}
          />
        </div>
      )}
    </div>
  );
}
