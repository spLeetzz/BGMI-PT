"use client";

import { useState } from "react";

type Player = { id: number; ign: string; slot: number; teamId: number };
type Team = { id: number; name: string; teamIdCustom: string | null; slot: number };

type Props = {
  tournamentId: number;
  initialTeams: Team[];
  initialPlayers: Player[];
};

export default function RosterManager({ tournamentId, initialTeams, initialPlayers }: Props) {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [search, setSearch] = useState("");

  // Edit Team States
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamCustomId, setEditTeamCustomId] = useState("");

  // Edit Player States
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editPlayerIgn, setEditPlayerIgn] = useState("");

  // Add Player States
  const [addingPlayerTeamId, setAddingPlayerTeamId] = useState<number | null>(null);
  const [newPlayerIgn, setNewPlayerIgn] = useState("");

  // Add Team States
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamCustomId, setNewTeamCustomId] = useState("");
  const [newTeamSlot, setNewTeamSlot] = useState("");

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtered teams
  const filteredTeams = teams
    .filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.teamIdCustom && t.teamIdCustom.toLowerCase().includes(search.toLowerCase())) ||
        t.slot.toString() === search
    )
    .sort((a, b) => a.slot - b.slot);

  // Team CRUD
  async function handleSaveTeam(teamId: number) {
    if (!editTeamName.trim()) return;
    setLoading(`team-save-${teamId}`);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTeamName.trim(), teamIdCustom: editTeamCustomId.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? data.data : t)));
        setEditingTeamId(null);
      } else {
        setError(data.error ?? "Failed to update team.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDeleteTeam(teamId: number) {
    if (!confirm("Are you sure you want to delete this team? This will delete all its players and match scores!")) return;
    setLoading(`team-delete-${teamId}`);
    setError(null);
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => prev.filter((t) => t.id !== teamId));
        setPlayers((prev) => prev.filter((p) => p.teamId !== teamId));
      } else {
        setError(data.error ?? "Failed to delete team.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleAddTeam() {
    if (!newTeamName.trim() || !newTeamSlot.trim()) return;
    const slotNum = parseInt(newTeamSlot);
    if (isNaN(slotNum)) {
      setError("Slot must be a number.");
      return;
    }
    setLoading("team-add");
    setError(null);
    try {
      // Send creation request. Since we don't have a direct /api/teams route for individual creation,
      // let's check if we need to implement one. Let's create `/api/teams/route.ts` if needed.
      // Wait, we can implement it in /api/teams/route.ts!
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: tournamentId,
          name: newTeamName.trim(),
          teamIdCustom: newTeamCustomId.trim() || null,
          slot: slotNum,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => [...prev, data.data]);
        setNewTeamName("");
        setNewTeamCustomId("");
        setNewTeamSlot("");
        setAddingTeam(false);
      } else {
        setError(data.error ?? "Failed to add team.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  // Player CRUD
  async function handleSavePlayer(playerId: number) {
    if (!editPlayerIgn.trim()) return;
    setLoading(`player-save-${playerId}`);
    setError(null);
    try {
      const res = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ign: editPlayerIgn.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayers((prev) => prev.map((p) => (p.id === playerId ? data.data : p)));
        setEditingPlayerId(null);
      } else {
        setError(data.error ?? "Failed to update player.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDeletePlayer(playerId: number) {
    if (!confirm("Delete this player from the roster?")) return;
    setLoading(`player-delete-${playerId}`);
    setError(null);
    try {
      const res = await fetch(`/api/players/${playerId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPlayers((prev) => prev.filter((p) => p.id !== playerId));
      } else {
        setError(data.error ?? "Failed to delete player.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleAddPlayer(teamId: number) {
    if (!newPlayerIgn.trim()) return;
    const teamPlayers = players.filter((p) => p.teamId === teamId);
    if (teamPlayers.length >= 10) {
      setError("Max 10 players per team.");
      return;
    }
    setLoading(`player-add-${teamId}`);
    setError(null);
    const nextSlot = Math.max(0, ...teamPlayers.map((p) => p.slot)) + 1;
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId, ign: newPlayerIgn.trim(), slot: nextSlot }),
      });
      const data = await res.json();
      if (data.success) {
        setPlayers((prev) => [...prev, data.data]);
        setNewPlayerIgn("");
        setAddingPlayerTeamId(null);
      } else {
        setError(data.error ?? "Failed to add player.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="🔍 Search teams by name or slot number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2.5 rounded-xl border border-border text-sm bg-background/50 focus:bg-background"
        />

        <button
          onClick={() => setAddingTeam(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary-dim transition-all hover:-translate-y-0.5 duration-200"
        >
          ➕ Add Custom Team
        </button>
      </div>

      {error && (
        <div className="text-xs border border-red-500/30 bg-red-500/5 text-red-400 font-semibold p-3.5 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* Add Team Panel */}
      {addingTeam && (
        <div className="glass-card rounded-2xl p-5 border border-primary/30 bg-primary/[0.01] flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground">🛡️ Add New Team</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Team Name (e.g. Soul)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border text-xs bg-background"
            />
            <input
              placeholder="Custom Team ID/Tag (optional)"
              value={newTeamCustomId}
              onChange={(e) => setNewTeamCustomId(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border text-xs bg-background"
            />
            <input
              placeholder="Slot Number (e.g. 1)"
              type="number"
              value={newTeamSlot}
              onChange={(e) => setNewTeamSlot(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border text-xs bg-background"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTeam}
              disabled={loading === "team-add"}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-hover text-white disabled:opacity-50"
            >
              {loading === "team-add" ? "Adding..." : "Add Team"}
            </button>
            <button
              onClick={() => setAddingTeam(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-muted hover:text-foreground border border-border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      <div className="flex flex-col gap-4">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 text-muted glass-card border border-border rounded-2xl">
            <p className="text-sm">No teams found matching search criteria.</p>
          </div>
        ) : (
          filteredTeams.map((team) => {
            const teamPlayers = players.filter((p) => p.teamId === team.id).sort((a, b) => a.slot - b.slot);

            return (
              <div
                key={team.id}
                className="glass-card rounded-2xl border border-border/80 shadow-md p-5 flex flex-col gap-4 bg-card/40"
              >
                {/* Team Title Card */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold tracking-wider text-muted bg-surface border border-border px-2.5 py-1 rounded-lg">
                      Slot {team.slot}
                    </span>
                    {editingTeamId === team.id ? (
                      <div className="flex gap-2 items-center flex-wrap">
                        <input
                          value={editTeamName}
                          onChange={(e) => setEditTeamName(e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs bg-background font-bold text-foreground"
                          placeholder="Team Name"
                        />
                        <input
                          value={editTeamCustomId}
                          onChange={(e) => setEditTeamCustomId(e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-border text-xs bg-background font-mono text-muted"
                          placeholder="Custom ID"
                        />
                        <button
                          onClick={() => handleSaveTeam(team.id)}
                          disabled={loading === `team-save-${team.id}`}
                          className="text-[10px] font-bold px-3 py-1 rounded-lg bg-primary text-white disabled:opacity-50"
                        >
                          {loading === `team-save-${team.id}` ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingTeamId(null)}
                          className="text-[10px] font-bold text-muted hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">{team.name}</span>
                        {team.teamIdCustom && (
                          <span className="text-xs font-mono font-bold text-muted bg-surface/80 border border-border/40 px-1.5 py-0.5 rounded">
                            {team.teamIdCustom}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setEditingTeamId(team.id);
                            setEditTeamName(team.name);
                            setEditTeamCustomId(team.teamIdCustom || "");
                          }}
                          className="text-xs text-muted hover:text-primary transition-colors ml-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    disabled={loading === `team-delete-${team.id}`}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    🗑️ Delete Team
                  </button>
                </div>

                {/* Team Players Roster */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Roster Players ({teamPlayers.length}/10)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-1">
                    {teamPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/20 hover:bg-background/40 transition-colors"
                      >
                        {editingPlayerId === player.id ? (
                          <div className="flex gap-1.5 w-full">
                            <input
                              value={editPlayerIgn}
                              onChange={(e) => setEditPlayerIgn(e.target.value)}
                              className="flex-1 px-2 py-0.5 rounded-lg border border-border text-xs bg-background"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSavePlayer(player.id);
                                if (e.key === "Escape") setEditingPlayerId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSavePlayer(player.id)}
                              disabled={loading === `player-save-${player.id}`}
                              className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary text-white"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingPlayerId(null)}
                              className="text-[9px] font-bold text-muted"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                              {player.ign}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingPlayerId(player.id);
                                  setEditPlayerIgn(player.ign);
                                }}
                                className="text-[10px] text-muted hover:text-primary transition-colors"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeletePlayer(player.id)}
                                disabled={loading === `player-delete-${player.id}`}
                                className="text-[10px] text-muted hover:text-red-400 transition-colors disabled:opacity-50"
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add Player Box */}
                    {addingPlayerTeamId === team.id ? (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.01]">
                        <input
                          placeholder="Player IGN"
                          value={newPlayerIgn}
                          onChange={(e) => setNewPlayerIgn(e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded-lg border border-border text-xs bg-background"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddPlayer(team.id);
                            if (e.key === "Escape") setAddingPlayerTeamId(null);
                          }}
                        />
                        <button
                          onClick={() => handleAddPlayer(team.id)}
                          disabled={loading === `player-add-${team.id}`}
                          className="text-[10px] font-bold px-2 py-1.5 rounded-lg bg-primary text-white disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingPlayerTeamId(null)}
                          className="text-[10px] font-bold text-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      teamPlayers.length < 10 && (
                        <button
                          onClick={() => {
                            setAddingPlayerTeamId(team.id);
                            setNewPlayerIgn("");
                          }}
                          className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-muted hover:text-primary transition-all duration-200 bg-background/5"
                        >
                          ➕ Add Player
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
