"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPointsSystem } from "@/actions/createPointsSystem";

type Rule = { position: number; points: number };

export default function CreatePointsSystemForm() {
  const [name, setName] = useState("");
  const [killPoints, setKillPoints] = useState("1");
  const [rules, setRules] = useState<Rule[]>([
    { position: 1, points: 10 },
    { position: 2, points: 6 },
    { position: 3, points: 5 },
    { position: 4, points: 4 },
    { position: 5, points: 3 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const router = useRouter();

  function addRule() {
    const nextPos = Math.max(0, ...rules.map((r) => r.position)) + 1;
    setRules((prev) => [...prev, { position: nextPos, points: 0 }]);
  }

  function removeRule(idx: number) {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRule(idx: number, field: keyof Rule, value: string) {
    setRules((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, [field]: parseInt(value) || 0 } : r
      )
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name required.");
      return;
    }
    if (rules.length === 0) {
      setError("Add at least one rule.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("kill_points", killPoints);
    formData.set("rules", JSON.stringify(rules));

    startTransition(async () => {
      const result = await createPointsSystem(formData);
      if (!result.success) {
        setError(result.error ?? "Failed.");
        return;
      }
      if (result.id) {
        router.push(`/points-systems/${result.id}`);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Basic fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            System Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Esports Standard"
            className="px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background/50 focus:bg-background w-full"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Points per Kill
          </label>
          <input
            type="number"
            min={0}
            value={killPoints}
            onChange={(e) => setKillPoints(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background/50 focus:bg-background font-mono font-bold w-full"
            required
          />
        </div>
      </div>

      {/* Rules list */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Finish Scoring Rules (Position ➔ Points)
          </label>
          <button
            type="button"
            onClick={addRule}
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-border bg-background/60 hover:bg-background hover:border-primary/40 text-foreground transition-all duration-150"
          >
            ➕ Add Row
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-background/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted">Pos</span>
                <input
                  type="number"
                  min={1}
                  value={rule.position}
                  onChange={(e) => updateRule(idx, "position", e.target.value)}
                  className="w-12 px-2 py-1 rounded-lg border border-border text-xs bg-background/80 text-center font-mono font-bold"
                  placeholder="Pos"
                />
              </div>

              <span className="text-xs text-muted">➔</span>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={rule.points}
                  onChange={(e) => updateRule(idx, "points", e.target.value)}
                  className="w-12 px-2 py-1 rounded-lg border border-border text-xs bg-background/80 text-center font-mono font-bold text-primary"
                  placeholder="Pts"
                />
                <span className="text-[10px] font-bold text-muted">pts</span>
              </div>

              <button
                type="button"
                onClick={() => removeRule(idx)}
                className="text-muted hover:text-red-500 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50 w-fit"
      >
        {pending ? "Creating..." : "Save Points System"}
      </button>
    </form>
  );
}
