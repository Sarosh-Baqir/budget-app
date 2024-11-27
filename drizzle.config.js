import 'dotenv/config'
import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from './src/utils/constants';

const config = {
  dialect: "mysql",
  schema: "./db/schema",
  out: "./migrations",
  dbCredentials: {
    url: DATABASE_URL,
  },
};

export default defineConfig(config);
