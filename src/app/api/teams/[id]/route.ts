import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const teamId = parseInt(id);
  if (isNaN(teamId)) return apiError("Invalid id.", 400);

  try {
    const body = await req.json();
    const { name, teamIdCustom } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return apiError("name required.", 400);
    }

    const [existing] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!existing) return apiError("Team not found.", 404);

    const [updated] = await db
      .update(teams)
      .set({ name: name.trim(), teamIdCustom: teamIdCustom?.trim() || null })
      .where(eq(teams.id, teamId))
      .returning();

    return apiResponse(updated);
  } catch (e) {
    console.error(e);
    return apiError("Failed to update team.");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const teamId = parseInt(id);
  if (isNaN(teamId)) return apiError("Invalid id.", 400);

  try {
    const [existing] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    if (!existing) return apiError("Team not found.", 404);

    await db.delete(teams).where(eq(teams.id, teamId));

    return apiResponse({ deleted: true });
  } catch (e) {
    console.error(e);
    return apiError("Failed to delete team.");
  }
}
