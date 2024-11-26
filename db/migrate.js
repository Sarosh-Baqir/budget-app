import { migrate } from "drizzle-orm/mysql2/migrator";
import { db } from "./database.js";

console.log("Migration folder: ", "../migrations");

migrate(db, { migrationsFolder: "../migrations" })
  .then(() => {
    console.log("Migrations complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migrations failed!", err);
    process.exit(1);
  });
