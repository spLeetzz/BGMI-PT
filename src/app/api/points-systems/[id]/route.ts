import { db } from "@/db";
import { pointsSystems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const psId = parseInt(id);
  if (isNaN(psId)) return apiError("Invalid id.", 400);

  try {
    const [row] = await db
      .select()
      .from(pointsSystems)
      .where(eq(pointsSystems.id, psId))
      .limit(1);
    if (!row) return apiError("Points system not found.", 404);
    return apiResponse(row);
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch points system.");
  }
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const psId = parseInt(id);
  if (isNaN(psId)) return apiError("Invalid id.", 400);

  try {
    const [row] = await db
      .select()
      .from(pointsSystems)
      .where(eq(pointsSystems.id, psId))
      .limit(1);
    if (!row) return apiError("Points system not found.", 404);

    const body = await req.json();
    const updates: Partial<typeof pointsSystems.$inferInsert> = {};
    if (body.name) updates.name = body.name.trim();
    if (body.rules) updates.rules = body.rules;
    if (body.kill_points != null) updates.killPoints = body.kill_points;

    const [updated] = await db
      .update(pointsSystems)
      .set(updates)
      .where(eq(pointsSystems.id, psId))
      .returning();

    return apiResponse(updated);
  } catch (e) {
    console.error(e);
    return apiError("Failed to update points system.");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const psId = parseInt(id);
  if (isNaN(psId)) return apiError("Invalid id.", 400);

  try {
    const [row] = await db
      .select()
      .from(pointsSystems)
      .where(eq(pointsSystems.id, psId))
      .limit(1);
    if (!row) return apiError("Points system not found.", 404);

    if (row.isDefault) {
      return apiError("Cannot delete a default points system.", 403);
    }

    await db.delete(pointsSystems).where(eq(pointsSystems.id, psId));
    return apiResponse({ deleted: true });
  } catch (e) {
    console.error(e);
    return apiError("Failed to delete points system.");
  }
}
