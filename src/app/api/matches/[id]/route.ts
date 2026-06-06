import { db } from "@/db";
import { matches, matchResults, playerKills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const matchId = parseInt(id);
  if (isNaN(matchId)) return apiError("Invalid id.", 400);

  try {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (!match) return apiError("Match not found.", 404);

    const results = await db.select().from(matchResults).where(eq(matchResults.matchId, matchId));
    const kills = await db.select().from(playerKills).where(eq(playerKills.matchId, matchId));

    return apiResponse({ ...match, results, kills });
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch match.");
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const matchId = parseInt(id);
  if (isNaN(matchId)) return apiError("Invalid id.", 400);

  try {
    const body = await req.json();
    const { name } = body;
    if (!name) return apiError("name required.", 400);

    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (!match) return apiError("Match not found.", 404);

    const [updated] = await db
      .update(matches)
      .set({ name: name.trim() })
      .where(eq(matches.id, matchId))
      .returning();

    return apiResponse(updated);
  } catch (e) {
    console.error(e);
    return apiError("Failed to update match.");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const matchId = parseInt(id);
  if (isNaN(matchId)) return apiError("Invalid id.", 400);

  try {
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (!match) return apiError("Match not found.", 404);

    await db.delete(matches).where(eq(matches.id, matchId));
    return apiResponse({ deleted: true });
  } catch (e) {
    console.error(e);
    return apiError("Failed to delete match.");
  }
}
