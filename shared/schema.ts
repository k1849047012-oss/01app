import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

// Export Auth Models
export * from "./models/auth";

// === PROFILES ===
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // "male", "female", "other"
  city: text("city").notNull(),
  bio: text("bio"),
  photos: text("photos").array().notNull(), // URLs
  exposureScore: integer("exposure_score").notNull().default(100),
  dislikeCount: integer("dislike_count").notNull().default(0),
  blockCount: integer("block_count").notNull().default(0),
  chatFailCount: integer("chat_fail_count").notNull().default(0),
  isDeleted: boolean("is_deleted").notNull().default(false),
  blockedUsers: text("blocked_users").array().notNull().default([]), // Array of user IDs this user has blocked
  isUnderage: boolean("is_underage").notNull().default(false),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true });
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

// === SWIPES ===
export const swipes = pgTable("swipes", {
  id: serial("id").primaryKey(),
  swiperId: varchar("swiper_id").notNull().references(() => users.id),
  targetId: varchar("target_id").notNull().references(() => users.id),
  direction: text("direction", { enum: ["LIKE", "PASS"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSwipeSchema = createInsertSchema(swipes).omit({ id: true, createdAt: true });
export type Swipe = typeof swipes.$inferSelect;
export type InsertSwipe = z.infer<typeof insertSwipeSchema>;

// === MATCHES ===
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  user1Id: varchar("user_1_id").notNull().references(() => users.id),
  user2Id: varchar("user_2_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Match = typeof matches.$inferSelect;

// === MESSAGES ===
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// === RELATIONS ===
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  swiper: one(users, {
    fields: [swipes.swiperId],
    references: [users.id],
    relationName: "swipes_sent",
  }),
  target: one(users, {
    fields: [swipes.targetId],
    references: [users.id],
    relationName: "swipes_received",
  }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "matches_user1",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "matches_user2",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
