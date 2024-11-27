import { mysqlTable, int, timestamp, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { user } from "./user.js";

export const budget = mysqlTable("budget", {
  id: int("id").notNull().autoincrement().unique().primaryKey(),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }).default(0),
  spentBudget: decimal("spent_budget", { precision: 10, scale: 2 }).default(0),
  remainingBudget: decimal("remaining_budget", { precision: 10, scale: 2,}).default(0),
  last_reset_date: timestamp("last_reset_date").defaultNow(),
  userId: int("user_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});


export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, {
    fields: [budget.userId],
    references: [user.id],
  }),
}));