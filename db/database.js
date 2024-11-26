import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import schema from "./schema/index.js";
import { user } from "./schema/user.js";

const poolConnection = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "C8ed2377",
  database: "test",
});

// Test the database connection
(async () => {
  try {
    const connection = await poolConnection.getConnection(); // Test connection
    console.log("Database connection has been established successfully!");
    connection.release();
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
})();

const db = drizzle({ client: poolConnection, schema: schema, mode: "default" });

export { db };
