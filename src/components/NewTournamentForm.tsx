"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTournament } from "@/lib/storage";

type System = { id: number; name: string; isDefault: boolean };
type Props = {
  systems: System[];
  action: (formData: FormData) => Promise<{ success: boolean; slug?: string; error?: string } | undefined>;
};

export default function NewTournamentForm({ systems, action }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result && !result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (result?.slug) {
        const res = result as { success: boolean; slug: string; adminToken?: string };
        addTournament(res.slug, res.adminToken);
        router.push(`/tournament/${res.slug}`);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">
          Tournament Title
        </label>
        <input
          name="name"
          required
          minLength={3}
          placeholder="e.g. BGMI Invitational S1"
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background/50 focus:bg-background"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted">
          Scoring System
        </label>
        <select
          name="points_system_id"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm bg-background/50 focus:bg-background cursor-pointer"
        >
          <option value="">Select Points System</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.isDefault ? "(default)" : ""}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-semibold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50 mt-2"
      >
        {pending ? "Initializing Tournament..." : "Create Tournament"}
      </button>
    </form>
  );
}
