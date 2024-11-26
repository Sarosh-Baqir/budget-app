import { mysqlTable, varchar, bigint, int } from "drizzle-orm/mysql-core";

const blackListToken = mysqlTable("blacklisttokens", {
  id: int("id").notNull().autoincrement().unique().primaryKey(),
  token: varchar("token", { length: 255 }).notNull(),
  expire_time: bigint("expire_time", { mode: "number" }),
});

export default blackListToken;
