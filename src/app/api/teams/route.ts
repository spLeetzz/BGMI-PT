import { db } from "@/db";
import { teams } from "@/db/schema";
import { apiError, apiResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tournament_id, name, teamIdCustom, slot } = body;

    if (!tournament_id || !name || slot == null) {
      return apiError("tournament_id, name, slot required.", 400);
    }

    const [inserted] = await db
      .insert(teams)
      .values({
        tournamentId: tournament_id,
        name: name.trim(),
        teamIdCustom: teamIdCustom?.trim() || null,
        slot,
      })
      .returning();

    return apiResponse(inserted, 201);
  } catch (e) {
    console.error(e);
    return apiError("Failed to create team.");
  }
}
