import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the relation type enum
export const relationTypeEnum = pgEnum("relation_type", [
  "support",
  "attack",
  "other",
]);

// Debates table
export const debates = pgTable("debates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dateCreated: timestamp("date_created").defaultNow(),
});

// Transcripts table
export const transcripts = pgTable("transcripts", {
  id: uuid("id").primaryKey(),
  debateId: integer("debate_id").references(() => debates.id),
  text: text("text").notNull(),
  utterances: jsonb("utterances"),
  words: jsonb("words"),
  confidence: numeric("confidence"),
  audioDuration: numeric("audio_duration"),
  status: varchar("status", { length: 50 }),
  error: text("error"),
  summary: text("summary"),
});

// Arguments table
export const _arguments = pgTable("arguments", {
  id: serial("id").primaryKey(),
  debateId: integer("debate_id").references(() => debates.id),
  scheme: varchar("scheme", { length: 255 }),
  premises: jsonb("premises"),
  conclusion: text("conclusion"),
  criticalQuestions: jsonb("critical_questions"),
  text: text("text"),
  speaker: varchar("speaker", { length: 255 }),
});

// Relations table
export const _relations = pgTable("relations", {
  id: serial("id").primaryKey(),
  debateId: integer("debate_id").references(() => debates.id),
  sourceId: integer("source_id").references(() => _arguments.id),
  targetId: integer("target_id").references(() => _arguments.id),
  type: relationTypeEnum("type"),
});

// Define relationships
export const debatesRelations = relations(debates, ({ many }) => ({
  transcripts: many(transcripts),
  arguments: many(_arguments),
  relations: many(_relations),
}));

export const transcriptsRelations = relations(transcripts, ({ one }) => ({
  debate: one(debates, {
    fields: [transcripts.debateId],
    references: [debates.id],
  }),
}));

export const argumentsRelations = relations(_arguments, ({ one }) => ({
  debate: one(debates, {
    fields: [_arguments.debateId],
    references: [debates.id],
  }),
}));

export const relationsRelations = relations(_relations, ({ one }) => ({
  debate: one(debates, {
    fields: [_relations.debateId],
    references: [debates.id],
  }),
  sourceArgument: one(_arguments, {
    fields: [_relations.sourceId],
    references: [_arguments.id],
  }),
  targetArgument: one(_arguments, {
    fields: [_relations.targetId],
    references: [_arguments.id],
  }),
}));
