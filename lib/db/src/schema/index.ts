// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Server-owned document store for SquadCraft's existing table-shaped API. */
export const squadcraftRows = pgTable("squadcraft_rows", {
  id: uuid("id").primaryKey(),
  tableName: text("table_name").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const squadcraftUsers = pgTable("squadcraft_users", {
  id: uuid("id").primaryKey(),
  prenom: text("prenom").notNull(),
  codeHash: text("code_hash").notNull(),
  patrouilleId: uuid("patrouille_id"),
  role: text("role").notNull().default("MEMBRE"),
  statut: text("statut").notNull().default("ACTIF"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const squadcraftSessions = pgTable("squadcraft_sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});