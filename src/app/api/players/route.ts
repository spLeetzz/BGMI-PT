import { db } from "@/db";
import { players, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { team_id, ign, slot } = body;

    if (!team_id || !ign || !slot) {
      return apiError("team_id, ign, slot required.", 400);
    }
    if (slot < 1 || slot > 10) {
      return apiError("Slot must be between 1 and 10.", 400);
    }

    const [team] = await db.select().from(teams).where(eq(teams.id, team_id)).limit(1);
    if (!team) return apiError("Team not found.", 404);

    // check team player count
    const existing = await db.select().from(players).where(eq(players.teamId, team_id));
    if (existing.length >= 10) {
      return apiError("Team already has 10 players.", 400);
    }

    const [player] = await db
      .insert(players)
      .values({ teamId: team_id, ign: ign.trim(), slot })
      .returning();

    return apiResponse(player, 201);
  } catch (e) {
    console.error(e);
    return apiError("Failed to add player.");
  }
}
