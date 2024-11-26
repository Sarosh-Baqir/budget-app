//import dotenv from "dotenv";
import express from "express";
//import { db } from "../db/database.js";
//import routes from "./routes/index.js";

//dotenv.config({ path: ".env" });

const app = express();

//app.use(express.static("public"));
//app.use(express.json());
//app.use("/api", routes);

// Example route
app.get("/", (req, res) => {
  console.log("in signup");
  res.send("in signup");
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
