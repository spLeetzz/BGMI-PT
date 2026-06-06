type Team = { id: number; name: string; teamIdCustom: string | null; slot: number };
type Match = { id: number; name: string };
type Result = { teamId: number; position: number; placementPoints: number };
type Kill = { playerId: number; kills: number };
type PlayerRef = { id: number; teamId: number };

type Props = {
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
  teams,
  matches,
  allResults,
  allKills,
  killPoints,
  allPlayers,
}: Props) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
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

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full border-collapse premium-table text-left">
        <thead>
          {/* Main headers */}
          <tr className="border-b border-border/80">
            <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-12 text-center">
              Rank
            </th>
            <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider min-w-[200px]">
              Team Name
            </th>
            {matches.map((m) => (
              <th
                key={m.id}
                colSpan={4}
                className="py-3 px-2 text-xs font-bold text-center border-l border-border/60 uppercase tracking-widest text-foreground bg-white/[0.01]"
              >
                {m.name}
              </th>
            ))}
            <th
              colSpan={4}
              className="py-3 px-4 text-xs font-bold text-center border-l border-border/80 uppercase tracking-widest text-primary bg-primary/5"
            >
              Overall Summary
            </th>
          </tr>

          {/* Subheaders */}
          <tr className="border-b-2 border-border">
            <th colSpan={2} />
            {matches.map((m) => (
              <tr key={m.id} className="contents">
                <th className="py-2 px-1 text-[10px] font-bold text-center text-muted border-l border-border/40 w-12">Pos</th>
                <th className="py-2 px-1 text-[10px] font-bold text-center text-muted w-10">PP</th>
                <th className="py-2 px-1 text-[10px] font-bold text-center text-muted w-10">KP</th>
                <th className="py-2 px-1.5 text-[10px] font-bold text-center text-foreground w-12 bg-white/[0.01]">Total</th>
              </tr>
            ))}
            <tr className="contents">
              <th className="py-2 px-2 text-[10px] font-bold text-center text-muted border-l border-border/80 w-16 bg-primary/5">Total PP</th>
              <th className="py-2 px-2 text-[10px] font-bold text-center text-muted w-16 bg-primary/5">Total KP</th>
              <th className="py-2 px-2 text-[10px] font-bold text-center text-primary w-20 bg-primary/5">Grand</th>
              <th className="py-2 px-2 text-[10px] font-bold text-center text-muted w-16 bg-primary/5">CDs</th>
            </tr>
          </tr>
        </thead>

        <tbody className="divide-y divide-border/50">
          {stats.map((s, idx) => {
            const isTop3 = idx < 3;
            const rankColors = [
              "text-yellow-500 font-extrabold text-sm", // 1st
              "text-zinc-300 font-bold",               // 2nd
              "text-amber-600 font-bold",               // 3rd
            ];

            return (
              <tr
                key={s.team.id}
                className={`transition-colors hover:bg-white/[0.02] ${idx === 0 ? "bg-primary/[0.02]" : ""
                  }`}
              >
                {/* Rank */}
                <td className="py-3 px-4 font-mono text-center">
                  {idx === 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-black text-xs">
                      1
                    </span>
                  ) : idx === 1 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-300/10 border border-zinc-300/30 text-zinc-300 font-bold text-xs">
                      2
                    </span>
                  ) : idx === 2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-600 font-bold text-xs">
                      3
                    </span>
                  ) : (
                    <span className="text-muted text-xs font-semibold">{idx + 1}</span>
                  )}
                </td>

                {/* Team Info */}
                <td className="py-3 px-4 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">{s.team.name}</span>
                    {s.team.teamIdCustom && (
                      <span className="text-[10px] font-mono font-bold tracking-tight text-muted bg-surface/80 px-1.5 py-0.5 rounded border border-border/60">
                        {s.team.teamIdCustom}
                      </span>
                    )}
                  </div>
                </td>

                {/* Per Match Results */}
                {s.perMatch.map((m, i) => (
                  <tr key={i} className="contents">
                    {/* Pos */}
                    <td
                      className={`py-3 px-1 text-center font-mono border-l border-border/40 text-xs ${m.cd ? "text-yellow-500 font-extrabold bg-yellow-500/5" : "text-muted"
                        }`}
                    >
                      {m.position !== null ? (
                        m.cd ? "🍗 1" : `#${m.position}`
                      ) : (
                        <span className="text-border/40">—</span>
                      )}
                    </td>
                    {/* PP */}
                    <td className="py-3 px-1 text-center font-mono text-xs text-muted-foreground/80">
                      {m.position !== null ? m.pp : <span className="text-border/40">—</span>}
                    </td>
                    {/* KP */}
                    <td className="py-3 px-1 text-center font-mono text-xs text-muted-foreground/80">
                      {m.position !== null ? m.kp : <span className="text-border/40">—</span>}
                    </td>
                    {/* Match Total */}
                    <td className="py-3 px-1.5 text-center font-mono text-xs font-bold text-foreground bg-white/[0.01]">
                      {m.position !== null ? m.total : <span className="text-border/40">—</span>}
                    </td>
                  </tr>
                ))}

                {/* Overall Totals */}
                <tr className="contents">
                  <td className="py-3 px-2 text-center font-mono text-xs font-medium text-muted-foreground border-l border-border/80 bg-primary/5">
                    {s.totalPP}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-xs font-medium text-muted-foreground bg-primary/5">
                    {s.totalKP}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-sm font-black text-primary bg-primary/5">
                    {s.grand}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-xs font-bold text-foreground bg-primary/5">
                    {s.cds > 0 ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-[10px]">
                        🍗 {s.cds}
                      </span>
                    ) : (
                      <span className="text-muted/60">0</span>
                    )}
                  </td>
                </tr>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
