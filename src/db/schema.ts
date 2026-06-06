import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const pointsSystems = pgTable("points_systems", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  rules: jsonb("rules").$type<{ position: number; points: number }[]>().notNull(),
  killPoints: integer("kill_points").notNull().default(1),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  pointsSystemId: integer("points_system_id").references(() => pointsSystems.id),
  adminToken: varchar("admin_token", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  slot: integer("slot").notNull(),
  teamIdCustom: varchar("team_id_custom", { length: 50 }),
  name: varchar("name", { length: 100 }).notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  ign: varchar("ign", { length: 100 }).notNull(),
  slot: integer("slot").notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  order: integer("order").notNull().default(0),
});

export const matchResults = pgTable("match_results", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  placementPoints: integer("placement_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerKills = pgTable("player_kills", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  kills: integer("kills").notNull().default(0),
});
