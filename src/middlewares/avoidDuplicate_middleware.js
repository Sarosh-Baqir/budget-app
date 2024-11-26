import { eq } from "drizzle-orm";
import { category } from "../../db/schema/category.js";
import { label } from "../../db/schema/label.js";
import { db } from "../../db/database.js";
import { errorResponse } from "../utils/response.handle.js";

// Middleware to check if category already exists
const checkCategoryAlreadyExist = async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await db.query.category.findFirst({
      where: eq(category.name, name),
    });

    if (data) {
      return errorResponse(res, "cagegory with this name already exists", 409);
    }
    next();
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

// Middleware to check if category already exists
const checkLabelAlreadyExist = async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await db.query.label.findFirst({
      where: eq(label.name, name),
    });

    if (data) {
      return errorResponse(res, "label with this name already exists", 409);
    }
    next();
  } catch (error) {
    errorResponse(res, error.message, 500);
  }
};

export { checkCategoryAlreadyExist, checkLabelAlreadyExist };
