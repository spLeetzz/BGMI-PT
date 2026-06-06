import { db } from "@/db";
import { matchResults, playerKills, matches, tournaments, pointsSystems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { apiError, apiResponse, getPlacementPoints } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const matchId = parseInt(searchParams.get("match_id") ?? "");

  if (isNaN(matchId)) return apiError("match_id required.", 400);

  try {
    const results = await db
      .select()
      .from(matchResults)
      .where(eq(matchResults.matchId, matchId));
    const kills = await db
      .select()
      .from(playerKills)
      .where(eq(playerKills.matchId, matchId));

    return apiResponse({ results, kills });
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch results.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { match_id, team_id, position, kills_per_player } = body;

    if (!match_id || !team_id || position == null) {
      return apiError("match_id, team_id, position required.", 400);
    }

    // get points system for this match's tournament
    const [match] = await db.select().from(matches).where(eq(matches.id, match_id)).limit(1);
    if (!match) return apiError("Match not found.", 404);

    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, match.tournamentId))
      .limit(1);

    const [ps] = await db
      .select()
      .from(pointsSystems)
      .where(eq(pointsSystems.id, tournament.pointsSystemId!))
      .limit(1);

    const placementPoints = ps ? getPlacementPoints(position, ps.rules) : 0;

    // upsert match result
    const existing = await db
      .select()
      .from(matchResults)
      .where(and(eq(matchResults.matchId, match_id), eq(matchResults.teamId, team_id)))
      .limit(1);

    let resultId: number;
    if (existing.length > 0) {
      const [updated] = await db
        .update(matchResults)
        .set({ position, placementPoints })
        .where(eq(matchResults.id, existing[0].id))
        .returning({ id: matchResults.id });
      resultId = updated.id;
    } else {
      const [inserted] = await db
        .insert(matchResults)
        .values({ matchId: match_id, teamId: team_id, position, placementPoints })
        .returning({ id: matchResults.id });
      resultId = inserted.id;
    }

    // upsert player kills
    if (Array.isArray(kills_per_player)) {
      for (const entry of kills_per_player) {
        const { player_id, kills } = entry;
        const existingKill = await db
          .select()
          .from(playerKills)
          .where(and(eq(playerKills.matchId, match_id), eq(playerKills.playerId, player_id)))
          .limit(1);

        if (existingKill.length > 0) {
          await db
            .update(playerKills)
            .set({ kills })
            .where(eq(playerKills.id, existingKill[0].id));
        } else {
          await db.insert(playerKills).values({ matchId: match_id, playerId: player_id, kills });
        }
      }
    }

    return apiResponse({ resultId }, 201);
  } catch (e) {
    console.error(e);
    return apiError("Failed to save result.");
  }
}
