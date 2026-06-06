import { db } from "@/db";
import { tournaments, teams, players } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { checkIsAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import RosterManager from "@/components/RosterManager";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function RosterPage({ params }: Props) {
  const { slug } = await params;

  const [tournament] = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.slug, slug))
    .limit(1);

  if (!tournament) notFound();

  const isAdmin = await checkIsAdmin(slug);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-8 py-16 flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-6 border border-border shadow-xl text-center">
          <span className="text-4xl mb-4 inline-block">🔒</span>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-muted mb-6">
            You must be the tournament creator to edit player rosters.
          </p>
          <div className="border-t border-border pt-4 text-left">
            <AdminLogin slug={slug} />
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          👥 Manage Roster
        </h1>
        <p className="text-sm text-muted">
          Add, rename, or delete teams and players throughout the entire tournament.
        </p>
      </div>

      <RosterManager
        tournamentId={tournament.id}
        initialTeams={teamList}
        initialPlayers={playersList}
      />
    </div>
  );
}
