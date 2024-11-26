import { db } from "../../db/database.js";
import { eq } from "drizzle-orm";
import { label } from "../../db/schema/label.js";
import { fetchCategory } from "../utils/helper.js";

import { successResponse, errorResponse } from "../utils/response.handle.js";
import { category } from "../../db/schema/category.js";

// API to add a new label
const addLabel = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    try {
      const data = await db
        .insert(label)
        .values({
          name,
          categoryId,
        })
        .$returningId();

      return successResponse(res, "Label has been created Successfully!", {
        data,
      });
    } catch (error) {
      return errorResponse(
        res,
        `Error in creating label = ${error.message}`,
        400
      );
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export { addLabel };
