import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

// Define the relation type enum
export const relationTypeEnum = pgEnum("relation_type", ["SUPPORT", "ATTACK"]);

// Debates table
export const debates = pgTable("debates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dateCreated: timestamp("date_created").defaultNow(),
});

// Transcripts table
export const transcripts = pgTable("transcripts", {
  id: serial("id").primaryKey(),
  debateId: integer("debate_id")
    .references(() => debates.id)
    .notNull(),
  text: text("text").notNull(),
  utterances: jsonb("utterances"),
  words: jsonb("words"),
  externalId: varchar("external_id", { length: 255 }),
  confidence: real("confidence"),
  audioDuration: integer("audio_duration"),
  status: varchar("status", { length: 50 }),
  error: text("error"),
  summary: text("summary"),
});

// Arguments table
export const _arguments = pgTable("arguments", {
  id: serial("id").primaryKey(),
  debateId: integer("debate_id")
    .references(() => debates.id)
    .notNull(),
  scheme: varchar("scheme", { length: 255 }),
  conclusion: text("conclusion"),
  start: integer("start"),
  end: integer("end"),
  text: text("text"),
  speaker: varchar("speaker", { length: 255 }),
  shortName: varchar("short_name", { length: 255 }),
});

// Premises table
export const premises = pgTable("premises", {
  id: serial("id").primaryKey(),
  argumentId: integer("argument_id").references(() => _arguments.id),
  text: text("text").notNull(),
});

// Critical Questions table
export const criticalQuestions = pgTable("critical_questions", {
  id: serial("id").primaryKey(),
  argumentId: integer("argument_id").references(() => _arguments.id),
  text: text("text").notNull(),
});

export type DrizzleCriticalQuestion = InferSelectModel<
  typeof criticalQuestions
>;

export type DrizzlePremise = InferSelectModel<typeof premises>;

// Relations table
export const relationCriterionEnum = pgEnum("relation_criterion", [
  "LOGICAL_CONTRADICTION",
  "PREMISE_UNDERMINING",
  "REBUTTAL",
  "UNDERCUTTING",
  "PREMISE_REINFORCEMENT",
  "CONCLUSION_STRENGTHENING",
  "INFERENTIAL_BACKING",
  "EVIDENTIAL_SUPPORT",
  "NO_RELATION",
]);

export const _relations = pgTable("relations", {
  id: serial("id").primaryKey(),
  debateId: integer("debate_id")
    .references(() => debates.id)
    .notNull(),
  sourceId: integer("source_id")
    .references(() => _arguments.id)
    .notNull(),
  targetId: integer("target_id")
    .references(() => _arguments.id)
    .notNull(),
  type: relationTypeEnum("type").notNull(),
  criterion: relationCriterionEnum("criterion").notNull(),
  confidence: real("confidence").notNull(),
  description: text("description"),
});

export type DrizzleRelation = InferSelectModel<typeof _relations>;

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

export const argumentsRelations = relations(_arguments, ({ one, many }) => ({
  debate: one(debates, {
    fields: [_arguments.debateId],
    references: [debates.id],
  }),
  premises: many(premises),
  criticalQuestions: many(criticalQuestions),
}));

export const premisesRelations = relations(premises, ({ one }) => ({
  argument: one(_arguments, {
    fields: [premises.argumentId],
    references: [_arguments.id],
  }),
}));

export const criticalQuestionsRelations = relations(
  criticalQuestions,
  ({ one }) => ({
    argument: one(_arguments, {
      fields: [criticalQuestions.argumentId],
      references: [_arguments.id],
    }),
  })
);

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

export type NewTranscript = InferInsertModel<typeof transcripts>;

export type DrizzleArgument = InferSelectModel<typeof _arguments>;
