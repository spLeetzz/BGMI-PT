import { db } from "@/db";
import { tournaments, teams, players, matches, matchResults, playerKills, pointsSystems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import StandingsTable from "@/components/StandingsTable";
import RegisterTournament from "@/components/RegisterTournament";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function StandingsPage({ params }: Props) {
  const { slug } = await params;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);

  if (!tournament) notFound();

  const [ps] = tournament.pointsSystemId
    ? await db.select().from(pointsSystems).where(eq(pointsSystems.id, tournament.pointsSystemId)).limit(1)
    : [null];

  const matchList = await db
    .select()
    .from(matches)
    .where(eq(matches.tournamentId, tournament.id))
    .orderBy(matches.order);

  const teamList = await db
    .select()
    .from(teams)
    .where(eq(teams.tournamentId, tournament.id))
    .orderBy(teams.slot);

  const teamIds = teamList.map((t) => t.id);
  const allPlayers =
    teamIds.length > 0
      ? await db
          .select({ id: players.id, teamId: players.teamId })
          .from(players)
          .where(inArray(players.teamId, teamIds))
      : [];

  const matchIds = matchList.map((m) => m.id);
  const flatResults = matchIds.length > 0
    ? await db.select().from(matchResults).where(inArray(matchResults.matchId, matchIds))
    : [];

  const flatKills = matchIds.length > 0
    ? await db.select().from(playerKills).where(inArray(playerKills.matchId, matchIds))
    : [];

  const allResults = matchList.map((m) => flatResults.filter((r) => r.matchId === m.id));
  const allKills = matchList.map((m) => flatKills.filter((k) => k.matchId === m.id));

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Auto-register this tournament in the visitor's local recent list */}
      <RegisterTournament slug={slug} />

      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          {tournament.name}
        </h1>
        <p className="text-sm text-muted">
          Real-time overall standings and matches scoreboard.
        </p>
      </div>

      {/* Quick stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-border/60">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Total Teams
          </p>
          <p className="text-2xl font-bold text-foreground">
            {teamList.length} <span className="text-sm font-normal text-muted">teams</span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/60">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Matches Played
          </p>
          <p className="text-2xl font-bold text-foreground">
            {matchList.length} <span className="text-sm font-normal text-muted">matches</span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/60">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Points System
          </p>
          <p className="text-base font-bold text-foreground truncate">
            {ps?.name ?? "Custom"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/60">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Kills Value
          </p>
          <p className="text-2xl font-bold text-primary">
            {ps?.killPoints ?? 1} <span className="text-sm font-normal text-muted">pts/kill</span>
          </p>
        </div>
      </div>

      {/* Standings Table */}
      <StandingsTable
        tournamentName={tournament.name}
        teams={teamList}
        matches={matchList}
        allResults={allResults}
        allKills={allKills}
        killPoints={ps?.killPoints ?? 1}
        allPlayers={allPlayers}
      />
    </div>
  );
}
