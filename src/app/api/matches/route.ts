import { db } from "@/db";
import { matches, tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournamentId = parseInt(searchParams.get("tournament_id") ?? "");

  if (isNaN(tournamentId)) return apiError("tournament_id required.", 400);

  try {
    const rows = await db
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(matches.order);
    return apiResponse(rows);
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch matches.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tournament_id, name, order } = body;

    if (!tournament_id || !name) {
      return apiError("tournament_id and name required.", 400);
    }

    const [tournament] = await db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, tournament_id))
      .limit(1);

    if (!tournament) return apiError("Tournament not found.", 404);

    const [row] = await db
      .insert(matches)
      .values({ tournamentId: tournament_id, name: name.trim(), order: order ?? 0 })
      .returning();

    return apiResponse(row, 201);
  } catch (e) {
    console.error(e);
    return apiError("Failed to create match.");
  }
}
