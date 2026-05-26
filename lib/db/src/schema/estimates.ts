import { pgTable, text, serial, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { projectsTable } from "./projects";

export const estimatesTable = pgTable("estimates", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  projectId: integer("project_id").references(() => projectsTable.id),
  status: text("status").notNull().default("draft"),
  roofType: text("roof_type"),
  squareFootage: numeric("square_footage", { precision: 10, scale: 2 }),
  materialCost: numeric("material_cost", { precision: 12, scale: 2 }),
  laborCost: numeric("labor_cost", { precision: 12, scale: 2 }),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  validUntil: date("valid_until"),
  lineItems: text("line_items"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEstimateSchema = createInsertSchema(estimatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;
export type Estimate = typeof estimatesTable.$inferSelect;
