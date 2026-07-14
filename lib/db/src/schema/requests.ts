import { pgTable, serial, text, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requestsTable = pgTable("requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  contactInfo: text("contact_info"),
  text: text("text").notNull(),
  department: text("department").notNull(), // hr, it, finance, legal, complaints, general
  departmentLabel: text("department_label").notNull(),
  confidence: real("confidence").notNull().default(0),
  reasoning: text("reasoning"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  status: text("status").notNull().default("new"), // new, in_progress, resolved, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requestsTable.$inferSelect;
