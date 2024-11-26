import express from "express";
import {
  addCategoryValidationSchema,
  updatePlannedBudgetSchema,
} from "../validation_schemas/category.validation.schemas.js";
import { authentication } from "../middlewares/auth_middlewares.js";
import { validationMiddleware } from "../middlewares/validation_schema.js";
import {
  addCategory,
  getCategoriesWithLabels,
  updatePlannedBudget,
} from "../controllers/categoryController.js";
import { checkCategoryAlreadyExist } from "../middlewares/avoidDuplicate_middleware.js";

const router = express.Router();

router.post(
  "/add-category",
  authentication,
  validationMiddleware(addCategoryValidationSchema, (req) => req.body),
  checkCategoryAlreadyExist,
  addCategory
);

router.post(
  "/update-plannedBudget",
  authentication,
  validationMiddleware(updatePlannedBudgetSchema, (req) => req.body),
  updatePlannedBudget
);

router.get("/", authentication, getCategoriesWithLabels);

export default router;
