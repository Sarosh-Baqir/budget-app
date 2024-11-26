import { defineConfig } from "drizzle-kit";

const config = {
  dialect: "mysql",
  schema: "./db/schema",
  out: "./migrations",
  dbCredentials: {
    url: "mysql://root:C8ed2377@127.0.0.1:3306/test",
  },
};

console.log("Drizzle config:", config);
export default defineConfig(config);
