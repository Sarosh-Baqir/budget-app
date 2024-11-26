import express from "express";

import userRoutes from "./userRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import budgetRoutes from "./budgetRoutes.js";
import labelRoutes from "./labelRoutes.js";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/budget", budgetRoutes);
router.use("/labels", labelRoutes);

export default router;
