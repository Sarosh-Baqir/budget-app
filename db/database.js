import 'dotenv/config'
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import schema from "./schema/index.js";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from '../src/utils/constants.js';

const poolConnection = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

(async () => {
  try {
    const connection = await poolConnection.getConnection();
    console.log("Database connection has been established successfully!");
    connection.release();
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
  }
})();

const db = drizzle({ client: poolConnection, schema: schema, mode: "default" });

export { db };
