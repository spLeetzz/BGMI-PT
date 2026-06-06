import { db } from "@/db";
import { players, teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const playerId = parseInt(id);
  if (isNaN(playerId)) return apiError("Invalid id.", 400);

  try {
    const body = await req.json();
    const { ign } = body;
    if (!ign || typeof ign !== "string" || !ign.trim()) {
      return apiError("ign required.", 400);
    }

    const [existing] = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    if (!existing) return apiError("Player not found.", 404);

    const [updated] = await db
      .update(players)
      .set({ ign: ign.trim() })
      .where(eq(players.id, playerId))
      .returning();

    return apiResponse(updated);
  } catch (e) {
    console.error(e);
    return apiError("Failed to update player.");
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const playerId = parseInt(id);
  if (isNaN(playerId)) return apiError("Invalid id.", 400);

  try {
    const [existing] = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    if (!existing) return apiError("Player not found.", 404);

    await db.delete(players).where(eq(players.id, playerId));

    return apiResponse({ deleted: true });
  } catch (e) {
    console.error(e);
    return apiError("Failed to delete player.");
  }
}
