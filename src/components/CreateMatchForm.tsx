"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = { tournamentId: number; nextOrder: number; slug: string };

export default function CreateMatchForm({ tournamentId, nextOrder, slug }: Props) {
  const [name, setName] = useState(`Match ${nextOrder + 1}`);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tournament_id: tournamentId, name: name.trim(), order: nextOrder }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error ?? "Failed to create match.");
          return;
        }
        if (router) {
          router.refresh();
        }
        setName(`Match ${nextOrder + 2}`);
      } catch {
        setError("Network error. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Match name (e.g. Erangel Match 1)"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background/50 focus:bg-background transition-all"
          required
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50 whitespace-nowrap"
      >
        {pending ? "Adding Match..." : "Add Match"}
      </button>
      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
    </form>
  );
}
