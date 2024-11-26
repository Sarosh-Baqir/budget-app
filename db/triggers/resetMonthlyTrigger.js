import { db } from "../database.js";
import { budget } from "../schema/budget.js";
import { category } from "../schema/category.js";
import { label } from "../schema/label.js";
import { eq } from "drizzle-orm";

// Function to reset budgets and categories at the start of the month
const resetMonthlyBudgetsAndCategories = async () => {
  console.log("Running monthly reset trigger");

  try {
    // Reset budget table
    const updatedBudgets = await db.update(budget).set({
      totalBudget: budget.remainingBudget,
      spentBudget: 0,
    });
    console.log("Budget table reset: ", updatedBudgets);

    // Reset category table
    const updatedCategories = await db.update(category).set({
      spentBudget: 0,
      remainingBudget: 0,
    });
    console.log("Category table reset: ", updatedCategories);

    // Reset label table
    const updatedLabels = await db.update(label).set({
      amount: 0,
    });
    console.log("Label table reset: ", updatedLabels);

    console.log("Monthly reset completed successfully");
  } catch (error) {
    console.error(
      "Error resetting monthly budgets and categories:",
      error.message
    );
  }
};

// Call the function to execute the monthly reset logic
resetMonthlyBudgetsAndCategories();

export { resetMonthlyBudgetsAndCategories };
