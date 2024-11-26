import express from "express";
import { addLabelValidationSchema } from "../validation_schemas/label.validation.schemas.js";
import { authentication } from "../middlewares/auth_middlewares.js";
import { validationMiddleware } from "../middlewares/validation_schema.js";
import { addLabel } from "../controllers/labelController.js";
import { checkLabelAlreadyExist } from "../middlewares/avoidDuplicate_middleware.js";

const router = express.Router();

router.post(
  "/add-label",
  authentication,
  validationMiddleware(addLabelValidationSchema, (req) => req.body),
  checkLabelAlreadyExist,
  addLabel
);

export default router;
