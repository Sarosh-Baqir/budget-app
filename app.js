import dotenv from "dotenv";
import express from "express";
import { db } from "./db/database.js";
import routes from "./src/routes/index.js";

dotenv.config({ path: ".env" });

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use("/api", routes);
// Example route
app.get("/", (req, res) => {
  res.send("Welcome to Express with Drizzle ORM!");
});

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});
