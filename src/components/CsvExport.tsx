"use client";

import Papa from "papaparse";

type Team = { id: number; name: string; teamIdCustom: string | null; slot: number };
type Match = { id: number; name: string };
type Result = { teamId: number; position: number; placementPoints: number };
type Kill = { playerId: number; kills: number };
type PlayerRef = { id: number; teamId: number; ign: string };

type Props = {
  teams: Team[];
  matches: Match[];
  allResults: Result[][];
  allKills: Kill[][];
  killPoints: number;
  allPlayers: PlayerRef[];
};

export default function CsvExport({
  teams,
  matches,
  allResults,
  allKills,
  killPoints,
  allPlayers,
}: Props) {
  function exportStandings() {
    const playersByTeam = new Map<number, Set<number>>();
    for (const p of allPlayers) {
      if (!playersByTeam.has(p.teamId)) playersByTeam.set(p.teamId, new Set());
      playersByTeam.get(p.teamId)!.add(p.id);
    }

    const rows = teams.map((team) => {
      const teamPlayerIds = playersByTeam.get(team.id) ?? new Set<number>();
      const perMatch = matches.map((_, i) => {
        const result = allResults[i]?.find((r) => r.teamId === team.id);
        const pp = result?.placementPoints ?? 0;
        const rawKills = (allKills[i] ?? [])
          .filter((k) => teamPlayerIds.has(k.playerId))
          .reduce((sum, k) => sum + k.kills, 0);
        const kp = rawKills * killPoints;
        const total = pp + kp;
        return {
          position: result?.position ?? null,
          pp,
          kp,
          total,
          cd: result?.position === 1,
        };
      });

      const totalPP = perMatch.reduce((sum, m) => sum + m.pp, 0);
      const totalKP = perMatch.reduce((sum, m) => sum + m.kp, 0);
      const grand = totalPP + totalKP;
      const cds = perMatch.filter((m) => m.cd).length;

      const obj: Record<string, string | number> = {
        "Slot": team.slot,
        "Team ID": team.teamIdCustom ?? "",
        "Team Name": team.name,
      };

      matches.forEach((m, idx) => {
        const hasResult = perMatch[idx].position !== null;
        obj[`${m.name} Pos`] = hasResult ? `#${perMatch[idx].position}` : "";
        obj[`${m.name} PP`] = hasResult ? perMatch[idx].pp : "";
        obj[`${m.name} KP`] = hasResult ? perMatch[idx].kp : "";
        obj[`${m.name} Total`] = hasResult ? perMatch[idx].total : "";
      });

      obj["Total PP"] = totalPP;
      obj["Total KP"] = totalKP;
      obj["Grand Total"] = grand;
      obj["Chicken Dinners"] = cds;

      return obj;
    });

    // Sort rows by Grand Total desc
    rows.sort((a, b) => (b["Grand Total"] as number) - (a["Grand Total"] as number));

    downloadCSV(rows, "overall_standings.csv");
  }

  function exportPlayers() {
    const rows: Array<Record<string, string | number>> = [];

    allPlayers.forEach((player) => {
      const team = teams.find((t) => t.id === player.teamId);
      const obj: Record<string, string | number> = {
        "Player IGN": player.ign,
        "Team Name": team?.name ?? "",
        "Team Slot": team?.slot ?? "",
      };

      let playerTotalKills = 0;

      matches.forEach((m, idx) => {
        const pk = allKills[idx]?.find((k) => k.playerId === player.id);
        const kills = pk?.kills ?? 0;
        playerTotalKills += kills;
        obj[`${m.name} Kills`] = kills;
        obj[`${m.name} Points`] = kills * killPoints;
      });

      obj["Total Kills"] = playerTotalKills;
      obj["Total Points"] = playerTotalKills * killPoints;

      rows.push(obj);
    });

    // Sort by total kills desc
    rows.sort((a, b) => (b["Total Kills"] as number) - (a["Total Kills"] as number));

    downloadCSV(rows, "player_stats.csv");
  }

  function downloadCSV(data: any[], filename: string) {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-2">
      <button
        onClick={exportStandings}
        className="flex-1 px-5 py-4 rounded-2xl border border-border bg-background/50 hover:bg-background hover:border-primary/40 text-left transition-all duration-200 group flex items-center justify-between"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            📊 Overall Standings CSV
          </span>
          <span className="text-[10px] text-muted leading-relaxed">
            Team totals, match positions, PP, and KP summaries.
          </span>
        </div>
        <span className="text-xl">➔</span>
      </button>

      <button
        onClick={exportPlayers}
        className="flex-1 px-5 py-4 rounded-2xl border border-border bg-background/50 hover:bg-background hover:border-primary/40 text-left transition-all duration-200 group flex items-center justify-between"
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            🎯 Player Kills CSV
          </span>
          <span className="text-[10px] text-muted leading-relaxed">
            Individual player kills and points details per match.
          </span>
        </div>
        <span className="text-xl">➔</span>
      </button>
    </div>
  );
}
