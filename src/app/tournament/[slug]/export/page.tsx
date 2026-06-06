import { db } from "@/db";
import { tournaments, teams, players, matches, matchResults, playerKills, pointsSystems } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import CsvExport from "@/components/CsvExport";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ExportPage({ params }: Props) {
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
          .select({ id: players.id, teamId: players.teamId, ign: players.ign })
          .from(players)
          .where(inArray(players.teamId, teamIds))
      : [];

  const allResults = await Promise.all(
    matchList.map((m) =>
      db.select().from(matchResults).where(eq(matchResults.matchId, m.id))
    )
  );

  const allKills = await Promise.all(
    matchList.map((m) =>
      db.select().from(playerKills).where(eq(playerKills.matchId, m.id))
    )
  );

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          📤 Export Standings & Data
        </h1>
        <p className="text-sm text-muted">
          Download detailed statistics, overall points, and match results.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-bold text-foreground mb-1">
            📦 CSV Spreadsheets Export
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            Download your scoreboard or detailed player stats in standard Excel-compatible CSV formats.
          </p>
        </div>

        <CsvExport
          teams={teamList}
          matches={matchList}
          allResults={allResults}
          allKills={allKills}
          killPoints={ps?.killPoints ?? 1}
          allPlayers={allPlayers}
        />
      </div>
    </div>
  );
}
