"use client";

import { useRef, useState, useTransition } from "react";
import { uploadTeams } from "@/actions/uploadTeams";
import { downloadTemplate } from "@/actions/downloadTemplate";

type Props = { tournamentId: number };

export default function UploadForm({ tournamentId }: Props) {
  const [result, setResult] = useState<{ success?: boolean; inserted?: number; errors?: string[]; error?: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("tournament_id", String(tournamentId));
    startTransition(async () => {
      const res = await uploadTeams(formData);
      setResult(res);
      if (res.success) formRef.current?.reset();
    });
  }

  async function handleDownloadTemplate() {
    const csv = await downloadTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roster_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted">
            Choose CSV Roster File
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-background/50 hover:bg-background hover:border-primary/50 transition-all duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <span className="text-2xl mb-2">📁</span>
                <p className="text-xs text-muted mb-1 font-medium">
                  <span className="text-primary font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-[10px] text-muted/60">CSV file format only</p>
              </div>
              <input
                name="csv"
                type="file"
                accept=".csv"
                required
                className="hidden"
                onChange={() => setResult(null)}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50"
          >
            {pending ? "Processing..." : "Import CSV Roster"}
          </button>
          
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="text-xs font-semibold text-muted hover:text-foreground transition-colors py-2"
          >
            📥 Download Template CSV
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-2 text-xs border border-border/80 rounded-xl p-4 bg-background/30">
          {result.error && (
            <div className="flex items-center gap-2 text-red-500 font-semibold">
              <span>❌</span> {result.error}
            </div>
          )}
          {result.inserted != null && result.success && (
            <div className="flex items-center gap-2 text-green-500 font-semibold mb-2">
              <span>✅</span> Successfully imported {result.inserted} teams!
            </div>
          )}
          {result.errors && result.errors.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2">
              <p className="font-semibold text-red-400">Import Warnings:</p>
              <ul className="max-h-36 overflow-y-auto space-y-1 pr-2">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-red-400/80 font-mono list-disc list-inside">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
