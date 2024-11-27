import { mysqlTable, varchar, decimal, timestamp, int } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { category } from "./category.js";

export const label = mysqlTable("label", {
  id: int("id").notNull().autoincrement().unique().primaryKey(),
  categoryId: int("category_id").notNull().references(() => category.id),
  name: varchar("name", { length: 100 }).notNull(),
  amount: decimal("amount", 10, 2).default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const labelRelations = relations(label, ({ one, many }) => ({
  category: one(category, {
    fields: [label.categoryId],
    references: [category.id],
  }),
}));