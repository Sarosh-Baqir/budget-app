import {
  mysqlTable,
  varchar,
  decimal,
  mysqlEnum,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";
import { user } from "./user.js";

export const category = mysqlTable("category", {
  id: int("id").notNull().autoincrement().unique().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => user.id),
  name: varchar("name", { length: 100 }).notNull(),
  totalBudget: decimal("total_budget", 10, 2).default(0),
  spentBudget: decimal("spent_budget", 10, 2).default(0),
  remainingBudget: decimal("remaining_budget", 10, 2).default(0),
  categoryType: mysqlEnum("category_type", ["income", "expense"]).notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
