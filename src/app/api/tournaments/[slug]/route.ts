import { db } from "@/db";
import { tournaments, teams, players } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.slug, slug))
      .limit(1);

    if (!tournament) return apiError("Tournament not found.", 404);

    const teamRows = await db
      .select()
      .from(teams)
      .where(eq(teams.tournamentId, tournament.id));

    const teamIds = teamRows.map((t) => t.id);
    const playerRows = teamIds.length > 0
      ? await db
          .select()
          .from(players)
          .where(inArray(players.teamId, teamIds))
      : [];

    const teamsWithPlayers = teamRows.map((t) => ({
      ...t,
      players: playerRows.filter((p) => p.teamId === t.id),
    }));

    return apiResponse({ ...tournament, teams: teamsWithPlayers });
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch tournament.");
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const { name, points_system_id } = body;

    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.slug, slug))
      .limit(1);

    if (!tournament) return apiError("Tournament not found.", 404);

    const updates: Partial<typeof tournaments.$inferInsert> = {};
    if (name) updates.name = name.trim();
    if (points_system_id) updates.pointsSystemId = points_system_id;

    const [updated] = await db
      .update(tournaments)
      .set(updates)
      .where(eq(tournaments.slug, slug))
      .returning();

    return apiResponse(updated);
  } catch (e) {
    console.error(e);
    return apiError("Failed to update tournament.");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { slug } = await params;
  try {
    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.slug, slug))
      .limit(1);

    if (!tournament) return apiError("Tournament not found.", 404);

    await db.delete(tournaments).where(eq(tournaments.slug, slug));
    return apiResponse({ deleted: true });
  } catch (e) {
    console.error(e);
    return apiError("Failed to delete tournament.");
  }
}
