import express from "express";
import {
  addBudgetValidationSchema,
  transactionSchema,
  generateReportSchema,
} from "../validation_schemas/budget.validation.schemas.js";
import { authentication } from "../middlewares/auth_middlewares.js";
import { validationMiddleware } from "../middlewares/validation_schema.js";
import {
  addBudget,
  addTransaction,
  generateReport,
  getBudget,
} from "../controllers/budgetController.js";

const router = express.Router();

router.post(
  "/add-budget",
  validationMiddleware(addBudgetValidationSchema, (req) => req.body),
  authentication,
  addBudget
);
router.post(
  "/add-transaction",
  validationMiddleware(transactionSchema, (req) => req.body),
  authentication,
  addTransaction
);

router.get(
  "/get-report",
  authentication,
  validationMiddleware(generateReportSchema, (req) => req.body),
  generateReport
);
router.get("/get-budget", authentication, getBudget);

export default router;
