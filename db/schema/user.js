import { mysqlTable, int, varchar, timestamp, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { transaction } from "./transaction.js";
import { category } from "./category.js";

export const user = mysqlTable("user", {
  id: int("id").notNull().autoincrement().unique().primaryKey(),
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  cnic: varchar("cnic", { length: 15 }),
  is_verified: boolean("is_verified").default(false),
  otp: varchar("otp", { length: 6 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  categories: many(category),
  transactions: many(transaction),
}));
