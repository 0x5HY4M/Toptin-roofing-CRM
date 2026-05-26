import { pgTable, text, serial, timestamp, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";
import { crewMembersTable } from "./crew";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  status: text("status").notNull().default("pending"),
  roofType: text("roof_type").notNull(),
  address: text("address").notNull(),
  squareFootage: numeric("square_footage", { precision: 10, scale: 2 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  assignedCrewId: integer("assigned_crew_id").references(() => crewMembersTable.id),
  contractValue: numeric("contract_value", { precision: 12, scale: 2 }),
  materialCost: numeric("material_cost", { precision: 12, scale: 2 }),
  laborCost: numeric("labor_cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
  progressPercent: integer("progress_percent").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
