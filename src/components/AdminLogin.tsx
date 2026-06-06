"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAdminToken } from "@/lib/storage";

type Props = { slug: string };

export default function AdminLogin({ slug }: Props) {
  const [token, setToken] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    saveAdminToken(slug, token.trim());
    setToken("");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="p-4 border-t border-border/40 flex flex-col gap-2.5">
      {open ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Enter Admin Passcode
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Passcode"
            className="w-full px-2.5 py-1.5 rounded-lg border border-border text-xs bg-background/50 focus:bg-background"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-primary text-white"
            >
              Access
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 text-[10px] font-bold text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-left text-xs font-semibold text-muted hover:text-primary transition-colors flex items-center gap-1.5"
        >
          🔐 Admin Access
        </button>
      )}
    </div>
  );
}
