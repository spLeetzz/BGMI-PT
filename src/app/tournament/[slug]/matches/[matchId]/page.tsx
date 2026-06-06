import { db } from "@/db";
import { matches, teams, players, matchResults, playerKills, tournaments } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import TeamCard from "@/components/TeamCard";
import Link from "next/link";
import { checkIsAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; matchId: string }> };

export default async function MatchResultsPage({ params }: Props) {
  const { slug, matchId } = await params;
  const matchIdNum = parseInt(matchId);
  if (isNaN(matchIdNum)) notFound();

  const [match] = await db.select().from(matches).where(eq(matches.id, matchIdNum)).limit(1);
  if (!match) notFound();

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);
  if (!tournament) notFound();

  const isAdmin = await checkIsAdmin(slug);

  const teamList = await db
    .select()
    .from(teams)
    .where(eq(teams.tournamentId, tournament.id))
    .orderBy(teams.slot);

  const teamIds = teamList.map((t) => t.id);
  const playersList = teamIds.length > 0
    ? await db
        .select()
        .from(players)
        .where(inArray(players.teamId, teamIds))
        .orderBy(players.slot)
    : [];

  const allPlayers = teamList.map((t) =>
    playersList.filter((p) => p.teamId === t.id)
  );

  const existingResults = await db
    .select()
    .from(matchResults)
    .where(eq(matchResults.matchId, matchIdNum));

  const existingKills = await db
    .select()
    .from(playerKills)
    .where(eq(playerKills.matchId, matchIdNum));

  const teamsWithData = teamList.map((team, i) => {
    const result = existingResults.find((r) => r.teamId === team.id);
    const teamPlayers = allPlayers[i].map((p) => ({
      ...p,
      kills: existingKills.find((k) => k.playerId === p.id)?.kills ?? 0,
    }));
    return { team, players: teamPlayers, result };
  });

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/tournament/${slug}/matches`}
          className="text-xs font-bold text-muted hover:text-foreground transition-colors border border-border bg-surface px-3 py-1.5 rounded-xl"
        >
          ⬅ Back to Matches
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          🎮 {match.name} Results
        </h1>
        <p className="text-sm text-muted">
          {isAdmin
            ? "Select teams below to record finish positions and individual player kills."
            : "Review the positions and player kills for this match below."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {teamsWithData.length === 0 && (
          <div className="glass-card rounded-2xl p-8 border border-border text-center text-muted">
            <p className="text-sm mb-1">No teams found.</p>
            {isAdmin && (
              <p className="text-xs text-muted/60">
                Please upload a roster CSV on the roster page first.
              </p>
            )}
          </div>
        )}

        {teamsWithData.map(({ team, players: teamPlayers, result }) => (
          <TeamCard
            key={team.id}
            team={team}
            players={teamPlayers}
            matchId={matchIdNum}
            existingResult={result ?? null}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}
