import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  country: varchar("country"),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Grant categories enum
export const grantCategoryEnum = pgEnum('grant_category', [
  'education',
  'business', 
  'healthcare',
  'housing',
  'emergency',
  'seniors',
  'research',
  'innovation',
  'homebuyer',
  'financial_relief'
]);

// Grant status enum
export const grantStatusEnum = pgEnum('grant_status', [
  'active',
  'closed',
  'draft'
]);

// Application status enum
export const applicationStatusEnum = pgEnum('application_status', [
  'pending',
  'under_review',
  'qualified',
  'not_qualified',
  'selected',
  'awarded',
  'rejected'
]);

// Countries table
export const countries = pgTable("countries", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  currency: varchar("currency", { length: 3 }).notNull(),
  flag: varchar("flag"),
  active: boolean("active").default(true),
});

// Grants table
export const grants = pgTable("grants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: grantCategoryEnum("category").notNull(),
  countryId: varchar("country_id").notNull().references(() => countries.id),
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),
  amount: decimal("amount", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).notNull(),
  amountType: varchar("amount_type").default('flexible'), // 'fixed', 'range', 'flexible'
  totalSpots: integer("total_spots").notNull(),
  availableSpots: integer("available_spots").notNull(),
  deadline: timestamp("deadline"),
  status: grantStatusEnum("status").default('active'),
  eligibilityCriteria: text("eligibility_criteria"),
  applicationInstructions: text("application_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Grant applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grantId: varchar("grant_id").notNull().references(() => grants.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  address: varchar("address").notNull(),
  reasonForApplying: text("reason_for_applying").notNull(),
  referralName: varchar("referral_name"),
  hasReferral: boolean("has_referral").default(false),
  autoQualified: boolean("auto_qualified").default(false),
  status: applicationStatusEnum("status").default('pending'),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  selectedAt: timestamp("selected_at"),
  notes: text("notes"),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default('new'),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Grant awards table (for tracking distributed grants)
export const grantAwards = pgTable("grant_awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grantId: varchar("grant_id").notNull().references(() => grants.id),
  applicationId: varchar("application_id").notNull().references(() => applications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
  disbursedAt: timestamp("disbursed_at"),
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  awards: many(grantAwards),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  grants: many(grants),
}));

export const grantsRelations = relations(grants, ({ one, many }) => ({
  country: one(countries, {
    fields: [grants.countryId],
    references: [countries.id],
  }),
  applications: many(applications),
  awards: many(grantAwards),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  grant: one(grants, {
    fields: [applications.grantId],
    references: [grants.id],
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const grantAwardsRelations = relations(grantAwards, ({ one }) => ({
  grant: one(grants, {
    fields: [grantAwards.grantId],
    references: [grants.id],
  }),
  application: one(applications, {
    fields: [grantAwards.applicationId],
    references: [applications.id],
  }),
  user: one(users, {
    fields: [grantAwards.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCountrySchema = createInsertSchema(countries);

export const insertGrantSchema = createInsertSchema(grants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  selectedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  status: true,
});

export const insertGrantAwardSchema = createInsertSchema(grantAwards).omit({
  id: true,
  awardedAt: true,
  disbursedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Country = typeof countries.$inferSelect;
export type Grant = typeof grants.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type GrantAward = typeof grantAwards.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertGrant = z.infer<typeof insertGrantSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertGrantAward = z.infer<typeof insertGrantAwardSchema>;

// Extended types for joined data
export type GrantWithCountry = Grant & {
  countries: Country | null;
  country?: Country | null; // For backward compatibility
};

export type ApplicationWithDetails = Application & {
  grant: GrantWithCountry;
  user: User;
};
