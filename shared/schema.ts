import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['company', 'contractor', 'admin']);
export const projectStatusEnum = pgEnum('project_status', ['open', 'in_progress', 'completed', 'cancelled']);
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'accepted', 'rejected', 'withdrawn']);
export const milestoneStatusEnum = pgEnum('milestone_status', ['pending', 'completed', 'verified', 'paid']);
export const projectCategoryEnum = pgEnum('project_category', [
  'construction', 
  'electrical', 
  'painting', 
  'plumbing', 
  'labour', 
  'transportation', 
  'other'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// User profiles - common fields
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  avatar: text("avatar"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Company-specific profile info
export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  companySize: text("company_size"),
  industry: text("industry"),
  yearFounded: integer("year_founded")
});

// Contractor-specific profile info
export const contractorProfiles = pgTable("contractor_profiles", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  specialization: text("specialization"),
  yearsOfExperience: integer("years_of_experience"),
  skills: text("skills").array(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 })
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: projectCategoryEnum("category").notNull(),
  location: text("location").notNull(),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }).notNull(),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  duration: text("duration"), // e.g., "2-3 months"
  status: projectStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Project requirements or specifications
export const projectRequirements = pgTable("project_requirements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  requirement: text("requirement").notNull(),
  isRequired: boolean("is_required").default(true)
});

// Bids made by contractors on projects
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  contractorId: integer("contractor_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  deliveryTime: text("delivery_time"), // e.g., "4 weeks"
  status: bidStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Project contracts (after a bid is accepted)
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  bidId: integer("bid_id").notNull().references(() => bids.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  termsAndConditions: text("terms_and_conditions"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Payment milestones for projects
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  completionDate: timestamp("completion_date"),
  verificationDate: timestamp("verification_date"),
  paymentDate: timestamp("payment_date"),
  paymentReference: text("payment_reference"),
  deliverableUrl: text("deliverable_url"),
  notes: text("notes"),
  order: integer("order").default(0),
  status: milestoneStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Reviews left by companies for contractors
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  revieweeId: integer("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Messages between companies and contractors
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  projectsAsCompany: many(projects),
  bidsAsContractor: many(bids, { relationName: "contractor_bids" }),
  sentMessages: many(messages, { relationName: "sent_messages" }),
  receivedMessages: many(messages, { relationName: "received_messages" }),
  reviewsGiven: many(reviews, { relationName: "reviews_given" }),
  reviewsReceived: many(reviews, { relationName: "reviews_received" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  companyProfile: one(companyProfiles),
  contractorProfile: one(contractorProfiles),
}));

export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  profile: one(profiles, { fields: [companyProfiles.profileId], references: [profiles.id] }),
}));

export const contractorProfilesRelations = relations(contractorProfiles, ({ one }) => ({
  profile: one(profiles, { fields: [contractorProfiles.profileId], references: [profiles.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(users, { fields: [projects.companyId], references: [users.id] }),
  requirements: many(projectRequirements),
  bids: many(bids),
  reviews: many(reviews),
  messages: many(messages),
}));

export const projectRequirementsRelations = relations(projectRequirements, ({ one }) => ({
  project: one(projects, { fields: [projectRequirements.projectId], references: [projects.id] }),
}));

export const bidsRelations = relations(bids, ({ one, many }) => ({
  project: one(projects, { fields: [bids.projectId], references: [projects.id] }),
  contractor: one(users, { fields: [bids.contractorId], references: [users.id] }),
  contract: one(contracts),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  project: one(projects, { fields: [contracts.projectId], references: [projects.id] }),
  bid: one(bids, { fields: [contracts.bidId], references: [bids.id] }),
  milestones: many(milestones),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  contract: one(contracts, { fields: [milestones.contractId], references: [contracts.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  project: one(projects, { fields: [reviews.projectId], references: [projects.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id] }),
  reviewee: one(users, { fields: [reviews.revieweeId], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id] }),
  project: one(projects, { fields: [messages.projectId], references: [projects.id] }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Must provide a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['company', 'contractor', 'admin'], { required_error: "Role must be either company, contractor, or admin" })
});

export const insertProfileSchema = createInsertSchema(profiles, {
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactEmail: z.string().email("Must provide a valid contact email").optional().nullable()
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles);
export const insertContractorProfileSchema = createInsertSchema(contractorProfiles);

export const insertProjectSchema = createInsertSchema(projects, {
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  budgetMin: z.number().gt(0, "Minimum budget must be greater than 0"),
  budgetMax: z.number().gt(0, "Maximum budget must be greater than 0"),
});

export const insertBidSchema = createInsertSchema(bids, {
  amount: z.number().gt(0, "Bid amount must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters")
});

export const insertMilestoneSchema = createInsertSchema(milestones, {
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  amount: z.number().gt(0, "Amount must be greater than 0"),
  order: z.number().int().nonnegative("Order must be a non-negative integer")
});

export const updateMilestoneStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['pending', 'completed', 'verified', 'paid']),
  notes: z.string().optional(),
  deliverableUrl: z.string().url("Must provide a valid URL").optional().nullable()
});

export const insertReviewSchema = createInsertSchema(reviews, {
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be greater than 5")
});

export const insertMessageSchema = createInsertSchema(messages, {
  content: z.string().min(1, "Message cannot be empty")
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type CompanyProfile = typeof companyProfiles.$inferSelect;

export type InsertContractorProfile = z.infer<typeof insertContractorProfileSchema>;
export type ContractorProfile = typeof contractorProfiles.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;

export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type UpdateMilestoneStatus = z.infer<typeof updateMilestoneStatusSchema>;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
