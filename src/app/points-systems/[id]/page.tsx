import { db } from "@/db";
import { pointsSystems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PointsSystemPage({ params }: Props) {
  const { id } = await params;
  const psId = parseInt(id);
  if (isNaN(psId)) notFound();

  const [ps] = await db.select().from(pointsSystems).where(eq(pointsSystems.id, psId)).limit(1);
  if (!ps) notFound();

  return (
    <div className="max-w-xl mx-auto px-8 py-12 flex flex-col gap-6">
      <div className="flex items-center">
        <Link
          href="/points-systems"
          className="text-xs font-bold text-muted hover:text-foreground transition-colors border border-border bg-surface px-3 py-1.5 rounded-xl"
        >
          ⬅ Back to Systems
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            {ps.name}
          </h1>
          <p className="text-sm text-muted">
            Points distribution rules for match finishes.
          </p>
        </div>
        {ps.isDefault && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            Default
          </span>
        )}
      </div>

      <div className="glass-card rounded-2xl border border-border/80 shadow-2xl p-6 overflow-hidden">
        <table className="w-full text-sm border-collapse premium-table">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">
                Finish Position
              </th>
              <th className="text-right py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">
                Awarded Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ps.rules.map((r) => (
              <tr key={r.position} className="hover:bg-white/[0.01]">
                <td className="py-2.5 text-sm font-semibold text-foreground">
                  Position #{r.position}
                </td>
                <td className="text-right py-2.5 font-mono font-bold text-sm text-primary">
                  {r.points} pts
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-3 text-sm font-semibold text-muted">
                Per Kill Multiplier
              </td>
              <td className="text-right py-3 font-mono font-bold text-sm text-foreground">
                {ps.killPoints} pts
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
