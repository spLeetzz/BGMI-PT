"use client";

import { useState } from "react";

type Player = { id: number; ign: string; slot: number; kills: number };
type Team = { id: number; name: string; teamIdCustom: string | null; slot: number };
type Result = { id: number; position: number; placementPoints: number } | null;

type Props = {
  team: Team;
  players: Player[];
  matchId: number;
  existingResult: Result;
  isAdmin: boolean;
};

export default function TeamCard({ team, players: initialPlayers, matchId, existingResult, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(existingResult?.position?.toString() ?? "");
  const [playerKills, setPlayerKills] = useState<Record<number, string>>(
    Object.fromEntries(initialPlayers.map((p) => [p.id, p.kills.toString()]))
  );
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [saved, setSaved] = useState(!!existingResult);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit IGN states
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editIgnValue, setEditIgnValue] = useState("");

  // Add player states
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newIgn, setNewIgn] = useState("");

  async function handleSave() {
    if (!isAdmin) return;
    if (!position || isNaN(parseInt(position))) {
      setError("Enter a valid position.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          team_id: team.id,
          position: parseInt(position),
          kills_per_player: players.map((p) => ({
            player_id: p.id,
            kills: parseInt(playerKills[p.id] ?? "0") || 0,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      setSaved(true);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditIgnSave(playerId: number) {
    if (!isAdmin || !editIgnValue.trim()) return;
    const res = await fetch(`/api/players/${playerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ign: editIgnValue.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? { ...p, ign: data.data.ign } : p)));
      setEditingPlayer(null);
    }
  }

  async function handleAddPlayer() {
    if (!isAdmin || !newIgn.trim()) return;
    if (players.length >= 10) {
      setError("Max 10 players per team.");
      return;
    }
    const nextSlot = Math.max(0, ...players.map((p) => p.slot)) + 1;
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: team.id, ign: newIgn.trim(), slot: nextSlot }),
    });
    const data = await res.json();
    if (data.success) {
      const newPlayer = { ...data.data, kills: 0 };
      setPlayers((prev) => [...prev, newPlayer]);
      setPlayerKills((prev) => ({ ...prev, [newPlayer.id]: "0" }));
      setNewIgn("");
      setAddingPlayer(false);
    }
  }

  const isChicken = position === "1";

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
        saved
          ? isChicken
            ? "border-yellow-500/50 bg-yellow-500/[0.02] shadow-yellow-500/5"
            : "border-primary/40 bg-primary/[0.01]"
          : "border-border bg-card/60"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.01]"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono font-bold tracking-wider text-muted bg-surface border border-border px-2 py-1 rounded-lg">
            Slot {team.slot}
          </span>
          <div>
            <span className="font-bold text-sm text-foreground">{team.name}</span>
            {team.teamIdCustom && (
              <span className="ml-2 text-xs font-mono font-bold text-muted bg-surface/80 border border-border/40 px-1.5 py-0.5 rounded">
                {team.teamIdCustom}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isChicken
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                  : "bg-primary/10 border-primary/20 text-primary"
              }`}
            >
              {isChicken ? "🍗 Chicken Winner" : `Position #${position}`}
            </span>
          )}
          <span className="text-xs font-bold text-muted group-hover:text-foreground">
            {open ? "▼ Collapse" : "▲ Expand"}
          </span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border/80 bg-background/25 flex flex-col gap-5 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Finish Position
              </label>
              {isAdmin ? (
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value);
                    setSaved(false);
                  }}
                  className="w-28 px-3.5 py-2 rounded-xl border border-border text-sm bg-background/50 focus:bg-background font-mono font-bold"
                  placeholder="e.g. 1"
                />
              ) : (
                <span className="text-sm font-mono font-bold text-foreground bg-surface px-3 py-1.5 rounded-lg border border-border">
                  {position ? `#${position}` : "Not Played"}
                </span>
              )}
            </div>

            <div className="text-xs text-muted font-medium">
              Players count: <span className="text-foreground font-bold">{players.length}</span> / 10
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Roster & Finishes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/30"
                >
                  {isAdmin && editingPlayer === p.id ? (
                    <div className="flex gap-2 w-full">
                      <input
                        value={editIgnValue}
                        onChange={(e) => setEditIgnValue(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg border border-border text-xs bg-background"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditIgnSave(p.id);
                          if (e.key === "Escape") setEditingPlayer(null);
                        }}
                      />
                      <button
                        onClick={() => handleEditIgnSave(p.id)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-primary text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className="text-[10px] font-bold text-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 max-w-[60%]">
                        <span className="text-xs font-semibold text-foreground truncate" title={p.ign}>
                          {p.ign}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingPlayer(p.id);
                              setEditIgnValue(p.ign);
                            }}
                            className="text-[10px] text-muted hover:text-primary transition-colors"
                          >
                            ✏️
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Kills
                        </label>
                        {isAdmin ? (
                          <input
                            type="number"
                            min={0}
                            value={playerKills[p.id] ?? "0"}
                            onChange={(e) => {
                              setPlayerKills((prev) => ({ ...prev, [p.id]: e.target.value }));
                              setSaved(false);
                            }}
                            className="w-14 px-2 py-1 rounded-lg border border-border text-xs bg-background/50 text-center font-mono font-bold focus:bg-background"
                          />
                        ) : (
                          <span className="text-xs font-mono font-bold text-foreground bg-surface/80 border border-border/40 px-2.5 py-0.5 rounded-lg">
                            {playerKills[p.id] ?? 0}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {isAdmin && players.length < 10 && (
              <div className="mt-1">
                {addingPlayer ? (
                  <div className="flex gap-2 max-w-sm">
                    <input
                      value={newIgn}
                      onChange={(e) => setNewIgn(e.target.value)}
                      placeholder="Player IGN"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs bg-background/50"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddPlayer();
                        if (e.key === "Escape") setAddingPlayer(false);
                      }}
                    />
                    <button
                      onClick={handleAddPlayer}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAddingPlayer(false)}
                      className="text-xs font-bold text-muted hover:text-foreground px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingPlayer(true)}
                    className="text-xs font-semibold text-muted hover:text-primary transition-colors"
                  >
                    ➕ Add Player
                  </button>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-50 w-fit"
            >
              {saving ? "Saving..." : "Save Match Results"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
