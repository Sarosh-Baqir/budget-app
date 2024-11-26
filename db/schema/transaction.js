import {
  mysqlTable,
  boolean,
  mysqlEnum,
  varchar,
  decimal,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";
import { label } from "./label.js";
import { user } from "./user.js";
import { category } from "./category.js";

export const transaction = mysqlTable("transaction", {
  id: int("id").notNull().autoincrement().unique().primaryKey(),
  labelId: int("label_id")
    .notNull()
    .references(() => label.id),
  userId: int("user_id")
    .notNull()
    .references(() => user.id),
  categoryId: int("category_id")
    .notNull()
    .references(() => category.id),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  amount: decimal("amount", 10, 2).notNull(),
  date: timestamp("transaction_date").notNull(),
  notes: varchar("notes", { length: 255 }),
  is_scheduled: boolean("is_scheduled").default(false).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled", "none"])
    .default("none")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updated_at: timestamp().defaultNow().onUpdateNow(),
});
