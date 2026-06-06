import { db } from "@/db";
import { matchResults } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const resultId = parseInt(id);
  if (isNaN(resultId)) return apiError("Invalid id.", 400);

  try {
    const body = await req.json();
    const { position } = body;
    if (position == null) return apiError("position required.", 400);

    const [existing] = await db
      .select()
      .from(matchResults)
      .where(eq(matchResults.id, resultId))
      .limit(1);
    if (!existing) return apiError("Result not found.", 404);

    const [updated] = await db
      .update(matchResults)
      .set({ position })
      .where(eq(matchResults.id, resultId))
      .returning();

    return apiResponse(updated);
  } catch (e) {
    console.error(e);
    return apiError("Failed to update result.");
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const resultId = parseInt(id);
  if (isNaN(resultId)) return apiError("Invalid id.", 400);

  try {
    const [existing] = await db
      .select()
      .from(matchResults)
      .where(eq(matchResults.id, resultId))
      .limit(1);
    if (!existing) return apiError("Result not found.", 404);

    await db.delete(matchResults).where(eq(matchResults.id, resultId));
    return apiResponse({ deleted: true });
  } catch (e) {
    console.error(e);
    return apiError("Failed to delete result.");
  }
}
