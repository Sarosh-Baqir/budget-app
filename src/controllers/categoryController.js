import { db } from "../../db/database.js";
import { category } from "../../db/schema/category.js";
import { label } from "../../db/schema/label.js";
import { fetchCategory } from "../utils/helper.js";
import { eq } from "drizzle-orm";

import { successResponse, errorResponse } from "../utils/response.handle.js";

// API to add a new category
const addCategory = async (req, res) => {
  try {
    const { name, totalBudget, categoryType, description } = req.body;
    const userId = req.loggedInUserId;

    try {
      const data = await db
        .insert(category)
        .values({
          userId,
          name,
          totalBudget: parseFloat(totalBudget.toFixed(2)),
          remainingBudget: parseFloat(totalBudget.toFixed(2)),
          categoryType,
          description,
        })
        .$returningId();

      return successResponse(res, "Category has been created Successfully!", {
        data,
      });
    } catch (error) {
      return errorResponse(
        res,
        `Error in creating category = ${error.message}`,
        400
      );
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// API to increase the planned budget of category
const updatePlannedBudget = async (req, res) => {
  try {
    console.log("in update planned budget of category controller");
    const { newAmountToAdd, categoryId } = req.body;
    console.log("new amount: ", newAmountToAdd);
    const categoryData = await fetchCategory(categoryId);
    console.log("category data: ", categoryData);
    const newTotalBudget =
      parseFloat(categoryData.totalBudget) + parseFloat(newAmountToAdd);
    console.log("new total budget: ", newTotalBudget);
    await db
      .update(category)
      .set({
        totalBudget: newTotalBudget,
        remainingBudget: parseFloat(newAmountToAdd),
      })
      .where(eq(category.id, categoryId));
    return successResponse(
      res,
      "planned budget has been successfully updated",
      {
        newTotalBudget,
      }
    );
  } catch (error) {
    return errorResponse(
      res,
      `Error in updating planned budget = ${error.message}`,
      400
    );
  }
};

//API to get all the categories along with their labels
// API to get all the categories along with their labels
const getCategoriesWithLabels = async (req, res) => {
  try {
    console.log("in getCategoryWithLabels controller");

    // Fetch categories for the logged-in user
    const categories = await db.query.category.findMany({
      where: eq(category.userId, req.loggedInUserId),
    });

    console.log("categories: ", categories);

    // Fetch labels for each category
    const categoriesWithLabels = await Promise.all(
      categories.map(async (cat) => {
        const labels = await db.query.label.findMany({
          where: eq(label.categoryId, cat.id),
        });
        return { ...cat, labels };
      })
    );
    console.log("categories with labels: ", categoriesWithLabels);

    return successResponse(res, "Categories with labels fetched successfully", {
      categories: categoriesWithLabels,
    });
  } catch (error) {
    console.error("Error fetching categories with labels:", error.message);
    return errorResponse(
      res,
      `Error in getting categories with labels = ${error.message}`,
      400
    );
  }
};

export { addCategory, updatePlannedBudget, getCategoriesWithLabels };
