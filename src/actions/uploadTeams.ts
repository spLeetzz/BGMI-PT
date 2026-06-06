"use server";

import Papa from "papaparse";
import { db } from "@/db";
import { teams, players } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

const REQUIRED_HEADERS = [
  "slot number",
  "team name",
];

export async function uploadTeams(formData: FormData) {
  const file = formData.get("csv") as File;
  const tournamentId = parseInt(formData.get("tournament_id") as string);

  if (!file || file.size === 0) return { success: false, error: "No file provided." };
  if (isNaN(tournamentId)) return { success: false, error: "Invalid tournament." };

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { success: false, error: "Could not read file." };
  }

  // Strip BOM if present
  text = text.replace(/^\uFEFF/, "");

  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return { success: false, error: "Could not parse CSV." };
  }

  const rows = parsed.data as string[][];
  if (rows.length < 2) {
    return { success: false, error: "CSV has no data rows." };
  }

  const headerRow = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z0-9 ]/g, ""));
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headerRow.some((rh) => rh.includes(h)));

  if (missingHeaders.length > 0) {
    return {
      success: false,
      error: `Missing columns: ${missingHeaders.join(", ")}. Expected: Slot Number, Team ID, Team Name, Player 1 IGN … Player 5 IGN`,
    };
  }

  // Detect column indices dynamically
  const colSlot = headerRow.findIndex((h) => h.includes("slot"));
  const colTeamId = headerRow.findIndex((h) => h.includes("team id") || h.includes("teamid"));
  const colTeamName = headerRow.findIndex((h) => h.includes("team name") || h.includes("teamname"));
  const playerCols: number[] = [];
  for (let pi = 1; pi <= 10; pi++) {
    const idx = headerRow.findIndex((h) => h.includes(`player ${pi}`) || h.includes(`player${pi}`));
    if (idx >= 0) playerCols.push(idx);
  }

  const errors: string[] = [];
  let inserted = 0;

  try {
    // 1. Fetch all existing teams for this tournament (1 query)
    const existingTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.tournamentId, tournamentId));
    const teamMapBySlot = new Map(existingTeams.map((t) => [t.slot, t]));

    // 2. Fetch all existing players for these teams (1 query)
    const teamIds = existingTeams.map((t) => t.id);
    const existingPlayers = teamIds.length > 0
      ? await db.select().from(players).where(inArray(players.teamId, teamIds))
      : [];
    const playerMapByKey = new Map(
      existingPlayers.map((p) => [`${p.teamId}_${p.slot}`, p])
    );

    // 3. Process each row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const slot = parseInt(colSlot >= 0 ? row[colSlot] : row[0]);
      const teamIdCustom = (colTeamId >= 0 ? row[colTeamId]?.trim() : row[1]?.trim()) || null;
      const name = (colTeamName >= 0 ? row[colTeamName]?.trim() : row[2]?.trim());

      if (isNaN(slot) || !name) {
        errors.push(`Row ${i + 1}: invalid slot or team name.`);
        continue;
      }

      try {
        let teamId: number;
        const existingTeam = teamMapBySlot.get(slot);

        if (existingTeam) {
          // If name or teamIdCustom changed, update it
          if (existingTeam.name !== name || existingTeam.teamIdCustom !== teamIdCustom) {
            await db
              .update(teams)
              .set({ name, teamIdCustom })
              .where(eq(teams.id, existingTeam.id));
          }
          teamId = existingTeam.id;
        } else {
          // Create new team
          const [inserted_team] = await db
            .insert(teams)
            .values({ tournamentId, slot, name, teamIdCustom })
            .returning({ id: teams.id });
          teamId = inserted_team.id;
          // Add to our cache so next rows/players can reference it if needed
          teamMapBySlot.set(slot, { id: teamId, tournamentId, slot, name, teamIdCustom });
        }

        // Process players for this team
        for (let pi = 0; pi < playerCols.length; pi++) {
          const ign = row[playerCols[pi]]?.trim();
          if (!ign) continue;
          const playerSlot = pi + 1;

          const key = `${teamId}_${playerSlot}`;
          const existingPlayer = playerMapByKey.get(key);

          if (existingPlayer) {
            if (existingPlayer.ign !== ign) {
              await db
                .update(players)
                .set({ ign })
                .where(eq(players.id, existingPlayer.id));
            }
          } else {
            await db
              .insert(players)
              .values({ teamId, ign, slot: playerSlot });
          }
        }

        inserted++;
      } catch (e) {
        console.error(e);
        errors.push(`Row ${i + 1}: DB error.`);
      }
    }
  } catch (globalError) {
    console.error(globalError);
    return { success: false, error: "A database error occurred during upload." };
  }

  return { success: true, inserted, errors };
}
