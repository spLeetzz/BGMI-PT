export const dynamic = "force-static";

const steps = [
  {
    n: "01",
    title: "Create a Tournament",
    desc: "Give your tournament a name and pick a points system. You get a unique link. Bookmark it.",
  },
  {
    n: "02",
    title: "Upload Your Roster",
    desc: "Download the CSV template, fill in team slots and player IGNs, then upload. Supports up to 10 players per team.",
  },
  {
    n: "03",
    title: "Create Matches",
    desc: "Add matches (Match 1, Match 2, etc.) from the matches page. Name them anything.",
  },
  {
    n: "04",
    title: "Enter Results",
    desc: "Click a team to expand it. Enter their finish position and each player kill count. Save per team.",
  },
  {
    n: "05",
    title: "Export Results",
    desc: "Export player kills CSV or full standings CSV with per-match breakdown at any time.",
  },
];

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-16 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          📖 How it Works
        </h1>
        <p className="text-sm text-muted">
          Follow these five steps to set up and manage your BGMI leaderboards.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {steps.map((step) => (
          <div
            key={step.n}
            className="group flex gap-5 p-5 rounded-2xl border border-border bg-card/40 hover:bg-card hover:border-primary/20 transition-all duration-200"
          >
            <span className="text-2xl font-black tabular-nums text-primary/70 group-hover:text-primary transition-colors">
              {step.n}
            </span>
            <div className="flex-1">
              <h2 className="font-bold text-sm text-foreground mb-1">
                {step.title}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
          📁 Roster Template CSV Specifications
        </h3>
        <div className="bg-background/80 border border-border rounded-xl p-4 font-mono text-xs overflow-x-auto text-primary whitespace-nowrap mb-3">
          Slot Number, Team ID, Team Name, Player 1 IGN, Player 2 IGN, Player 3 IGN, Player 4 IGN, Player 5 IGN
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          The <span className="text-foreground font-semibold">Team ID</span> column is optional per row (can be left blank). You can expand squads and add more players in the match results page (up to 10 players).
        </p>
      </div>
    </div>
  );
}
