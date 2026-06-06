import { db } from "@/db";
import { pointsSystems } from "@/db/schema";
import Link from "next/link";
import CreatePointsSystemForm from "@/components/CreatePointsSystemForm";

export const dynamic = "force-dynamic";

export default async function PointsSystemsPage() {
  const systems = await db.select().from(pointsSystems).orderBy(pointsSystems.id);

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          ⚙️ Points Systems
        </h1>
        <p className="text-sm text-muted">
          Manage match finish placement scoring rules and kill point multipliers.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
          Available Systems
        </h2>
        
        {systems.length === 0 && (
          <div className="glass-card rounded-2xl p-8 border border-border text-center text-muted">
            <p className="text-sm mb-2">No points systems configured.</p>
            <p className="text-xs text-muted/60">
              Run <code className="px-1.5 py-0.5 rounded bg-background font-mono text-[10px] border border-border">pnpm db:seed</code> in terminal or create a custom one below.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {systems.map((ps) => (
            <Link
              key={ps.id}
              href={`/points-systems/${ps.id}`}
              className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card/60 hover:border-primary/40 hover:bg-card transition-all duration-200 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {ps.name}
                  </span>
                  {ps.isDefault && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted/80">
                  Defines custom scoring for finishes up to position #{ps.rules.length}.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted">Kill Multiplier:</span>
                <span className="font-mono font-bold text-primary">{ps.killPoints} pts/kill</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Create custom form */}
      <div className="glass-card rounded-2xl p-6 border border-border shadow-xl">
        <h2 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
          🛠️ Create Custom System
        </h2>
        <p className="text-xs text-muted mb-6">
          Specify placement rewards and kill point values for tournament tables.
        </p>
        <CreatePointsSystemForm />
      </div>
    </div>
  );
}
