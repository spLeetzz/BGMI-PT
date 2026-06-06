"use client";

import { Fragment, useRef, useState } from "react";
import { Download } from "lucide-react";
import html2canvas from "html2canvas-pro";

type Team = { id: number; name: string; teamIdCustom: string | null; slot: number };
type Match = { id: number; name: string };
type Result = { teamId: number; position: number; placementPoints: number };
type Kill = { playerId: number; kills: number };
type PlayerRef = { id: number; teamId: number };

type Props = {
  tournamentName: string;
  teams: Team[];
  matches: Match[];
  allResults: Result[][];
  allKills: Kill[][];
  killPoints: number;
  allPlayers: PlayerRef[];
};

type MatchStats = {
  position: number | null;
  pp: number;
  kp: number;
  total: number;
  cd: boolean;
};

type TeamStats = {
  team: Team;
  perMatch: MatchStats[];
  totalPP: number;
  totalKP: number;
  grand: number;
  cds: number;
};

export default function StandingsTable({
  tournamentName,
  teams,
  matches,
  allResults,
  allKills,
  killPoints,
  allPlayers,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted glass-card rounded-2xl border border-border p-6">
        <p className="text-sm">No teams uploaded yet.</p>
      </div>
    );
  }

  // Build a set of player IDs per team for O(1) lookups
  const playersByTeam = new Map<number, Set<number>>();
  for (const p of allPlayers) {
    if (!playersByTeam.has(p.teamId)) playersByTeam.set(p.teamId, new Set());
    playersByTeam.get(p.teamId)!.add(p.id);
  }

  const stats: TeamStats[] = teams.map((team) => {
    const teamPlayerIds = playersByTeam.get(team.id) ?? new Set<number>();

    const perMatch: MatchStats[] = matches.map((_, i) => {
      const result = allResults[i]?.find((r) => r.teamId === team.id);
      const pp = result?.placementPoints ?? 0;

      const rawKills = (allKills[i] ?? [])
        .filter((k) => teamPlayerIds.has(k.playerId))
        .reduce((sum, k) => sum + k.kills, 0);

      const kp = rawKills * killPoints;
      const total = pp + kp;
      const cd = result?.position === 1;

      return {
        position: result?.position ?? null,
        pp,
        kp,
        total,
        cd,
      };
    });

    const totalPP = perMatch.reduce((s, m) => s + m.pp, 0);
    const totalKP = perMatch.reduce((s, m) => s + m.kp, 0);
    const grand = totalPP + totalKP;
    const cds = perMatch.filter((m) => m.cd).length;

    return { team, perMatch, totalPP, totalKP, grand, cds };
  });

  // Sort by grand total desc, then by CDs desc, then by total KP desc as tiebreaker
  stats.sort((a, b) => b.grand - a.grand || b.cds - a.cds || b.totalKP - a.totalKP);

  async function handleDownloadScreenshot() {
    if (!cardRef.current) return;
    setCapturing(true);
    // Let any state changes settle
    await new Promise((r) => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#121215", // Match glass-card background
        scale: 2.5, // Crisp high-definition output
        logging: false,
        useCORS: true,
        onclone: (clonedDoc: Document) => {
          const element = clonedDoc.getElementById("scoreboard-card");
          if (element) {
            element.style.background = "#121215";
            element.style.backgroundColor = "#121215";
          }
        },
      } as any);

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tournamentName.trim().replace(/\s+/g, "_")}_scoreboard.png`;
      link.click();
    } catch (e) {
      console.error("Error capturing scoreboard", e);
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div
      ref={cardRef}
      id="scoreboard-card"
      className="glass-card rounded-2xl border border-border/80 shadow-2xl p-6 overflow-hidden flex flex-col gap-4 bg-[#121215]"
    >
      {/* Header section with Tournament Name & Save button */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/30">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 tracking-tight">
            {tournamentName} Standings
          </h2>
          <p className="text-xs text-muted font-medium mt-1">
            Matches Played: {matches.length}
          </p>
        </div>

        <button
          onClick={handleDownloadScreenshot}
          disabled={capturing}
          data-html2canvas-ignore
          className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-card-hover text-muted hover:text-foreground transition-all duration-200 cursor-pointer flex items-center gap-2 text-xs font-bold disabled:opacity-50"
          title="Download Scoreboard PNG"
        >
          {capturing ? (
            <span className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
              Capturing...
            </span>
          ) : (
            <>
              <Download className="w-4 h-4 text-primary" />
              <span>Save Image</span>
            </>
          )}
        </button>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {/* Row 1: Group headers */}
            <tr className="border-b border-border/60">
              <th className="py-4 px-4 text-sm font-bold text-muted uppercase tracking-wider w-14 text-center">
                Rank
              </th>
              <th className="py-4 px-4 text-sm font-bold text-muted uppercase tracking-wider min-w-[200px]">
                Team
              </th>
              {matches.map((m) => (
                <th
                  key={m.id}
                  colSpan={4}
                  className="py-4 px-2 text-sm font-extrabold text-center border-l border-border/40 uppercase tracking-widest text-foreground bg-white/[0.01]"
                >
                  {m.name}
                </th>
              ))}
              <th
                colSpan={4}
                className="py-4 px-4 text-sm font-extrabold text-center border-l border-border/60 uppercase tracking-widest text-primary bg-primary/5"
              >
                Total
              </th>
            </tr>

            {/* Row 2: Column subheaders */}
            <tr className="border-b-2 border-border">
              <th colSpan={2} />
              {matches.map((m) => (
                <Fragment key={m.id}>
                  <th className="py-2.5 px-1.5 text-xs font-bold text-center text-muted border-l border-border/40 w-14">Pos</th>
                  <th className="py-2.5 px-1.5 text-xs font-bold text-center text-muted w-12">PP</th>
                  <th className="py-2.5 px-1.5 text-xs font-bold text-center text-muted w-12">KP</th>
                  <th className="py-2.5 px-2 text-xs font-bold text-center text-foreground w-14 bg-white/[0.01]">Pts</th>
                </Fragment>
              ))}
              <th className="py-2.5 px-2 text-xs font-bold text-center text-muted border-l border-border/60 w-20 bg-primary/5">PP</th>
              <th className="py-2.5 px-2 text-xs font-bold text-center text-muted w-20 bg-primary/5">KP</th>
              <th className="py-2.5 px-2 text-xs font-extrabold text-center text-primary w-24 bg-primary/5">Grand</th>
              <th className="py-2.5 px-2 text-xs font-bold text-center text-muted w-20 bg-primary/5">CDs</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {stats.map((s, idx) => (
              <tr
                key={s.team.id}
                className={`transition-colors hover:bg-white/[0.02] ${idx === 0 ? "bg-primary/[0.02]" : ""}`}
              >
                {/* Rank badge */}
                <td className="py-4 px-4 font-mono text-center">
                  {idx === 0 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-black text-sm">1</span>
                  ) : idx === 1 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-400/10 border border-zinc-400/30 text-zinc-300 font-bold text-sm">2</span>
                  ) : idx === 2 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-600 font-bold text-sm">3</span>
                  ) : (
                    <span className="text-muted text-sm font-bold">{idx + 1}</span>
                  )}
                </td>

                {/* Team name */}
                <td className="py-4 px-4 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-foreground text-base font-bold">{s.team.name}</span>
                    {s.team.teamIdCustom && (
                      <span className="text-xs font-mono font-bold text-muted bg-surface/80 px-2 py-0.5 rounded border border-border/50">
                        {s.team.teamIdCustom}
                      </span>
                    )}
                  </div>
                </td>

                {/* Per-match cells */}
                {s.perMatch.map((m, i) => (
                  <Fragment key={`${s.team.id}-${i}`}>
                    <td
                      className={`py-4 px-1.5 text-center font-mono border-l border-border/40 text-sm ${m.cd ? "text-yellow-500 font-black bg-yellow-500/5" : "text-muted/80"
                        }`}
                    >
                      {m.position !== null ? (m.cd ? "🍗 1" : `#${m.position}`) : <span className="opacity-30">—</span>}
                    </td>
                    <td className="py-4 px-1.5 text-center font-mono text-sm text-muted/80">
                      {m.position !== null ? m.pp : <span className="opacity-30">—</span>}
                    </td>
                    <td className="py-4 px-1.5 text-center font-mono text-sm text-muted/80">
                      {m.position !== null ? m.kp : <span className="opacity-30">—</span>}
                    </td>
                    <td className="py-4 px-2 text-center font-mono text-sm font-bold text-foreground bg-white/[0.01]">
                      {m.position !== null ? m.total : <span className="opacity-30">—</span>}
                    </td>
                  </Fragment>
                ))}

                {/* Overall totals */}
                <td className="py-4 px-2 text-center font-mono text-sm text-muted border-l border-border/60 bg-primary/5">
                  {s.totalPP}
                </td>
                <td className="py-4 px-2 text-center font-mono text-sm text-muted bg-primary/5">
                  {s.totalKP}
                </td>
                <td className="py-4 px-2 text-center font-mono text-base font-extrabold text-primary bg-primary/5">
                  {s.grand}
                </td>
                <td className="py-4 px-2 text-center font-mono text-sm bg-primary/5">
                  {s.cds > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-xs">
                      🍗 {s.cds}
                    </span>
                  ) : (
                    <span className="text-muted/50">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
