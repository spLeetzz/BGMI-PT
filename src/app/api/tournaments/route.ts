import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { apiError, apiResponse } from "@/lib/utils";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const rows = await db.select().from(tournaments);
    return apiResponse(rows);
  } catch (e) {
    console.error(e);
    return apiError("Failed to fetch tournaments.");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, points_system_id } = body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return apiError("Name must be at least 3 characters.", 400);
    }
    if (!points_system_id) {
      return apiError("points_system_id required.", 400);
    }

    const slug = nanoid(8);
    const [row] = await db
      .insert(tournaments)
      .values({ slug, name: name.trim(), pointsSystemId: points_system_id })
      .returning();

    return apiResponse(row, 201);
  } catch (e) {
    console.error(e);
    return apiError("Failed to create tournament.");
  }
}
