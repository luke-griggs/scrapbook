import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const memberRoleEnum = pgEnum("member_role", ["owner", "admin", "member"]);
export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "expired",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Families table
export const families = pgTable("families", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Family members (join table)
export const familyMembers = pgTable("family_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: memberRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Prompt categories
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  displayOrder: varchar("display_order", { length: 10 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prompts/questions within categories
export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  displayOrder: varchar("display_order", { length: 10 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prompt invitations (sent to family members)
export const promptInvites = pgTable("prompt_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptId: uuid("prompt_id")
    .notNull()
    .references(() => prompts.id, { onDelete: "cascade" }),
  familyId: uuid("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  recipientId: uuid("recipient_id").references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  status: inviteStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
});

// Video responses to prompts
export const responses = pgTable("responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  promptInviteId: uuid("prompt_invite_id")
    .notNull()
    .references(() => promptInvites.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  durationSeconds: varchar("duration_seconds", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  familyMemberships: many(familyMembers),
  sentInvites: many(promptInvites, { relationName: "sender" }),
  responses: many(responses),
}));

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(familyMembers),
  invites: many(promptInvites),
}));

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  family: one(families, {
    fields: [familyMembers.familyId],
    references: [families.id],
  }),
  user: one(users, {
    fields: [familyMembers.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  prompts: many(prompts),
}));

export const promptsRelations = relations(prompts, ({ one, many }) => ({
  category: one(categories, {
    fields: [prompts.categoryId],
    references: [categories.id],
  }),
  invites: many(promptInvites),
}));

export const promptInvitesRelations = relations(promptInvites, ({ one, many }) => ({
  prompt: one(prompts, {
    fields: [promptInvites.promptId],
    references: [prompts.id],
  }),
  family: one(families, {
    fields: [promptInvites.familyId],
    references: [families.id],
  }),
  sender: one(users, {
    fields: [promptInvites.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [promptInvites.recipientId],
    references: [users.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  promptInvite: one(promptInvites, {
    fields: [responses.promptInviteId],
    references: [promptInvites.id],
  }),
  user: one(users, {
    fields: [responses.userId],
    references: [users.id],
  }),
}));
